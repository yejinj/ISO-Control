import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: '04/21', 복구시간: 8 },
  { name: '04/22', 복구시간: 12 },
  { name: '04/23', 복구시간: 5 },
];

const RecoveryStats = () => {
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">복구 통계</h1>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="복구시간" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RecoveryStats;