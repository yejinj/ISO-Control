import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { monitoringApi } from '../services/api';
import ClusterOverview from './ClusterOverview';
import NodeList from './NodeList';
import PodDistribution from './PodDistribution';
import { IsolationControl } from './IsolationControl';
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
    { id: 'overview', label: '클러스터 개요', icon: 'Activity' },
    { id: 'nodes', label: '노드 관리', icon: 'Server' },
    { id: 'pods', label: '파드 분포', icon: 'Package' },
    { id: 'isolation', label: '격리 제어', icon: 'AlertTriangle' },
    { id: 'events', label: '이벤트 로그', icon: 'Clock' },
  ];

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">
            ❌ 백엔드 서버에 연결할 수 없습니다
          </div>
          <p className="text-gray-600 mb-4">
            백엔드 서버가 실행 중인지 확인해주세요 (http://localhost:8000)
          </p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Cluster Node Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              쿠버네티스 노드 격리 및 파드 마이그레이션 모니터링 시스템
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${error ? 'bg-red-400' : 'bg-green-400'}`}></div>
              <span className="text-sm text-gray-600">
                {error ? '백엔드 연결 실패' : '백엔드 연결됨'}
              </span>
            </div>
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>새로고침</span>
            </button>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="mt-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-600 mt-4">실제 쿠버네티스 데이터를 불러오는 중...</p>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <ClusterOverview clusterStatus={(monitoringData as any)?.cluster_status} />
              )}
              {activeTab === 'nodes' && (
                <NodeList nodes={(monitoringData as any)?.cluster_status?.nodes || []} />
              )}
              {activeTab === 'pods' && <PodDistribution />}
              {activeTab === 'isolation' && <IsolationControl />}
              {activeTab === 'events' && <MonitoringEvents />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 