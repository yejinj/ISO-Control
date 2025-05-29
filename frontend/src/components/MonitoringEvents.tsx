import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle, Info, CheckCircle, Activity } from 'lucide-react';

interface MonitoringEvent {
  id: string;
  timestamp: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  node?: string;
  pod?: string;
}

const MonitoringEvents: React.FC = () => {
  const [events, setEvents] = useState<MonitoringEvent[]>([
    {
      id: '1',
      timestamp: new Date().toISOString(),
      type: 'info',
      message: '모니터링 시스템이 시작되었습니다.',
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 60000).toISOString(),
      type: 'success',
      message: '모든 노드가 정상 상태입니다.',
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 120000).toISOString(),
      type: 'info',
      message: '클러스터 상태 확인 완료',
    }
  ]);

  const [isMonitoring, setIsMonitoring] = useState(true);

  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      // 시뮬레이션: 랜덤 이벤트 생성
      const eventTypes: Array<'info' | 'warning' | 'error' | 'success'> = ['info', 'warning', 'success'];
      const messages = [
        '클러스터 상태 정상',
        '파드 스케줄링 완료',
        '노드 리소스 사용률 확인',
        '네트워크 연결 상태 양호',
        '모든 서비스 정상 동작 중'
      ];

      const newEvent: MonitoringEvent = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        message: messages[Math.floor(Math.random() * messages.length)],
      };

      setEvents(prev => [newEvent, ...prev.slice(0, 19)]); // 최대 20개 이벤트 유지
    }, 10000); // 10초마다 새 이벤트

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'border-l-red-500 bg-red-50';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'success':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-blue-500 bg-blue-50';
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
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            클러스터에서 발생하는 실시간 이벤트를 모니터링합니다. 
            노드 격리 테스트 중 파드 마이그레이션 이벤트가 여기에 표시됩니다.
          </p>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {events.map((event) => (
              <div
                key={event.id}
                className={`border-l-4 p-4 rounded-r-md ${getEventColor(event.type)}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getEventIcon(event.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {event.type}
                      </p>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 mt-1">
                      {event.message}
                    </p>
                    
                    {(event.node || event.pod) && (
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-600">
                        {event.node && (
                          <span>노드: {event.node}</span>
                        )}
                        {event.pod && (
                          <span>파드: {event.pod}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {events.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Info className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>아직 이벤트가 없습니다.</p>
              <p className="text-xs mt-1">모니터링이 시작되면 이벤트가 여기에 표시됩니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MonitoringEvents; 