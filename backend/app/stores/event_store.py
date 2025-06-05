#!/usr/bin/env python3
"""
이벤트 스토어 모듈
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
import asyncio
from app.models.schemas import MonitoringEvent

class EventStore:
    """이벤트 스토어 싱글톤
    - 시스템 전체에서 하나의 인스턴스만 사용
    """
    _instance = None
    _events: List[MonitoringEvent] = [] #저장된 이벤트 목록
    _subscribers: Dict[str, List[callable]] = {}
    _last_update: Optional[datetime] = None
    _update_interval = 30  # 초

    def __new__(cls):
    #클래스 첫 인스턴스 생성 시에만 새 인스턴스 생성
    #이후에는 기존 인스턴스 반환
        if cls._instance is None:
            cls._instance = super(EventStore, cls).__new__(cls)
        return cls._instance

    def subscribe(self, event_type: str, callback: callable): # 이벤트 구독 등록
        if event_type not in self._subscribers:
            self._subscribers[event_type] = []
        self._subscribers[event_type].append(callback)

    def unsubscribe(self, event_type: str, callback: callable): #구독 해제
        if event_type in self._subscribers:
            self._subscribers[event_type].remove(callback)

    def notify_subscribers(self, event_type: str, data: Any): # 구독자에게 알림
        if event_type in self._subscribers:
            for callback in self._subscribers[event_type]:
                callback(data)

    def update_events(self, events: List[MonitoringEvent]): # 이벤트 업데이트
        self._events = events
        self._last_update = datetime.utcnow()
        self.notify_subscribers("events_updated", events)

    def get_events(self, limit: int = 50) -> List[MonitoringEvent]: # 이벤트 조회
        return self._events[:limit] # 반환할 이벤트 수 제한

    def should_update(self) -> bool:
        """업데이트 필요 여부 확인"""
        if not self._last_update:
            return True
        return (datetime.utcnow() - self._last_update).total_seconds() >= self._update_interval

event_store = EventStore() 