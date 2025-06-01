import { useState, useEffect, useCallback } from 'react';
import { MonitoringEvent } from '../types';

export const useEvents = (limit: number = 50) => {
  const [events, setEvents] = useState<MonitoringEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      const response = await fetch(`/api/monitoring/events?limit=${limit}`);
      if (!response.ok) {
        throw new Error('이벤트를 가져오는데 실패했습니다.');
      }
      const data = await response.json();
      setEvents(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 30000); // 30초마다 갱신
    return () => clearInterval(interval);
  }, [fetchEvents]);

  return { events, loading, error, refetch: fetchEvents };
}; 