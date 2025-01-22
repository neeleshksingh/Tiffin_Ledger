"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { GlobalLoader } from '@components/components/globalLoader';

interface LoadingContextType {
  loading: boolean;
  incrementRequests: () => void;
  decrementRequests: () => void;
}

const LoadingContext = createContext<LoadingContextType | null>(null);

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === null) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [requestCount, setRequestCount] = useState(0);

  const incrementRequests = () => {
    setRequestCount(prev => {
      const newCount = prev + 1;
      setLoading(newCount > 0);
      return newCount;
    });
  };

  const decrementRequests = () => {
    setRequestCount(prev => {
      const newCount = Math.max(0, prev - 1);
      setLoading(newCount > 0);
      return newCount;
    });
  };

  return (
    <LoadingContext.Provider value={{ loading, incrementRequests, decrementRequests }}>
      {children}
      {loading && <GlobalLoader />}
    </LoadingContext.Provider>
  );
};