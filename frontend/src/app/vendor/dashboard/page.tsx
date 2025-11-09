"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Utensils, DollarSign, TrendingUp, Calendar, ChefHat, IndianRupee, Loader2 } from "lucide-react";
import axiosInstance from '@components/interceptors/axiosVendor.interceptor';
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface User {
    _id: string;
    name: string;
    email: string;
    phone: string;
    preferredMealTypes: string[];
    joinedAt: string;
}

interface VendorUsersResponse {
    success: boolean;
    count: number;
    vendorMealTypes: string[];
    users: User[];
}

export default function VendorDashboard() {
    const router = useRouter();
    const [vendorName, setVendorName] = useState("Chef");
    const [totalCustomers, setTotalCustomers] = useState(0);
    const [mealBreakdown, setMealBreakdown] = useState({ lunch: 0, dinner: 0, breakfast: 0 });
    const [loading, setLoading] = useState(true);
    const [usersData, setUsersData] = useState<VendorUsersResponse | null>(null);
    const [vendorData, setVendorData] = useState<any>(null);

    useEffect(() => {
        const fetchAssignedUsers = async () => {
            try {
                const response = await axiosInstance.get(`/vendor/users`);
                const data: VendorUsersResponse = response.data;
                setUsersData(data);
                setTotalCustomers(data.count);

                const breakdown = { lunch: 0, dinner: 0, breakfast: 0 };
                data.users.forEach((user) => {
                    user.preferredMealTypes.forEach((type) => {
                        const key = type.toLowerCase() as keyof typeof breakdown;
                        if (key in breakdown) breakdown[key]++;
                    });
                });
                setMealBreakdown(breakdown);
            } catch (err) {
                console.error("Failed to fetch users:", err);
            }
        };

        const user = localStorage.getItem("vendorUser");
        if (user) {
            const parsed = JSON.parse(user);
            setVendorName(parsed.vendor?.shopName || "Chef");
        }

        fetchAssignedUsers();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get("/vendor/profile");
            const user = res.data;
            setVendorData(user);
            localStorage.setItem("vendorUser", JSON.stringify(user));
        } catch (err: any) {
            toast({ variant: "error", title: "Error", description: err.response?.data?.message || "Failed to load profile" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleViewCustomers = () => {
        if (usersData) {
            sessionStorage.setItem("vendorCustomersData", JSON.stringify(usersData));
            router.push("/vendor/customers");
        }
    };

    if (loading) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-red-50"
            >
                <div className="text-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                        <Loader2 className="w-16 h-16 text-orange-600" />
                    </motion.div>
                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-xl text-gray-700 mt-6"
                    >
                        Cooking up your dashboard...
                    </motion.p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="space-y-10 pb-10"
        >
            {/* Hero Header */}
            <motion.div
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                whileHover={{ y: -6 }}
                className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-10 rounded-3xl shadow-2xl overflow-hidden relative"
            >
                <motion.div
                    animate={{ x: [0, 20, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: "url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
                    }}
                />
                <div className="relative z-10">
                    <motion.h1
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        className="text-5xl font-bold"
                    >
                        Welcome back, {vendorName}!
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-orange-100 text-xl mt-3"
                    >
                        Here's what's cooking in your mess today
                    </motion.p>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                variants={{
                    hidden: { opacity: 0 },
                    visible: {
                        opacity: 1,
                        transition: { staggerChildren: 0.15, delayChildren: 0.2 }
                    }
                }}
                initial="hidden"
                animate="visible"
            >
                {[
                    {
                        title: "Total Customers",
                        value: totalCustomers.toString(),
                        desc: `Lunch: ${mealBreakdown.lunch} · Dinner: ${mealBreakdown.dinner} · Breakfast: ${mealBreakdown.breakfast}`,
                        icon: Users,
                        color: "from-blue-500 to-cyan-500",
                        onClick: handleViewCustomers,
                    },
                    {
                        title: "Meals Today",
                        value: "142",
                        desc: "Lunch: 68 · Dinner: 74",
                        icon: Utensils,
                        color: "from-green-500 to-emerald-500",
                    },
                    {
                        title: "Revenue",
                        value: `₹${vendorData?.totalRevenue || 0}`,
                        change: "+8.2%",
                        icon: IndianRupee,
                        color: "from-yellow-500 to-orange-500",
                        onClick: () => router.push("/vendor/revenue"),
                        pulse: true,
                    },
                    {
                        title: "Active Days",
                        value: "28",
                        desc: "This month",
                        icon: Calendar,
                        color: "from-purple-500 to-pink-500",
                    },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.title}
                        variants={{
                            hidden: { y: 60, opacity: 0 },
                            visible: { y: 0, opacity: 1 }
                        }}
                        whileHover={{ y: -12, scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <Card
                            className={`border-0 shadow-xl overflow-hidden cursor-pointer transition-all duration-300 ${stat.pulse ? "animate-pulse-slow" : ""
                                }`}
                            onClick={stat.onClick}
                        >
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                                <motion.div
                                    whileHover={{ rotate: 360 }}
                                    transition={{ duration: 0.6 }}
                                    className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}
                                >
                                    <stat.icon className="w-7 h-7" />
                                </motion.div>
                            </CardHeader>
                            <CardContent>
                                <motion.div
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.4 + i * 0.1 }}
                                    className="text-4xl font-bold text-gray-800"
                                >
                                    {stat.value}
                                </motion.div>
                                {stat.change && (
                                    <motion.p
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        className="text-xs text-green-600 flex items-center gap-1 mt-2 font-semibold"
                                    >
                                        <TrendingUp className="w-4 h-4" /> {stat.change} from last month
                                    </motion.p>
                                )}
                                {stat.desc && (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                        className="text-xs text-gray-500 mt-2"
                                    >
                                        {stat.desc}
                                    </motion.p>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Quick Actions */}
                <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <Card className="shadow-2xl border-0">
                        <CardHeader>
                            <motion.div
                                initial={{ x: -20 }}
                                animate={{ x: 0 }}
                                className="flex items-center gap-3"
                            >
                                <ChefHat className="w-7 h-7 text-orange-600" />
                                <CardTitle className="text-2xl">Quick Actions</CardTitle>
                            </motion.div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    "Add Today's Meal",
                                    "View Orders",
                                    "Update Menu",
                                    "Send Notification"
                                ].map((action, i) => (
                                    <motion.button
                                        key={action}
                                        initial={{ y: 50, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.7 + i * 0.1 }}
                                        whileHover={{ scale: 1.08, y: -4 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-6 rounded-3xl font-bold shadow-xl transition-all duration-300"
                                    >
                                        {action}
                                    </motion.button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Today's Special */}
                <motion.div
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <Card className="shadow-2xl bg-gradient-to-br from-orange-500 to-red-600 text-white overflow-hidden relative">
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 6, repeat: Infinity }}
                            className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full"
                        />
                        <CardHeader>
                            <motion.div
                                initial={{ y: -20 }}
                                animate={{ y: 0 }}
                            >
                                <CardTitle className="text-2xl">Today's Special</CardTitle>
                            </motion.div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <motion.p
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 200, delay: 0.8 }}
                                className="text-6xl font-extrabold leading-tight"
                            >
                                Rajma Rice + Roti
                            </motion.p>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                                className="text-orange-100 text-lg mt-3"
                            >
                                Served with fresh salad & cooling raita
                            </motion.p>
                            <motion.button
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 1.2 }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="mt-8 bg-white text-orange-600 px-10 py-4 rounded-full font-bold text-lg shadow-2xl hover:bg-orange-50 transition"
                            >
                                Change Menu
                            </motion.button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}