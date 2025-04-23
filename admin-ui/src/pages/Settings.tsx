import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { FiSettings, FiBarChart2, FiFilter, FiRefreshCw } from 'react-icons/fi';

const data = [
  { name: '04/21', 복구시간: 8 },
  { name: '04/22', 복구시간: 12 },
  { name: '04/23', 복구시간: 5 },
];

const RecoveryStats = () => {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
      <div className="flex items-center mb-4">
        <FiBarChart2 className="text-base text-purple-400 mr-2" />
        <h2 className="text-sm font-semibold text-gray-700">일별 평균 복구 시간 (분)</h2>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
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
              <select className="w-full text-sm border border-gray-300 rounded px-2 py-1.5 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 outline-none">
                <option>isocontrol</option>
                <option>quarantine</option>
                <option>모든 네임스페이스</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5 flex items-center">
                <FiRefreshCw className="mr-1.5" size={13}/>자동 새로고침 주기
              </label>
              <select className="w-full text-sm border border-gray-300 rounded px-2 py-1.5 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 outline-none">
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