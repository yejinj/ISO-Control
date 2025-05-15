import React, { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FiCpu, FiActivity } from 'react-icons/fi';

const fetchResourceMetrics = async () => {
  const [cpu, memory] = await Promise.all([
    fetch('/api/v1/probes/metrics/cpu').then(res => res.json()),
    fetch('/api/v1/probes/metrics/memory').then(res => res.json()),
  ]);
  return { cpu, memory };
};

const fetchLatencyMetrics = async () => {
  const res = await fetch('/api/v1/probes/metrics/latency');
  return res.json();
};

const ResourceLatencyMonitor = () => {
  const [resourceData, setResourceData] = useState<any>({ cpu: {}, memory: {} });
  const [latencyData, setLatencyData] = useState<any[]>([]);

  useEffect(() => {
    fetchResourceMetrics().then(setResourceData);
    fetchLatencyMetrics().then(setLatencyData);
  }, []);

  return (
    <div className="px-0 md:px-6 py-6 w-full max-w-7xl mx-auto">
      <div className="mb-6 pb-2 border-b border-gray-200 flex items-center">
        <FiCpu className="mr-2 text-blue-400" size={20} />
        <h1 className="text-lg font-semibold text-gray-800">리소스/지연 모니터링</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CPU/메모리 카드 */}
        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center mb-3">
            <FiCpu className="text-blue-400 mr-2" size={18} />
            <h2 className="text-base font-semibold text-gray-700">CPU/메모리 사용률</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[
              { name: 'CPU', 사용률: parseFloat(resourceData.cpu?.cpu_usage) || 0 },
              { name: '메모리', 사용률: parseFloat(resourceData.memory?.memory_usage) || 0 },
            ]}>
              <XAxis dataKey="name" fontSize={11} />
              <YAxis fontSize={11} domain={[0, 100]} tickFormatter={v => `${v}%`} />
              <Tooltip formatter={v => `${v}%`} />
              <Bar dataKey="사용률" fill="#60a5fa" radius={[4, 4, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-between mt-4 text-xs text-gray-500">
            <span>CPU 사용률: <span className="font-bold text-blue-600">{resourceData.cpu?.cpu_usage || 0}%</span></span>
            <span>메모리 사용률: <span className="font-bold text-blue-600">{resourceData.memory?.memory_usage || 0}%</span></span>
          </div>
        </div>
        {/* API 응답 지연 추이 카드 */}
        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center mb-3">
            <FiActivity className="text-orange-400 mr-2" size={18} />
            <h2 className="text-base font-semibold text-gray-700">API 응답 지연 추이</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={latencyData}>
              <XAxis dataKey="timestamp" fontSize={11} />
              <YAxis fontSize={11} unit="ms" />
              <Tooltip formatter={v => `${v}ms`} />
              <Legend />
              <Line type="monotone" dataKey="latency_ms" stroke="#f59e42" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 text-xs text-gray-500 text-right">
            최근 10분간 1분 단위 평균 응답시간(ms)
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceLatencyMonitor; 