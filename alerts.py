from collections import deque
from config import THRESHOLDS
from notifier import send_whatsapp

alert_log = deque(maxlen=200)
active_alerts = {}

def check_alerts(client_id, data):
    checks = [
        ("cpu", data["cpu"], THRESHOLDS["cpu"]),
        ("memory", data["memory"], THRESHOLDS["memory"]),
        ("disk", data["disk"], THRESHOLDS["disk"]),
    ]

    for key, value, threshold in checks:
        if value >= threshold:
            if (client_id, key) not in active_alerts:
                active_alerts[(client_id, key)] = True

                msg = f"{client_id}: {key} high at {value}%"
                alert_log.appendleft(msg)

                send_whatsapp(msg)
        else:
            active_alerts.pop((client_id, key), None)