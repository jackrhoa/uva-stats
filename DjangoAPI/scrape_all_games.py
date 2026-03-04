#!/usr/bin/env python3
"""
Scrape all games for an NCAA team and save each to JSON.

Fetches the team schedule page, extracts all box score game IDs,
then runs scrape_to_json on each one.

USAGE:
    python scrape_all_games.py 596439
    python scrape_all_games.py 596439 --team "Virginia" --headless
    python scrape_all_games.py 596439 --resume              # skip already-scraped games
    python scrape_all_games.py 596439 --ids-only             # just print game IDs, don't scrape

FINDING YOUR TEAM ID:
    Go to https://stats.ncaa.org and find your team's page.
    The number in the URL is the team ID, e.g.:
    https://stats.ncaa.org/teams/596439 -> 596439
"""

import argparse
import json
import os
import time

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from download_box_score import init_driver
from scrape_to_json import GameParser


SCHEDULE_URL = "https://stats.ncaa.org/teams/{team_id}"


def fetch_game_ids(team_id: int, headless: bool = False) -> list[int]:
    """
    Fetch all NCAA game IDs from a team's schedule page.

    Returns list of game IDs (integers).
    """
    driver = init_driver(headless=headless)
    url = SCHEDULE_URL.format(team_id=team_id)

    try:
        print(f"Fetching schedule: {url}")
        driver.get(url)

        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, '//a[@target="BOX_SCORE_WINDOW"]'))
        )

        links = driver.find_elements(By.XPATH, '//a[@target="BOX_SCORE_WINDOW"]')
        game_ids = []
        for link in links:
            href = link.get_attribute('href')
            try:
                game_id = int(href.split('/')[4])
                game_ids.append(game_id)
            except (IndexError, ValueError):
                print(f"  Skipping unrecognized link: {href}")

        print(f"Found {len(game_ids)} games")
        return game_ids

    finally:
        driver.quit()


def main():
    parser = argparse.ArgumentParser(description="Scrape all games for an NCAA team")
    parser.add_argument("team_id", type=int, help="NCAA team ID (from stats.ncaa.org URL)")
    parser.add_argument("--team", default="Virginia", help="Selected team name")
    parser.add_argument("--headless", action="store_true", help="Run browser headless")
    parser.add_argument("--output-dir", default="game_data", help="Output directory for JSON files")
    parser.add_argument("--resume", action="store_true",
                        help="Skip games that already have a JSON file")
    parser.add_argument("--ids-only", action="store_true",
                        help="Just print game IDs without scraping")
    parser.add_argument("--delay", type=int, default=3,
                        help="Seconds to wait between scraping games (default: 3)")
    args = parser.parse_args()

    # Step 1: Get all game IDs
    game_ids = fetch_game_ids(args.team_id, headless=args.headless)

    if not game_ids:
        print("No games found.")
        return

    if args.ids_only:
        for gid in game_ids:
            print(gid)
        return

    # Step 2: Scrape each game
    os.makedirs(args.output_dir, exist_ok=True)

    skipped = 0
    scraped = 0
    failed = 0

    for i, game_id in enumerate(game_ids):
        out_path = os.path.join(args.output_dir, f"{game_id}.json")

        # Resume mode: skip if JSON already exists
        if args.resume and os.path.exists(out_path):
            print(f"[{i+1}/{len(game_ids)}] Game {game_id} — already scraped, skipping")
            skipped += 1
            continue

        print(f"\n{'='*60}")
        print(f"[{i+1}/{len(game_ids)}] Scraping game {game_id}...")
        print(f"{'='*60}")

        try:
            gp = GameParser(game_id, selected_team=args.team, headless=args.headless)
            data = gp.extract_all()

            with open(out_path, 'w') as f:
                json.dump(data, f, indent=2)

            print(f"  Saved: {out_path}")
            print(f"  {gp.selected_team} vs {gp.opponent} on {gp.date}")
            print(f"  Score: {gp.selected_team_runs}-{gp.opponent_runs}")
            scraped += 1

        except Exception as e:
            print(f"  ERROR: {e}")
            failed += 1

        # Be polite between requests
        if i < len(game_ids) - 1:
            time.sleep(args.delay)

    print(f"\n{'='*60}")
    print(f"Done! Scraped: {scraped}, Skipped: {skipped}, Failed: {failed}")
    print(f"JSON files in: {args.output_dir}/")
    print(f"\nTo upload to Django:")
    print(f"  docker cp {args.output_dir}/ uva-stats-backend-1:/app/game_data/")
    print(f"  docker exec -it uva-stats-backend-1 python upload_to_django.py game_data/*.json")


if __name__ == "__main__":
    main()