import requests

resp = requests.post(
    "https://flood-watch-bmvg.onrender.com/api/alerts/sms/broadcast",
    json={"message": "Test message", "region": "Nairobi"}
)
print("Status:", resp.status_code)
print("Response:", resp.text)
