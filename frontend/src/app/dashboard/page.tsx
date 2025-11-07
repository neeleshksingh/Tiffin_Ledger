"use client"

import BarChartComponent from "@components/components/barChart";
import PieChartComponent from "@components/components/pieChart";
import { useToast } from "@components/hooks/use-toast";
import axiosInstance from "@components/interceptors/axios.interceptor";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";

export default function Landing() {
    const [allMonths, setAllMonths] = useState<any[]>([]);
    const [tiffinData, setTiffinData] = useState<any>(null);
    const [takenDays, setTakenDays] = useState(0);
    const { toast } = useToast();
    const nav = useRouter();
    const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');
    const [upcomingMeal, setUpcomingMeal] = useState<any>(null);

    const currentMonth = useMemo(() => new Date().toISOString().slice(0, 7), []);

    const transformDaysData = (monthData: any) => {
        if (monthData && monthData.days) {
            return Object.keys(monthData.days).map((dayKey) => {
                const day = monthData.days[dayKey];
                const isTaken = day.meals.breakfast || day.meals.lunch || day.meals.dinner;
                return {
                    name: day.date.padStart(2, '0'),
                    value: isTaken ? 1 : 0
                };
            }).sort((a, b) => parseInt(a.name, 10) - parseInt(b.name, 10));
        }
        return [];
    };

    const getChartData = useMemo(() => {
        let chartData: { name: string; value: number }[] = [];
        let computedTakenDays = 0;

        const currentMonthData = allMonths.find((item: any) => item.month === currentMonth);

        if (viewMode === 'monthly' && currentMonthData) {
            chartData = transformDaysData(currentMonthData);
            computedTakenDays = chartData.filter((d) => d.value > 0).length;
        } else {
            // Yearly view
            chartData = allMonths
                .map((month: any) => {
                    const monthDate = new Date(`${month.month}-01`);
                    const monthName = monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                    return {
                        name: monthName,
                        value: month.tiffinMeals
                    };
                })
                .sort((a, b) => new Date(`${a.name}-01`).getTime() - new Date(`${b.name}-01`).getTime());
            computedTakenDays = allMonths.reduce((sum: number, m: any) => sum + m.tiffinMeals, 0);
        }

        setTakenDays(computedTakenDays);
        return chartData;
    }, [allMonths, viewMode, currentMonth]);

    const fetchTiffinData = async () => {
        try {
            const user = localStorage.getItem("user");
            if (user) {
                const parsedUser = JSON.parse(user);
                const userId = parsedUser._id;
                const response = await axiosInstance.get(`/tiffin/tiffin-bill/${userId}`);
                if (response && response.data && response.data.length > 0) {
                    setAllMonths(response.data);

                    const currentMonthData = response.data.find((item: any) => item.month === currentMonth) || null;

                    if (currentMonthData) {
                        setTiffinData(currentMonthData);
                        const transformedDays = transformDaysData(currentMonthData);
                        const computedTakenDays = transformedDays.filter((d: any) => d.value > 0).length;
                        setTakenDays(computedTakenDays);
                        getUpComingMeal(currentMonthData.vendor.id);
                    } else {
                        console.warn("No data found for the current month");
                        toast({
                            variant: "warning",
                            title: `No data found for this month`,
                        });
                    }
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

    const getUpComingMeal = async (vendorId?: string) => {
        const todayStr = new Date().toISOString().split("T")[0];
        try {
            const user = localStorage.getItem("user");
            if (user) {
                const response = await axiosInstance.get(`/tiffin/get-meals/${vendorId}`);
                const meals = response.data; // Assuming it's an array of objects

                console.log("Upcoming meal response:", meals);

                // Find meal matching today's date
                const todayMeal = meals.find((meal: any) => meal.date.split("T")[0] === todayStr);

                if (todayMeal) {
                    setUpcomingMeal(todayMeal);
                } else {
                    setUpcomingMeal(null);
                }
            } else {
                nav.push("/login");
            }
        } catch (error) {
            console.error("Error fetching upcoming meal:", error);
            toast({
                variant: "error",
                title: `Error fetching upcoming meal: ${error}`,
            });
        }
    };

    useEffect(() => {
        fetchTiffinData();
    }, []);

    const totalYearlyMeals = useMemo(() => allMonths.reduce((sum: number, m: any) => sum + m.tiffinMeals, 0), [allMonths]);

    const isMonthlyView = viewMode === 'monthly';
    const totalConsumption = isMonthlyView ? takenDays : totalYearlyMeals;
    const consumptionUnit = isMonthlyView ? 'days' : 'meals';
    const averageConsumption = isMonthlyView
        ? (takenDays / Math.min(new Date().getDate(), new Date(tiffinData?.month + '-01').getDate() || 1)).toFixed(1)
        : (totalYearlyMeals / allMonths.length).toFixed(1);

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
                                <h3 className="text-xl font-semibold text-gray-800 font-poppins">Tiffin {consumptionUnit} this month</h3>
                                <p className="text-sm text-gray-500 font-roboto">You have had tiffin for {takenDays} {isMonthlyView ? 'days' : 'meals'}</p>
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
                        <div className="text-xl font-bold text-gray-800 font-poppins"> ₹ {tiffinData?.vendor?.amountPerMeal}</div>
                        <p className="text-sm text-gray-500 font-roboto"> Per Meal Charge</p>
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
                        <div className="text-xl font-bold text-gray-800 font-poppins">₹ {tiffinData?.paidAmount || 0} Paid</div>
                        <p className="text-sm text-gray-500 font-roboto">Pending Dues: ₹ {tiffinData?.pendingAmount || 0}</p>
                    </div>

                    {/* Card 4 */}
                    <div className="bg-[#FFF9E6] shadow-xl rounded-xl p-6 cursor-pointer transform hover:scale-105 transition-all duration-300 ease-in-out">
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="h-12 w-12 bg-yellow-200 rounded-full flex items-center justify-center">
                                <svg className="h-8 w-8 text-[#FFB300]" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-10S17.52 2 12 2zm1 15h-2v2h2v-2zm0-4h2V7h-2v6z"></path>
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800 font-poppins">Upcoming Tiffin Deliveries</h3>
                                <p className="text-sm text-gray-500 font-roboto">Your next delivery is scheduled</p>
                            </div>
                        </div>

                        {upcomingMeal ? (
                            <>
                                <div className="text-lg font-bold text-gray-800 font-poppins">Meals for Today</div>
                                <ul className="text-sm text-gray-600 font-roboto">
                                    <li><strong>Breakfast:</strong> {upcomingMeal.mealDetails.breakfast}</li>
                                    <li><strong>Lunch:</strong> {upcomingMeal.mealDetails.lunch}</li>
                                    <li><strong>Dinner:</strong> {upcomingMeal.mealDetails.dinner}</li>
                                </ul>
                            </>
                        ) : (
                            <p className="text-sm text-gray-500 font-roboto">No meal scheduled for today</p>
                        )}
                    </div>

                </div>
                <div className="space-y-8 mt-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">

                        {/* Card 1: Bar Chart */}
                        <div className="bg-white shadow-lg rounded-xl p-8 space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-semibold text-gray-800">
                                    Tiffin Consumption Overview
                                </h2>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setViewMode('monthly')}
                                        className={`px-4 py-2 rounded-lg font-medium transition ${viewMode === 'monthly'
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                    >
                                        Monthly
                                    </button>
                                    <button
                                        onClick={() => setViewMode('yearly')}
                                        className={`px-4 py-2 rounded-lg font-medium transition ${viewMode === 'yearly'
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                    >
                                        Yearly
                                    </button>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500">
                                {isMonthlyView
                                    ? 'Your tiffin consumption over the past month. This helps you understand your daily usage trends.'
                                    : 'Your tiffin consumption over the past year. This helps you understand your monthly usage trends.'}
                            </p>
                            <div className="border-t-2 border-gray-200 pt-4">
                                <div className="text-xl font-bold text-gray-800">
                                    Total Consumption: {totalConsumption} {consumptionUnit}
                                </div>
                                <p className="text-sm text-gray-500">
                                    Average {isMonthlyView ? 'daily' : 'monthly'} consumption: {averageConsumption} {consumptionUnit}/{isMonthlyView ? 'day' : 'month'}
                                </p>
                                <div className="mt-6">
                                    <BarChartComponent data={getChartData} />
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
                                <div className="text-xl font-bold text-gray-800">Total Days with Tiffin: {takenDays}</div>
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