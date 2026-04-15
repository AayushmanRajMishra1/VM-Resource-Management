from flask import request, jsonify, render_template, Response
import json, time

from metrics import clients_data, lock
from alerts import check_alerts, alert_log

def event_stream():
    while True:
        time.sleep(2)
        with lock:
            yield f"data: {json.dumps(clients_data)}\n\n"

def register_routes(app):

    @app.route("/")
    def home():
        return render_template("index.html")

    @app.route("/upload", methods=["POST"])
    def upload():
        data = request.json
        client_id = data.get("client_id", "unknown")

        with lock:
            clients_data[client_id] = data

        check_alerts(client_id, data)

        return {"status": "ok"}

    @app.route("/stream")
    def stream():
        return Response(event_stream(), mimetype="text/event-stream")

    @app.route("/alerts")
    def alerts():
        return jsonify(list(alert_log))

    @app.route("/download")
    def download():
        with lock:
            return jsonify(clients_data)