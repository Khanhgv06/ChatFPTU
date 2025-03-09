import os
import requests
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

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
    """Handles chat messages from the Expo app and returns the response"""
    data = request.get_json()
    user_message = data.get("message", "")
    conversation_id = data.get("conversation_id", "")

    if not user_message:
        return jsonify({"error": "Message cannot be empty"}), 400

    response = send_to_dify(user_message, conversation_id)
    return jsonify({"response": response})

def send_to_dify(user_message, conversation_id):
    """Sends user message to Dify AI and returns the full response"""
    payload = {
        "inputs": {},
        "query": user_message,
        "response_mode": "blocking",
        "conversation_id": conversation_id,
        "user": "test_user"
    }
    headers = {
        "Authorization": f"Bearer {DIFY_API_KEY}",
        "Content-Type": "application/json"
    }

    response = requests.post(DIFY_API_URL, json=payload, headers=headers)
    if response.status_code == 200:
        return response.json().get('answer', 'No response from AI')
    else:
        return "Sorry, something went wrong."

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000, debug=True)
