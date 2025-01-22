"use client";

import { useEffect } from "react";
import { LoadingProvider } from "@components/contexts/loading-context";
import { useLoading } from "@components/contexts/loading-context";
import { setLoadingContext } from "@components/interceptors/axios.interceptor";

interface ClientWrapperProps {
  children: React.ReactNode;
}

function LoadingWrapper({ children }: { children: React.ReactNode }) {
  const { incrementRequests, decrementRequests } = useLoading();
  
  useEffect(() => {
    setLoadingContext({ incrementRequests, decrementRequests });
  }, [incrementRequests, decrementRequests]);

  return <>{children}</>;
}

export function ClientProviders({ children }: ClientWrapperProps) {
  return (
    <LoadingProvider>
      <LoadingWrapper>
        {children}
      </LoadingWrapper>
    </LoadingProvider>
  );
}