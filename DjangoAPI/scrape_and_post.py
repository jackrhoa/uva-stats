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
        print(f'Error posting to {endpoint}: STATUS CODE {response.status_code}')
        with open('error_log.txt', 'a') as f:
            f.write(f'Error posting to {endpoint}: STATUS CODE {response.status_code}\n')
            f.write(f'Response text: {response.text}\n')
        # print("Response text (truncated):", response.text)
        # print("RESPONSE:", response)
        print(response.json())
    return response
