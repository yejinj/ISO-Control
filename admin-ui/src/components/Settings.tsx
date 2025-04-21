import React, { useState } from "react";
import axios from "axios";

const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    healthCheck: {
      interval: 30,
      timeout: 5,
      failureThreshold: 3,
    },
    isolation: {
      autoRecover: true,
      maxRetries: 3,
      quarantineNamespace: "isolation",
    },
    notification: {
      email: "",
      slackWebhook: "",
      criticalOnly: true,
    },
    monitoring: {
      cpuThreshold: 90,
      memoryThreshold: 90,
      diskThreshold: 90,
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8000/settings", settings);
      alert("설정이 저장되었습니다.");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("설정 저장에 실패했습니다.");
    }
  };

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 헬스 체크 설정 */}
        <section>
          <h3 className="text-lg font-medium text-gray-900 mb-4">헬스 체크 설정</h3>
          <div className="bg-white shadow-sm rounded-lg p-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                점검 주기 (초)
              </label>
              <input
                type="number"
                value={settings.healthCheck.interval}
                onChange={(e) => setSettings({
                  ...settings,
                  healthCheck: { ...settings.healthCheck, interval: parseInt(e.target.value) }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                타임아웃 (초)
              </label>
              <input
                type="number"
                value={settings.healthCheck.timeout}
                onChange={(e) => setSettings({
                  ...settings,
                  healthCheck: { ...settings.healthCheck, timeout: parseInt(e.target.value) }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                실패 임계값
              </label>
              <input
                type="number"
                value={settings.healthCheck.failureThreshold}
                onChange={(e) => setSettings({
                  ...settings,
                  healthCheck: { ...settings.healthCheck, failureThreshold: parseInt(e.target.value) }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </section>

        {/* 격리 설정 */}
        <section>
          <h3 className="text-lg font-medium text-gray-900 mb-4">격리 설정</h3>
          <div className="bg-white shadow-sm rounded-lg p-4 space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoRecover"
                checked={settings.isolation.autoRecover}
                onChange={(e) => setSettings({
                  ...settings,
                  isolation: { ...settings.isolation, autoRecover: e.target.checked }
                })}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="autoRecover" className="ml-2 block text-sm text-gray-700">
                자동 복구 활성화
              </label>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  최대 재시도 횟수
                </label>
                <input
                  type="number"
                  value={settings.isolation.maxRetries}
                  onChange={(e) => setSettings({
                    ...settings,
                    isolation: { ...settings.isolation, maxRetries: parseInt(e.target.value) }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  격리 네임스페이스
                </label>
                <input
                  type="text"
                  value={settings.isolation.quarantineNamespace}
                  onChange={(e) => setSettings({
                    ...settings,
                    isolation: { ...settings.isolation, quarantineNamespace: e.target.value }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 알림 설정 */}
        <section>
          <h3 className="text-lg font-medium text-gray-900 mb-4">알림 설정</h3>
          <div className="bg-white shadow-sm rounded-lg p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                이메일 주소
              </label>
              <input
                type="email"
                value={settings.notification.email}
                onChange={(e) => setSettings({
                  ...settings,
                  notification: { ...settings.notification, email: e.target.value }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Slack Webhook URL
              </label>
              <input
                type="text"
                value={settings.notification.slackWebhook}
                onChange={(e) => setSettings({
                  ...settings,
                  notification: { ...settings.notification, slackWebhook: e.target.value }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="criticalOnly"
                checked={settings.notification.criticalOnly}
                onChange={(e) => setSettings({
                  ...settings,
                  notification: { ...settings.notification, criticalOnly: e.target.checked }
                })}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="criticalOnly" className="ml-2 block text-sm text-gray-700">
                심각한 문제만 알림 받기
              </label>
            </div>
          </div>
        </section>

        {/* 모니터링 임계값 설정 */}
        <section>
          <h3 className="text-lg font-medium text-gray-900 mb-4">모니터링 임계값 설정</h3>
          <div className="bg-white shadow-sm rounded-lg p-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                CPU 임계값 (%)
              </label>
              <input
                type="number"
                value={settings.monitoring.cpuThreshold}
                onChange={(e) => setSettings({
                  ...settings,
                  monitoring: { ...settings.monitoring, cpuThreshold: parseInt(e.target.value) }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                메모리 임계값 (%)
              </label>
              <input
                type="number"
                value={settings.monitoring.memoryThreshold}
                onChange={(e) => setSettings({
                  ...settings,
                  monitoring: { ...settings.monitoring, memoryThreshold: parseInt(e.target.value) }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                디스크 임계값 (%)
              </label>
              <input
                type="number"
                value={settings.monitoring.diskThreshold}
                onChange={(e) => setSettings({
                  ...settings,
                  monitoring: { ...settings.monitoring, diskThreshold: parseInt(e.target.value) }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            설정 저장
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings; 