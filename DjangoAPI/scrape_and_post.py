import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'baseball_stats.settings')  # change if your settings module is elsewhere
django.setup()

import requests
from decouple import config


API_BASE_URL = "http://127.0.0.1:8000/api/"
API_KEY = config('SCRAPER_API_KEY')

def post_stats(endpoint, data):
    headers = {
    "Content-Type": "application/json",
    "X-API-KEY": API_KEY
    }
    response = requests.post(f'{API_BASE_URL}{endpoint}/', json=data, headers=headers)
    if response.status_code != 201:
        print(f'Error posting to {endpoint}: {response.status_code}')
        print(response.json())
    return response
