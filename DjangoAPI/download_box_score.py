#!/usr/bin/env python3
"""
Fetch NCAA Game Stats via Selenium

Scrapes box score, individual stats, and situational stats from stats.ncaa.org.

INSTALLATION:
    pip install selenium pandas beautifulsoup4 lxml

REQUIREMENTS:
    - Chrome browser installed
    - ChromeDriver (auto-managed by selenium 4.6+)

USAGE:
    from download_box_score import NcaaGameScraper

    scraper = NcaaGameScraper(ncaa_game_id="6181541", selected_team="Virginia", headless=True)
    scraper.fetch()

    scraper.box_score_df_list          # list of DataFrames from box score page
    scraper.box_score_soup             # BeautifulSoup of box score page
    scraper.individual_stats_df_list   # list of DataFrames from individual stats page
    scraper.situational_stats_soup     # BeautifulSoup of situational stats page
"""

import time
from io import StringIO

import pandas as pd
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


# ============================================================================
# CONFIGURATION
# ============================================================================

BASE_URL = "https://stats.ncaa.org/contests"
PAGE_LOAD_WAIT = 10      # seconds to wait for initial page load
RETRY_WAIT = 5           # seconds to wait before retry on failure
MAX_RETRIES = 2          # number of retries per page


# ============================================================================
# DRIVER SETUP
# ============================================================================

def init_driver(headless: bool = True) -> webdriver.Chrome:
    """
    Initialize a Chrome WebDriver.

    Uses selenium 4.6+ built-in driver management (no ChromeDriverManager needed).

    Args:
        headless: If True, run in headless mode. Set False to debug visually.
    """
    options = webdriver.ChromeOptions()

    if headless:
        options.add_argument('--headless=new')

    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-gpu')
    options.add_argument('--window-size=1920,1080')

    driver = webdriver.Chrome(options=options)
    return driver


# ============================================================================
# SCRAPER CLASS
# ============================================================================

class NcaaGameScraper:
    """
    Scrape box score, individual stats, and situational stats for a single NCAA game.

    Attributes:
        box_score_df_list: List of DataFrames parsed from the box score page.
        box_score_soup: BeautifulSoup object of the box score page.
        individual_stats_df_list: List of DataFrames parsed from the individual stats page.
        situational_stats_soup: BeautifulSoup object of the situational stats page.
    """

    def __init__(self, ncaa_game_id: str, selected_team: str, headless: bool = True):
        self.ncaa_game_id = str(ncaa_game_id)
        self.selected_team = selected_team
        self.headless = headless

        self.box_score_df_list = None
        self.box_score_soup = None
        self.individual_stats_df_list = None
        self.situational_stats_soup = None

    def _fetch_page(self, driver: webdriver.Chrome, url: str) -> str:
        """
        Fetch a page with retries. Returns the page source.

        Raises ValueError if all retries fail.
        """
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                driver.get(url)
                # Wait for at least one table to appear
                WebDriverWait(driver, PAGE_LOAD_WAIT).until(
                    EC.presence_of_element_located((By.TAG_NAME, "table"))
                )
                return driver.page_source
            except Exception as e:
                print(f"  Attempt {attempt}/{MAX_RETRIES} failed for {url}: {e}")
                if attempt < MAX_RETRIES:
                    print(f"  Retrying in {RETRY_WAIT}s...")
                    time.sleep(RETRY_WAIT)

        raise ValueError(f"Unable to fetch {url} after {MAX_RETRIES} attempts")

    def fetch(self) -> None:
        """
        Fetch all stats for this game. Populates instance attributes.

        Raises ValueError if critical pages cannot be loaded.
        """
        driver = init_driver(headless=self.headless)

        try:
            # --- Box Score ---
            box_url = f"{BASE_URL}/{self.ncaa_game_id}/box_score"
            print(f"Fetching box score: {box_url}")
            box_source = self._fetch_page(driver, box_url)
            self.box_score_df_list = pd.read_html(StringIO(box_source))
            self.box_score_soup = BeautifulSoup(box_source, "lxml")
            print(f"  OK - parsed {len(self.box_score_df_list)} table(s)")

            # --- Individual Stats ---
            ind_url = f"{BASE_URL}/{self.ncaa_game_id}/individual_stats"
            print(f"Fetching individual stats: {ind_url}")
            ind_source = self._fetch_page(driver, ind_url)
            self.individual_stats_df_list = pd.read_html(StringIO(ind_source))
            print(f"  OK - parsed {len(self.individual_stats_df_list)} table(s)")

            # --- Situational Stats ---
            sit_url = f"{BASE_URL}/{self.ncaa_game_id}/situational_stats"
            print(f"Fetching situational stats: {sit_url}")
            try:
                sit_source = self._fetch_page(driver, sit_url)
                self.situational_stats_soup = BeautifulSoup(sit_source, "lxml")
                print(f"  OK - situational stats loaded")
            except ValueError:
                print(f"  WARNING: Could not load situational stats (page may not exist)")
                self.situational_stats_soup = None

        finally:
            driver.quit()

    def get_team_box_score(self) -> pd.DataFrame | None:
        """
        Return the box score DataFrame for the selected team, if found.
        """
        if not self.box_score_df_list:
            return None

        for df in self.box_score_df_list:
            df_str = df.to_string()
            if self.selected_team.lower() in df_str.lower():
                return df

        return None


# ============================================================================
# CLI ENTRY POINT (for quick testing)
# ============================================================================

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Fetch NCAA game stats")
    parser.add_argument("game_id", help="NCAA game ID (from stats.ncaa.org URL)")
    parser.add_argument("--team", default="", help="Team name to highlight")
    parser.add_argument("--headless", action="store_true", default=False,
                        help="Run in headless mode (default: visible for debugging)")

    args = parser.parse_args()

    scraper = NcaaGameScraper(
        ncaa_game_id=args.game_id,
        selected_team=args.team,
        headless=args.headless,
    )
    scraper.fetch()

    print("\n--- Box Score Tables ---")
    for i, df in enumerate(scraper.box_score_df_list or []):
        print(f"\nTable {i}:")
        print(df.to_string())

    print("\n--- Individual Stats Tables ---")
    for i, df in enumerate(scraper.individual_stats_df_list or []):
        print(f"\nTable {i}:")
        print(df.to_string())

    if scraper.situational_stats_soup:
        print("\n--- Situational Stats Page Loaded ---")
    else:
        print("\n--- Situational Stats: Not Available ---")