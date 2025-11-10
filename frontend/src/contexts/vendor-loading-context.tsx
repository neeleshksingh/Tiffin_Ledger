"use client";

import { createContext, useContext, useState, ReactNode } from 'react';
import { GlobalLoader } from '@components/components/globalLoader';

interface VendorLoadingContextType {
    increment: () => void;
    decrement: () => void;
}

const VendorLoadingContext = createContext<VendorLoadingContextType | null>(null);

export const useVendorLoading = () => {
    const ctx = useContext(VendorLoadingContext);
    if (!ctx) throw new Error('useVendorLoading must be used within VendorLoadingProvider');
    return ctx;
};

export const VendorLoadingProvider = ({ children }: { children: ReactNode }) => {
    const [count, setCount] = useState(0);
    const loading = count > 0;

    const increment = () => setCount(c => c + 1);
    const decrement = () => setCount(c => Math.max(0, c - 1));

    return (
        <VendorLoadingContext.Provider value={{ increment, decrement }}>
            {children}
            {loading && <GlobalLoader />}
        </VendorLoadingContext.Provider>
    );
};