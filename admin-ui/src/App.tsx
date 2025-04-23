import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { FiUser } from 'react-icons/fi';

// 페이지 컴포넌트 import
import Dashboard from './pages/Dashboard';
import EventLog from './pages/EventLog';
import PodStatus from './pages/PodStatus';
import Settings from './pages/Settings';
import Sidebar from './components/Sidebar'; // Sidebar 컴포넌트 import
import AdminInfo from './pages/AdminInfo'; // AdminInfo 페이지 import

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-gray-100"> {/* Flex 레이아웃 적용 */}
        <Sidebar /> {/* 사이드바 추가 */}

        {/* 메인 영역 (헤더 + 콘텐츠) */}
        <div className="flex-1 flex flex-col overflow-hidden ml-52"> {/* ml-52 위치 변경, flex-col 추가 */}
          {/* 상단 헤더 바 */}
          <header className="bg-white shadow-sm p-3 flex justify-end pr-6"> {/* 패딩 조정 */}
            <Link to="/admin-info" className="flex items-center text-xs text-gray-500 hover:text-blue-600">
              <FiUser className="mr-1" size={14}/>
              관리자 정보
            </Link>
          </header>

          {/* 메인 콘텐츠 영역 */}
          <main className="flex-1 p-6 overflow-y-auto"> {/* 기존 ml-52 제거, overflow-y-auto 유지 */}
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/pod-status" element={<PodStatus />} />
              <Route path="/event-log" element={<EventLog />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/admin-info" element={<AdminInfo />} /> {/* 관리자 정보 라우트 추가 */}
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
