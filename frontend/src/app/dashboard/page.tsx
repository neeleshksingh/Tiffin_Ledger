"use client"

import BarChartComponent from "@components/components/barChart";
import PieChartComponent from "@components/components/pieChart";
import { useToast } from "@components/hooks/use-toast";
import axiosInstance from "@components/interceptors/axios.interceptor";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Landing() {
    const [tiffinData, setTiffinData] = useState<any>(null);
    const { toast } = useToast();
    const nav = useRouter();
    const [transformedDays, setTransformedDays] = useState<any>([]);

    const transformDaysData = (tiffinData:any) => {
        if (tiffinData && tiffinData.days && tiffinData.days[0] && tiffinData.days[0].isTaken) {
            const days = tiffinData.days[0].isTaken.days;
            return Object.keys(days).map(day => ({
                name: day,
                isTaken: days[day]
            }));
        }
        return [];
    };
    
    const fetchTiffinData = async () => {
        try {
            const user = localStorage.getItem("user");
            if (user) {
                const parsedUser = JSON.parse(user);
                const userId = parsedUser._id;
                const response = await axiosInstance.get(`/tiffin/tiffin-bill/${userId}`);
                const currentMonth = new Date().toISOString().slice(0, 7);
                const currentMonthData = response.data?.find((item:any) => item.month === currentMonth) || null;
    
                if (currentMonthData) {
                    const transformedDays = transformDaysData(currentMonthData);
    
                    setTransformedDays(transformedDays);

                    setTiffinData({
                        ...currentMonthData,
                        days: transformedDays
                    });

                } else {
                    console.warn("No data found for the current month");
                    toast({
                        variant: "warning",
                        title: `No data found for this month`,
                    });
                }
            } else {
                nav.push("/login");
            }
        } catch (error) {
            console.error("Error fetching month data:", error);
            toast({
                variant: "error",
                title: `Error fetching month data: ${error}`,
            });
        }
    };
    

    useEffect(() => {
        fetchTiffinData();
    }, []);

    return (
        <>
            <div className="p-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1 */}
                    <div className="bg-[#E8F8F5] shadow-xl rounded-xl p-6 cursor-pointer transform hover:scale-105 transition-all duration-300 ease-in-out"
                        onClick={() => nav.push("/dashboard/timetable")}>
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="h-12 w-12 bg-teal-200 rounded-full flex items-center justify-center">
                                <svg className="h-8 w-8 text-[#1D9B8B]" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path></svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800 font-poppins">Tiffin days this month</h3>
                                <p className="text-sm text-gray-500 font-roboto">You have had tiffin for {tiffinData?.tiffinDays} days</p>
                            </div>
                        </div>
                        <div className="text-xl font-bold text-gray-800 font-poppins"> ₹ {tiffinData?.billAmount}</div>
                        <p className="text-sm text-gray-500 font-roboto">Total billing this month</p>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-[#F5F5FF] shadow-xl rounded-xl p-6 cursor-pointer transform hover:scale-105 transition-all duration-300 ease-in-out"
                        onClick={() => nav.push("/dashboard/vendor-view/" + tiffinData?.vendor?.id)}>
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="h-12 w-12 bg-purple-200 rounded-full flex items-center justify-center">
                                <svg className="h-8 w-8 text-[#5C6BC0]" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path></svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800 font-poppins">{tiffinData?.vendor?.shopName}</h3>
                                <p className="text-sm text-gray-500 font-roboto">View your vendor details</p>
                            </div>
                        </div>
                        <div className="text-xl font-bold text-gray-800 font-poppins">Per Day Charge</div>
                        <p className="text-sm text-gray-500 font-roboto"> ₹ {tiffinData?.vendor?.amountPerDay}</p>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-[#FFF3E0] shadow-xl rounded-xl p-6 cursor-pointer transform hover:scale-105 transition-all duration-300 ease-in-out">
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="h-12 w-12 bg-orange-200 rounded-full flex items-center justify-center">
                                <svg className="h-8 w-8 text-[#FF7043]" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path></svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800 font-poppins">Total Payments & Pending Dues</h3>
                                <p className="text-sm text-gray-500 font-roboto">Overview of payments and dues</p>
                            </div>
                        </div>
                        <div className="text-xl font-bold text-gray-800 font-poppins">$250 Paid</div>
                        <p className="text-sm text-gray-500 font-roboto">Pending Dues: $50</p>
                    </div>

                    {/* Card 4 */}
                    <div className="bg-[#FFF9E6] shadow-xl rounded-xl p-6 cursor-pointer transform hover:scale-105 transition-all duration-300 ease-in-out">
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="h-12 w-12 bg-yellow-200 rounded-full flex items-center justify-center">
                                <svg className="h-8 w-8 text-[#FFB300]" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v2h2v-2zm0-4h2V7h-2v6z"></path></svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800 font-poppins">Upcoming Tiffin Deliveries</h3>
                                <p className="text-sm text-gray-500 font-roboto">Your next delivery is scheduled</p>
                            </div>
                        </div>
                        <div className="text-xl font-bold text-gray-800 font-poppins">Tomorrow: Veggie Delight</div>
                        <p className="text-sm text-gray-500 font-roboto">Scheduled for 12:00 PM</p>
                    </div>

                </div>
                <div className="space-y-8 mt-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">

                        {/* Card 1: Bar Chart */}
                        <div className="bg-white shadow-lg rounded-xl p-8 space-y-4">
                            <h2 className="text-2xl font-semibold text-gray-800">
                                Tiffin Consumption Overview
                            </h2>
                            <p className="text-sm text-gray-500">
                                Your tiffin consumption over the past month. This helps you understand your daily usage trends.
                            </p>
                            <div className="border-t-2 border-gray-200 pt-4">
                                <div className="text-xl font-bold text-gray-800">
                                    Total Consumption: 15 days
                                </div>
                                <p className="text-sm text-gray-500">
                                    Average daily consumption: 0.5 meals/day
                                </p>
                                <div className="mt-6">
                                    <BarChartComponent data={transformedDays || []}/>
                                </div>
                            </div>
                        </div>

                        {/* Card 2: Pie Chart */}
                        <div className="bg-white shadow-lg rounded-xl p-8 space-y-4">
                            <h2 className="text-2xl font-semibold text-gray-800">Tiffin Type Distribution</h2>
                            <p className="text-sm text-gray-500">A breakdown of your tiffin types consumed during the past month.</p>

                            <div className="border-t-2 border-gray-200 pt-4">
                                <div className="text-xl font-bold text-gray-800">Tiffin Types Distribution</div>
                                <p className="text-sm text-gray-500">Percentage of Veggie vs. Non-Veg tiffins.</p>

                                <div className="mt-6">
                                    <PieChartComponent />
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
                        {/* Card 3: Tiffin Usage History */}
                        <div className="bg-white shadow-lg rounded-xl p-8 space-y-4">
                            <h2 className="text-2xl font-semibold text-gray-800">Tiffin Usage History</h2>
                            <p className="text-sm text-gray-500">Here’s a detailed look at your daily tiffin usage for this month.</p>

                            <div className="border-t-2 border-gray-200 pt-4">
                                <div className="text-xl font-bold text-gray-800">Total Days with Tiffin: 15</div>
                                <p className="text-sm text-gray-500">Your daily consumption summary:</p>
                                <div className="mt-4">
                                    <table className="min-w-full table-auto">
                                        <thead>
                                            <tr>
                                                <th className="px-4 py-2 text-left text-gray-600">Date</th>
                                                <th className="px-4 py-2 text-left text-gray-600">Meal Type</th>
                                                <th className="px-4 py-2 text-left text-gray-600">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="border-t border-gray-200 px-4 py-2">1st Jan</td>
                                                <td className="border-t border-gray-200 px-4 py-2">Veggie Delight</td>
                                                <td className="border-t border-gray-200 px-4 py-2">$20</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Card 4: Recent Payments */}
                        <div className="bg-white shadow-lg rounded-xl p-8 space-y-4">
                            <h2 className="text-2xl font-semibold text-gray-800">Recent Payments</h2>
                            <p className="text-sm text-gray-500">A breakdown of your recent transactions and payment history.</p>

                            <div className="border-t-2 border-gray-200 pt-4">
                                <div className="text-xl font-bold text-gray-800">Amount Paid: $250</div>
                                <p className="text-sm text-gray-500">Pending Dues: $50</p>
                                <div className="mt-4">
                                    <table className="min-w-full table-auto">
                                        <thead>
                                            <tr>
                                                <th className="px-4 py-2 text-left text-gray-600">Date</th>
                                                <th className="px-4 py-2 text-left text-gray-600">Amount</th>
                                                <th className="px-4 py-2 text-left text-gray-600">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="border-t border-gray-200 px-4 py-2">1st Jan</td>
                                                <td className="border-t border-gray-200 px-4 py-2">$100</td>
                                                <td className="border-t border-gray-200 px-4 py-2">Paid</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}