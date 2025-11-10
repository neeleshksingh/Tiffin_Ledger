"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isVendorLoggedIn } from "@/lib/auth";
import VendorLayout from "./components/VendorLayout";
import { ClientProviders } from "@components/components/providers/loadingWrapper";
import { LoadingProvider } from "@components/contexts/loading-context";
import { VendorLoadingWrapper } from "@components/components/providers/vendor-loading-wrapper";

export default function VendorRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const loggedIn = isVendorLoggedIn();
        setIsAuthenticated(loggedIn);
        setIsLoading(false);

        if (!loggedIn) {
            router.replace("/vendor/login");
        }
    }, [router]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-orange-50">
                <div className="text-2xl font-bold text-orange-600">Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <LoadingProvider>
            <VendorLoadingWrapper>
                <VendorLayout>{children}</VendorLayout>
            </VendorLoadingWrapper>
        </LoadingProvider>
    );
}