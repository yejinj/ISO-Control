import React, { useEffect, useState } from "react";
import axios from "axios";

type Event = {
  timestamp: string;
  event_type: string;
  target: string;
  reason: string;
  status: string;
};

const EventTable: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get("http://localhost:8000/events");
        setEvents(response.data);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
    // 5초마다 이벤트 새로고침
    const interval = setInterval(fetchEvents, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section>
      <h2 className="text-lg font-medium text-gray-900 mb-4">이벤트 로그</h2>
      <div className="bg-white shadow-sm rounded-lg p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs uppercase text-gray-600 border-b border-gray-200">
              <tr>
                <th scope="col" className="px-6 py-3">시간</th>
                <th scope="col" className="px-6 py-3">이벤트 종류</th>
                <th scope="col" className="px-6 py-3">대상</th>
                <th scope="col" className="px-6 py-3">이유</th>
                <th scope="col" className="px-6 py-3">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {events.length > 0 ? (
                events.map((event, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{event.timestamp}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{event.event_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{event.target}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{event.reason}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${event.status.toLowerCase() === 'completed' ? 'bg-green-100 text-green-800' : 
                          event.status.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {event.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    아직 기록된 이벤트가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default EventTable;
