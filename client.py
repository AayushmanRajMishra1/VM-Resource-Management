import psutil, requests, time, socket

SERVER_URL = "http://localhost:10000/upload"  # will change after deployment

import sys
client_id = sys.argv[1] if len(sys.argv) > 1 else "PC-1"

while True:
    data = {
        "client_id": client_id,
        "cpu": psutil.cpu_percent(),
        "memory": psutil.virtual_memory().percent,
        "disk": psutil.disk_usage("/").percent
    }

    try:
        requests.post(SERVER_URL, json=data)
    except:
        pass

    time.sleep(2)