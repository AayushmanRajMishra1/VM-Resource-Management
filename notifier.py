import requests
import os

BOT_TOKEN = os.getenv("BOT_TOKEN")
CHAT_ID = os.getenv("CHAT_ID")

def send_whatsapp(msg):
    if not BOT_TOKEN or not CHAT_ID:
        print("Token or Chat ID missing")
        return

    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"

    try:
        requests.post(url, json={
            "chat_id": CHAT_ID,
            "text": msg
        })
    except Exception as e:
        print("Telegram error:", e)