"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Utensils, DollarSign, TrendingUp, Calendar, ChefHat } from "lucide-react";
import axiosInstance from '@components/interceptors/axiosVendor.interceptor';

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

    useEffect(() => {
        const fetchAssignedUsers = async () => {
            try {
                const response = await axiosInstance.get(`/vendor/users`);

                if (response) {
                    const data: VendorUsersResponse = await response.data;
                    setUsersData(data);
                    setTotalCustomers(data.count);

                    const breakdown = { lunch: 0, dinner: 0, breakfast: 0 };
                    data.users.forEach((user) => {
                        user.preferredMealTypes.forEach((type) => {
                            if (type.toLowerCase() in breakdown) {
                                breakdown[type.toLowerCase() as keyof typeof breakdown]++;
                            }
                        });
                    });
                    setMealBreakdown(breakdown);
                }
            } catch (err) {
                console.error("Failed to fetch users:", err);
            } finally {
                setLoading(false);
            }
        };

        const user = localStorage.getItem("vendorUser");
        if (user) {
            const parsed = JSON.parse(user);
            setVendorName(parsed.vendor?.shopName || "Chef");
        }

        fetchAssignedUsers();
    }, []);

    const handleViewCustomers = () => {
        if (usersData) {
            router.push("/vendor/customers");
            sessionStorage.setItem("vendorCustomersData", JSON.stringify(usersData));
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-8 rounded-3xl shadow-2xl">
                <h1 className="text-4xl font-bold">Welcome back, {vendorName || "Chef"}!</h1>
                <p className="text-orange-100 mt-2">Here's what's happening with your mess today</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    {
                        title: "Total Customers",
                        value: loading ? "..." : totalCustomers.toString(),
                        desc: loading ? "" : `Lunch: ${mealBreakdown.lunch} · Dinner: ${mealBreakdown.dinner}`,
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
                        value: "₹18,960",
                        change: "+8.2%",
                        icon: DollarSign,
                        color: "from-yellow-500 to-orange-500",
                    },
                    {
                        title: "Active Days",
                        value: "28",
                        desc: "This month",
                        icon: Calendar,
                        color: "from-purple-500 to-pink-500",
                    },
                ].map((stat) => (
                    <Card
                        key={stat.title}
                        className={`hover:shadow-xl transition-all duration-300 border-0 cursor-pointer ${stat.onClick ? "hover:scale-105" : ""
                            }`}
                        onClick={stat.onClick}
                    >
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                            <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stat.value}</div>
                            {stat.change && (
                                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                                    <TrendingUp className="w-4 h-4" /> {stat.change}
                                </p>
                            )}
                            {stat.desc && <p className="text-xs text-gray-500 mt-1">{stat.desc}</p>}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Rest of your Quick Actions & Today's Special */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-3">
                            <ChefHat className="w-6 h-6 text-orange-600" />
                            Quick Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            {["Add Today's Meal", "View Orders", "Update Menu", "Send Notification"].map((action) => (
                                <button
                                    key={action}
                                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-5 rounded-2xl font-semibold shadow-lg transition transform hover:scale-105"
                                >
                                    {action}
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-xl bg-gradient-to-br from-orange-500 to-red-600 text-white">
                    <CardHeader>
                        <CardTitle className="text-xl">Today's Special</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-5xl font-bold">Rajma Rice + Roti</p>
                        <p className="text-orange-100 mt-2">Served with salad & raita</p>
                        <button className="mt-6 bg-white text-orange-600 px-8 py-3 rounded-full font-bold hover:bg-orange-50 transition">
                            Change Menu
                        </button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}