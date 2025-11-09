"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Home, User, Utensils, LogOut } from "lucide-react";
import { logoutVendor } from "@/lib/auth";

const navItems = [
    { name: "Dashboard", href: "/vendor/dashboard", icon: Home },
    { name: "Profile", href: "/vendor/profile", icon: User },
    { name: "Meals", href: "/vendor/meals", icon: Utensils },
];

export default function MobileMenu({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (open: boolean) => void }) {
    const pathname = usePathname();

    if (!isOpen) return null;

    return (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
            <div
                className="fixed left-0 top-0 w-72 h-full bg-gradient-to-b from-orange-600 to-orange-700 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-5 border-b border-orange-800">
                    <h2 className="text-xl font-bold text-white">Menu</h2>
                    <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-orange-700 rounded-lg">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="p-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-4 px-5 py-4 rounded-xl transition-all ${isActive ? "bg-white text-orange-600 font-bold shadow-lg" : "hover:bg-orange-700"
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-orange-800">
                    <button
                        onClick={logoutVendor}
                        className="flex items-center gap-4 w-full px-5 py-4 rounded-xl hover:bg-orange-700 transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </div>
    );
}