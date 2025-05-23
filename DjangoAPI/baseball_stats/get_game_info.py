import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'baseball_stats.settings')  # change if your settings module is elsewhere
django.setup()

import pandas as pd
from datetime import datetime
import math
import re
from io import StringIO
from app.models import PlayerInfo, BatterStat
# from .models import BatterStat, PitcherStat, FieldingStat, Game, Session

from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from webdriver_manager.chrome import ChromeDriverManager
import random
from io import StringIO
from scrape_and_post import post_stats



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
        options.add_argument('--headless')

        driver = webdriver.Chrome(service=ChromeService(ChromeDriverManager().install()), options=options)
        
        
        self.ncaa_game_id = ncaa_game_id
        self.selected_team = selected_team
        if from_web:
            try:
                driver.get(f'https://stats.ncaa.org/contests/{self.ncaa_game_id}/box_score')
                box_score_source = driver.page_source
                self.box_score_df_list = pd.read_html(StringIO(box_score_source))
            except:
                raise ValueError('Unable to get box score from web')
            try:
                driver.get(f'https://stats.ncaa.org/contests/{self.ncaa_game_id}/individual_stats')
                individual_stats_source = driver.page_source
                self.individual_stats_df_list = pd.read_html(StringIO(individual_stats_source))
            except:
                raise ValueError('Unable to get individual stats from web')
            ## still need to get situational stats, and umpires
        else:

            raise ValueError('Please provide either a file name or a url')
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
        self.add_selected_team_batting()
        # self.add_selected_team_pitching()
        # self.add_selected_team_fielding()
        # self.add_game()
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
            str_date = self.box_score_df_list[1].loc[3][0]
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
            self.opponent_team_hits = int(self.box_score_df_list[0].loc[2][num_rows-2])
            self.opponent_team_errors = int(self.box_score_df_list[0].loc[2][num_rows-1])
        else:
            self.selected_team_runs = int(self.box_score_df_list[0].loc[2][num_rows-3])
            self.opponent_runs = int(self.box_score_df_list[0].loc[3][num_rows-3])
            self.opponent_team_hits = int(self.box_score_df_list[0].loc[3][num_rows-2])
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
        # session = Session()
        if self.selected_team_home:
            selected_team_batting = self.individual_stats_df_list[4]
        else:
            selected_team_batting = self.individual_stats_df_list[3]
        for i in range(len(selected_team_batting)-1):
            player_name = selected_team_batting['Name'].loc[i].strip()
            pos = selected_team_batting['P'].loc[i].strip()
            number = int(selected_team_batting['#'].loc[i])

            # Make sure this matches how names appear in scraped data
            player_info, created = PlayerInfo.objects.get_or_create(
                player_name=player_name,
                defaults={"player_position": pos, 'jersey_number': number}
            )
            if created:
                print(f"Created new player: {player_info.player_name}")
            else:
                print(f"Found existing player: {player_info.player_name}")
            
            data = {
                'player': player_info.player_id,
                'game_id': int(f'{self.date.strftime("%Y")}{self.game_number}'),
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


            # stat = BatterStat(
            #     # id=int(f'{self.date.strftime("%Y")}{self.game_number}{99}{number}'),
            #     # player_name=player_name,
            #     player_position=pos,
            #     game_date=self.date,
            #     runs=int(selected_team_batting['R'].loc[i]),
            #     ab=int(selected_team_batting['AB'].loc[i]),
            #     hits=int(selected_team_batting['H'].loc[i]),
            #     double=int(selected_team_batting['2B'].loc[i]),
            #     triple=int(selected_team_batting['3B'].loc[i]),
            #     hr=int(selected_team_batting['HR'].loc[i]),
            #     rbi=int(selected_team_batting['RBI'].loc[i]),
            #     bb=int(selected_team_batting['BB'].loc[i]),
            #     hbp=int(selected_team_batting['HBP'].loc[i]),
            #     sf=int(selected_team_batting['SF'].loc[i]),
            #     sh=int(selected_team_batting['SH'].loc[i]),
            #     k=int(selected_team_batting['K'].loc[i]),
            #     # just add OPP DP here to account for DP
            #     cs=int(selected_team_batting['CS'].loc[i]),
            #     sb=int(selected_team_batting['SB'].loc[i]),
            #     picked_off=int(selected_team_batting['Picked'].loc[i]),
            #     ibb=int(selected_team_batting['IBB'].loc[i]),
            # )
        #     session.add(stat)
        # session.commit()
        # session.close()
    
    # def add_selected_team_pitching(self) -> None:
    #     '''Adds the selected team pitching stats to the pitching table in database
    #     \n
    #     '''
    #     session = Session()
    #     if self.selected_team_home:
    #         selected_team_pitching = self.individual_stats_df_list[6]
    #     else:
    #         selected_team_pitching = self.individual_stats_df_list[5]
    #     for i in range(len(selected_team_pitching)-1):
    #         player_name = selected_team_pitching['Name'].loc[i].strip()
    #         number = int(selected_team_pitching['#'].loc[i])

    #         stat = PitcherStat(
    #             id=int(f'{self.date.strftime("%Y")}{self.game_number}{99}{number}'),
    #             player_name=player_name,
    #             game_date=self.date,
    #             starter=bool(i== 0),
    #             ip=float(selected_team_pitching['IP'].loc[i]),
    #             h=int(selected_team_pitching['H'].loc[i]),
    #             r=int(selected_team_pitching['R'].loc[i]),
    #             er=int(selected_team_pitching['ER'].loc[i]),
    #             bb=int(selected_team_pitching['BB'].loc[i]),
    #             k=int(selected_team_pitching['SO'].loc[i]),
    #             bf=int(selected_team_pitching['BF'].loc[i]),
    #             doubles_allowed=int(selected_team_pitching['2B-A'].loc[i]),
    #             triples_allowed=int(selected_team_pitching['3B-A'].loc[i]),
    #             bk=int(selected_team_pitching['Bk'].loc[i]),
    #             hr_allowed=int(selected_team_pitching['HR-A'].loc[i]),
    #             # pitches=int(selected_team_pitching['Pitches'].loc[i]),
    #             wp=int(selected_team_pitching['WP'].loc[i]),
    #             hb=int(selected_team_pitching['HB'].loc[i]),
    #             ibb=int(selected_team_pitching['IBB'].loc[i]),
    #             ir=int(selected_team_pitching['Inh Run'].loc[i]),
    #             irs=int(selected_team_pitching['Inh Run Score'].loc[i]),
    #             sh_allowed=int(selected_team_pitching['SHA'].loc[i]),
    #             sf_allowed=int(selected_team_pitching['SFA'].loc[i]),
    #             kl=int(selected_team_pitching['KL'].loc[i]),
    #             pickoffs=int(selected_team_pitching['pickoffs'].loc[i]),
    #             win=self.winning_pitcher == player_name,
    #             loss=self.losing_pitcher == player_name,
    #             sv=self.saving_pitcher == player_name,
    #         )
    #         session.add(stat)
    #     session.commit()
    #     session.close()
    
    # def add_selected_team_fielding(self) -> None:
    #     '''Adds the selected team fielding stats to the fielding table in database
    #     \n
    #     '''
    #     session = Session()
    #     if self.selected_team_home:
    #         selected_team_fielding = self.individual_stats_df_list[8]
    #     else:
    #         selected_team_fielding = self.individual_stats_df_list[7]
    #     for i in range(len(selected_team_fielding)-1):
    #         player_name = selected_team_fielding['Name'].loc[i].strip()
    #         pos = selected_team_fielding['P'].loc[i].strip()
    #         number = int(selected_team_fielding['#'].loc[i])

    #         stat = FieldingStat(
    #             id=int(f'{self.date.strftime("%Y")}{self.game_number}{99}{number}'),
    #             player_name=player_name,
    #             player_position=pos,
    #             game_date=self.date,
    #             po=int(selected_team_fielding['PO'].loc[i]),
    #             a=int(selected_team_fielding['A'].loc[i]),
    #             e=int(selected_team_fielding['E'].loc[i]),
    #             catcher_interference=int(selected_team_fielding['CI'].loc[i]),
    #             pb=int(selected_team_fielding['PB'].loc[i]),
    #             sb_allowed=int(selected_team_fielding['SBA'].loc[i]),
    #             cs=int(selected_team_fielding['CSB'].loc[i]),
    #             dp=int(selected_team_fielding['IDP'].loc[i]),
    #             tp=int(selected_team_fielding['TP'].loc[i]),
    #         )
    #         session.add(stat)
    #     session.commit()
    #     session.close()
    
    # def add_game(self) -> None:
    #     '''Adds the game to the database
    #     \n
    #     '''
    #     selected_team_dpt, selected_team_tpt = self.get_dpt_tpt()[0]
    #     opponent_dp, opponent_tpt = self.get_dpt_tpt()[1]
    #     session = Session()
    #     game = Game(
    #         id=int(f'{self.date.strftime("%Y")}{self.game_number}'),
    #         game_date=self.date,
    #         selected_team=self.selected_team,
    #         opponent=self.opponent,
    #         selected_team_home=bool(self.selected_team_home),
    #         total_innings=int(self.total_innings),
    #         selected_team_won=bool(self.selected_team_won),
    #         selected_team_runs=int(self.selected_team_runs),
    #         opp_runs=int(self.opponent_runs),
    #         opp_e=int(self.opponent_team_errors),
    #         opp_h=int(self.opponent_team_hits),
    #         selected_team_dpt=int(selected_team_dpt),
    #         opp_dpt=int(opponent_dp),
    #         selected_team_tpt=int(selected_team_tpt),
    #         opp_tpt=int(opponent_tpt),
    #         win=self.winning_pitcher,
    #         loss=self.losing_pitcher,
    #         sv=self.saving_pitcher,
    #         box_score_link=f'https://stats.ncaa.org/contests/{self.ncaa_game_id}/box_score',
    #         attendance=int(self.attendance),
    #         )   
    #     session.add(game)
    #     session.commit()
    #     session.close()
    
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
    QTR_FLS = GameStats(
        ncaa_game_id=6385130)