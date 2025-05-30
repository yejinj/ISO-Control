import React, { createContext, useContext, useState, useCallback } from 'react';
import { useQueryClient } from 'react-query';

interface RefreshContextType {
  isRefreshing: boolean;
  lastUpdate: Date;
  refreshAll: () => Promise<void>;
}

const RefreshContext = createContext<RefreshContextType | undefined>(undefined);

export const RefreshProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const queryClient = useQueryClient();

  const refreshAll = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries('monitoring-data'),
        queryClient.invalidateQueries('nodes'),
        queryClient.invalidateQueries('isolation-tasks'),
      ]);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('데이터 새로고침 중 오류 발생:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient]);

  return (
    <RefreshContext.Provider value={{ isRefreshing, lastUpdate, refreshAll }}>
      {children}
    </RefreshContext.Provider>
  );
};

export const useRefresh = () => {
  const context = useContext(RefreshContext);
  if (context === undefined) {
    throw new Error('useRefresh must be used within a RefreshProvider');
  }
  return context;
}; 