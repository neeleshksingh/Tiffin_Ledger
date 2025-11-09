"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, Filter, X, Copy, LockOpen, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import whatsapp from "../../../../public/assets/whatsapp-svgrepo-com.svg";
import axiosInstance from '@components/interceptors/axiosVendor.interceptor';
import { toast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface User {
    _id: string;
    name: string;
    email: string;
    phone: string;
    alternatePhone?: string;
    address: { line1: string; line2?: string; city: string; state: string; zipCode: string };
    profilePic?: string;
    preferredMealTypes: string[];
    vendor: { shopName: string };
    joinedAt: string;
    blockedByVendor: boolean;
}

interface VendorData {
    count: number;
    users: User[];
    vendorMealTypes: string[];
}

export default function VendorCustomers() {
    const router = useRouter();
    const [data, setData] = useState<VendorData | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedMeals, setSelectedMeals] = useState<string[]>([]);
    const [showMealDropdown, setShowMealDropdown] = useState(false);

    // Dialog states
    const [blockDialogOpen, setBlockDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [blockReason, setBlockReason] = useState("");
    const [isBlocking, setIsBlocking] = useState(false);

    // === FETCH FRESH DATA FROM API ===
    const fetchAssignedUsers = async () => {
        try {
            const response = await axiosInstance.get(`/vendor/users`);
            const freshData: VendorData = response.data;

            setData(freshData);
            sessionStorage.setItem("vendorCustomersData", JSON.stringify(freshData));
        } catch (err: any) {
            console.error("Failed to fetch users:", err);
            toast({
                title: "Error",
                description: "Failed to refresh customer list",
                variant: "error",
            });
        }
    };

    // Initial load
    useEffect(() => {
        const saved = sessionStorage.getItem("vendorCustomersData");
        if (saved) {
            setData(JSON.parse(saved));
        } else {
            router.push("/vendor/dashboard");
        }

        // Always fetch fresh data on mount
        fetchAssignedUsers();
    }, [router]);

    const availableMealTypes = useMemo(() => {
        if (!data) return [];
        const types = new Set<string>();
        data.users.forEach(u => u.preferredMealTypes.forEach(t => types.add(t)));
        return Array.from(types);
    }, [data]);

    const filteredUsers = useMemo(() => {
        if (!data) return [];
        return data.users.filter(user => {
            const matchesSearch =
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.phone.includes(searchQuery) ||
                user.address.city.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesMeal = selectedMeals.length === 0 || selectedMeals.every(m => user.preferredMealTypes.includes(m));
            return matchesSearch && matchesMeal;
        });
    }, [data, searchQuery, selectedMeals]);

    const toggleMeal = (meal: string) => {
        setSelectedMeals(prev => prev.includes(meal) ? prev.filter(m => m !== meal) : [...prev, meal]);
    };

    const clearFilters = () => {
        setSearchQuery("");
        setSelectedMeals([]);
    };

    const handleCopyPhone = (phone: string) => {
        navigator.clipboard.writeText(phone);
        toast({
            title: "Copied!",
            description: `${phone} copied to clipboard`,
            duration: 2000,
        });
    };

    const openBlockDialog = (user: User) => {
        setSelectedUser(user);
        setBlockReason("");
        setBlockDialogOpen(true);
    };

    const confirmBlockAction = async () => {
        if (!selectedUser) return;
        setIsBlocking(true);

        try {
            const res = await axiosInstance.patch(`/vendor/users/${selectedUser._id}/block`, {
                reason: selectedUser.blockedByVendor ? undefined : (blockReason || "No reason provided")
            });

            toast({
                title: res.data.message,
                variant: "success",
            });

            // REFRESH DATA FROM SERVER
            await fetchAssignedUsers();

            setBlockDialogOpen(false);
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.response?.data?.message || "Failed to update",
                variant: "error",
            });
        } finally {
            setIsBlocking(false);
        }
    };

    if (!data) return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full"
            />
        </div>
    );

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
                {/* Sticky Header */}
                <motion.div initial={{ y: -100 }} animate={{ y: 0 }} className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-orange-200 shadow-lg">
                    <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                        <motion.button whileHover={{ x: -4 }} onClick={() => router.back()} className="flex items-center gap-2 text-orange-600 font-semibold">
                            <ArrowLeft className="w-5 h-5" /> Back
                        </motion.button>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                            Customers ({filteredUsers.length}{data.count !== filteredUsers.length && ` / ${data.count}`})
                        </h1>
                        <div className="w-20" />
                    </div>
                </motion.div>

                {/* Sticky Filter Bar */}
                <motion.div initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="sticky top-16 z-40 bg-white/95 backdrop-blur-xl border-b border-orange-100 px-4 py-3">
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-500" />
                            <input
                                type="text"
                                placeholder="Search name, phone, city..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-orange-200 focus:border-orange-500 focus:outline-none text-sm"
                            />
                        </div>

                        <div className="relative">
                            <button onClick={() => setShowMealDropdown(!showMealDropdown)} className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium text-sm">
                                <Filter className="w-4 h-4" /> Meals {selectedMeals.length > 0 && `(${selectedMeals.length})`}
                            </button>

                            <AnimatePresence>
                                {showMealDropdown && (
                                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                                        className="absolute top-full mt-2 left-0 bg-white rounded-xl shadow-xl border border-orange-200 p-3 w-48 z-50">
                                        {availableMealTypes.map(meal => (
                                            <label key={meal} className="flex items-center gap-3 p-2 hover:bg-orange-50 rounded-lg cursor-pointer">
                                                <input type="checkbox" checked={selectedMeals.includes(meal)} onChange={() => toggleMeal(meal)} className="w-4 h-4 text-orange-600 rounded" />
                                                <span className="capitalize text-sm font-medium">{meal}</span>
                                            </label>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {(searchQuery || selectedMeals.length > 0) && (
                            <button onClick={clearFilters} className="flex items-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium">
                                <X className="w-4 h-4" /> Clear
                            </button>
                        )}
                    </div>

                    {selectedMeals.length > 0 && (
                        <div className="max-w-7xl mx-auto mt-2 flex flex-wrap gap-2 px-1">
                            {selectedMeals.map(meal => (
                                <span key={meal} className={`px-3 py-1 rounded-full text-white text-xs font-medium flex items-center gap-1 ${meal === "lunch" ? "bg-orange-500" : meal === "dinner" ? "bg-red-600" : meal === "breakfast" ? "bg-yellow-600" : "bg-purple-600"}`}>
                                    {meal} <button onClick={() => toggleMeal(meal)}><X className="w-3 h-3" /></button>
                                </span>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Compact List */}
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <motion.div layout className="space-y-3">
                        <AnimatePresence>
                            {filteredUsers.length === 0 ? (
                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 text-gray-500 font-medium">
                                    No customers found
                                </motion.p>
                            ) : (
                                filteredUsers.map((user, i) => (
                                    <motion.div
                                        key={user._id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ delay: i * 0.015 }}
                                        className="bg-white/90 backdrop-blur-sm rounded-2xl shadow hover:shadow-md border border-gray-100 transition-all duration-200"
                                    >
                                        <div className="p-4 flex items-center justify-between gap-4">
                                            {/* Left: Avatar + Details */}
                                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                                <div className="relative">
                                                    <img src={user.profilePic || "/default-avatar.png"} alt={user.name}
                                                        className="w-11 h-11 rounded-full object-cover ring-2 ring-orange-100" />
                                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                                                </div>

                                                <div className="min-w-0">
                                                    <h3 className="font-bold text-gray-900 text-sm truncate">{user.name}</h3>
                                                    <p className="text-xs text-gray-600 truncate">{user.phone}</p>
                                                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                                        <span>{user.address.city}</span>
                                                        <span>•</span>
                                                        <span>Joined {new Date(user.joinedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Center: Meals */}
                                            <div className="hidden sm:flex gap-1.5">
                                                {user.preferredMealTypes.map(m => (
                                                    <span key={m} className={`px-2.5 py-1 rounded-full text-xs font-bold text-white ${m === "lunch" ? "bg-orange-500" :
                                                        m === "dinner" ? "bg-red-600" :
                                                            m === "breakfast" ? "bg-yellow-600" : "bg-purple-600"
                                                        }`}>
                                                        {m.charAt(0).toUpperCase() + m.slice(1, 3)}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Block Button */}
                                            <button
                                                onClick={() => openBlockDialog(user)}
                                                className={`p-2 rounded-lg transition ${user.blockedByVendor
                                                        ? 'bg-gray-100 hover:bg-gray-200'
                                                        : 'bg-red-100 hover:bg-red-200'
                                                    }`}
                                                title={user.blockedByVendor ? 'Unblock' : 'Block Customer'}
                                            >
                                                {user.blockedByVendor ? (
                                                    <LockOpen className="w-4 h-4 text-green-600" />
                                                ) : (
                                                    <Lock className="w-4 h-4 text-red-600" />
                                                )}
                                            </button>

                                            {/* Right: Actions */}
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleCopyPhone(user.phone)}
                                                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                                                >
                                                    <Copy className="w-4 h-4 text-gray-700" />
                                                </button>

                                                <a
                                                    href={`https://wa.me/${user.phone.replace(/[^0-9]/g, "")}?text=Hi%20${encodeURIComponent(user.name)}!%20Your%20meal%20is%20on%20the%20way%20from%20${encodeURIComponent(user.vendor.shopName)}!`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 bg-green-100 hover:bg-green-200 rounded-lg transition"
                                                >
                                                    <img src={whatsapp.src} alt="WhatsApp" className="w-5 h-5" />
                                                </a>
                                            </div>
                                        </div>

                                        {/* Bottom: Full Address + Meals on Mobile */}
                                        <div className="px-4 pb-3 text-xs text-gray-600 border-t border-gray-100 pt-2">
                                            <div className="flex items-center justify-between">
                                                <p className="truncate">
                                                    {user.address.line1}{user.address.line2 && `, ${user.address.line2}`}, {user.address.city}, {user.address.state}
                                                </p>
                                                <div className="sm:hidden flex gap-1 ml-2">
                                                    {user.preferredMealTypes.map(m => (
                                                        <span key={m} className={`px-2 py-0.5 rounded text-xs font-bold text-white ${m === "lunch" ? "bg-orange-500" :
                                                            m === "dinner" ? "bg-red-600" :
                                                                m === "breakfast" ? "bg-yellow-600" : "bg-purple-600"
                                                            }`}>
                                                            {m.slice(0, 3)}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>

            {/* Block/Unblock Dialog */}
            <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedUser?.blockedByVendor ? "Unblock" : "Block"} Customer
                        </DialogTitle>
                        <DialogDescription>
                            {selectedUser?.blockedByVendor
                                ? `Are you sure you want to unblock ${selectedUser.name}?`
                                : `Are you sure you want to block ${selectedUser?.name}? They will no longer receive meals from you.`}
                        </DialogDescription>
                    </DialogHeader>

                    {!selectedUser?.blockedByVendor && (
                        <div className="space-y-3 py-4">
                            <Label htmlFor="reason">Reason for blocking (optional)</Label>
                            <Input
                                id="reason"
                                placeholder="e.g. Non-payment, bad behavior..."
                                value={blockReason}
                                onChange={(e) => setBlockReason(e.target.value)}
                            />
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setBlockDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant={selectedUser?.blockedByVendor ? "default" : "destructive"}
                            onClick={confirmBlockAction}
                            disabled={isBlocking}
                        >
                            {isBlocking ? "Processing..." : selectedUser?.blockedByVendor ? "Unblock" : "Block Customer"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}