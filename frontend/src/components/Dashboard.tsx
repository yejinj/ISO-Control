import React from 'react';
import PodDistributionView from './PodDistribution';
import MonitoringEvents from './MonitoringEvents';

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <PodDistributionView />
            <MonitoringEvents />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 