#!/usr/bin/env python3
"""
Stage 2: Load scraped game JSON into Django database.

Run this inside your Docker container (or anywhere Django is configured).
Uses Django ORM for player/school creation, and your existing post_stats()
for the endpoints that already work.

USAGE:
    python upload_to_django.py game_data/6313117.json
    python upload_to_django.py game_data/*.json
"""

import argparse
import json
import os
import sys

# Django setup — must happen before importing models
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'baseball_stats.settings')
import django
django.setup()

from app.models import PlayerInfo, SchoolInfo
from scrape_and_post import post_stats


# ============================================================================
# UPLOAD LOGIC
# ============================================================================

def upload_game(data: dict) -> None:
    """Upload a single game's data to the database."""
    meta = data["meta"]
    game_id = meta["game_id"]

    print(f"\nUploading game {meta['ncaa_game_id']} "
          f"({meta['selected_team']} vs {meta['opponent']} on {meta['date']})...")

    # 1. Create schools (ORM)
    for school in data["schools"]:
        school_info, created = SchoolInfo.objects.get_or_create(
            school_id=school["school_id"],
        )
        if created:
            school_info.school_name = school["school_name"]
            school_info.save()
            print(f"  Created school: {school['school_name']}")
        else:
            print(f"  Found school: {school_info.school_name}")

    # 2. Create game (API)
    print(f"  Game info (id={game_id})...")
    post_stats("game_info/create", data["game_info"])

    # 3. Batting stats
    for batter in data["batting"]:
        player_info, created = PlayerInfo.objects.get_or_create(
            player_name=batter["player_name"],
            defaults={
                "player_position": {batter["position"]: 1},
                "jersey_number": batter["jersey_number"],
            }
        )
        if not created:
            positions = player_info.player_position
            pos = batter["position"]
            positions[pos] = positions.get(pos, 0) + 1
            player_info.player_position = dict(positions)
            player_info.save()

        stat_data = {
            "player_id": player_info.player_id,
            "game_id": game_id,
            **batter["stats"],
        }
        post_stats("batter_stats/create", stat_data)
        print(f"  Batter: {batter['player_name']}")

    # 4. Pitching stats
    for pitcher in data["pitching"]:
        player_info, created = PlayerInfo.objects.get_or_create(
            player_name=pitcher["player_name"],
            defaults={
                "player_position": {"P": 1},
                "jersey_number": pitcher["jersey_number"],
            }
        )

        stat_data = {
            "player_id": player_info.player_id,
            "game_id": game_id,
            **pitcher["stats"],
        }
        post_stats("pitcher_stats/create", stat_data)
        print(f"  Pitcher: {pitcher['player_name']}")

    # 5. Fielding stats
    for fielder in data["fielding"]:
        player_info, created = PlayerInfo.objects.get_or_create(
            player_name=fielder["player_name"],
            defaults={
                "player_position": {fielder["position"]: 1},
                "jersey_number": fielder["jersey_number"],
            }
        )

        stat_data = {
            "player_id": player_info.player_id,
            "player_position": fielder["position"],
            "game_id": game_id,
            **fielder["stats"],
        }
        post_stats("fielding_stats/create", stat_data)
        print(f"  Fielder: {fielder['player_name']}")

    print(f"  Done uploading game {meta['ncaa_game_id']}")


# ============================================================================
# CLI
# ============================================================================

def main():
    parser = argparse.ArgumentParser(description="Upload game JSON files to Django database")
    parser.add_argument("json_files", nargs="+", help="Path(s) to game JSON files")
    args = parser.parse_args()

    for filepath in args.json_files:
        if not os.path.exists(filepath):
            print(f"File not found: {filepath}")
            continue

        with open(filepath) as f:
            data = json.load(f)

        upload_game(data)

    print("\nAll done!")


if __name__ == "__main__":
    main()