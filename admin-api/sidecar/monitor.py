import time
import os
from sidecar.logger import write_log

CPU_THRESHOLD = 90  # CPU 사용률 임계치 (%)
MEMORY_THRESHOLD = 90  # 메모리 사용률 임계치 (%)
DISK_THRESHOLD = 90  # 디스크 사용률 임계치 (%)
CHECK_INTERVAL = 20  # 체크 주기 (초)

# cgroup v2 경로
CGROUP_PATH = "/sys/fs/cgroup"

def read_cgroup_metric(path):
    try:
        with open(path, 'r') as f:
            return int(f.read().strip())
    except (FileNotFoundError, ValueError):
        return 0

def check_cpu_usage():
    # CPU 사용량 계산 (cgroup v2)
    cpu_stat_path = os.path.join(CGROUP_PATH, "cpu.stat")
    try:
        with open(cpu_stat_path, 'r') as f:
            stats = dict(line.split() for line in f if line.strip())
            usage_usec = int(stats.get('usage_usec', 0))
            total_usec = int(stats.get('total_usec', 0))
            
            if total_usec > 0:
                cpu_usage = (usage_usec / total_usec) * 100
    if cpu_usage > CPU_THRESHOLD:
        write_log(
            event_type="High CPU Usage",
            details={
                            "cpu_usage": f"{cpu_usage:.2f}%",
                            "threshold": f"{CPU_THRESHOLD}%",
                            "usage_usec": usage_usec,
                            "total_usec": total_usec
                        }
                    )
    except Exception as e:
        write_log(
            event_type="CPU Usage Check Error",
            details={"error": str(e)}
        )

def check_memory_usage():
    # 메모리 사용량 계산 (cgroup v2)
    memory_current = read_cgroup_metric(os.path.join(CGROUP_PATH, "memory.current"))
    memory_max = read_cgroup_metric(os.path.join(CGROUP_PATH, "memory.max"))
    
    if memory_max > 0:
        memory_usage = (memory_current / memory_max) * 100
        if memory_usage > MEMORY_THRESHOLD:
        write_log(
            event_type="High Memory Usage",
            details={
                    "memory_usage": f"{memory_usage:.2f}%",
                    "threshold": f"{MEMORY_THRESHOLD}%",
                    "current_bytes": memory_current,
                    "max_bytes": memory_max
            }
        )

def check_disk_usage():
    # 디스크 사용량 계산 (cgroup v2)
    io_stat_path = os.path.join(CGROUP_PATH, "io.stat")
    try:
        with open(io_stat_path, 'r') as f:
            stats = dict(line.split() for line in f if line.strip())
            read_bytes = int(stats.get('rbytes', 0))
            write_bytes = int(stats.get('wbytes', 0))
            
            # 디스크 사용량이 임계치를 초과하는 경우
            if (read_bytes + write_bytes) > DISK_THRESHOLD:
                write_log(
                    event_type="High Disk I/O",
                    details={
                        "read_bytes": read_bytes,
                        "write_bytes": write_bytes,
                        "threshold": f"{DISK_THRESHOLD} bytes"
                    }
                )
    except Exception as e:
        write_log(
            event_type="Disk Usage Check Error",
            details={"error": str(e)}
        )

def monitor_loop():
    while True:
        check_cpu_usage()
        check_memory_usage()
        check_disk_usage()
        time.sleep(CHECK_INTERVAL)

if __name__ == "__main__":
    monitor_loop()
