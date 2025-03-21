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

@app.route("/Alpha", methods=["GET"])
def get_alpha():
    return send_from_directory(IMAGE_FOLDER, "alpha.jpg")

@app.route("/Beta", methods=["GET"])
def get_beta():
    return send_from_directory(IMAGE_FOLDER, "beta.jpg")

@app.route("/Delta", methods=["GET"])
def get_delta():
    return send_from_directory(IMAGE_FOLDER, "delta.jpg")

@app.route("/Epsilon", methods=["GET"])
def get_epsilon():
    return send_from_directory(IMAGE_FOLDER, "epsilon.jpg")

@app.route("/Gamma", methods=["GET"])
def get_gamma():
    return send_from_directory(IMAGE_FOLDER, "gamma.jpg")

@app.route("/dom_a", methods=["GET"])
def get_dom_a():
    return send_from_directory(IMAGE_FOLDER, "dom_a.jpg")

@app.route("/dom_b", methods=["GET"])
def get_dom_b():
    return send_from_directory(IMAGE_FOLDER, "dom_b.jpg")

@app.route("/dom_c", methods=["GET"])
def get_dom_c():
    return send_from_directory(IMAGE_FOLDER, "dom_c.jpg")

@app.route("/dom_d", methods=["GET"])
def get_dom_d():
    return send_from_directory(IMAGE_FOLDER, "dom_d.jpg")

@app.route("/dom_e", methods=["GET"])
def get_dom_e():
    return send_from_directory(IMAGE_FOLDER, "dom_e.jpg")

@app.route("/dom_f", methods=["GET"])
def get_dom_f():
    return send_from_directory(IMAGE_FOLDER, "dom_f.jpg")

@app.route("/dom_g", methods=["GET"])
def get_dom_g():
    return send_from_directory(IMAGE_FOLDER, "dom_g.jpg")

@app.route("/dom_h", methods=["GET"])
def get_dom_h():
    return send_from_directory(IMAGE_FOLDER, "dom_h.jpg")

@app.route("/chat", methods=["POST"])
def chat():
    """Handles chat messages from the Expo app and returns the response"""
    data = request.get_json()
    user_message = data.get("message", "")
    conversation_id = data.get("conversation_id", "")

    if not user_message:
        return jsonify({"error": "Message cannot be empty"}), 400

    response = send_to_dify(user_message, conversation_id)
    return response

def send_to_dify(user_message, conversation_id=""):
    """Sends user message to Dify AI and returns the full response"""
    payload = {
        "inputs": {},
        "query": user_message,
        "response_mode": "blocking",
        "conversation_id": conversation_id,
        "user": "ChatFPTU_Android_App"
    }
    headers = {
        "Authorization": f"Bearer {DIFY_API_KEY}",
        "Content-Type": "application/json"
    }

    response = requests.post(DIFY_API_URL, json=payload, headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        return "Sorry, something went wrong."
