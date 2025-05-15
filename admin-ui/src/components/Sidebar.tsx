import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiGrid, FiList, FiBarChart2, FiSettings, FiCpu } from 'react-icons/fi';

const Sidebar = () => {
  const baseLinkClasses = "flex items-center py-2 px-3 rounded transition duration-150 ease-in-out text-gray-600 hover:bg-gray-100 text-sm";
  const activeLinkClasses = "font-semibold text-blue-700 border-l-4 border-blue-600 bg-blue-50 pl-2 text-sm";

  return (
    <div className="w-52 h-screen bg-white shadow-md fixed top-0 left-0 p-4 flex flex-col">
      <div className="mb-6 pb-3 border-b border-gray-200 pt-1">
        <h2 className="text-xl font-semibold text-blue-600 text-center tracking-tight">IsoCtrl</h2>
      </div>
      
      <nav className="flex-grow">
        <ul className="space-y-1.5">
          <li>
            <NavLink 
              to="/" 
              className={({ isActive }) => `${baseLinkClasses} ${isActive ? activeLinkClasses : ''}`}
            >
              <FiGrid className="mr-2" size={14} />
              대시보드
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/pod-status" 
              className={({ isActive }) => `${baseLinkClasses} ${isActive ? activeLinkClasses : ''}`}
            >
              <FiList className="mr-2" size={14} />
              Pod 상태
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/event-log" 
              className={({ isActive }) => `${baseLinkClasses} ${isActive ? activeLinkClasses : ''}`}
            >
              <FiBarChart2 className="mr-2" size={14} />
              장애 이력
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/resource-latency" 
              className={({ isActive }) => `${baseLinkClasses} ${isActive ? activeLinkClasses : ''}`}
            >
              <FiCpu className="mr-2" size={14} />
              리소스/지연 모니터링
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/settings" 
              className={({ isActive }) => `${baseLinkClasses} ${isActive ? activeLinkClasses : ''}`}
            >
              <FiSettings className="mr-2" size={14} />
              설정
            </NavLink>
          </li>
        </ul>
      </nav>
      
      {/* 하단 영역 (예: 사용자 정보, 로그아웃 등) */}
      {/* 
      <div className="mt-auto pt-4 border-t border-gray-200">
         <p className="text-xs text-gray-500 text-center">© 2024 IsoCtrl</p>
      </div>
      */}
    </div>
  );
};

export default Sidebar; 