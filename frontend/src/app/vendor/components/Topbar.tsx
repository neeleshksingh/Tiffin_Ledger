"use client";

import { Bell, Menu } from "lucide-react";
import { logoutVendor } from "@/lib/auth";
import { useEffect, useState } from "react";

export default function Topbar({ toggleSidebar }: { toggleSidebar: () => void }) {
    const [vendorName, setVendorName] = useState("Vendor");

    useEffect(() => {
        const user = localStorage.getItem("vendorUser");
        if (user) {
            const parsed = JSON.parse(user);
            setVendorName(parsed.vendor?.shopName || "Vendor");
        }
    }, []);

    return (
        <header className="bg-white shadow-lg border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
            <button onClick={toggleSidebar} className="lg:hidden p-2 hover:bg-gray-100 rounded-xl">
                <Menu className="w-6 h-6 text-gray-700" />
            </button>

            <div className="flex items-center gap-5 ml-auto">
                <button className="relative p-2 hover:bg-gray-100 rounded-xl">
                    <Bell className="w-6 h-6 text-gray-700" />
                    <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                </button>

                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {vendorName[0]}
                    </div>
                    <div className="hidden sm:block">
                        <p className="font-semibold text-gray-800">{vendorName}</p>
                        <button onClick={logoutVendor} className="text-xs text-red-600 hover:underline">
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}