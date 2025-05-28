import React from 'react';
import { MonitoringEvent } from '../types/api';
import { Clock, AlertCircle, Info, CheckCircle } from 'lucide-react';

interface MonitoringEventsProps {
  events: MonitoringEvent[];
}

const MonitoringEvents: React.FC<MonitoringEventsProps> = ({ events }) => {
  const getEventIcon = (eventType: string) => {
    switch (eventType.toLowerCase()) {
      case 'error':
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'success':
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType.toLowerCase()) {
      case 'error':
      case 'failed':
        return 'border-l-red-500 bg-red-50';
      case 'success':
      case 'completed':
        return 'border-l-green-500 bg-green-50';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50';
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">이벤트 로그</h3>
        <p className="text-sm text-gray-600 mb-6">
          클러스터에서 발생한 최근 이벤트들을 시간순으로 확인할 수 있습니다.
        </p>

        {events.length > 0 ? (
          <div className="space-y-3">
            {events.map((event, index) => (
              <div
                key={index}
                className={`border-l-4 p-4 rounded-r-md ${getEventColor(event.event_type)}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getEventIcon(event.event_type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {event.event_type.toUpperCase()}
                      </p>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(event.timestamp).toLocaleString()}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 mt-1">
                      {event.message}
                    </p>
                    
                    {(event.node_name || event.pod_name) && (
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-600">
                        {event.node_name && (
                          <span>노드: {event.node_name}</span>
                        )}
                        {event.pod_name && (
                          <span>파드: {event.pod_name}</span>
                        )}
                        {event.namespace && (
                          <span>네임스페이스: {event.namespace}</span>
                        )}
                      </div>
                    )}
                    
                    {event.details && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-500 cursor-pointer">
                          상세 정보
                        </summary>
                        <pre className="text-xs text-gray-600 mt-1 bg-gray-100 p-2 rounded overflow-x-auto">
                          {JSON.stringify(event.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Info className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>표시할 이벤트가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonitoringEvents; 