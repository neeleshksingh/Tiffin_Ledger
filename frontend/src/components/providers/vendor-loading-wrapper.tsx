"use client";

import { useEffect } from "react";
import { useLoading } from "@components/contexts/loading-context";
import { setVendorLoadingContext } from "@components/interceptors/axiosVendor.interceptor";

export function VendorLoadingWrapper({ children }: { children: React.ReactNode }) {
    const { incrementRequests, decrementRequests } = useLoading();

    useEffect(() => {
        setVendorLoadingContext({
            increment: incrementRequests,
            decrement: decrementRequests,
        });
    }, [incrementRequests, decrementRequests]);

    return <>{children}</>;
}