import json
import os
from datetime import datetime

# 로그 파일 저장할 경로
LOG_FILE_PATH = "/mnt/logs/log.json"

def write_log(event_type, details):
    """
    장애 발생 시 로그를 JSON 파일로 기록하는 함수.
    """
    log_entry = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "event_type": event_type,
        "details": details
    }

    # 폴더 없으면 생성
    os.makedirs(os.path.dirname(LOG_FILE_PATH), exist_ok=True)

    # log.json이 없으면 새로 만들고, 있으면 기존 데이터에 추가
    if not os.path.exists(LOG_FILE_PATH):
        with open(LOG_FILE_PATH, 'w') as f:
            json.dump([log_entry], f, indent=4)
    else:
        with open(LOG_FILE_PATH, 'r+') as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError:
                data = []
            data.append(log_entry)
            f.seek(0)
            json.dump(data, f, indent=4)
