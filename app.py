from flask import Flask
from routes import register_routes
import os

app = Flask(__name__)

register_routes(app)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)