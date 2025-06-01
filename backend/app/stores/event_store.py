#!/usr/bin/env python3
"""
이벤트 스토어 모듈
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
import asyncio
from app.models.schemas import MonitoringEvent

class EventStore:
    """이벤트 스토어 싱글톤"""
    _instance = None
    _events: List[MonitoringEvent] = []
    _subscribers: Dict[str, List[callable]] = {}
    _last_update: Optional[datetime] = None
    _update_interval = 30  # 초

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(EventStore, cls).__new__(cls)
        return cls._instance

    def subscribe(self, event_type: str, callback: callable):
        """이벤트 구독"""
        if event_type not in self._subscribers:
            self._subscribers[event_type] = []
        self._subscribers[event_type].append(callback)

    def unsubscribe(self, event_type: str, callback: callable):
        """이벤트 구독 해제"""
        if event_type in self._subscribers:
            self._subscribers[event_type].remove(callback)

    def notify_subscribers(self, event_type: str, data: Any):
        """구독자에게 알림"""
        if event_type in self._subscribers:
            for callback in self._subscribers[event_type]:
                callback(data)

    def update_events(self, events: List[MonitoringEvent]):
        """이벤트 업데이트"""
        self._events = events
        self._last_update = datetime.utcnow()
        self.notify_subscribers("events_updated", events)

    def get_events(self, limit: int = 50) -> List[MonitoringEvent]:
        """이벤트 조회"""
        return self._events[:limit]

    def should_update(self) -> bool:
        """업데이트 필요 여부 확인"""
        if not self._last_update:
            return True
        return (datetime.utcnow() - self._last_update).total_seconds() >= self._update_interval

# 싱글톤 인스턴스
event_store = EventStore() 