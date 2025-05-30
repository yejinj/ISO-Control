import React from 'react';
import { AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import { usePodData } from '../contexts/PodContext';
import { useRefresh } from '../contexts/RefreshContext';

const MonitoringEvents: React.FC = () => {
  const { isRefreshing, lastUpdate, refreshAll } = useRefresh();
  const { data, isLoading } = usePodData();

  if (isLoading || !data) {
    return <div>로딩 중...</div>;
  }

  const { events } = data;

  const getEventColor = (type: string) => {
    switch (type) {
      case 'Normal':
        return 'bg-blue-100 text-blue-800';
      case 'Warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'Error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            모니터링 이벤트
          </h3>
          <button
            onClick={() => refreshAll()}
            disabled={isRefreshing}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            새로고침
          </button>
        </div>

        <div className="flow-root">
          <ul className="-mb-8">
            {events.map((event, eventIdx) => (
              <li key={event.id}>
                <div className="relative pb-8">
                  {eventIdx !== events.length - 1 ? (
                    <span
                      className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  ) : null}
                  <div className="relative flex space-x-3">
                    <div>
                      <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                        event.type === 'Warning' ? 'bg-yellow-100' : 'bg-blue-100'
                      }`}>
                        <AlertTriangle className={`h-5 w-5 ${
                          event.type === 'Warning' ? 'text-yellow-600' : 'text-blue-600'
                        }`} />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          {event.message}{' '}
                          <span className="font-medium text-gray-900">
                            {event.involved_object.name}
                          </span>
                        </p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        <div className="flex items-center">
                          <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          <time dateTime={event.timestamp}>
                            {new Date(event.timestamp).toLocaleString()}
                          </time>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MonitoringEvents; 