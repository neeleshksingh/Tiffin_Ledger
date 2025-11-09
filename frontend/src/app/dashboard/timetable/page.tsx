"use client";

import { useState, useEffect, useMemo } from "react";
import axiosInstance from "@components/interceptors/axios.interceptor";
import { useRouter } from "next/navigation";
import { useToast } from "@components/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type MealType = "breakfast" | "lunch" | "dinner";
type DayMeals = Record<MealType, boolean>;
type MonthDays = Record<string, DayMeals>;

export default function Timetable() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [monthDays, setMonthDays] = useState<MonthDays>({});
    const [selectedDay, setSelectedDay] = useState<Date | null>(null);
    const [showMealModal, setShowMealModal] = useState(false);
    const [showPaidRangeModal, setShowPaidRangeModal] = useState(false);
    const [dayMeals, setDayMeals] = useState<DayMeals>({ breakfast: false, lunch: false, dinner: false });
    const [startDay, setStartDay] = useState("01");
    const [endDay, setEndDay] = useState("31");
    const nav = useRouter();
    const [totalAmount, setTotalAmount] = useState(0);
    const [paidAmount, setPaidAmount] = useState(0);
    const [pendingAmount, setPendingAmount] = useState(0);
    const [payableMeals, setPayableMeals] = useState(0);
    const [paidMeals, setPaidMeals] = useState(0);
    const [pendingMeals, setPendingMeals] = useState(0);
    const [payableAmount, setPayableAmount] = useState(0);
    const { toast } = useToast();
    const [disableBtn, setDisableBtn] = useState(false);
    const [orderId, setOrderId] = useState('');
    const [currentDayKey, setCurrentDayKey] = useState(() => new Date().toDateString());

    const [userData, setUserData] = useState<any>(null);

    const getUserData = async () => {
        try {
            const stored = localStorage.getItem("user");
            if (!stored) return;
            const id = JSON.parse(stored)._id;
            if (!id) return;
            const response = await axiosInstance.get(`profile/view-profile/${id}`);
            setUserData(response.data.data.user);
        } catch (error: any) {
            toast({ variant: "error", title: `Error fetching user data: ${error.message || error}` });
        }
    };

    useEffect(() => { getUserData(); }, []);

    const availableMeals = useMemo(() => {
        return (userData?.preferredMealTypes || []) as MealType[];
    }, [userData]);

    const defaultDayMeals = useMemo(() =>
        availableMeals.reduce((acc, meal) => ({ ...acc, [meal]: false }), {} as DayMeals),
        [availableMeals]
    );

    const today = useMemo(() => {
        const t = new Date();
        t.setHours(0, 0, 0, 0);
        t.setMinutes(0);
        t.setSeconds(0);
        t.setMilliseconds(0);
        return t;
    }, [currentDayKey]);

    const fetchMonthData = async (month: Date) => {
        try {
            setDisableBtn(true);
            const user = localStorage.getItem("user");
            if (user) {
                const parsedUser = JSON.parse(user);
                const userId = parsedUser._id;

                const response = await axiosInstance.get(`/tiffin/tiffin-bill/${userId}`);

                const data = response.data || [];
                const formattedMonth = `${month.getFullYear()}-${String(
                    month.getMonth() + 1
                ).padStart(2, "0")}`;

                const currentMonthData = data.find((item: any) => item.month === formattedMonth) || null;

                if (currentMonthData) {
                    const flattenedDays: MonthDays = {};
                    const backendDays = currentMonthData.days || {};
                    Object.entries(backendDays).forEach(([dayKey, dayObj]: [string, any]) => {
                        flattenedDays[dayKey] = { ...defaultDayMeals, ...(dayObj.meals || {}) };
                    });

                    setMonthDays(flattenedDays);
                    setPayableMeals(currentMonthData.tiffinMeals);
                    setTotalAmount(currentMonthData.totalAmount);
                    setPaidAmount(currentMonthData.paidAmount || 0);
                    setPendingAmount(currentMonthData.pendingAmount || currentMonthData.totalAmount);
                    setPaidMeals(currentMonthData.paidMeals || 0);
                    setPendingMeals(currentMonthData.pendingMeals || currentMonthData.tiffinMeals);
                    setOrderId(currentMonthData.invoiceNumber);
                    setPayableAmount(currentMonthData.vendor.amountPerMeal || currentMonthData.vendor.amountPerDay);
                    if (!userData && currentMonthData.vendor?.availableMealTypes) {
                        setUserData((prev: any) => ({ ...(prev || {}), messId: { availableMealTypes: currentMonthData.vendor.availableMealTypes } }));
                    }
                } else {
                    toast({
                        variant: "warning",
                        title: `No data found for this ${formattedMonth} month`,
                    });
                    setMonthDays({} as MonthDays);
                    setPayableMeals(0);
                    setTotalAmount(0);
                    setPaidAmount(0);
                    setPendingAmount(0);
                    setPaidMeals(0);
                    setPendingMeals(0);
                    setOrderId('');
                    setPayableAmount(0);
                }
                setDisableBtn(false);
            } else {
                nav.push("/login");
                setDisableBtn(true);
            }
        } catch (error: any) {
            setDisableBtn(false);
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
            setMonthDays({} as MonthDays);
            setPayableMeals(0);
            setTotalAmount(0);
            setPaidAmount(0);
            setPendingAmount(0);
            setPaidMeals(0);
            setPendingMeals(0);
            setOrderId('');
            setPayableAmount(0);
        }
    };

    useEffect(() => {
        fetchMonthData(currentMonth);
    }, [currentMonth, defaultDayMeals]);

    useEffect(() => {
        const checkDayChange = () => {
            const nowDay = new Date().toDateString();
            if (nowDay !== currentDayKey) {
                setCurrentDayKey(nowDay);
            }
        };

        checkDayChange();

        const intervalId = setInterval(checkDayChange, 5 * 60 * 1000);

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                checkDayChange();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(intervalId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [currentDayKey]);

    const handleDayClick = (selectedDate: Date) => {
        if (selectedDate.getMonth() !== currentMonth.getMonth()) {
            return;
        }

        const dayNumber = String(selectedDate.getDate()).padStart(2, "0");
        const backendMeals = monthDays[dayNumber] || {};
        const existingDayMeals = availableMeals.reduce((acc, meal) => {
            acc[meal] = backendMeals[meal] ?? false;
            return acc;
        }, {} as DayMeals);
        setDayMeals(existingDayMeals);
        setSelectedDay(selectedDate);
        setShowMealModal(true);
    };

    const handleMealToggle = (mealType: MealType, checked: boolean) => {
        setDayMeals(prev => ({ ...prev, [mealType]: checked }));
    };

    const saveDayMeals = async () => {
        if (!selectedDay) return;

        if (selectedDay.getMonth() !== currentMonth.getMonth()) {
            toast({
                variant: "warning",
                title: "Cannot save for dates outside the current month.",
            });
            return;
        }

        try {
            setDisableBtn(true);
            const user = localStorage.getItem("user");
            if (user) {
                const parsedUser = JSON.parse(user);
                const userId = parsedUser._id;

                const dayNumber = String(selectedDay.getDate()).padStart(2, "0");
                const formattedMonth = `${selectedDay.getFullYear()}-${String(
                    selectedDay.getMonth() + 1
                ).padStart(2, "0")}`;

                const payload = {
                    userId: userId,
                    month: formattedMonth,
                    days: {
                        ...monthDays,
                        [dayNumber]: dayMeals,
                    },
                };

                const response = await axiosInstance.post(`/tiffin/track/add`, payload);

                setMonthDays((prevDays) => ({
                    ...prevDays,
                    [dayNumber]: dayMeals,
                }));

                await fetchMonthData(currentMonth);
                setShowMealModal(false);
            } else {
                nav.push("/login");
                setDisableBtn(true);
            }
        } catch (error: any) {
            setDisableBtn(false);
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
                title: `Error updating meals: ${error}`,
            });
        }
    };

    const markPaidRange = async () => {
        try {
            setDisableBtn(true);
            const user = localStorage.getItem("user");
            if (user) {
                const parsedUser = JSON.parse(user);
                const userId = parsedUser._id;

                const formattedMonth = `${currentMonth.getFullYear()}-${String(
                    currentMonth.getMonth() + 1
                ).padStart(2, "0")}`;

                const payload = {
                    userId: userId,
                    month: formattedMonth,
                    startDay,
                    endDay,
                };

                await axiosInstance.post(`/payment/mark-paid-range`, payload);

                toast({
                    variant: "success",
                    title: `Marked days ${startDay} to ${endDay} as paid.`,
                });

                setStartDay("01");
                setEndDay("31");
                setShowPaidRangeModal(false);

                await fetchMonthData(currentMonth);
            } else {
                nav.push("/login");
                setDisableBtn(true);
            }
        } catch (error: any) {
            setDisableBtn(false);
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
                title: `Error marking paid range: ${error.response?.data?.message || error.message}`,
            });
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
            toast({
                variant: "error",
                title: `Error generating PDF: ${error}`,
            });
        }
    };

    const handleMonthChange = (newMonth: Date) => {
        setCurrentMonth(newMonth);
    };

    const getDayMealsCount = (day: Date) => {
        if (!(day instanceof Date) || isNaN(day.getTime())) {
            return 0;
        }

        if (day.getMonth() !== currentMonth.getMonth()) {
            return 0;
        }

        const dayNumber = String(day.getDate()).padStart(2, "0");
        const dayMeals = monthDays[dayNumber];
        if (!dayMeals) return 0;
        return Object.values(dayMeals).filter(Boolean).length;
    };

    const generatePayment = async () => {
        try {
            const user = localStorage.getItem("user");
            if (user) {
                const amountToPay = pendingAmount > 0 ? pendingAmount : totalAmount;
                const payload = {
                    amount: amountToPay,
                    orderId: orderId,
                };

                const response = await axiosInstance.post(
                    `/payment/generate-upi-payment-link`,
                    payload
                );
                const link = response.data?.paymentLink || null;
                if (link) {
                    const startTime = new Date().getTime();
                    nav.push(`/payment-fallback?paymentLink=${encodeURIComponent(link)}&totalAmount=${encodeURIComponent(amountToPay)}`);

                    setTimeout(() => {
                        const endTime = new Date().getTime();
                        const timeTaken = endTime - startTime;
                        if (timeTaken < 1000) {
                            window.location.href = `/payment-fallback?paymentLink=${encodeURIComponent(link)}&totalAmount=${encodeURIComponent(amountToPay)}`;
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
                    title: `Payment link generated for ₹${amountToPay}`,
                });
            } else {
                nav.push("/login");
            }
        } catch (error: any) {
            toast({
                variant: "error",
                title: `Error generating payment: ${error}`,
            });
        }
    };

    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const getCalendarDays = (month: Date): Date[] => {
        const year = month.getFullYear();
        const mon = month.getMonth();
        const firstDay = new Date(year, mon, 1);
        const lastDay = new Date(year, mon + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startOffset = firstDay.getDay();

        const calendarDays: Date[] = [];

        const prevLastDay = new Date(year, mon, 0).getDate();
        for (let i = startOffset - 1; i >= 0; i--) {
            const date = new Date(year, mon - 1, prevLastDay - i);
            date.setHours(0, 0, 0, 0);
            calendarDays.push(date);
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(year, mon, d);
            date.setHours(0, 0, 0, 0);
            calendarDays.push(date);
        }

        const totalDays = calendarDays.length;
        const remaining = 7 - (totalDays % 7);
        if (remaining !== 7) {
            const nextFirst = new Date(year, mon + 1, 1);
            nextFirst.setHours(0, 0, 0, 0);
            for (let i = 0; i < remaining; i++) {
                const date = new Date(nextFirst);
                date.setDate(1 + i);
                calendarDays.push(date);
            }
        }

        return calendarDays;
    };

    const calendarDays = useMemo(() => getCalendarDays(currentMonth), [currentMonth]);
    const weeks: Date[][] = useMemo(() => {
        const w: Date[][] = [];
        for (let i = 0; i < calendarDays.length; i += 7) {
            w.push(calendarDays.slice(i, i + 7));
        }
        return w;
    }, [calendarDays]);

    const handlePrevMonth = () => {
        const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
        handleMonthChange(prevMonth);
    };

    const handleNextMonth = () => {
        const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
        handleMonthChange(nextMonth);
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
                        {/* Month Navigation */}
                        <div className="flex justify-between items-center mb-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePrevMonth}
                            >
                                Previous
                            </Button>
                            <h3 className="text-lg font-semibold">
                                {currentMonth.toLocaleString("default", { month: "long", year: "numeric" })}
                            </h3>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleNextMonth}
                            >
                                Next
                            </Button>
                        </div>

                        {/* Calendar Table */}
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="text-gray-500">
                                    {weekdays.map((day) => (
                                        <th key={day} className="p-2 text-center font-medium">
                                            {day}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {weeks.map((week, weekIndex) => (
                                    <tr key={weekIndex}>
                                        {week.map((day, dayIndex) => (
                                            <td key={dayIndex} className="p-1">
                                                {day ? (
                                                    <button
                                                        type="button"
                                                        disabled={
                                                            day > today ||
                                                            day.getMonth() !== currentMonth.getMonth()
                                                        }
                                                        onClick={() => {
                                                            if (day <= today && day.getMonth() === currentMonth.getMonth()) {
                                                                handleDayClick(day);
                                                            }
                                                        }}
                                                        className={`w-10 h-10 rounded-full mx-auto block relative text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:cursor-not-allowed ${day.getMonth() !== currentMonth.getMonth()
                                                            ? "text-gray-400 bg-gray-100 opacity-50 cursor-not-allowed"
                                                            : day > today
                                                                ? "text-gray-400 bg-gray-100 opacity-50 cursor-not-allowed"
                                                                : getDayMealsCount(day) > 1
                                                                    ? "bg-green-500 text-white hover:bg-green-600"
                                                                    : getDayMealsCount(day) === 1
                                                                        ? "bg-yellow-500 text-white hover:bg-yellow-600"
                                                                        : "bg-red-500 text-white hover:bg-red-600"
                                                            }`}
                                                    >
                                                        {day.getDate()}
                                                        {getDayMealsCount(day) > 0 && (
                                                            <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                                                                {getDayMealsCount(day)}
                                                            </span>
                                                        )}
                                                    </button>
                                                ) : null}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Billing Section */}
                <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-700">Billing Details</h2>
                    <div className="bg-gray-50 p-4 rounded-md shadow-inner border border-gray-200 space-y-2">
                        <p className="text-sm text-gray-600">
                            <strong>Month:</strong> {currentMonth.toLocaleString("default", { month: "long" })} {currentMonth.getFullYear()}
                        </p>
                        <p className="text-sm text-gray-600">
                            <strong>Total Meals:</strong> {payableMeals}
                        </p>
                        <p className="text-sm text-gray-600">
                            <strong>Paid Meals:</strong> {paidMeals}
                        </p>
                        <p className="text-sm text-gray-600">
                            <strong>Pending Meals:</strong> {pendingMeals}
                        </p>
                        <p className="text-sm text-gray-600">
                            <strong>Rate per Meal:</strong> ₹{payableAmount}
                        </p>
                        <p className="text-lg font-bold text-blue-600">
                            Paid Amount: ₹{paidAmount}
                        </p>
                        <p className="text-xl font-bold text-orange-600">
                            Pending Amount: ₹{pendingAmount}
                        </p>
                        <p className="text-xl font-bold text-green-600">
                            Total Amount: ₹{totalAmount}
                        </p>
                        {orderId && (
                            <p className="text-sm text-gray-600">
                                <strong>Invoice Number:</strong> {orderId}
                            </p>
                        )}
                    </div>
                    {pendingAmount > 0 && (
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setShowPaidRangeModal(true)}
                            disabled={disableBtn}
                        >
                            Mark Paid Range
                        </Button>
                    )}
                    <button disabled={disableBtn}
                        className="w-full bg-green-500 text-white py-2 px-4 rounded-md shadow-lg hover:bg-green-600 transition-all disabled:opacity-50"
                        onClick={generatePayment}
                    >
                        Pay Pending (₹{pendingAmount || totalAmount})
                    </button>
                    <button disabled={disableBtn}
                        className="w-full bg-purple-500 text-white py-2 px-4 rounded-md shadow-lg hover:bg-purple-600 transition-all disabled:opacity-50"
                        onClick={generatePdf}
                    >
                        Generate Bill
                    </button>
                </div>
            </div>

            {/* Meal Selection Modal */}
            <Dialog open={showMealModal} onOpenChange={setShowMealModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Select Meals for {selectedDay?.toLocaleDateString()}</DialogTitle>
                        <DialogDescription>Choose which meals you attended on this day.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {availableMeals.map((meal) => (
                            <div key={meal} className="flex items-center space-x-2">
                                <Checkbox
                                    id={meal}
                                    checked={dayMeals[meal] ?? false}
                                    onCheckedChange={(checked) => handleMealToggle(meal, !!checked)}
                                />
                                <Label htmlFor={meal} className="capitalize">
                                    {meal}
                                </Label>
                            </div>
                        ))}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowMealModal(false)}>
                                Cancel
                            </Button>
                            <Button onClick={saveDayMeals} disabled={disableBtn}>
                                Save
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Mark Paid Range Modal */}
            <Dialog open={showPaidRangeModal} onOpenChange={setShowPaidRangeModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Mark Paid Range</DialogTitle>
                        <DialogDescription>Specify the start and end days to mark all taken meals in the range as paid.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="startDay">Start Day (01-31)</Label>
                            <Input
                                id="startDay"
                                type="text"
                                value={startDay}
                                onChange={(e: any) => setStartDay(e.target.value)}
                                placeholder="01"
                                maxLength={2}
                            />
                        </div>
                        <div>
                            <Label htmlFor="endDay">End Day (01-31)</Label>
                            <Input
                                id="endDay"
                                type="text"
                                value={endDay}
                                onChange={(e: any) => setEndDay(e.target.value)}
                                placeholder="31"
                                maxLength={2}
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowPaidRangeModal(false)}>
                                Cancel
                            </Button>
                            <Button onClick={markPaidRange} disabled={disableBtn || !startDay || !endDay}>
                                Mark Paid
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Additional Info */}
            <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">How it Works</h2>
                <ul className="list-disc pl-6 space-y-2 text-sm text-gray-600">
                    <li>Click on a date to select meals ({availableMeals.map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(', ')}).</li>
                    <li>Green/yellow/red days indicate multiple/single/no meals taken.</li>
                    <li>Use "Mark Paid Range" to record partial/full month payments.</li>
                    <li>The pending amount is calculated based on unpaid taken meals at ₹{payableAmount} per meal.</li>
                </ul>
            </div>
        </div>
    );
}