import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { PodProvider } from './contexts/PodContext';
import { RefreshProvider } from './contexts/RefreshContext';
import Dashboard from './components/Dashboard';
import './index.css';

const queryClient = new QueryClient();

const App: React.FC = () => {
  return ( // 최상위 컴포넌트, Context 사용 가능케 함
    <QueryClientProvider client={queryClient}>
      <RefreshProvider>
        <PodProvider>
          <Dashboard />
        </PodProvider>
      </RefreshProvider>
    </QueryClientProvider>
  );
};

export default App; 