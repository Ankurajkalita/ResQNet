import requests
import time
import os

# Get the API URL from environment or fallback to localhost
# On Render, it should be your actual deployment URL
API_URL = os.getenv("API_URL", "http://localhost:8000")
HEALTH_URL = f"{API_URL}/health"

def ping_server():
    print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Pinging {HEALTH_URL}...")
    try:
        response = requests.get(HEALTH_URL, timeout=10)
        if response.status_code == 200:
            print(f"Success! Status: {response.json()}")
        else:
            print(f"Server returned status code: {response.status_code}")
    except Exception as e:
        print(f"Ping failed: {e}")

if __name__ == "__main__":
    # If running as a standalone script, you can loop it
    # But better to run it via an external cron job for free.
    ping_server()
