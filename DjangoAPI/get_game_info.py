import os
import django
from collections import defaultdict
import time
from bs4 import BeautifulSoup
from selenium.webdriver.common.by import By
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'baseball_stats.settings')  # change if your settings module is elsewhere
django.setup()

import pandas as pd
from datetime import datetime
import math
import re
from io import StringIO
from app.models import PlayerInfo, BatterStat, GameInfo, BattingSituational, SchoolInfo
# from .models import BatterStat, PitcherStat, FieldingStat, Game, Session

from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from webdriver_manager.chrome import ChromeDriverManager
import random
from io import StringIO
from scrape_and_post import post_stats

def convert_ip_to_outs(ip: str | float) -> int:
    '''Converts an IP string to the number of outs
    \n
    '''
    if isinstance(ip, float):
        if math.isnan(ip):
            raise ValueError('IP is NaN')
        ip = str(ip)
    if isinstance(ip, str):
        ip = ip.strip()
    parts = ip.split('.')
    outs = int(parts[0]) * 3
    if len(parts) > 1:
        outs += int(parts[1])
    return outs


class GameStats:
    def __init__(self, ncaa_game_id, from_web=True, file_path=None, selected_team: str = 'Virginia'):
        ''' Creates an instance of a specific game
        \n
        '''
        
        options = webdriver.ChromeOptions()

        UAS = ("Mozilla/5.0 (Windows NT 6.1; WOW64; rv:40.0) Gecko/20100101 Firefox/40.1", 
        "Mozilla/5.0 (Windows NT 6.3; rv:36.0) Gecko/20100101 Firefox/36.0",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10; rv:33.0) Gecko/20100101 Firefox/33.0",
        "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36",
        "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.0 Safari/537.36",
        )
        ua = UAS[random.randrange(len(UAS))]

        options.add_argument(f'user-agent={ua}')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--headless=new')
        driver = webdriver.Chrome(service=ChromeService(ChromeDriverManager().install()), options=options)
        
        self.ncaa_game_id = ncaa_game_id
        self.selected_team = selected_team
        if from_web:
            try:
                driver.get(f'https://stats.ncaa.org/contests/{self.ncaa_game_id}/box_score')
                box_score_source = driver.page_source
                self.box_score_df_list = pd.read_html(StringIO(box_score_source))
                self.box_score_soup = BeautifulSoup(driver.page_source, "lxml")
            except:
                raise ValueError('Unable to get box score from web')
            try:
                driver.get(f'https://stats.ncaa.org/contests/{self.ncaa_game_id}/individual_stats')
                individual_stats_source = driver.page_source
                self.individual_stats_df_list = pd.read_html(StringIO(individual_stats_source))
            except:
                raise ValueError('Unable to get individual stats from web')
            try:
                driver.get(f'https://stats.ncaa.org/contests/{self.ncaa_game_id}/situational_stats')
                self.situational_stats_source = driver.page_source
                self.situational_stats_df_list = pd.read_html(StringIO(self.situational_stats_source))
                self.situational_stats_soup = BeautifulSoup(driver.page_source, "lxml")
                
            except:
                raise ValueError('Unable to get situational stats from web')
            ## still need to get situational stats, and umpires
        else:
            raise ValueError('Please provide either a file name or a url')
        driver.quit()
        # print(f'Game {self.ncaa_game_id} box score and individual stats retrieved')
        # print(box_score_source)
        self.date = None
        self.set_date()
        self.opponent = None
        self.selected_team_home: bool = None
        self.set_home_and_opponent()
        self.selected_team_won: bool = None
        self.attendance: int = None
        self.get_attendance()
        # self.start_time: int = None
        # self.duration: int = None
        self.total_innings: int = None
        self.selected_team_runs: int = None
        self.opponent_runs: int = None
        self.opponent_team_hits: int = None
        self.opponent_team_errors: int = None
        self.set_line_score_stats()
        self.winning_pitcher: str = None
        self.losing_pitcher: str = None
        self.saving_pitcher: str = None
        self.game_number = self.get_game_number()
        self.set_win_loss_save()
        self.add_game()
        self.add_selected_team_batting()
        self.add_selected_team_pitching()
        self.add_selected_team_fielding()
        self.add_situational_batting()
        self.get_hidden_text()
    def set_home_and_opponent(self) -> None:
        '''Sets selected_team_home and opponent variables in GameStats object
        \n
        '''
        if self.box_score_df_list[1].loc[2][0].strip() == self.selected_team:
            self.selected_team_home = True
            self.opponent = self.box_score_df_list[1].loc[1][0].strip()
        elif self.box_score_df_list[1].loc[1][0].strip() == self.selected_team:
            self.selected_team_home = False
            self.opponent = self.box_score_df_list[1].loc[2][0].strip()
        else:
            raise ValueError('Unable to determine home team')
    
    def set_win_loss_save(self) -> None:
        '''Updates the winning and losing pitchers and assigns the save (if any)
        '''
        # Rice game doesn't have this...
        if (self.ncaa_game_id == 6316955):
            self.winning_pitcher = 'Tomas Valincius'
            self.losing_pitcher = 'J.D. McCracken'
            self.saving_pitcher = None
            return
        print(self.ncaa_game_id)
        pitcher_info = self.box_score_df_list[13]
        win_loss_pattern = r'(.*?) \(\d+-\d+\)'
        save_pattern = r'(.*?) \(\d+\)'
        if self.selected_team_won:
            winning_pitcher = pitcher_info.loc[3, ('Game Leaders', f'{self.selected_team}')]
            save = pitcher_info.loc[4, ('Game Leaders', f'{self.selected_team}')]
            if (isinstance(save, float)) and math.isnan(save):
                losing_pitcher = pitcher_info.loc[4, ('Game Leaders', f'{self.opponent}')]
            else:
                losing_pitcher = pitcher_info.loc[5, ('Game Leaders', f'{self.opponent}')]
        else:
            winning_pitcher = pitcher_info.loc[3, ('Game Leaders', f'{self.opponent}')]
            save = pitcher_info.loc[4, ('Game Leaders', f'{self.opponent}')]
            if (isinstance(save, float)) and math.isnan(save):
                losing_pitcher = pitcher_info.loc[4, ('Game Leaders', f'{self.selected_team}')]
            else:
                losing_pitcher = pitcher_info.loc[5, ('Game Leaders', f'{self.selected_team}')]
        winning_pitcher_clean = re.match(win_loss_pattern, winning_pitcher)
        losing_pitcher_clean = re.match(win_loss_pattern, losing_pitcher)
        self.winning_pitcher = winning_pitcher_clean.group(1)
        self.losing_pitcher = losing_pitcher_clean.group(1)
        if isinstance(save, str):
            save_clean = re.match(save_pattern, save)
            if save_clean is None:
                raise ValueError('Pitcher with save not detected:', save)
            self.saving_pitcher = save_clean.group(1)
    
    def set_date(self) -> None:
        '''Sets the date of the game
        '''
        try:
            str_date = self.box_score_df_list[1].loc[3][0].split(' ')[0]

            self.date = datetime.strptime(str_date.strip(), '%m/%d/%Y').date()
        except:
            raise ValueError('Unable to find game date')
        
    def set_line_score_stats(self) -> None:
        '''Sets the winner of the game
        '''
        num_rows = len(self.box_score_df_list[0].loc[2])
        if num_rows == 0:
            raise ValueError('Unable to find game winner')
        self.total_innings = num_rows - 4
        if self.total_innings < 7:
            raise ValueError('Unable to determine total innings (or the game was < 7 inn.)')
        if self.selected_team_home:
            self.selected_team_runs = int(self.box_score_df_list[0].loc[3][num_rows-3])
            self.opponent_runs = int(self.box_score_df_list[0].loc[2][num_rows-3])
            # selected team hits
            self.opponent_team_hits = int(self.box_score_df_list[0].loc[2][num_rows-2])
            # selected teeam errorrs
            self.opponent_team_errors = int(self.box_score_df_list[0].loc[2][num_rows-1])
        else:
            self.selected_team_runs = int(self.box_score_df_list[0].loc[2][num_rows-3])
            self.opponent_runs = int(self.box_score_df_list[0].loc[3][num_rows-3])
            # selected team hits
            self.opponent_team_hits = int(self.box_score_df_list[0].loc[3][num_rows-2])
            # selected teeam errorrs
            self.opponent_team_errors = int(self.box_score_df_list[0].loc[3][num_rows-1])
        if self.selected_team_runs == self.opponent_runs:
            raise ValueError('Unable to determine score')
        self.selected_team_won = self.selected_team_runs > self.opponent_runs
    
    def get_attendance(self) -> None:
        attendance_str = self.box_score_df_list[1].loc[5][0]
        attendance_clean = re.match(r'Attendance:\s*(\d+)[,]?(\d+)?$', attendance_str)
        if attendance_clean:
            if attendance_clean.group(2) is None:
                attendance = int(attendance_clean.group(1))
            else:
                attendance = int(f'{attendance_clean.group(1)}{attendance_clean.group(2)}')
            self.attendance = attendance
        else:
            raise ValueError('Unable to find attendance')
    
    def add_selected_team_batting(self) -> None:
        '''Adds the selected team batting stats to the batting table in database
        \n
        '''
        try:
            game = GameInfo.objects.get(
                game_id=int(f'{self.date.strftime("%Y")}{self.game_number}')
            )
        except GameInfo.DoesNotExist:
            raise ValueError(f'Game not found in database for game {self.date.strftime("%Y")}{self.game_number}')
        except GameInfo.MultipleObjectsReturned:
            raise ValueError(f'Multiple games found in database for game {self.date.strftime("%Y")}{self.game_number}')
        except:
            raise ValueError(f'Unable to find game {self.date.strftime("%Y")}{self.game_number} in database')

        if self.selected_team_home:
            selected_team_batting = self.individual_stats_df_list[4]
        else:
            selected_team_batting = self.individual_stats_df_list[3]
        for i in range(len(selected_team_batting)-1):
            player_name = selected_team_batting['Name'].loc[i].strip()
            pos = selected_team_batting['P'].loc[i].strip()
            number = int(selected_team_batting['#'].loc[i])

            player_info, created = PlayerInfo.objects.get_or_create(
                player_name=player_name,
                defaults={"player_position": {pos: 1}, 'jersey_number': number}
            )
            print(player_info.player_position)
            if not created:
                positions = player_info.player_position
                positions[pos] = positions.get(pos, 0) + 1
                player_info.player_position = dict(positions)
                player_info.save()


            if created:
                print(f"Created new batter: {player_info.player_name}")
            else:
                print(f"Found existing batter: {player_info.player_name}")
            
            data = {
                'player_id': player_info.player_id,
                'game_id': game.game_id,
                'runs': int(selected_team_batting['R'].loc[i]),
                'ab': int(selected_team_batting['AB'].loc[i]),
                'hits': int(selected_team_batting['H'].loc[i]),
                'rbi': int(selected_team_batting['RBI'].loc[i]),
                'bb': int(selected_team_batting['BB'].loc[i]),
                'so': int(selected_team_batting['K'].loc[i]),
                'hbp': int(selected_team_batting['HBP'].loc[i]),
                'ibb': int(selected_team_batting['IBB'].loc[i]),
                'sb': int(selected_team_batting['SB'].loc[i]),
                'cs': int(selected_team_batting['CS'].loc[i]),
                'dp': int(selected_team_batting['OPP DP'].loc[i]),
                'double': int(selected_team_batting['2B'].loc[i]),
                'triple': int(selected_team_batting['3B'].loc[i]),
                'hr': int(selected_team_batting['HR'].loc[i]),
                'sf': int(selected_team_batting['SF'].loc[i]),
                'sh': int(selected_team_batting['SH'].loc[i]),
                'picked_off': int(selected_team_batting['Picked'].loc[i]),
            }

            post_stats(
                endpoint='batter_stats/create',
                data=data
            )
    
    def add_selected_team_pitching(self) -> None:
        '''Adds the selected team pitching stats to the pitching table in database
        \n
        '''
        

        try:
            game = GameInfo.objects.get(
                game_id=int(f'{self.date.strftime("%Y")}{self.game_number}')
            )
        except GameInfo.DoesNotExist:
            raise ValueError(f'Game not found in database for game {self.date.strftime("%Y")}{self.game_number}')
        except GameInfo.MultipleObjectsReturned:
            raise ValueError(f'Multiple games found in database for game {self.date.strftime("%Y")}{self.game_number}')
        except:
            raise ValueError(f'Unable to find game {self.date.strftime("%Y")}{self.game_number} in database')        

        if self.selected_team_home:
            selected_team_pitching = self.individual_stats_df_list[6]
        else:
            selected_team_pitching = self.individual_stats_df_list[5]
        for i in range(len(selected_team_pitching)-1):
            player_name = selected_team_pitching['Name'].loc[i].strip()
            number = int(selected_team_pitching['#'].loc[i])
            
            player_info, created = PlayerInfo.objects.get_or_create(
                player_name=player_name,
                defaults={"player_position": {'P': 1}, 'jersey_number': number}
            )

            if created:
                print(f"Created new pitcher: {player_info.player_name}")
            else:
                print(f"Found existing pitcher: {player_info.player_name}")
            

            data = {
                'player_id': player_info.player_id,
                'game_id': game.game_id,
                'starter': int(i == 0),
                'outs': convert_ip_to_outs(selected_team_pitching['IP'].loc[i]),
                'h': int(selected_team_pitching['H'].loc[i]),
                'r': int(selected_team_pitching['R'].loc[i]),
                'er': int(selected_team_pitching['ER'].loc[i]),
                'bb': int(selected_team_pitching['BB'].loc[i]),
                'so': int(selected_team_pitching['SO'].loc[i]),
                'bf': int(selected_team_pitching['BF'].loc[i]),
                'doubles_allowed': int(selected_team_pitching['2B-A'].loc[i]),
                'triples_allowed': int(selected_team_pitching['3B-A'].loc[i]),
                'hr_allowed': int(selected_team_pitching['HR-A'].loc[i]),
                'wp': int(selected_team_pitching['WP'].loc[i]),
                'hb': int(selected_team_pitching['HB'].loc[i]),
                'ibb': int(selected_team_pitching['IBB'].loc[i]),
                'balk': int(selected_team_pitching['Bk'].loc[i]),
                'ir': int(selected_team_pitching['Inh Run'].loc[i]),
                'irs': int(selected_team_pitching['Inh Run Score'].loc[i]),
                'sh_allowed': int(selected_team_pitching['SHA'].loc[i]),
                'sf_allowed': int(selected_team_pitching['SFA'].loc[i]),
                'kl': int(selected_team_pitching['KL'].loc[i]),
                'pickoffs': int(selected_team_pitching['pickoffs'].loc[i]),
                'win': int(self.winning_pitcher == player_name),
                'loss': int(self.losing_pitcher == player_name),
                'sv': int(self.saving_pitcher == player_name),
            }
            print("data", data)
            # print("type of data:", type(data))

            post_stats(
                endpoint='pitcher_stats/create',
                data=data
            )


        #     stat = PitcherStat(
        #         id=int(f'{self.date.strftime("%Y")}{self.game_number}{99}{number}'),
        #         player_name=player_name,
        #         game_date=self.date,
        #         starter=bool(i== 0),
        #         ip=float(selected_team_pitching['IP'].loc[i]),
        #         h=int(selected_team_pitching['H'].loc[i]),
        #         r=int(selected_team_pitching['R'].loc[i]),
        #         er=int(selected_team_pitching['ER'].loc[i]),
        #         bb=int(selected_team_pitching['BB'].loc[i]),
        #         k=int(selected_team_pitching['SO'].loc[i]),
        #         bf=int(selected_team_pitching['BF'].loc[i]),
        #         doubles_allowed=int(selected_team_pitching['2B-A'].loc[i]),
        #         triples_allowed=int(selected_team_pitching['3B-A'].loc[i]),
        #         bk=int(selected_team_pitching['Bk'].loc[i]),
        #         hr_allowed=int(selected_team_pitching['HR-A'].loc[i]),
        #         # pitches=int(selected_team_pitching['Pitches'].loc[i]),
        #         wp=int(selected_team_pitching['WP'].loc[i]),
        #         hb=int(selected_team_pitching['HB'].loc[i]),
        #         ibb=int(selected_team_pitching['IBB'].loc[i]),
        #         ir=int(selected_team_pitching['Inh Run'].loc[i]),
        #         irs=int(selected_team_pitching['Inh Run Score'].loc[i]),
        #         sh_allowed=int(selected_team_pitching['SHA'].loc[i]),
        #         sf_allowed=int(selected_team_pitching['SFA'].loc[i]),
        #         kl=int(selected_team_pitching['KL'].loc[i]),
        #         pickoffs=int(selected_team_pitching['pickoffs'].loc[i]),
        #         win=self.winning_pitcher == player_name,
        #         loss=self.losing_pitcher == player_name,
        #         sv=self.saving_pitcher == player_name,
        #     )
        #     session.add(stat)
        # session.commit()
        # session.close()
    
    def add_selected_team_fielding(self) -> None:
        '''Adds the selected team fielding stats to the fielding table in database
        \n
        '''

        try:
            game = GameInfo.objects.get(
                game_id=int(f'{self.date.strftime("%Y")}{self.game_number}')
            )
        except GameInfo.DoesNotExist:
            raise ValueError(f'Game not found in database for game {self.date.strftime("%Y")}{self.game_number}')
        except GameInfo.MultipleObjectsReturned:
            raise ValueError(f'Multiple games found in database for game {self.date.strftime("%Y")}{self.game_number}')
        except:
            raise ValueError(f'Unable to find game {self.date.strftime("%Y")}{self.game_number} in database')


        # session = Session()
        if self.selected_team_home:
            selected_team_fielding = self.individual_stats_df_list[8]
        else:
            selected_team_fielding = self.individual_stats_df_list[7]
        for i in range(len(selected_team_fielding)-1):
            player_name = selected_team_fielding['Name'].loc[i].strip()
            pos = selected_team_fielding['P'].loc[i].strip()
            number = int(selected_team_fielding['#'].loc[i])

            player_info, created = PlayerInfo.objects.get_or_create(
                player_name=player_name,
                defaults={"player_position": pos, 'jersey_number': number}
            )

            if created:
                print(f'Found a fielder who didn\'t bat or pitch: {player_info.player_name}')
            else:
                print(f'Found existing fielder: {player_info.player_name}')
            
            data = {
                'player_id': player_info.player_id,
                'player_position': pos,
                'game_id': game.game_id,
                'po': int(selected_team_fielding['PO'].loc[i]),
                'a': int(selected_team_fielding['A'].loc[i]),
                'e': int(selected_team_fielding['E'].loc[i]),
                'catchers_interference': int(selected_team_fielding['CI'].loc[i]),
                'pb': int(selected_team_fielding['PB'].loc[i]),
                'sba': int(selected_team_fielding['SBA'].loc[i]),
                'cs': int(selected_team_fielding['CSB'].loc[i]),
                'dp': int(selected_team_fielding['IDP'].loc[i]),
                'tp': int(selected_team_fielding['TP'].loc[i]),
            }
            post_stats(
                endpoint='fielding_stats/create',
                data=data
            )

            # stat = FieldingStat(
            #     id=int(f'{self.date.strftime("%Y")}{self.game_number}{99}{number}'),
            #     player_name=player_name,
            #     player_position=pos,
            #     game_date=self.date,
            #     po=int(selected_team_fielding['PO'].loc[i]),
            #     a=int(selected_team_fielding['A'].loc[i]),
            #     e=int(selected_team_fielding['E'].loc[i]),
            #     catcher_interference=int(selected_team_fielding['CI'].loc[i]),
            #     pb=int(selected_team_fielding['PB'].loc[i]),
            #     sb_allowed=int(selected_team_fielding['SBA'].loc[i]),
            #     cs=int(selected_team_fielding['CSB'].loc[i]),
            #     dp=int(selected_team_fielding['IDP'].loc[i]),
            #     tp=int(selected_team_fielding['TP'].loc[i]),
            # )
        #     session.add(stat)
        # session.commit()
        # session.close()
    
    def add_game(self) -> None:
        '''Adds the game to the database
        \n
        '''
        
        selected_team_dpt, selected_team_tpt = self.get_dpt_tpt()[0]
        opponent_dp, opponent_tpt = self.get_dpt_tpt()[1]
        # session = Session()
        
        self.get_school_ids()

        self.set_school(school_id=self.selected_team_id, school_name=self.selected_team)
        self.set_school(school_id=self.opponent_team_id, school_name=self.opponent)

        game = {
            'game_id': int(f'{self.date.strftime("%Y")}{self.game_number}'),
            'game_date': str(self.date),
            'selected_team': self.selected_team_id,
            'opponent': self.opponent_team_id,
            'selected_team_home': bool(self.selected_team_home),
            'total_innings': int(self.total_innings),
            'selected_team_runs': int(self.selected_team_runs),
            'opponent_runs': int(self.opponent_runs),
            # 'selected_team_hits': int(self.opponent_team_hits),
            'opponent_hits': int(self.opponent_team_hits),
            # 'selected_team_errors': int(self.opponent_team_errors),
            'opponent_errors': int(self.opponent_team_errors),
            'selected_team_dpt': int(selected_team_dpt),
            'opponent_dpt': int(opponent_dp),
            'selected_team_tpt': int(selected_team_tpt),
            'opponent_tpt': int(opponent_tpt),
            'winning_pitcher': self.winning_pitcher,
            'losing_pitcher': self.losing_pitcher,
            'save_pitcher': self.saving_pitcher,
            'box_score_link': f'https://stats.ncaa.org/contests/{self.ncaa_game_id}/box_score',
            'attendance': int(self.attendance),
        }
        print(f'Adding {self.selected_team}\'s game {self.game_number} to database...')
        try:
            post_stats(
                endpoint='game_info/create',
                data=game
            )
        except:
            raise ValueError(f'Unable to add game {self.game_number} to database')

        
    
    def get_dpt_tpt(self) -> tuple[tuple[int, int], tuple[int, int]]:
        '''Returns the double plays and triple plays turned by both teams
        \n ((selected_team_dp, selected_team_tp), (opponent_dp, opponent_tp))
        \n
        '''
        num_home_rows = len(self.box_score_df_list[8])
        num_away_rows = len(self.box_score_df_list[7])
        if self.selected_team_home:
            
            selected_team_dpt = self.individual_stats_df_list[8]['IDP'].loc[num_home_rows-1]
            selected_team_tpt = self.individual_stats_df_list[8]['TP'].loc[num_home_rows-1]
            opponent_dpt = self.individual_stats_df_list[7]['IDP'].loc[num_away_rows-1]
            opponent_tpt = self.individual_stats_df_list[7]['TP'].loc[num_away_rows-1]
        else:
            selected_team_dpt = self.individual_stats_df_list[7]['IDP'].loc[num_away_rows-1]
            selected_team_tpt = self.individual_stats_df_list[7]['TP'].loc[num_away_rows-1]
            opponent_dpt = self.individual_stats_df_list[8]['IDP'].loc[num_home_rows-1]
            opponent_tpt = self.individual_stats_df_list[8]['TP'].loc[num_home_rows-1]
        
        return ((selected_team_dpt, selected_team_tpt), (opponent_dpt, opponent_tpt))
    
    def get_game_number(self) -> int:
            '''Returns the game number
            \n
            '''
            if self.selected_team_home:
                record_info = self.box_score_df_list[0].loc[0][6]
            else:
                record_info = self.box_score_df_list[0].loc[0][1]
            record_num = re.search(r'.*?(\d+)-(\d+), Conf', record_info)
            if record_num:
                return int(record_num.group(1)) + int(record_num.group(2))
            else:
                raise ValueError(f'Unable to find {self.selected_team} record')

    def add_situational_batting(self) -> None:
        '''Adds the selected team's situational batting stats to the database
        \n\
        '''

        try:
            game = GameInfo.objects.get(
                game_id=int(f'{self.date.strftime("%Y")}{self.game_number}')
            )
        except BattingSituational.DoesNotExist:
            raise ValueError(f'Game not found in database for game {self.date.strftime("%Y")}{self.game_number}')
        except BattingSituational.MultipleObjectsReturned:
            raise ValueError(f'Multiple games found in database for game {self.date.strftime("%Y")}{self.game_number}')
        except:
            raise ValueError(f'Unable to find game {self.date.strftime("%Y")}{self.game_number} in database')
        
        # iterate through list generated from hidden text locator
        situational_stats_df = self.get_hidden_text()
        for index, row in situational_stats_df.iterrows():
            with_runners = {}
            hits_with_risp = {}
            vs_lhp = {}
            vs_rhp = {}
            leadoff_pct = {}
            rbi_runner_on_3rd = {}
            h_pinchhit = {}
            runners_advanced = {}
            with_two_outs = {}
            with_two_runners = {}
            with_two_in_scoring = {}
            bases_empty = {}
            bases_loaded = {}
            print('Raw player:', row['Player'])
            if row['Player'] == self.selected_team:
                print(f'Reached {self.selected_team} row, stopping')
                return
            p_name_parts = str(row['Player']).strip().split(',')
            player_name = p_name_parts[1].strip() + ' ' + p_name_parts[0].strip()
            pos = str(row['Position']).strip().capitalize()
            situational_columns = {
                2: with_runners,
                3: hits_with_risp,
                4: vs_lhp,
                5: vs_rhp,
                6: leadoff_pct,
                7: rbi_runner_on_3rd,
                8: h_pinchhit,
                9: runners_advanced,
                10: with_two_outs,
                11: with_two_runners,
                12: with_two_in_scoring,
                13: bases_empty,
                14: bases_loaded,
            }
            for i in range(len(situational_stats_df.columns)):
                if i < 2:
                    continue
                stat_column: dict = situational_columns[i]
                print(f'Column {i} for player {player_name} ({pos}):', self.columns[i])
                stats = str(row[self.columns[i]]).split('\n')
                if len(stats) == 0:
                    raise ValueError(f'Invalid stats for {player_name} in situational stats (length = 0)')
                if (len(stats) == 1 and stats[0] == ''):
                    print(f'No stats found for player {player_name} in situational stats for {self.columns[i]}')
                    print('Stats:', stats)
                    continue
                for stat in stats:
                    stat = stat.strip()
                    if '-' in stat:
                        stat_column['succ_opp'] = str(stat)
                    else:
                        stat_info = stat.split(' = ')
                        if stat.strip() == '' or len(stat_info) != 2:
                            raise ValueError(f'Invalid stat format for {player_name} in situational stats: {stat}')
                        stat_column[stat_info[0]] = int(stat_info[1])
                print(stat_column)

            if not with_runners and not hits_with_risp and not vs_lhp and not vs_rhp and not leadoff_pct and not rbi_runner_on_3rd and not h_pinchhit and not runners_advanced and not with_two_outs and not with_two_runners and not with_two_in_scoring and not bases_empty and not bases_loaded:
                print(f'No stats found for player {player_name} in situational stats AT ALL (testing)')
                continue
            player_info, created = PlayerInfo.objects.get_or_create(
                player_name=player_name,
                defaults={"player_position": {pos: 1}, 'jersey_number': None}
            )


            if created:
                raise ValueError("Created a new player:", player_info.player_name)
            else:
                print(f'Found existing player for situational stats: {player_info.player_name}')
                print(f'Player ID: {player_info.player_id}')
                print(f'Game ID: {game.game_id}')
            # only add stats if player has at least one non-Nan value
            data = {
                'player_id': player_info.player_id,
                'game_id': game.game_id,
                'with_runners': with_runners,
                'hits_with_risp': hits_with_risp,
                'vs_lhp': vs_lhp,
                'vs_rhp': vs_rhp,
                'leadoff_pct': leadoff_pct,
                'rbi_runner_on_3rd': rbi_runner_on_3rd,
                'h_pinchhit': h_pinchhit,
                'runners_advanced': runners_advanced,
                'with_two_outs': with_two_outs,
                'with_two_runners': with_two_runners,
                'with_two_in_scoring': with_two_in_scoring,
                'bases_empty': bases_empty,
                'bases_loaded': bases_loaded,
            }

            post_stats(
                endpoint='situational_batting/create',
                data=data
            )

    def get_hidden_text(self) -> pd.DataFrame:
        '''Gets the hidden text from the box score page
        \n
        '''
        data = []
        tables_with_thead = [t for t in self.situational_stats_soup.find_all("table") if t.find("thead")]
        if self.selected_team_home:
            soup = tables_with_thead[1]
        else:
            soup = tables_with_thead[0]
        for row in soup.select("tbody > tr"):
            cells = row.find_all("td")
            # print(cells)
            if not cells or not cells[0].get_text(strip=True):
                continue
            
            player = cells[0].get_text(strip=True)
            # print("'Player':", player)
            pos = cells[1].get_text(strip=True)
            stats = []

            for cell in cells[2:]:
                a = cell.find("a")
                if a and a.has_attr("title") and a["title"].strip():
                    stats.append(a["title"].strip())
                else:
                    stats.append("")

            data.append([player, pos] + stats)

        # Convert to DataFrame
        self.columns = ["Player", "Position", "with runners", 
                    "hits scorepos", "vs LHP", "vs RHP",
                    "leadoff pct", "RBI3rd", "H-pinchit", 
                    "adv-ops", "with 2 outs", "with runrs2", 
                    "with scorepos2", "bases empty", "bases loaded"]
        df = pd.DataFrame(data, columns=self.columns)
        return df
        # print(f'{df.loc[0, 'Player']} With Runners:', df.loc[0, 'with runners'])
        # df.to_csv("situational_stats.csv", index=False)
        # print(df.head())

    def get_school_ids(self) -> dict:
        '''Returns the school IDs for the selected team and opponent
        \n
        '''
        selected_team_img = self.box_score_soup.find('img', class_='logo_image', alt=self.selected_team).get('src')
        self.selected_team_id = selected_team_img.split('//')[-1].split('.')[0]

        opponent_team_img = self.box_score_soup.find('img', class_='logo_image', alt=self.opponent).get('src')
        self.opponent_team_id = opponent_team_img.split('//')[-1].split('.')[0]

    def set_school(self, school_id, school_name) -> None:
        '''Creates school profile if it doesn't exist
        \n
        '''
        school_info, new_school_created = SchoolInfo.objects.get_or_create(
                school_id=school_id,
            )
        
        if new_school_created:
            school_info.school_name = school_name
            school_info.save()

        
        if new_school_created:
            print(f"Created new school: {school_info.school_name}")

        else:
            print(f"Found existing school: {school_info.school_name}")

        

    def __str__(self) -> str:
        '''Returns a string representation of the game stats
        \n
        '''
        return f'Game date: {self.date}\n' \
            f'Opponent: {self.opponent}\n' \
            f'Selected team home: {self.selected_team_home}\n' \
            f'Selected team won: {self.selected_team_won}\n' \
            f'Selected team runs: {self.selected_team_runs}\n' \
            f'Opponent runs: {self.opponent_runs}\n' \
            f'Total innings: {self.total_innings}\n' \
            f'Attendance: {self.attendance}\n' \
            f'Winning pitcher: {self.winning_pitcher}\n' \
            f'Losing pitcher: {self.losing_pitcher}\n' \
            f'Saving pitcher: {self.saving_pitcher}\n' \
            f'Opponent team hits: {self.opponent_team_hits}\n' \
            f'Opponent team errors: {self.opponent_team_errors}\n'


if __name__ == "__main__":

    
    VT1 = GameStats(
        ncaa_game_id=6303762, selected_team='Virginia Tech')
    # VT2 = GameStats(
    #     ncaa_game_id=6317490)
    # VT3 = GameStats(
    #     ncaa_game_id=6317491)
    # BC = GameStats(
    #     ncaa_game_id=6385130)
    
    # options = webdriver.ChromeOptions()

    # UAS = ("Mozilla/5.0 (Windows NT 6.1; WOW64; rv:40.0) Gecko/20100101 Firefox/40.1", 
    #     "Mozilla/5.0 (Windows NT 6.3; rv:36.0) Gecko/20100101 Firefox/36.0",
    #     "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10; rv:33.0) Gecko/20100101 Firefox/33.0",
    #     "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36",
    #     "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36",
    #     "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.0 Safari/537.36",
    #     )
    # ua = UAS[random.randrange(len(UAS))]

    # options.add_argument(f'user-agent={ua}')
    # options.add_argument('--no-sandbox')
    # options.add_argument('--disable-dev-shm-usage')
    # options.add_argument('--headless')
    
    # driver = webdriver.Chrome(
    #     service=ChromeService(ChromeDriverManager().install()), options=options
    #     )
    # driver.get('https://stats.ncaa.org/teams/596439')

    # links = driver.find_elements(By.XPATH, '//a[@target="BOX_SCORE_WINDOW"]')

    # for link in links:
    #     # print(link.get_attribute('href'))
    #     ncaa_game_id = int(link.get_attribute('href').split('/')[4])
    #     print(ncaa_game_id)
    #     new_game = GameStats(ncaa_game_id=ncaa_game_id)
    #     time.sleep(1)