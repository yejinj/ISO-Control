import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { FiSettings, FiBarChart2, FiFilter, FiRefreshCw } from 'react-icons/fi';
import { fetchEvents } from '../api';

const NAMESPACE_KEY = 'selectedNamespace';
const REFRESH_KEY = 'refreshInterval';

const RecoveryStats = () => {
  const [recoveryData, setRecoveryData] = useState<{ name: string, 복구시간: number }[]>([]);

  useEffect(() => {
    fetchEvents().then((events: any[]) => {
      const byDate: Record<string, number[]> = {};
      events.forEach(ev => {
        if (ev.start_time && ev.recovery_time) {
          const start = new Date(ev.start_time);
          const end = new Date(ev.recovery_time);
          const diffMin = (end.getTime() - start.getTime()) / 60000;
          const dateKey = end.toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul', month: '2-digit', day: '2-digit' });
          if (!byDate[dateKey]) byDate[dateKey] = [];
          byDate[dateKey].push(diffMin);
        }
      });
      const data = Object.entries(byDate).map(([name, arr]) => ({
        name,
        복구시간: Math.round(arr.reduce((a, b) => a + b, 0) / arr.length)
      }));
      setRecoveryData(data);
    });
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
      <div className="flex items-center mb-4">
        <FiBarChart2 className="text-base text-purple-400 mr-2" />
        <h2 className="text-sm font-semibold text-gray-700">일별 평균 복구 시간 (분)</h2>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={recoveryData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
          <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} dy={5} />
          <YAxis fontSize={10} tickLine={false} axisLine={false} />
          <Tooltip 
            cursor={{ fill: 'rgba(239, 246, 255, 0.5)' }}
            contentStyle={{ fontSize: '10px', padding: '2px 5px', border: 'none', borderRadius: '4px', boxShadow: 'var(--tw-shadow)' }}
            itemStyle={{ padding: 0 }}
          />
          <Bar dataKey="복구시간" fill="#a78bfa" radius={[3, 3, 0, 0]} barSize={25} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const Settings = () => {
  const [namespace, setNamespace] = useState(() => localStorage.getItem(NAMESPACE_KEY) || 'isocontrol');
  const [refresh, setRefresh] = useState(() => localStorage.getItem(REFRESH_KEY) || '10초');

  useEffect(() => {
    localStorage.setItem(NAMESPACE_KEY, namespace);
    window.dispatchEvent(new CustomEvent('namespaceChange', { detail: namespace }));
  }, [namespace]);

  useEffect(() => {
    localStorage.setItem(REFRESH_KEY, refresh);
    window.dispatchEvent(new CustomEvent('refreshChange', { detail: refresh }));
  }, [refresh]);

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-gray-200">
        <h1 className="text-lg font-semibold text-gray-800 flex items-center">
          <FiSettings className="mr-2 text-gray-500" size={18} />
          설정
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecoveryStats />

        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 -mt-1">UI 설정</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5 flex items-center">
                <FiFilter className="mr-1.5" size={13}/>네임스페이스 필터
              </label>
              <select
                className="w-full text-sm border border-gray-300 rounded px-2 py-1.5 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 outline-none"
                value={namespace}
                onChange={e => setNamespace(e.target.value)}
              >
                <option>isocontrol</option>
                <option>quarantine</option>
                <option>모든 네임스페이스</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5 flex items-center">
                <FiRefreshCw className="mr-1.5" size={13}/>자동 새로고침 주기
              </label>
              <select
                className="w-full text-sm border border-gray-300 rounded px-2 py-1.5 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 outline-none"
                value={refresh}
                onChange={e => setRefresh(e.target.value)}
              >
                <option>10초</option>
                <option>30초</option>
                <option>1분</option>
                <option>새로고침 안함</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;