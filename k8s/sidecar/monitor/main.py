import time
import psutil
import requests
import os

# 환경변수 (나중에 ConfigMap으로 치환 가능)
OPERATOR_API = os.getenv("OPERATOR_API", "http://operator-service.isocontrol.svc.cluster.local:8080/alert")
CHECK_INTERVAL = int(os.getenv("CHECK_INTERVAL", 20))  # 초
THRESHOLD = 90  # %

def get_resource_usage():
    cpu = psutil.cpu_percent(interval=1)
    memory = psutil.virtual_memory().percent
    disk = psutil.disk_usage('/').percent
    return cpu, memory, disk

def send_alert(cpu, memory, disk):
    payload = {
        "cpu": cpu,
        "memory": memory,
        "disk": disk,
        "type": "resource",
        "message": "Resource usage exceeded threshold."
    }
    try:
        response = requests.post(OPERATOR_API, json=payload, timeout=5)
        print(f"[INFO] Alert sent to Operator. Status: {response.status_code}")
    except Exception as e:
        print(f"[ERROR] Failed to send alert: {e}")

def monitor_loop():
    while True:
        cpu, memory, disk = get_resource_usage()
        print(f"[MONITOR] CPU: {cpu}%, Memory: {memory}%, Disk: {disk}%")

        if cpu > THRESHOLD or memory > THRESHOLD or disk > THRESHOLD:
            print(f"[ALERT] Resource usage exceeded threshold. Sending alert...")
            send_alert(cpu, memory, disk)

        time.sleep(CHECK_INTERVAL)

if __name__ == "__main__":
    monitor_loop()
