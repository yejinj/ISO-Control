import time
import requests
import os

# 환경변수
TARGET_URL = os.getenv("TARGET_URL", "http://isocontrol-core:8080/healthz")
OPERATOR_API = os.getenv("OPERATOR_API", "http://admin-api.isocontrol.svc.cluster.local:8080/alert")
CHECK_INTERVAL = int(os.getenv("CHECK_INTERVAL", 20))  # 초
LATENCY_THRESHOLD = int(os.getenv("LATENCY_THRESHOLD", 500))  # 밀리초
FAIL_THRESHOLD = 3  # 연속 실패 3회

def check_latency():
    try:
        start = time.time()
        response = requests.get(TARGET_URL, timeout=3)
        elapsed = (time.time() - start) * 1000  # ms
        return elapsed, response.status_code
    except Exception as e:
        print(f"[ERROR] Request failed: {e}")
        return None, None

def send_alert(latency):
    payload = {
        "latency": latency,
        "type": "latency",
        "message": f"High latency detected: {latency:.2f}ms"
    }
    try:
        response = requests.post(OPERATOR_API, json=payload, timeout=5)
        print(f"[INFO] Alert sent to Operator. Status: {response.status_code}")
    except Exception as e:
        print(f"[ERROR] Failed to send alert: {e}")

def monitor_loop():
    fail_count = 0
    while True:
        latency, status = check_latency()
        if latency is None or status != 200:
            fail_count += 1
            print(f"[WARN] Failed request or bad status. Consecutive fails: {fail_count}")
        elif latency > LATENCY_THRESHOLD:
            fail_count += 1
            print(f"[WARN] High latency: {latency:.2f}ms. Consecutive fails: {fail_count}")
        else:
            fail_count = 0

        if fail_count >= FAIL_THRESHOLD:
            print(f"[ALERT] Detected {FAIL_THRESHOLD} consecutive latency issues.")
            send_alert(latency)
            fail_count = 0

        time.sleep(CHECK_INTERVAL)

if __name__ == "__main__":
    monitor_loop()
