"use client";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MobileMenu from "./MobileMenu";
import { useState } from "react";

export default function VendorLayout({ children }: { children: React.ReactNode }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-50 to-orange-50">
            <Sidebar />

            {/* Main content */}
            <div className="flex-1 flex flex-col md:ml-64">
                <Topbar toggleSidebar={() => setMobileMenuOpen(true)} />
                <main className="flex-1 overflow-y-auto p-6 lg:p-10">
                    {children}
                </main>
            </div>

            <MobileMenu isOpen={mobileMenuOpen} setIsOpen={setMobileMenuOpen} />
        </div>
    );
}