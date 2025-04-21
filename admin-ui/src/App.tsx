import { useState } from "react";
import EventTable from "./components/EventTable";
import ServiceList from "./components/ServiceList";
import Settings from "./components/Settings";

export default function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'services' | 'settings'>('dashboard');

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
      case 'settings':
        return (
          <>
            <h2 className="text-lg font-medium text-gray-900">설정</h2>
            <p className="mt-1 text-sm text-gray-500 mb-6">
              시스템 설정을 관리할 수 있습니다.
            </p>
            <div className="bg-gray-50">
              <Settings />
            </div>
          </>
        );
      default:
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="text-sm font-medium text-gray-500">활성 서비스</h3>
                <p className="mt-2 text-2xl font-semibold text-blue-600">23</p>
                <div className="mt-1 text-xs text-gray-400">전체 30개 중</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="text-sm font-medium text-gray-500">격리된 Pod</h3>
                <p className="mt-2 text-2xl font-semibold text-red-600">2</p>
                <div className="mt-1 text-xs text-gray-400">최근 24시간</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="text-sm font-medium text-gray-500">평균 복구 시간</h3>
                <p className="mt-2 text-2xl font-semibold text-green-600">1.2분</p>
                <div className="mt-1 text-xs text-gray-400">최근 24시간</div>
              </div>
            </div>

            <div className="space-y-6">
              <section>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-900">시스템 모니터링</h2>
                  <div className="flex space-x-2">
                    <button className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50">
                      필터
                    </button>
                    <button className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                      새로고침
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white rounded-lg shadow-sm p-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-4">클러스터 상태</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">노드 상태</span>
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
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
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            정상 45
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            주의 2
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            문제 1
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">네임스페이스</span>
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
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
                          <div className="bg-blue-600 h-2 rounded-full" style={{width: '75%'}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600">메모리 사용률</span>
                          <span className="text-sm font-medium text-gray-900">60%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{width: '60%'}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600">디스크 사용률</span>
                          <span className="text-sm font-medium text-gray-900">45%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-yellow-600 h-2 rounded-full" style={{width: '45%'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50">
                  <EventTable />
                </div>
              </section>
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
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <h1 className="text-xl font-semibold text-blue-700">
                  IsoCtrl <span className="text-gray-600 text-sm font-normal">Admin</span>
                </h1>
              </div>
              <div className="ml-10 flex space-x-4">
                <button
                  onClick={() => setCurrentTab('dashboard')}
                  className={`px-3 py-2 text-sm font-medium ${
                    currentTab === 'dashboard'
                      ? 'text-blue-700 border-b-2 border-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  대시보드
                </button>
                <button
                  onClick={() => setCurrentTab('services')}
                  className={`px-3 py-2 text-sm font-medium ${
                    currentTab === 'services'
                      ? 'text-blue-700 border-b-2 border-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  서비스
                </button>
                <button
                  onClick={() => setCurrentTab('settings')}
                  className={`px-3 py-2 text-sm font-medium ${
                    currentTab === 'settings'
                      ? 'text-blue-700 border-b-2 border-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  설정
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
}

