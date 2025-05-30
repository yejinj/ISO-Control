import React, { createContext, useContext, useState, useCallback } from 'react';

interface RefreshContextType {
  isRefreshing: boolean;
  lastUpdate: Date;
  refreshAll: () => void;
}

const RefreshContext = createContext<RefreshContextType | undefined>(undefined);

export const RefreshProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const refreshAll = useCallback(() => {
    setIsRefreshing(true);
    // 실제 새로고침 로직은 각 컴포넌트에서 처리
    setLastUpdate(new Date());
    setIsRefreshing(false);
  }, []);

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