import requests

BOT_TOKEN = "8795872225:AAGZeBYkXCMvt3iQQ5CeSt8McqupNDarzhk"
CHAT_ID = "8199128489"

def send_whatsapp(msg):
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"

    try:
        requests.post(url, json={
            "chat_id": CHAT_ID,
            "text": msg
        })
    except Exception as e:
        print("Telegram error:", e)
        