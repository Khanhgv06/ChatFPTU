import os
import requests
from flask import Flask, request, jsonify, send_from_directory
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

DIFY_API_URL = os.environ['DIFY_API_URL']
DIFY_API_KEY = os.environ['DIFY_API_KEY']

IMAGE_FOLDER = "data/img"

@app.route("/", methods=["GET"])
def home():
    return "OK", 200

@app.route("/map", methods=["GET"])
def get_map():
    return send_from_directory(IMAGE_FOLDER, "map.jpg")

@app.route("/chat", methods=["POST"])
def chat():
    """Handles chat messages from the Expo app"""
    data = request.get_json()
    user_message = data.get("message", "")

    if not user_message:
        return jsonify({"error": "Message cannot be empty"}), 400

    # Send message to Dify AI
    dify_response = send_to_dify(user_message)
    return jsonify({"reply": dify_response})


def send_to_dify(user_message):
    """Sends user message to Dify AI and returns the response"""
    payload = {
        "inputs": {},
        "query": user_message,
        "response_mode": "blocking",
        "conversation_id": "",
        "user": "test_user"
    }
    headers = {
        "Authorization": f"Bearer {DIFY_API_KEY}",
        "Content-Type": "application/json"
    }

    response = requests.post(DIFY_API_URL, json=payload, headers=headers)
    if response.status_code == 200:
        return response.json().get("answer", "I'm not sure how to respond to that.")
    else:
        print("Error from Dify:", response.text)
        return "Sorry, something went wrong."

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000, debug=True)
