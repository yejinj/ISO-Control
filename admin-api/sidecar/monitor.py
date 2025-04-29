import time
import psutil
from sidecar.logger import write_log

CPU_THRESHOLD = 90  # CPU 사용률 임계치 (%)
MEMORY_THRESHOLD = 90  # 메모리 사용률 임계치 (%)
DISK_THRESHOLD = 90  # 디스크 사용률 임계치 (%)
CHECK_INTERVAL = 20  # 체크 주기 (초)

def check_cpu_usage():
    cpu_usage = psutil.cpu_percent(interval=1)
    if cpu_usage > CPU_THRESHOLD:
        write_log(
            event_type="High CPU Usage",
            details={
                "cpu_usage": f"{cpu_usage}%",
                "threshold": f"{CPU_THRESHOLD}%"
            }
        )

def check_memory_usage():
    memory = psutil.virtual_memory()
    if memory.percent > MEMORY_THRESHOLD:
        write_log(
            event_type="High Memory Usage",
            details={
                "memory_usage": f"{memory.percent}%",
                "threshold": f"{MEMORY_THRESHOLD}%"
            }
        )

def check_disk_usage():
    disk = psutil.disk_usage('/')
    if disk.percent > DISK_THRESHOLD:
        write_log(
            event_type="High Disk Usage",
            details={
                "disk_usage": f"{disk.percent}%",
                "threshold": f"{DISK_THRESHOLD}%"
            }
        )

def monitor_loop():
    while True:
        check_cpu_usage()
        check_memory_usage()
        check_disk_usage()
        time.sleep(CHECK_INTERVAL)

if __name__ == "__main__":
    monitor_loop()
