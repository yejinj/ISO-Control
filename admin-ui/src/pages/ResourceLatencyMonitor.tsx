import React, { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FiCpu, FiActivity, FiHardDrive } from 'react-icons/fi';
import { Line as ChartLine } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  ChartLegend
);

const fetchResourceMetrics = async () => {
  const res = await fetch('/api/v1/probes');
  const data = await res.json();
  return {
    cpu: { cpu_usage: data.cpuUsage },
    memory: { memory_usage: data.memoryUsage },
    pvc: data.pvcUsage
  };
};

const fetchLatencyMetrics = async () => {
  const res = await fetch('/api/v1/probes/metrics/latency');
  return res.json();
};

interface LatencyData {
  timestamp: string;
  latency_ms: number;
}

const ResourceLatencyMonitor = () => {
  const [resourceData, setResourceData] = useState<any>({ cpu: {}, memory: {}, pvc: {} });
  const [latencyData, setLatencyData] = useState<LatencyData[]>([]);

  useEffect(() => {
    fetchResourceMetrics().then(setResourceData);
    fetchLatencyMetrics().then(setLatencyData);
  }, []);

  // PVC 데이터를 차트용으로 변환
  const pvcChartData = Object.entries(resourceData.pvc || {}).map(([pvcName, usage]) => ({
    name: pvcName,
    사용률: Number(usage)
  }));

  const chartData = {
    labels: latencyData.map(d => new Date(d.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'API 응답 지연 (ms)',
        data: latencyData.map(d => d.latency_ms),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'API 응답 지연 추이'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: '지연 시간 (ms)'
        }
      },
      x: {
        title: {
          display: true,
          text: '시간'
        }
      }
    }
  };

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
            <h2 className="text-base font-semibold text-gray-700">시스템 리소스 사용률</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[
              { name: 'CPU', 사용률: isNaN(parseFloat(resourceData.cpu?.cpu_usage)) ? 0 : parseFloat(resourceData.cpu?.cpu_usage) },
              { name: '메모리', 사용률: isNaN(parseFloat(resourceData.memory?.memory_usage)) ? 0 : parseFloat(resourceData.memory?.memory_usage) },
            ]}>
              <XAxis dataKey="name" fontSize={11} />
              <YAxis fontSize={11} domain={[0, 100]} tickFormatter={v => `${v}%`} />
              <Tooltip formatter={v => `${v}%`} />
              <Bar dataKey="사용률" fill="#60a5fa" radius={[4, 4, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-between mt-4 text-xs text-gray-500">
            <span>CPU 사용률: <span className="font-bold text-blue-600">{resourceData.cpu?.cpu_usage ?? 0}%</span></span>
            <span>메모리 사용률: <span className="font-bold text-blue-600">{resourceData.memory?.memory_usage ?? 0}%</span></span>
          </div>
        </div>

        {/* PVC 사용률 카드 */}
        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center mb-3">
            <FiHardDrive className="text-green-400 mr-2" size={18} />
            <h2 className="text-base font-semibold text-gray-700">PVC 사용률</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={pvcChartData}>
              <XAxis dataKey="name" fontSize={11} angle={-45} textAnchor="end" height={60} />
              <YAxis fontSize={11} domain={[0, 100]} tickFormatter={v => `${v}%`} />
              <Tooltip formatter={v => `${v}%`} />
              <Bar dataKey="사용률" fill="#34d399" radius={[4, 4, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 text-xs text-gray-500">
            {Object.entries(resourceData.pvc || {}).map(([pvcName, usage]) => (
              <div key={pvcName} className="flex justify-between mb-1">
                <span>{pvcName}:</span>
                <span className="font-bold text-green-600">{Number(usage)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* API 응답 지연 추이 카드 */}
        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center mb-3">
            <FiActivity className="text-orange-400 mr-2" size={18} />
            <h2 className="text-base font-semibold text-gray-700">API 응답 지연 추이</h2>
          </div>
          <div className="h-[200px]">
            <ChartLine data={chartData} options={options} />
          </div>
          <div className="mt-4 text-xs text-gray-500 text-right">
            최근 10분간 1분 단위 평균 응답시간(ms)
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceLatencyMonitor; 