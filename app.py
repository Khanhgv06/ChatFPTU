import os
import requests
from flask import Flask, request, jsonify, send_from_directory
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Facebook & Dify API credentials
FACEBOOK_PAGE_ACCESS_TOKEN = os.environ['META_PAGE_ACCESS_TOKEN']
DIFY_API_URL = os.environ['DIFY_API_URL']
DIFY_API_KEY = os.environ['DIFY_API_KEY']
VERIFY_TOKEN = os.environ['CHATBOT_VERIFY_TOKEN']

IMAGE_FOLDER = "data/img"

@app.route("/", methods=["GET"])
def home():
    return "Dify Messenger Bot + Image Server is running!", 200

# Serve uni map
@app.route("/map", methods=["GET"])
def get_image1():
    return send_from_directory(IMAGE_FOLDER, "map.jpg")

@app.route("/webhook", methods=["GET"])
def verify_webhook():
    """Verify Facebook webhook during setup"""
    mode = request.args.get("hub.mode")
    token = request.args.get("hub.verify_token")
    challenge = request.args.get("hub.challenge")

    if mode == "subscribe" and token == VERIFY_TOKEN:
        return challenge, 200
    return "Forbidden", 403

@app.route("/webhook", methods=["POST"])
def handle_message():
    """Handles incoming messages from Facebook Messenger"""
    data = request.get_json()
    print("Incoming:", data)

    if "entry" in data:
        for entry in data["entry"]:
            for messaging_event in entry["messaging"]:
                if "message" in messaging_event and "text" in messaging_event["message"]:
                    sender_id = messaging_event["sender"]["id"]
                    user_message = messaging_event["message"]["text"]

                    # Send message to Dify AI
                    dify_response = send_to_dify(user_message, sender_id)

                    # Send response back to Facebook Messenger
                    send_to_messenger(sender_id, dify_response)

    return "OK", 200

def send_to_dify(user_message, user_id):
    """Sends user message to Dify AI and returns the response"""
    payload = {
        "inputs": {},
        "query": user_message,
        "response_mode": "blocking",
        "conversation_id": "",
        "user": user_id
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

def send_to_messenger(recipient_id, response_text):
    """Sends a message back to the user via Messenger API"""
    url = f"https://graph.facebook.com/v19.0/me/messages"
    payload = {
        "recipient": {"id": recipient_id},
        "message": {"text": response_text}
    }
    headers = {
        "Authorization": f"Bearer {FACEBOOK_PAGE_ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }

    response = requests.post(url, json=payload, headers=headers)
    if response.status_code != 200:
        print("Error sending to Messenger:", response.text)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=443, debug=True)
