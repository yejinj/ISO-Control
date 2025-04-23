# Example import in database.py
from app.models.models import SomeModel
from pymongo import MongoClient

# MongoDB connection
client = MongoClient("mongodb://localhost:27017/")
db = client["iso_control"]
events_collection = db["events"]

def get_events():
    events = list(events_collection.find({}, {"_id": 0}))
    print("Fetched events from MongoDB:", events)  # 디버깅용 출력
    return events

# In-memory storage for events
events_data = [
    {"id": 1, "event": "Pod restarted", "timestamp": "2025-04-23T10:00:00Z"},
    {"id": 2, "event": "Service isolated", "timestamp": "2025-04-23T11:00:00Z"},
]
