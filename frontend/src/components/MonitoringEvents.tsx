import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Activity, Clock } from 'lucide-react';
import { monitoringApi } from '../services/api';
import { useRefresh } from '../contexts/RefreshContext';
import { MonitoringEvent } from '../types';

const MonitoringEvents: React.FC = () => {
  const { isRefreshing, lastUpdate, refreshAll } = useRefresh();
  const [isMonitoring, setIsMonitoring] = useState(true);

  const { data, isLoading } = useQuery<{ events: MonitoringEvent[] }>(
    'monitoring-events',
    async () => {
      const response = await monitoringApi.getMonitoringEvents(50);
      return response as { events: MonitoringEvent[] };
    },
    {
      refetchInterval: isMonitoring ? 10000 : false, // 10초마다 자동 새로고침
    }
  );

  const events = data?.events || [];

  const getEventColor = (type: string) => {
    switch (type) {
      case 'info':
        return 'bg-blue-100 text-blue-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'success':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              실시간 이벤트 로그
            </h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Activity className={`w-4 h-4 ${isMonitoring ? 'text-green-500' : 'text-gray-400'}`} />
                <span className="text-sm text-gray-600">
                  {isMonitoring ? '모니터링 중' : '일시정지'}
                </span>
              </div>
              <button
                onClick={() => setIsMonitoring(!isMonitoring)}
                className={`px-3 py-1 text-xs font-medium rounded-full ${
                  isMonitoring 
                    ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                }`}
              >
                {isMonitoring ? '일시정지' : '시작'}
              </button>
              <button
                onClick={() => refreshAll()}
                disabled={isRefreshing}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Clock className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                새로고침
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            클러스터에서 발생하는 실시간 이벤트를 모니터링합니다. 
            노드 격리 테스트 중 파드 마이그레이션 이벤트가 여기에 표시됩니다.
          </p>

          <div className="space-y-4">
            {events.map((event: MonitoringEvent) => (
              <div
                key={event.id}
                className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${
                  event.type === 'info' ? 'bg-blue-400' :
                  event.type === 'warning' ? 'bg-yellow-400' :
                  event.type === 'error' ? 'bg-red-400' :
                  'bg-green-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {event.message}
                  </p>
                  <div className="mt-1 flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEventColor(event.type)}`}>
                      {event.type}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitoringEvents; 