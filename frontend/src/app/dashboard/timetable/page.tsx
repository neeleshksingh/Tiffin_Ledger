"use client";

import { useState, useEffect } from "react";
import axiosInstance from "@components/interceptors/axios.interceptor";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { useRouter } from "next/navigation";
import { useToast } from "@components/hooks/use-toast";

type MonthDays = Record<string, boolean>;

export default function Timetable() {
    const [date, setDate] = useState(new Date());
    const [monthDays, setMonthDays] = useState<MonthDays>({});
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const nav = useRouter();
    const [totalAmount, setTotalAmount] = useState(0);
    const [payableDays, setPayableDays] = useState(0);
    const { toast } = useToast();

    const fetchMonthData = async (month: Date) => {
        try {
            const user = localStorage.getItem("user");
            if (user) {
                const parsedUser = JSON.parse(user);
                const userId = parsedUser._id;

                const formattedMonth = `${month.getFullYear()}-${String(
                    month.getMonth() + 1
                ).padStart(2, "0")}`;

                const response = await axiosInstance.get(`/tiffin/track/get?userId=${userId}&month=${formattedMonth}`);

                // Debug the response
                console.log("API Response:", response.data);

                const data = response.data?.data?.[0] || null;

                if (data) {
                    const daysData = data.days || {};
                    const payableDays = Object.values(daysData).filter((day) => day === true).length;
                    setPayableDays(payableDays);
                    setTotalAmount(payableDays * 50);
                    setMonthDays(daysData);
                } else {
                    console.warn("No data found for the current month");
                    setMonthDays({});
                    setPayableDays(0);
                    setTotalAmount(0);
                }
            } else {
                nav.push("/login");
            }
        } catch (error) {
            console.error("Error fetching month data:", error);
            setMonthDays({});
            setPayableDays(0);
            setTotalAmount(0);
        }
    };


    useEffect(() => {
        fetchMonthData(currentMonth);
    }, [currentMonth]);

    const handleDayClick = async (selectedDate: any) => {
        try {
            const user = localStorage.getItem("user");
            if (user) {
                const parsedUser = JSON.parse(user);
                const userId = parsedUser._id;

                const dayNumber = String(selectedDate.getDate()).padStart(2, "0");

                const formattedMonth = `${selectedDate.getFullYear()}-${String(
                    selectedDate.getMonth() + 1
                ).padStart(2, "0")}`;

                const newDayStatus = !monthDays[dayNumber];

                const payload = {
                    userId: userId,
                    month: formattedMonth,
                    days: {
                        ...monthDays,
                        [dayNumber]: newDayStatus,
                    },
                };

                const response = await axiosInstance.post(`/tiffin/track/add`, payload);

                setMonthDays((prevDays) => ({
                    ...prevDays,
                    [dayNumber]: newDayStatus,
                }));

                fetchMonthData(currentMonth);
            } else {
                nav.push("/login");
            }
        } catch (error) {
            console.error("Error updating date:", error);
        }
    };

    const generatePdf = async () => {
        try {
            const user = localStorage.getItem("user");
            if (user) {
                const parsedUser = JSON.parse(user);
                const userId = parsedUser._id;

                const payload = {
                    userId: userId,
                    date: new Date().toISOString().split('T')[0],
                };

                const response = await axiosInstance.post(
                    `/tiffin/generate`,
                    payload,
                    { responseType: 'blob' }
                );

                const blob = new Blob([response.data], { type: 'application/pdf' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'bill.pdf';
                link.click();
                toast({
                    // variant: "success",
                    title: `Receipt generated successfully`,
                });
            } else {
                nav.push("/login");
            }
        } catch (error) {
            console.error("Error generating PDF:", error);
        }
    };



    const handleMonthChange = (newMonth: any) => {
        setCurrentMonth(newMonth);
        setMonthDays({});
    };

    const getDayStatus = (day: any) => {
        const dayNumber = String(day.getDate()).padStart(2, "0");
        return monthDays[dayNumber];
    };

    return (
        <div className="p-6 space-y-8 bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-bold text-gray-800">Tiffin Timetable</h1>

            {/* Calendar and Billing Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Calendar Section */}
                <div className="bg-white shadow-md rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">Attendance Calendar</h2>
                    <DayPicker
                        mode="single"
                        selected={date}
                        onDayClick={(day) => {
                            setDate(day);
                            handleDayClick(day);
                        }}
                        onMonthChange={handleMonthChange}
                        modifiersClassNames={{
                            greenDay: "bg-green-400 text-white",
                            redDay: "bg-red-400 text-white",
                        }}
                        modifiers={{
                            greenDay: (day) => getDayStatus(day) === true,
                            redDay: (day) => getDayStatus(day) === false,
                        }}
                        className="w-full text-sm"
                        styles={{
                            caption: { fontSize: "1rem", textAlign: "center", marginBottom: "1rem" },
                            day: { height: "2.5rem", width: "2.5rem" },
                            month: { padding: "1rem" },
                        }}
                    />
                </div>

                {/* Billing Section */}
                <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-700">Billing Details</h2>
                    <div className="bg-gray-50 p-4 rounded-md shadow-inner border border-gray-200">
                        <p className="text-sm text-gray-600">
                            <strong>Month:</strong> {currentMonth.toLocaleString("default", { month: "long" })} {currentMonth.getFullYear()}
                        </p>
                        <p className="text-sm text-gray-600">
                            <strong>Total Days in Month:</strong> {Object.keys(monthDays).length}
                        </p>
                        <p className="text-sm text-gray-600">
                            <strong>Payable Days:</strong> {payableDays}
                        </p>
                        <p className="text-xl font-bold text-green-600">
                            Total Amount: ₹{totalAmount}
                        </p>
                    </div>
                    <button
                        className="w-full bg-green-500 text-white py-2 px-4 rounded-md shadow-lg hover:bg-green-600 transition-all"
                        onClick={() => alert("Payment gateway integration coming soon!")}
                    >
                        Pay Now
                    </button>
                    <button
                        className="w-full bg-purple-500 text-white py-2 px-4 rounded-md shadow-lg hover:bg-purple-600 transition-all"
                        onClick={generatePdf}
                    >
                        Generate Bill
                    </button>
                </div>
            </div>

            {/* Additional Info */}
            <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">How it Works</h2>
                <ul className="list-disc pl-6 space-y-2 text-sm text-gray-600">
                    <li>Click on a date to toggle attendance for that day.</li>
                    <li>Green days indicate payable days, while red days are non-payable.</li>
                    <li>The total payable amount is calculated based on ₹50 per day.</li>
                </ul>
            </div>
        </div>
    );
}