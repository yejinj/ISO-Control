import React, { useEffect, useState } from "react";
import axios from "axios";

// 타입 정의 (export 제거)
type Event = {
  id: string;
  timestamp: string;
  service: string;
  type: string;
  description: string;
};

// props 인터페이스 제거
// interface EventTableProps {
//   events: Event[];
// }

const formatTimestamp = (timestamp: string) => {
  try {
    return new Date(timestamp).toLocaleString('ko-KR');
  } catch {
    return timestamp;
  }
};

// 컴포넌트 시그니처에서 props 제거
const EventTable: React.FC = () => {
  // 내부 상태 관리 복원
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  // 데이터 로딩 로직 복원
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(false);
        // 임시 URL 또는 이전 URL 사용 (원래 코드에 따라)
        const response = await axios.get<Event[]>("http://localhost:8000/events");
        setEvents(response.data);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError(true);
        // 에러 발생 시 임시 데이터 (옵션)
        setEvents([
          { id: 'evt-001', timestamp: '2024-04-21T10:00:00Z', service: 'payment-service', type: 'isolation', description: '메모리 사용량 초과로 격리됨' },
          { id: 'evt-002', timestamp: '2024-04-21T09:45:00Z', service: 'user-service', type: 'health_check_failed', description: '헬스 체크 3회 연속 실패' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 5000); // 주기적 로딩은 유지 (필요시 제거)
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="p-6 text-center">이벤트 로그 로딩 중...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">이벤트 로그를 불러올 수 없습니다.</div>;
  }

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-base font-medium text-gray-900">최근 이벤트</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                시간
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                서비스
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                유형
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                설명
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {events.length > 0 ? (
              events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatTimestamp(event.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {event.service}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {event.type}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {event.description}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                  표시할 이벤트가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EventTable;
