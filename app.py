from flask import Flask, render_template, request, jsonify
import json
import os
import time

app = Flask(__name__)
app.config["TEMPLATES_AUTO_RELOAD"] = True

DATA_DIR = "data"
DATA_FILE = os.path.join(DATA_DIR, "tasks.json")

os.makedirs(DATA_DIR, exist_ok=True)

if not os.path.exists(DATA_FILE):
    with open(DATA_FILE, "w") as f:
        json.dump([], f)

def load_tasks():
    try:
        with open(DATA_FILE, "r") as f:
            data = json.load(f)
            return data if isinstance(data, list) else []
    except:
        return []

def save_tasks(tasks):
    with open(DATA_FILE, "w") as f:
        json.dump(tasks, f, indent=2)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "message": "Flask backend working"})

@app.route("/api/tasks", methods=["GET"])
def get_tasks():
    return jsonify(load_tasks())

@app.route("/api/tasks", methods=["POST"])
def create_task():
    tasks = load_tasks()
    data = request.get_json(silent=True) or {}
    new_task = {
        "id": int(time.time() * 1000),
        "title": data.get("title", "").strip(),
        "completed": False
    }
    if not new_task["title"]:
        return jsonify({"message": "Title is required"}), 400
    tasks.append(new_task)
    save_tasks(tasks)
    return jsonify(new_task), 201

@app.route("/api/tasks", methods=["PUT"])
def update_task():
    tasks = load_tasks()
    data = request.get_json(silent=True) or {}

    for task in tasks:
        if task["id"] == data.get("id"):
            task["completed"] = bool(data.get("completed"))
            save_tasks(tasks)
            return jsonify({"message": "Task updated"})

    return jsonify({"message": "Task not found"}), 404

@app.route("/api/tasks", methods=["DELETE"])
def delete_task():
    tasks = load_tasks()
    data = request.get_json(silent=True) or {}

    updated_tasks = [task for task in tasks if task["id"] != data.get("id")]

    if len(updated_tasks) == len(tasks):
        return jsonify({"message": "Task not found"}), 404

    save_tasks(updated_tasks)
    return jsonify({"message": "Task deleted"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)