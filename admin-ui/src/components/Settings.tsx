import React from 'react';

const Settings: React.FC = () => {
  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">설정</h2>
      <div className="space-y-6">
        {/* 기본 설정 섹션 */}
        <section>
          <h3 className="text-sm font-medium text-gray-500 mb-4">기본 설정</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                이름
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                placeholder="이름을 입력하세요"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                이메일
              </label>
              <input
                type="email"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                placeholder="이메일을 입력하세요"
              />
            </div>
          </div>
        </section>

        {/* 알림 설정 섹션 */}
        <section>
          <h3 className="text-sm font-medium text-gray-500 mb-4">알림 설정</h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500"
              />
              <label className="ml-2 block text-sm text-gray-700">
                이메일 알림 받기
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500"
              />
              <label className="ml-2 block text-sm text-gray-700">
                중요 알림만 받기
              </label>
            </div>
          </div>
        </section>

        {/* 보안 설정 섹션 */}
        <section>
          <h3 className="text-sm font-medium text-gray-500 mb-4">보안 설정</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                현재 비밀번호
              </label>
              <input
                type="password"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                새 비밀번호
              </label>
              <input
                type="password"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="button"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            설정 저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings; 