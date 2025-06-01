import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery } from 'react-query';
import { podApi } from '../services/api';
import { IntegratedPodData } from '../types';

interface PodContextType {
  data: IntegratedPodData | undefined;
  isLoading: boolean;
  error: Error | null;
  lastUpdate: Date;
}

const PodContext = createContext<PodContextType | undefined>(undefined);

export const PodProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { data, isLoading, error } = useQuery<IntegratedPodData>(
    'integrated-pod-data',
    podApi.getIntegratedPodData,
    {
      refetchInterval: 10000, // 10초마다 자동 새로고침
    }
  );

  const value = {
    data,
    isLoading,
    error: error as Error | null,
    lastUpdate: new Date(),
  };

  return <PodContext.Provider value={value}>{children}</PodContext.Provider>;
};

export const usePodData = () => {
  const context = useContext(PodContext);
  if (context === undefined) {
    throw new Error('usePodData must be used within a PodProvider');
  }
  return context;
}; 