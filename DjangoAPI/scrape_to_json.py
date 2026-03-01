#!/usr/bin/env python3
"""
Stage 1: Scrape NCAA game stats locally and save to JSON.

Run this on your LOCAL machine (where Chrome is available).
It produces a JSON file that can then be uploaded to your Docker Django server.

USAGE:
    python scrape_to_json.py 6313117
    python scrape_to_json.py 6313117 --team "Virginia" --headless
    python scrape_to_json.py 6313117 6317490 6317491  # multiple games

OUTPUT:
    Creates game_data/<game_id>.json for each game
"""

import argparse
import json
import math
import os
import re
import time
from datetime import datetime
from io import StringIO

import pandas as pd
from bs4 import BeautifulSoup

# Import your existing scraper
from download_box_score import NcaaGameScraper


# ============================================================================
# HELPERS (copied from your GameStats so this file is self-contained)
# ============================================================================

def convert_ip_to_outs(ip) -> int:
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


# ============================================================================
# GAME PARSER — extracts all data into plain dicts (no Django needed)
# ============================================================================

class GameParser:
    """
    Parses NCAA box score and individual stats into plain Python dicts.
    No Django dependency — just data extraction.
    """

    def __init__(self, ncaa_game_id: int, selected_team: str = "Virginia", headless: bool = False):
        self.ncaa_game_id = ncaa_game_id
        self.selected_team = selected_team

        # Scrape using your existing NcaaGameScraper
        scraper = NcaaGameScraper(ncaa_game_id, selected_team=selected_team, headless=False)
        scraper.fetch()
        self.box_score_df_list = scraper.box_score_df_list
        self.box_score_soup = scraper.box_score_soup
        self.individual_stats_df_list = scraper.individual_stats_df_list

        print("Scraped!")
        print("Box Score soup:", self.box_score_soup)

        # Parse everything
        self.date = self._parse_date()
        self.selected_team_home, self.opponent = self._parse_home_and_opponent()
        self.attendance = self._parse_attendance()
        self.total_innings = None
        self.selected_team_runs = None
        self.opponent_runs = None
        self.opponent_team_hits = None
        self.opponent_team_errors = None
        self.selected_team_won = None
        self._parse_line_score()
        self.game_number = self._parse_game_number()
        self.winning_pitcher, self.losing_pitcher, self.saving_pitcher = self._parse_win_loss_save()
        self.selected_team_id, self.opponent_team_id = self._parse_school_ids()

    # ------ Parsing methods (adapted from your GameStats) ------

    def _parse_date(self):
        try:
            str_date = self.box_score_df_list[1].loc[3][0].split(' ')[0]
            return datetime.strptime(str_date.strip(), '%m/%d/%Y').date()
        except Exception:
            raise ValueError('Unable to find game date')

    def _parse_home_and_opponent(self):
        if self.box_score_df_list[1].loc[2][0].strip() == self.selected_team:
            return True, self.box_score_df_list[1].loc[1][0].strip()
        elif self.box_score_df_list[1].loc[1][0].strip() == self.selected_team:
            return False, self.box_score_df_list[1].loc[2][0].strip()
        else:
            raise ValueError('Unable to determine home team')

    def _parse_attendance(self):
        attendance_str = self.box_score_df_list[1].loc[5][0]
        match = re.match(r'Attendance:\s*(\d+)[,]?(\d+)?$', attendance_str)
        if match:
            if match.group(2) is None:
                return int(match.group(1))
            return int(f'{match.group(1)}{match.group(2)}')
        raise ValueError('Unable to find attendance')

    def _parse_line_score(self):
        line_score = self.box_score_df_list[1]
        num_cols = len(line_score.loc[2])
        if num_cols == 0:
            raise ValueError('Unable to find line score')
        self.total_innings = num_cols - 4
        if self.total_innings < 7:
            raise ValueError('Game < 7 innings or unable to determine innings')

        if self.selected_team_home:
            opp_row, sel_row = line_score.loc[1], line_score.loc[2]
        else:
            opp_row, sel_row = line_score.loc[2], line_score.loc[1]

        self.selected_team_runs = int(sel_row[num_cols - 3])
        self.opponent_runs = int(opp_row[num_cols - 3])
        self.opponent_team_hits = int(opp_row[num_cols - 2])
        self.opponent_team_errors = int(opp_row[num_cols - 1])

        if self.selected_team_runs == self.opponent_runs:
            raise ValueError('Tied score — cannot determine winner')
        self.selected_team_won = self.selected_team_runs > self.opponent_runs

    def _parse_game_number(self):
        if self.selected_team_home:
            record_info = self.box_score_df_list[0].loc[0][6]
        else:
            record_info = self.box_score_df_list[0].loc[0][1]
        match = re.search(r'.*?(\d+)-(\d+), Conf', record_info)
        if match:
            return int(match.group(1)) + int(match.group(2))
        raise ValueError(f'Unable to find {self.selected_team} record')

    def _parse_win_loss_save(self):
        # Hardcoded exception from your original code
        if self.ncaa_game_id == 6316955:
            return 'Tomas Valincius', 'J.D. McCracken', None

        pitcher_info = self.box_score_df_list[13]
        win_loss_pattern = r'(.*?) \(\d+-\d+\)'
        save_pattern = r'(.*?) \(\d+\)'

        if self.selected_team_won:
            wp_raw = pitcher_info.loc[3, ('Game Leaders', self.selected_team)]
            save_raw = pitcher_info.loc[4, ('Game Leaders', self.selected_team)]
            if isinstance(save_raw, float) and math.isnan(save_raw):
                lp_raw = pitcher_info.loc[4, ('Game Leaders', self.opponent)]
            else:
                lp_raw = pitcher_info.loc[5, ('Game Leaders', self.opponent)]
        else:
            wp_raw = pitcher_info.loc[3, ('Game Leaders', self.opponent)]
            save_raw = pitcher_info.loc[4, ('Game Leaders', self.opponent)]
            if isinstance(save_raw, float) and math.isnan(save_raw):
                lp_raw = pitcher_info.loc[4, ('Game Leaders', self.selected_team)]
            else:
                lp_raw = pitcher_info.loc[5, ('Game Leaders', self.selected_team)]

        wp = re.match(win_loss_pattern, wp_raw).group(1)
        lp = re.match(win_loss_pattern, lp_raw).group(1)
        sv = None
        if isinstance(save_raw, str):
            sv_match = re.match(save_pattern, save_raw)
            if sv_match:
                sv = sv_match.group(1)

        return wp, lp, sv

    def _parse_school_ids(self):
        sel_img = self.box_score_soup.find('img', class_='logo_image', alt=self.selected_team)
        opp_img = self.box_score_soup.find('img', class_='logo_image', alt=self.opponent)
        sel_id = sel_img.get('src').split('/')[-1].split('.')[0] if sel_img else None
        opp_id = opp_img.get('src').split('/')[-1].split('.')[0] if opp_img else None
        return sel_id, opp_id

    # ------ Extract stats into plain dicts ------

    def _get_dpt_tpt(self):
        num_home = len(self.box_score_df_list[8])
        num_away = len(self.box_score_df_list[7])
        if self.selected_team_home:
            s_dp = int(self.individual_stats_df_list[8]['IDP'].loc[num_home - 1])
            s_tp = int(self.individual_stats_df_list[8]['TP'].loc[num_home - 1])
            o_dp = int(self.individual_stats_df_list[7]['IDP'].loc[num_away - 1])
            o_tp = int(self.individual_stats_df_list[7]['TP'].loc[num_away - 1])
        else:
            s_dp = int(self.individual_stats_df_list[7]['IDP'].loc[num_away - 1])
            s_tp = int(self.individual_stats_df_list[7]['TP'].loc[num_away - 1])
            o_dp = int(self.individual_stats_df_list[8]['IDP'].loc[num_home - 1])
            o_tp = int(self.individual_stats_df_list[8]['TP'].loc[num_home - 1])
        return (s_dp, s_tp), (o_dp, o_tp)

    def extract_all(self) -> dict:
        """
        Extract all game data into a single JSON-serializable dict.
        This is the main output — no Django involved.
        """
        (s_dp, s_tp), (o_dp, o_tp) = self._get_dpt_tpt()
        game_id = int(f'{self.date.strftime("%Y")}{self.game_number}')

        result = {
            "meta": {
                "ncaa_game_id": self.ncaa_game_id,
                "game_id": game_id,
                "date": str(self.date),
                "selected_team": self.selected_team,
                "opponent": self.opponent,
                "selected_team_id": self.selected_team_id,
                "opponent_team_id": self.opponent_team_id,
            },
            "game_info": {
                "game_id": game_id,
                "game_date": str(self.date),
                "selected_team": self.selected_team_id,
                "opponent": self.opponent_team_id,
                "selected_team_home": bool(self.selected_team_home),
                "total_innings": int(self.total_innings),
                "selected_team_runs": int(self.selected_team_runs),
                "opponent_runs": int(self.opponent_runs),
                "opponent_hits": int(self.opponent_team_hits),
                "opponent_errors": int(self.opponent_team_errors),
                "selected_team_dpt": s_dp,
                "opponent_dpt": o_dp,
                "selected_team_tpt": s_tp,
                "opponent_tpt": o_tp,
                "winning_pitcher": self.winning_pitcher,
                "losing_pitcher": self.losing_pitcher,
                "save_pitcher": self.saving_pitcher,
                "box_score_link": f"https://stats.ncaa.org/contests/{self.ncaa_game_id}/box_score",
                "attendance": int(self.attendance),
            },
            "schools": [
                {"school_id": self.selected_team_id, "school_name": self.selected_team},
                {"school_id": self.opponent_team_id, "school_name": self.opponent},
            ],
            "batting": self._extract_batting(),
            "pitching": self._extract_pitching(),
            "fielding": self._extract_fielding(),
        }
        return result

    def _extract_batting(self) -> list[dict]:
        if self.selected_team_home:
            df = self.individual_stats_df_list[4]
        else:
            df = self.individual_stats_df_list[3]

        rows = []
        for i in range(len(df) - 1):
            rows.append({
                "player_name": df['Name'].loc[i].strip(),
                "position": df['P'].loc[i].strip(),
                "jersey_number": int(df['#'].loc[i]),
                "stats": {
                    "runs": int(df['R'].loc[i]),
                    "ab": int(df['AB'].loc[i]),
                    "hits": int(df['H'].loc[i]),
                    "rbi": int(df['RBI'].loc[i]),
                    "bb": int(df['BB'].loc[i]),
                    "so": int(df['K'].loc[i]),
                    "hbp": int(df['HBP'].loc[i]),
                    "ibb": int(df['IBB'].loc[i]),
                    "sb": int(df['SB'].loc[i]),
                    "cs": int(df['CS'].loc[i]),
                    "dp": int(df['OPP DP'].loc[i]),
                    "double": int(df['2B'].loc[i]),
                    "triple": int(df['3B'].loc[i]),
                    "hr": int(df['HR'].loc[i]),
                    "sf": int(df['SF'].loc[i]),
                    "sh": int(df['SH'].loc[i]),
                    "picked_off": int(df['Picked'].loc[i]),
                },
            })
        return rows

    def _extract_pitching(self) -> list[dict]:
        if self.selected_team_home:
            df = self.individual_stats_df_list[6]
        else:
            df = self.individual_stats_df_list[5]

        rows = []
        for i in range(len(df) - 1):
            name = df['Name'].loc[i].strip()
            rows.append({
                "player_name": name,
                "jersey_number": int(df['#'].loc[i]),
                "stats": {
                    "starter": int(i == 0),
                    "outs": convert_ip_to_outs(df['IP'].loc[i]),
                    "h": int(df['H'].loc[i]),
                    "r": int(df['R'].loc[i]),
                    "er": int(df['ER'].loc[i]),
                    "bb": int(df['BB'].loc[i]),
                    "so": int(df['SO'].loc[i]),
                    "bf": int(df['BF'].loc[i]),
                    "doubles_allowed": int(df['2B-A'].loc[i]),
                    "triples_allowed": int(df['3B-A'].loc[i]),
                    "hr_allowed": int(df['HR-A'].loc[i]),
                    "wp": int(df['WP'].loc[i]),
                    "hb": int(df['HB'].loc[i]),
                    "ibb": int(df['IBB'].loc[i]),
                    "balk": int(df['Bk'].loc[i]),
                    "ir": int(df['Inh Run'].loc[i]),
                    "irs": int(df['Inh Run Score'].loc[i]),
                    "sh_allowed": int(df['SHA'].loc[i]),
                    "sf_allowed": int(df['SFA'].loc[i]),
                    "kl": int(df['KL'].loc[i]),
                    "pickoffs": int(df['pickoffs'].loc[i]),
                    "win": int(self.winning_pitcher == name),
                    "loss": int(self.losing_pitcher == name),
                    "sv": int(self.saving_pitcher == name),
                },
            })
        return rows

    def _extract_fielding(self) -> list[dict]:
        if self.selected_team_home:
            df = self.individual_stats_df_list[8]
        else:
            df = self.individual_stats_df_list[7]

        rows = []
        for i in range(len(df) - 1):
            rows.append({
                "player_name": df['Name'].loc[i].strip(),
                "position": df['P'].loc[i].strip(),
                "jersey_number": int(df['#'].loc[i]),
                "stats": {
                    "po": int(df['PO'].loc[i]),
                    "a": int(df['A'].loc[i]),
                    "e": int(df['E'].loc[i]),
                    "catchers_interference": int(df['CI'].loc[i]),
                    "pb": int(df['PB'].loc[i]),
                    "sba": int(df['SBA'].loc[i]),
                    "cs": int(df['CSB'].loc[i]),
                    "dp": int(df['IDP'].loc[i]),
                    "tp": int(df['TP'].loc[i]),
                },
            })
        return rows


# ============================================================================
# CLI
# ============================================================================

def main():
    parser = argparse.ArgumentParser(description="Scrape NCAA games and save to JSON")
    parser.add_argument("game_ids", nargs="+", type=int, help="NCAA game ID(s)")
    parser.add_argument("--team", default="Virginia", help="Selected team name")
    parser.add_argument("--headless", action="store_true", help="Run browser headless")
    parser.add_argument("--output-dir", default="game_data", help="Output directory")
    args = parser.parse_args()

    os.makedirs(args.output_dir, exist_ok=True)

    for game_id in args.game_ids:
        print(f"\n{'='*60}")
        print(f"Scraping game {game_id}...")
        print(f"{'='*60}")

        try:
            gp = GameParser(game_id, selected_team=args.team, headless=args.headless)
            data = gp.extract_all()

            out_path = os.path.join(args.output_dir, f"{game_id}.json")
            with open(out_path, 'w') as f:
                json.dump(data, f, indent=2)

            print(f"\nSaved: {out_path}")
            print(f"  {gp.selected_team} vs {gp.opponent} on {gp.date}")
            print(f"  Score: {gp.selected_team_runs}-{gp.opponent_runs}")
            print(f"  Batters: {len(data['batting'])}, Pitchers: {len(data['pitching'])}, Fielders: {len(data['fielding'])}")

        except Exception as e:
            print(f"ERROR scraping game {game_id}: {e}")

        time.sleep(2)  # Be polite between games


if __name__ == "__main__":
    main()