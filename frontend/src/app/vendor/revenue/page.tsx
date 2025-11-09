"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, IndianRupee, TrendingUp, Users, Calendar, Clock, AlertCircle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import axiosInstance from "@components/interceptors/axiosVendor.interceptor";
import { toast } from "@/hooks/use-toast";

interface RevenueStats {
    summary: {
        totalRevenue: number;
        totalPending: number;
        totalProjected: number;
        collectionRate: number;
        totalDeliveredDays: number;
    };
    monthlyBreakdown: Array<{
        month: string;
        revenue: number;
        pending: number;
        paidDays: number;
        pendingDays: number;
    }>;
    recentPayments: Array<{
        user: {
            _id: string;
            name: string;
            phone: string;
            profilePic?: string;
        };
        amount: number;
        month: string;
        paidAt: string;
    }>;
}

export default function VendorRevenuePage() {
    const router = useRouter();
    const [stats, setStats] = useState<RevenueStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRevenueStats = async () => {
            try {
                const res = await axiosInstance.get("/vendor/revenue-stats");
                if (res.data.success) {
                    setStats(res.data.data);
                }
            } catch (err: any) {
                toast({
                    variant: "error",
                    title: "Error",
                    description: err.response?.data?.message || "Failed to load revenue stats",
                });
            } finally {
                setLoading(false);
            }
        };
        fetchRevenueStats();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 p-4">
                <div className="max-w-7xl mx-auto space-y-8">
                    <Skeleton className="h-12 w-80 rounded-3xl" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="h-48 rounded-3xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
                <p className="text-2xl text-gray-600">No revenue data available yet</p>
            </div>
        );
    }

    const { summary, monthlyBreakdown, recentPayments } = stats;

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
            {/* Sticky Header */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-orange-100 shadow-lg"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-3 text-orange-600 hover:gap-4 transition-all font-semibold"
                        >
                            <ArrowLeft className="w-6 h-6" />
                            Back to Dashboard
                        </button>
                        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                            Revenue Analytics
                        </h1>
                        <div className="w-28" />
                    </div>
                </div>
            </motion.div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
                {/* Hero Summary Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ staggerChildren: 0.1 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
                >
                    {[
                        {
                            title: "Total Revenue",
                            value: `₹${summary.totalRevenue.toLocaleString()}`,
                            icon: IndianRupee,
                            color: "from-green-500 to-emerald-600",
                            desc: `${summary.totalDeliveredDays} days delivered`,
                            delay: 0.1,
                        },
                        {
                            title: "Pending Amount",
                            value: `₹${summary.totalPending.toLocaleString()}`,
                            icon: AlertCircle,
                            color: "from-orange-500 to-red-600",
                            desc: `${Math.round((summary.totalPending / (summary.totalRevenue + summary.totalPending)) * 100)}% pending`,
                            delay: 0.2,
                        },
                        {
                            title: "Projected Earnings",
                            value: `₹${summary.totalProjected.toLocaleString()}`,
                            icon: TrendingUp,
                            color: "from-blue-500 to-cyan-600",
                            desc: "Next 30 days",
                            delay: 0.3,
                        },
                        {
                            title: "Collection Rate",
                            value: `${summary.collectionRate}%`,
                            icon: Users,
                            color: "from-purple-500 to-pink-600",
                            desc: "Paid vs Delivered",
                            delay: 0.4,
                        },
                    ].map((item) => (
                        <motion.div
                            key={item.title}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: item.delay }}
                        >
                            <Card className="h-full bg-white/90 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 group overflow-hidden">
                                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm font-medium text-gray-600">{item.title}</CardTitle>
                                        <div className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-3xl flex items-center justify-center shadow-2xl`}>
                                            <item.icon className="w-8 h-8 text-white" />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-4xl font-bold text-gray-900">{item.value}</div>
                                    <p className="text-sm text-gray-500 mt-2 font-medium">{item.desc}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Monthly Breakdown */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Card className="bg-white/90 backdrop-blur-xl shadow-2xl border-0">
                            <CardHeader>
                                <CardTitle className="text-2xl flex items-center gap-3">
                                    <Calendar className="w-8 h-8 text-orange-600" />
                                    Monthly Performance
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {monthlyBreakdown.slice(0, 6).map((month, i) => (
                                    <motion.div
                                        key={month.month}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.6 + i * 0.05 }}
                                        className="group"
                                    >
                                        <div className="flex items-center justify-between p-5 rounded-3xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-orange-50 hover:to-red-50 transition-all duration-300">
                                            <div>
                                                <p className="text-lg font-bold text-gray-900">{month.month}</p>
                                                <p className="text-sm text-gray-600">
                                                    {month.paidDays} paid • {month.pendingDays} pending
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-green-600">₹{month.revenue.toLocaleString()}</p>
                                                {month.pending > 0 && (
                                                    <p className="text-sm font-semibold text-orange-600">₹{month.pending.toLocaleString()} due</p>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Recent Payments */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Card className="bg-white/90 backdrop-blur-xl shadow-2xl border-0">
                            <CardHeader>
                                <CardTitle className="text-2xl flex items-center gap-3">
                                    <Clock className="w-8 h-8 text-orange-600" />
                                    Recent Collections
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {recentPayments.length === 0 ? (
                                    <div className="text-center py-16 text-gray-500">
                                        <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                        <p className="text-lg">No payments collected yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {recentPayments.slice(0, 6).map((payment, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.6 + i * 0.05 }}
                                                className="flex items-center gap-4 p-5 rounded-3xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-green-50 hover:to-emerald-50 transition-all duration-300"
                                            >
                                                <Avatar className="w-14 h-14 ring-4 ring-white shadow-xl">
                                                    <AvatarImage src={payment.user.profilePic} />
                                                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-600 text-white font-bold">
                                                        {payment.user.name.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <p className="font-bold text-gray-900">{payment.user.name}</p>
                                                    <p className="text-sm text-gray-600">{payment.user.phone}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-green-600">₹{payment.amount}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(payment.paidAt).toLocaleDateString("en-IN", {
                                                            day: "numeric",
                                                            month: "short",
                                                        })}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>

            {/* Floating CTA */}
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.8 }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
            >
                <Button
                    size="lg"
                    onClick={() => router.push("/vendor/customers")}
                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold text-lg px-12 py-8 rounded-full shadow-2xl flex items-center gap-4 hover:gap-6 transition-all duration-300 transform hover:scale-105"
                >
                    Collect Pending Payments
                    <ArrowRight className="w-6 h-6" />
                </Button>
            </motion.div>
        </div>
    );
}