import React, { useEffect, useState } from 'react';
import { FiUser, FiMail, FiShield, FiClock, FiKey, FiActivity, FiEdit3 } from 'react-icons/fi'; // 아이콘 추가

const NAMESPACE_KEY = 'selectedNamespace';
const REFRESH_KEY = 'refreshInterval';

// 임시 관리자 정보
const adminData = {
  name: '관리자 이름',
  email: 'admin@example.com',
  role: 'Super Admin',
  lastLogin: '2024-04-23 10:30:15',
};

const initialRecentActivity = [
  { id: 1, action: '로그인', timestamp: '2024-04-23 10:30:15' },
  { id: 2, action: `설정 변경: 자동 새로고침 주기 ${localStorage.getItem(REFRESH_KEY) || '10초'}`, timestamp: '2024-04-22 15:05:00' },
  { id: 3, action: 'Pod 격리: worker-abc-456', timestamp: '2024-04-22 09:10:30' },
];

const AdminInfo = () => {
  const [namespace, setNamespace] = useState(localStorage.getItem(NAMESPACE_KEY) || 'isocontrol');
  const [refresh, setRefresh] = useState(localStorage.getItem(REFRESH_KEY) || '10초');
  const [recentActivity, setRecentActivity] = useState(initialRecentActivity);

  useEffect(() => {
    const onNamespaceChange = (e: any) => {
      setNamespace(e.detail);
      setRecentActivity(prev => [
        { id: Date.now(), action: `설정 변경: 네임스페이스 ${e.detail}`, timestamp: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }) },
        ...prev
      ]);
    };
    const onRefreshChange = (e: any) => {
      setRefresh(e.detail);
      setRecentActivity(prev => [
        { id: Date.now(), action: `설정 변경: 자동 새로고침 주기 ${e.detail}`, timestamp: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }) },
        ...prev
      ]);
    };
    window.addEventListener('namespaceChange', onNamespaceChange);
    window.addEventListener('refreshChange', onRefreshChange);
    return () => {
      window.removeEventListener('namespaceChange', onNamespaceChange);
      window.removeEventListener('refreshChange', onRefreshChange);
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="pb-3 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-800 flex items-center">
          <FiUser className="mr-2 text-gray-500" size={20} />
          관리자 정보
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"> {/* 그리드 레이아웃 */}
        {/* 프로필 카드 (lg:col-span-1) */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
            <FiUser className="mr-2 text-blue-400"/> 프로필 정보
          </h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="text-xs font-medium text-gray-500 w-20">이름:</span>
              <span className="text-sm text-gray-800">{adminData.name}</span>
            </div>
            <div className="flex items-center">
              <span className="text-xs font-medium text-gray-500 w-20">이메일:</span>
              <span className="text-sm text-gray-800">{adminData.email}</span>
            </div>
            <div className="flex items-center">
              <span className="text-xs font-medium text-gray-500 w-20">역할:</span>
              <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                {adminData.role}
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-xs font-medium text-gray-500 w-20">네임스페이스:</span>
              <span className="text-sm text-gray-800">{namespace}</span>
            </div>
            <div className="flex items-center">
              <span className="text-xs font-medium text-gray-500 w-20">새로고침:</span>
              <span className="text-sm text-gray-800">{refresh}</span>
            </div>
          </div>
        </div>

        {/* 활동/보안 카드 (lg:col-span-2) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
           <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
            <FiActivity className="mr-2 text-purple-400"/> 활동 및 보안
          </h2>
          <div className="space-y-4">
            {/* 마지막 로그인 & 비밀번호 변경 */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4 border-gray-100">
              <div className="flex items-center mb-2 sm:mb-0">
                <FiClock className="text-gray-400 mr-2" size={14}/>
                <span className="text-xs font-medium text-gray-500 mr-2">마지막 로그인:</span>
                <span className="text-xs text-gray-700">{adminData.lastLogin}</span>
              </div>
              <button className="flex items-center text-xs text-blue-600 hover:underline focus:outline-none">
                <FiKey className="mr-1" size={13}/> 비밀번호 변경
              </button>
            </div>
            
            {/* 최근 활동 로그 */}
            <div>
              <h3 className="text-xs font-medium text-gray-500 mb-2">최근 활동</h3>
              <ul className="space-y-1.5 max-h-40 overflow-y-auto pr-2"> {/* 스크롤 추가 */}
                {recentActivity.map((activity) => (
                  <li key={activity.id} className="flex justify-between items-center text-xs text-gray-600">
                    <span>{activity.action}</span>
                    <span className="text-gray-400">{activity.timestamp}</span>
                  </li>
                ))}
                {recentActivity.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-2">최근 활동 기록이 없습니다.</p>
                )}
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminInfo; 