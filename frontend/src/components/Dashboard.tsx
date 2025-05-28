import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { monitoringApi } from '../services/api';
import ClusterOverview from './ClusterOverview';
import NodeList from './NodeList';
import PodDistribution from './PodDistribution';
import IsolationControl from './IsolationControl';
import MonitoringEvents from './MonitoringEvents';
import { RefreshCw } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: monitoringData, isLoading, error, refetch } = useQuery(
    'monitoring-data',
    monitoringApi.getMonitoringData,
    {
      refetchInterval: 10000, // 10초마다 자동 새로고침
      retry: 3,
    }
  );

  const tabs = [
    { id: 'overview', label: '클러스터 개요', icon: '📊' },
    { id: 'nodes', label: '노드 관리', icon: '🖥️' },
    { id: 'pods', label: '파드 분포', icon: '📦' },
    { id: 'isolation', label: '격리 제어', icon: '🔧' },
    { id: 'events', label: '이벤트 로그', icon: '📋' },
  ];

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg mb-4">
          ❌ 데이터를 불러오는 중 오류가 발생했습니다
        </div>
        <button
          onClick={() => refetch()}
          className="btn-primary"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">클러스터 대시보드</h2>
          <p className="text-gray-600 mt-1">
            쿠버네티스 노드 격리 및 파드 마이그레이션 모니터링
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="flex items-center space-x-2 btn-secondary"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>새로고침</span>
        </button>
      </div>

      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* 탭 컨텐츠 */}
      <div className="mt-6">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">데이터를 불러오는 중...</p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <ClusterOverview clusterStatus={monitoringData?.cluster_status} />
            )}
            {activeTab === 'nodes' && (
              <NodeList nodes={monitoringData?.cluster_status?.nodes || []} />
            )}
            {activeTab === 'pods' && (
              <PodDistribution 
                distributions={monitoringData?.cluster_status?.pod_distribution || []} 
              />
            )}
            {activeTab === 'isolation' && <IsolationControl />}
            {activeTab === 'events' && (
              <MonitoringEvents events={monitoringData?.recent_events || []} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 