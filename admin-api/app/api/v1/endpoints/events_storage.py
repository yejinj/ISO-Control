event_log = []

def add_event(event):
    from datetime import datetime
    event = event.copy()
    event["time"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    event_log.append(event)
    # 최대 1000개까지만 저장
    if len(event_log) > 1000:
        event_log.pop(0)

def get_events():
    # 최신순 100개 반환
    return event_log[-100:][::-1] 