import React, { useEffect, useState } from "react";
import apiClient from "../api/axiosConfig"; // apiClient를 import

type Service = {
  id: string;
  name: string;
  status: 'healthy' | 'unhealthy' | 'pending' | 'isolated';
  podCount: number;
  cpu: string;
  memory: string;
  restartCount: number;
};

const getHealthBadgeColor = (status: Service['status']) => {
  switch (status) {
    case 'healthy':
      return 'bg-green-100 text-green-800';
    case 'unhealthy':
      return 'bg-red-100 text-red-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'isolated':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const ServiceList: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(false);
        const response = await apiClient.get<Service[]>("/services"); // 이미 apiClient 사용 중
        setServices(response.data);
      } catch (err) {
        console.error("Error fetching services:", err);
        setError(true);
        setServices([
          { id: '1', name: 'auth-service', status: 'healthy', podCount: 3, cpu: '0.5 cores', memory: '256Mi', restartCount: 0 },
          { id: '2', name: 'user-service', status: 'unhealthy', podCount: 2, cpu: '1.2 cores', memory: '512Mi', restartCount: 5 },
          { id: '3', name: 'payment-service', status: 'isolated', podCount: 1, cpu: '0.8 cores', memory: '1Gi', restartCount: 12 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
    const interval = setInterval(fetchServices, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="p-6 text-center">서비스 목록 로딩 중...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">서비스 목록을 불러올 수 없습니다.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {services.length > 0 ? (
        services.map((service) => (
          <div key={service.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-medium text-gray-900">{service.name}</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHealthBadgeColor(service.status)}`}>
                  {service.status}
                </span>
              </div>
            </div>
            <div className="p-4 space-y-3 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Pods:</span>
                <span className="font-medium text-gray-900">{service.podCount}</span>
              </div>
              <div className="flex justify-between">
                <span>CPU 사용량:</span>
                <span className="font-medium text-gray-900">{service.cpu}</span>
              </div>
              <div className="flex justify-between">
                <span>메모리 사용량:</span>
                <span className="font-medium text-gray-900">{service.memory}</span>
              </div>
              <div className="flex justify-between">
                <span>재시작 횟수:</span>
                <span className="font-medium text-gray-900">{service.restartCount}</span>
              </div>
            </div>
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button className="text-sm text-gray-700 hover:text-gray-900">상세 보기</button>
              <button className="text-sm text-red-600 hover:text-red-800">재시작</button>
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full text-center text-gray-500 py-10">
          등록된 서비스가 없습니다.
        </div>
      )}
    </div>
  );
};

export default ServiceList;