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
    const [payableAmount, setPayableAmount] = useState(0);
    const { toast } = useToast();
    const [disableBtn, setDisableBtn] = useState(false);
    const [orderId, setOrderId] = useState('');
    const disabledDays = { after: new Date() };

    const fetchMonthData = async (month: Date) => {
        try {
            setDisableBtn(true);
            const user = localStorage.getItem("user");
            if (user) {
                const parsedUser = JSON.parse(user);
                const userId = parsedUser._id;

                const formattedMonth = `${month.getFullYear()}-${String(
                    month.getMonth() + 1
                ).padStart(2, "0")}`;

                const response = await axiosInstance.get(`/tiffin/track/get?userId=${userId}&month=${formattedMonth}`);

                const data = response.data?.data?.[0] || null;

                if (data) {
                    const daysData = data.days || {};
                    const payableDays = Object.values(daysData).filter((day) => day === true).length;
                    const fetchedAmount = await fetchTiffinData();
                    setPayableDays(payableDays);
                    setTotalAmount(payableDays * fetchedAmount);
                    setMonthDays(daysData);
                } else {
                    console.warn("No data found for the current month");
                    toast({
                        variant: "warning",
                        title: `No data found for this ${formattedMonth} month`,
                    });
                    setMonthDays({});
                    setPayableDays(0);
                    setTotalAmount(0);
                    setDisableBtn(true);
                }
            } else {
                nav.push("/login");
                setDisableBtn(true);
            }
        } catch (error: any) {
            console.error("Error fetching month data:", error);
            if (error.status === 403) {
                localStorage.removeItem("token");
                nav.push("/login");
                toast({
                    variant: "error",
                    title: `Session Expired, Please login again`,
                });
            }
            toast({
                variant: "error",
                title: `Error fetching month data: ${error}`,
            });
            setMonthDays({});
            setPayableDays(0);
            setTotalAmount(0);
            setDisableBtn(true);
        }
    };


    useEffect(() => {
        fetchMonthData(currentMonth);
    }, [currentMonth]);

    const handleDayClick = async (selectedDate: any) => {
        try {
            setDisableBtn(true);
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
                setDisableBtn(false);
            } else {
                nav.push("/login");
                setDisableBtn(true);
            }
        } catch (error) {
            setDisableBtn(true);
            console.error("Error updating date:", error);
            toast({
                variant: "error",
                title: `Error updating date: ${error}`,
            })
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
                    variant: "success",
                    title: `Receipt generated successfully`,
                });
            } else {
                nav.push("/login");
            }
        } catch (error: any) {
            console.error("Error generating PDF:", error);
            toast({
                variant: "error",
                title: `Error generating PDF: ${error}`,
            });
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

    const generatePayment = async () => {
        try {
            const user = localStorage.getItem("user");
            if (user) {
                const payload = {
                    amount: totalAmount,
                    orderId: orderId,
                };

                const response = await axiosInstance.post(
                    `/payment/generate-upi-payment-link`,
                    payload
                );
                const link = response.data?.paymentLink || null;
                if (link) {
                    const startTime = new Date().getTime();
                    nav.push(`/payment-fallback?paymentLink=${encodeURIComponent(link)}&totalAmount=${encodeURIComponent(totalAmount)}`);

                    setTimeout(() => {
                        const endTime = new Date().getTime();
                        const timeTaken = endTime - startTime;
                        if (timeTaken < 1000) {
                            window.location.href = `/payment-fallback?paymentLink=${encodeURIComponent(link)}&totalAmount=${encodeURIComponent(totalAmount)}`;
                        }
                    }, 800);
                } else {
                    toast({
                        variant: "error",
                        title: `Failed to generate payment link.`,
                    });
                }
                toast({
                    variant: "success",
                    title: `Receipt generated successfully`,
                });
            } else {
                nav.push("/login");
            }
        } catch (error) {
            console.error("Error generating payment:", error);
            toast({
                variant: "error",
                title: `Error generating payment: ${error}`,
            });
        }
    }

    const fetchTiffinData = async () => {
        try {
            setDisableBtn(true);
            const user = localStorage.getItem("user");
            if (user) {
                const parsedUser = JSON.parse(user);
                const userId = parsedUser._id;
                const response = await axiosInstance.get(`/tiffin/tiffin-bill/${userId}`);
                const currentMonth = new Date().toISOString().slice(0, 7);
                const currentMonthData = response.data?.find((item: any) => item.month === currentMonth) || null;

                if (currentMonthData) {
                    setOrderId(currentMonthData.invoiceNumber);
                    setDisableBtn(false);
                    setPayableAmount(currentMonthData.vendor.amountPerDay);
                    return currentMonthData.vendor.amountPerDay;
                } else {
                    console.warn("No data found for the current month");
                    setDisableBtn(true);
                    toast({
                        variant: "warning",
                        title: `No data found for this month`,
                    });
                    return 0;
                }
            } else {
                setDisableBtn(true);
                nav.push("/login");
            }
        } catch (error: any) {
            console.error("Error fetching month data:", error);
            setDisableBtn(true);
            if (error.status === 403) {
                nav.push("/login");
            }
            toast({
                variant: "error",
                title: `Error fetching month data: ${error}`,
            });
            return 0;
        }
    };

    return (
        <div className="p-3 space-y-8 bg-gray-100">
            <h1 className="text-2xl font-bold text-gray-800">Tiffin Timetable</h1>

            {/* Calendar and Billing Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Calendar Section */}
                <div className="bg-white shadow-md rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">Attendance Calendar</h2>
                    <div className="w-full overflow-x-auto">
                        <DayPicker
                            mode="single"
                            selected={date}
                            onDayClick={(day) => {
                                setDate(day);
                                handleDayClick(day);
                            }}
                            disabled={disabledDays}
                            onMonthChange={handleMonthChange}
                            modifiersClassNames={{
                                greenDay: "bg-green-400 text-white",
                                redDay: "bg-red-400 text-white",
                            }}
                            modifiers={{
                                greenDay: (day) => getDayStatus(day) === true,
                                redDay: (day) => getDayStatus(day) === false,
                            }}
                            className="w-full sm:w-80 md:w-96 lg:w-full text-sm"
                            styles={{
                                caption: { fontSize: "1rem", textAlign: "center", marginBottom: "1rem" },
                                day: { height: "2.5rem", width: "2.5rem" },
                                month: { padding: "1rem" },
                            }}
                        />
                    </div>
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
                    <button disabled={disableBtn}
                        className="w-full bg-green-500 text-white py-2 px-4 rounded-md shadow-lg hover:bg-green-600 transition-all"
                        onClick={generatePayment}
                    >
                        Pay Now
                    </button>
                    <button disabled={disableBtn}
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
