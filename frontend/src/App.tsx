import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { PodProvider } from './contexts/PodContext';
import { RefreshProvider } from './contexts/RefreshContext';
import Dashboard from './components/Dashboard';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RefreshProvider>
        <PodProvider>
          <div className="min-h-screen bg-gray-100">
            <Dashboard />
          </div>
        </PodProvider>
      </RefreshProvider>
    </QueryClientProvider>
  );
}

export default App; 