import { useState } from "react";
import EventTable from "./components/EventTable";
import ServiceList from "./components/ServiceList";
import UserManagement from "./components/UserManagement";

type Tab = 'dashboard' | 'services' | 'usermanagement';

export default function App() {
  const [currentTab, setCurrentTab] = useState<Tab>('dashboard');

  const renderContent = () => {
    switch (currentTab) {
      case 'services':
        return (
          <>
            <h2 className="text-lg font-medium text-gray-900">서비스 관리</h2>
            <p className="mt-1 text-sm text-gray-500 mb-6">
              서비스 상태를 확인하고 관리할 수 있습니다.
            </p>
            <div className="bg-gray-50">
              <ServiceList />
            </div>
          </>
        );
      case 'usermanagement':
        return <UserManagement />;
      default:
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-4">헬스 체크 상태</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">기본 프로브</span>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        성공 48
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        실패 2
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">사이드카 체크</span>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        성공 45
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        지연 3
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        실패 2
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">운영자 체크</span>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        정상 3
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium text-gray-500">격리된 서비스</h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    2개 격리됨
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">payment-service</h4>
                        <p className="text-xs text-gray-600 mt-1">메모리 사용량 초과</p>
                      </div>
                      <span className="text-xs text-gray-500">12분 전</span>
                    </div>
                    <div className="mt-2 flex space-x-2">
                      <button className="text-xs text-gray-600 hover:text-gray-900">복구 시도</button>
                      <button className="text-xs text-gray-600 hover:text-gray-900">상세보기</button>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">auth-service</h4>
                        <p className="text-xs text-gray-600 mt-1">응답 시간 초과</p>
                      </div>
                      <span className="text-xs text-gray-500">23분 전</span>
                    </div>
                    <div className="mt-2 flex space-x-2">
                      <button className="text-xs text-gray-600 hover:text-gray-900">복구 시도</button>
                      <button className="text-xs text-gray-600 hover:text-gray-900">상세보기</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium text-gray-500">실시간 알림</h3>
                  <button className="text-xs text-gray-600 hover:text-gray-900">모두 보기</button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <span className="inline-block w-2 h-2 rounded-full bg-gray-400 mt-2"></span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">user-service CPU 사용량 경고 임계치 도달</p>
                      <span className="text-xs text-gray-500">5분 전</span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <span className="inline-block w-2 h-2 rounded-full bg-gray-400 mt-2"></span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">order-service 자동 복구 완료</p>
                      <span className="text-xs text-gray-500">12분 전</span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <span className="inline-block w-2 h-2 rounded-full bg-gray-400 mt-2"></span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">payment-service 격리 조치됨</p>
                      <span className="text-xs text-gray-500">15분 전</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-4">클러스터 상태</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">노드 상태</span>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        정상 3
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        총 3
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pod 상태</span>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        정상 45
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        주의 2
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        문제 1
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">네임스페이스</span>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        활성 5
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-4">리소스 사용량</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">CPU 사용률</span>
                      <span className="text-sm font-medium text-gray-900">75%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gray-600 h-2 rounded-full" style={{width: '75%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">메모리 사용률</span>
                      <span className="text-sm font-medium text-gray-900">60%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gray-600 h-2 rounded-full" style={{width: '60%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">디스크 사용률</span>
                      <span className="text-sm font-medium text-gray-900">45%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gray-600 h-2 rounded-full" style={{width: '45%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50">
              <EventTable />
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                <h1 className="text-xl font-semibold text-gray-900">
                  IsoCtrl <span className="text-gray-500 text-sm font-normal">Admin</span>
                </h1>
              </div>
              <div className="ml-10 flex space-x-4">
                <button
                  onClick={() => setCurrentTab('dashboard')}
                  className={`px-3 py-2 text-sm font-medium ${
                    currentTab === 'dashboard'
                      ? 'text-gray-900 border-b-2 border-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  대시보드
                </button>
                <button
                  onClick={() => setCurrentTab('services')}
                  className={`px-3 py-2 text-sm font-medium ${
                    currentTab === 'services'
                      ? 'text-gray-900 border-b-2 border-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  서비스
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <button
                onClick={() => setCurrentTab('usermanagement')}
                className={`px-3 py-2 text-sm font-medium ${
                  currentTab === 'usermanagement'
                    ? 'text-gray-900 border-b-2 border-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                사용자 관리
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {renderContent()}
      </main>
    </div>
  );
}

