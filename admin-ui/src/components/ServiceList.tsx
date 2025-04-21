import React, { useEffect, useState } from "react";
import axios from "axios";

type Service = {
  name: string;
  status: string;
  health: string;
  lastCheck: string;
  podCount: number;
  cpu: number;
  memory: number;
  restartCount: number;
};

const ServiceList: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get("http://localhost:8000/services");
        setServices(response.data);
        setError(false);
      } catch (error) {
        console.error("Error fetching services:", error);
        setError(true);
      }
    };

    fetchServices();
    const interval = setInterval(fetchServices, 5000);
    return () => clearInterval(interval);
  }, []);

  const getHealthColor = (health: string) => {
    switch (health.toLowerCase()) {
      case "healthy":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "critical":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getHealthBadgeColor = (health: string) => {
    switch (health.toLowerCase()) {
      case "healthy":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500 py-4">
          서비스 데이터를 불러올 수 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 gap-4">
        {services.length > 0 ? (
          services.map((service, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-medium text-gray-900">{service.name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHealthBadgeColor(service.health)}`}>
                      {service.health}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    마지막 점검: {service.lastCheck}
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded p-3">
                    <div className="text-sm font-medium text-gray-500">Pod 수</div>
                    <div className="mt-1 text-xl font-semibold text-gray-900">{service.podCount}</div>
                  </div>
                  <div className="bg-gray-50 rounded p-3">
                    <div className="text-sm font-medium text-gray-500">CPU 사용률</div>
                    <div className="mt-1 text-xl font-semibold text-gray-900">{service.cpu}%</div>
                  </div>
                  <div className="bg-gray-50 rounded p-3">
                    <div className="text-sm font-medium text-gray-500">메모리 사용률</div>
                    <div className="mt-1 text-xl font-semibold text-gray-900">{service.memory}%</div>
                  </div>
                  <div className="bg-gray-50 rounded p-3">
                    <div className="text-sm font-medium text-gray-500">재시작 횟수</div>
                    <div className="mt-1 text-xl font-semibold text-gray-900">{service.restartCount}</div>
                  </div>
                </div>

                <div className="mt-4 flex justify-end space-x-3">
                  <button className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                    상세 정보
                  </button>
                  <button className="inline-flex items-center px-3 py-1 border border-transparent shadow-sm text-sm font-medium rounded text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                    재시작
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-4">
            등록된 서비스가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceList; 