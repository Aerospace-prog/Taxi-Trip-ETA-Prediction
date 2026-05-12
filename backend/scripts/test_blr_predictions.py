import sys
import os
import urllib.request
import json
from datetime import datetime

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from app.services.auth_service import create_access_token
from app.database import SessionLocal
from app.models.user import User

# Indiranagar to Koramangala (roughly 6km, high traffic usually)
PICKUP_LAT = 12.9784
PICKUP_LNG = 77.6408
DROPOFF_LAT = 12.9345
DROPOFF_LNG = 77.6214

url = "http://localhost:8000/predict"

db = SessionLocal()
user = db.query(User).first()
if not user:
    print("No users in DB!")
    sys.exit(1)

token = create_access_token({"sub": user.email})

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {token}"
}

payload = {
    "pickup_latitude": PICKUP_LAT,
    "pickup_longitude": PICKUP_LNG,
    "dropoff_latitude": DROPOFF_LAT,
    "dropoff_longitude": DROPOFF_LNG,
    "pickup_datetime": datetime.utcnow().isoformat()
}

req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers, method='POST')

try:
    with urllib.request.urlopen(req) as response:
        if response.status == 200:
            data = json.loads(response.read().decode('utf-8'))
            print("✅ Bengaluru Prediction Successful!")
            print(json.dumps(data, indent=2))
        else:
            print(f"❌ Error: {response.status}")
except Exception as e:
    print(f"❌ Exception: {e}")
