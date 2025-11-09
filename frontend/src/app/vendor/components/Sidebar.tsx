"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, Utensils, LogOut } from "lucide-react";
import Image from "next/image";
import { logoutVendor } from "@/lib/auth";

const navItems = [
    { name: "Dashboard", href: "/vendor/dashboard", icon: Home },
    { name: "Profile", href: "/vendor/profile", icon: User },
    { name: "Meals", href: "/vendor/meals", icon: Utensils },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-64 md:z-40 bg-gradient-to-b from-orange-600 to-orange-700 text-white shadow-2xl">
            <div className="flex items-center gap-3 px-6 py-5 border-b border-orange-800">
                <Image src="/assets/logo.png" alt="Logo" width={44} height={44} className="rounded-lg" />
                <div>
                    <h1 className="text-xl font-bold">Tiffin Ledger</h1>
                    <p className="text-xs opacity-90">Vendor Panel</p>
                </div>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-4 px-5 py-3 rounded-xl transition-all duration-200 ${isActive
                                ? "bg-white text-orange-600 shadow-lg font-semibold"
                                : "hover:bg-orange-700 hover:shadow-md"
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-orange-800">
                <button
                    onClick={logoutVendor}
                    className="flex items-center gap-4 w-full px-5 py-3 rounded-xl hover:bg-orange-700 transition-all"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}