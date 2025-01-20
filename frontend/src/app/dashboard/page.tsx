"use client";

import { useState, useRef, useEffect } from "react";
import MenuIcon from "../../../public/assets/menu.png";
import Logo from "../../../public/assets/logo.png";
import Profile from "../../../public/assets/profile.png";
import Image from 'next/image';
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { FaTachometerAlt, FaCog, FaBell, FaFileAlt } from "react-icons/fa";
import BarChartComponent from "@components/components/barChart";
import PieChartComponent from "@components/components/pieChart";

export default function Dashboard() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const sidebarRef = useRef<HTMLDivElement | null>(null);
    const [userName, setUserName] = useState('');
    const router = useRouter();
    const pathname = usePathname();


    useEffect(() => {
        const userDetails = JSON.parse(localStorage.getItem("user") || "{}");
        setUserName(userDetails.name || 'Guest');
    }, []);

    // Close sidebar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
                setIsSidebarOpen(false);
            }
        };

        if (isSidebarOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isSidebarOpen]);

    return (
        <div className="w-full h-screen bg-[#f7f7f7] grid lg:grid-cols-[20%,80%] grid-cols-1">
            {/* Sidebar */}
            <aside
                ref={sidebarRef}
                className={`z-[1000] fixed lg:relative lg:block bg-[#f7f7f7] text-black h-screen w-64 lg:w-full transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    } lg:translate-x-0`}
            >
                <div className="p-4 h-full flex flex-col justify-between">
                    <div>
                        <div className="mb-4 flex items-center">
                            <Image src={Logo} alt="Logo" width={40} height={40} />
                            <span className="ml-2 text-lg font-bold">Tiffin Ledger</span>
                        </div>
                        <div className="relative mb-6">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full p-2 text-sm border rounded-full outline-none bg-white"
                            />
                        </div>
                    </div>

                    {/* Menu Items */}
                    <nav className="flex-1">
                        <ul className="space-y-3">
                            <li className={`rounded-lg hover:bg-white hover:shadow-md p-3 cursor-pointer transition ${pathname === "/dashboard" ? "bg-white shadow-md" : ""}`}>
                                <FaTachometerAlt className="inline-block mr-3" />
                                <span>Dashboard</span>
                            </li>
                            <li className={`rounded-lg hover:bg-white hover:shadow-md p-3 cursor-pointer transition ${pathname === "/settings" ? "bg-white shadow-md" : ""}`}>
                                <FaCog className="inline-block mr-3" />
                                <span>Settings</span>
                            </li>
                            <li className={`rounded-lg hover:bg-white hover:shadow-md p-3 cursor-pointer transition ${pathname === "/notifications" ? "bg-white shadow-md" : ""}`}>
                                <FaBell className="inline-block mr-3" />
                                <span>Notifications</span>
                            </li>
                            <li className={`rounded-lg hover:bg-white hover:shadow-md p-3 cursor-pointer transition ${pathname === "/reports" ? "bg-white shadow-md" : ""}`}>
                                <FaFileAlt className="inline-block mr-3" />
                                <span>Reports</span>
                            </li>
                        </ul>
                    </nav>


                    <div>
                        <div className="border-t pt-4">
                            <div className="flex items-center gap-3 mb-3 cursor-pointer">
                                <Image
                                    src={Profile}
                                    alt="User Avatar"
                                    width={30}
                                    height={30}
                                    className="rounded-full"
                                />
                                <div>
                                    <p className="text-sm font-medium">{userName}</p>
                                    <p className="text-xs text-gray-500">View Profile</p>
                                </div>
                            </div>
                            <div className="rounded-lg hover:bg-gray-100 p-3 cursor-pointer transition">
                                <span>Help Center</span>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Section */}
            <section className="h-screen bg-[#f7f7f7]">
                <div className="p-4">
                    <Image
                        src={MenuIcon}
                        alt="Description of the image"
                        width={30}
                        height={30}
                        onClick={() => setIsSidebarOpen(true)}
                        className="cursor-pointer lg:hidden"
                    />
                    <div className="card shadow-lg h-[97vh] w-full mx-auto rounded-lg border-solid border-1 border-slate-400 bg-white max-h-[97vh] overflow-y-auto">
                        <div className="p-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Card 1 */}
                                <div className="bg-[#E8F8F5] shadow-xl rounded-xl p-6 cursor-pointer transform hover:scale-105 transition-all duration-300 ease-in-out">
                                    <div className="flex items-center space-x-4 mb-4">
                                        <div className="h-12 w-12 bg-teal-200 rounded-full flex items-center justify-center">
                                            <svg className="h-8 w-8 text-[#1D9B8B]" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path></svg>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-800 font-poppins">Tiffin days this month</h3>
                                            <p className="text-sm text-gray-500 font-roboto">You have had tiffin for 15 days</p>
                                        </div>
                                    </div>
                                    <div className="text-xl font-bold text-gray-800 font-poppins">$300</div>
                                    <p className="text-sm text-gray-500 font-roboto">Total billing this month</p>
                                </div>

                                {/* Card 2 */}
                                <div className="bg-[#F5F5FF] shadow-xl rounded-xl p-6 cursor-pointer transform hover:scale-105 transition-all duration-300 ease-in-out">
                                    <div className="flex items-center space-x-4 mb-4">
                                        <div className="h-12 w-12 bg-purple-200 rounded-full flex items-center justify-center">
                                            <svg className="h-8 w-8 text-[#5C6BC0]" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path></svg>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-800 font-poppins">Tiffin Subscription Summary</h3>
                                            <p className="text-sm text-gray-500 font-roboto">Overview of your subscription plan</p>
                                        </div>
                                    </div>
                                    <div className="text-xl font-bold text-gray-800 font-poppins">Monthly Plan</div>
                                    <p className="text-sm text-gray-500 font-roboto">Active until: 25th January 2025</p>
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
                                        <h2 className="text-2xl font-semibold text-gray-800">Tiffin Consumption Overview</h2>
                                        <p className="text-sm text-gray-500">Your tiffin consumption over the past month. This helps you understand your daily usage trends.</p>

                                        <div className="border-t-2 border-gray-200 pt-4">
                                            <div className="text-xl font-bold text-gray-800">Total Consumption: 15 days</div>
                                            <p className="text-sm text-gray-500">Average daily consumption: 0.5 meals/day</p>

                                            <div className="mt-6">
                                                <BarChartComponent />
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
                    </div>
                </div>
            </section>
        </div>
    );
}