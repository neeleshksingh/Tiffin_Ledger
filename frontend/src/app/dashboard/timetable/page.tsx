"use client";

import { useState, useEffect, useMemo } from "react";
import { AlertCircle, Phone, MessageCircle } from "lucide-react";
import axiosInstance from "@components/interceptors/axios.interceptor";
import { useRouter } from "next/navigation";
import { useToast } from "@components/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@components/components/ui/radio-group";

type MealType = "breakfast" | "lunch" | "dinner";
type DayMeals = Record<MealType, boolean>;
type MonthDays = Record<string, DayMeals>;

interface BillingInfo {
    name: string;
    gstin: string;
    address: string;
}
interface VendorDetails {
    _id: string;
    name: string;
    shopName: string;
    address: string;
    contactNumber: string;
    amountPerDay: number;
    gstNumber: string;
    billingInfo: BillingInfo;
    availableMealTypes: string[];
}

interface TiffinDay {
    date: string;
    meals: Record<MealType, boolean>;
}
interface TiffinOverview {
    month: string;
    totalDays: number;
    totalMeals: number;
    tiffinTakenDays: number;
    days: TiffinDay[];
}

interface UserData {
    data: {
        user: {
            _id: string;
            name: string;
            email: string;
            createdAt: string;
            updatedAt: string;
            __v?: number;
            messId: VendorDetails;
            profilePic: string;
        };
        tiffinOverview: TiffinOverview[];
        vendor: VendorDetails;
    };
}

export default function Timetable() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [monthDays, setMonthDays] = useState<MonthDays>({});
    const [selectedDay, setSelectedDay] = useState<Date | null>(null);
    const [showMealModal, setShowMealModal] = useState(false);
    const [showPaidRangeModal, setShowPaidRangeModal] = useState(false);
    const [dayMeals, setDayMeals] = useState<DayMeals>({ breakfast: false, lunch: false, dinner: false });
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
    const [eligibleDays, setEligibleDays] = useState<string[]>([]);
    const [selectedPaidDays, setSelectedPaidDays] = useState<Set<string>>(new Set());

    const [userData, setUserData] = useState<any>(null);
    const [isBlocked, setIsBlocked] = useState(false);
    const [blockReason, setBlockReason] = useState("");
    const [vendorContact, setVendorContact] = useState("");

    const [vendors, setVendors] = useState<VendorDetails[]>([]);
    const [selectedVendorId, setSelectedVendorId] = useState<string>('');
    const [preferredMeals, setPreferredMeals] = useState<string[]>([]);
    const [showVendorDialog, setShowVendorDialog] = useState(false);
    const [isLoadingVendors, setIsLoadingVendors] = useState(false);
    const [isAssigning, setIsAssigning] = useState(false);

    const getUserData = async () => {
        try {
            const stored = localStorage.getItem("user");
            if (!stored) return;
            const id = JSON.parse(stored)._id;
            if (!id) return;
            const response = await axiosInstance.get(`profile/view-profile/${id}`);
            const user = response.data.data.user;
            setUserData(user);

            const currentVendorId = user.messId?._id;
            const blockedEntry = user.blockedByVendors?.find(
                (b: any) => b.vendorId === currentVendorId && b.isBlocked === true
            );

            if (blockedEntry) {
                setIsBlocked(true);
                setBlockReason(blockedEntry.reason || "No reason provided");
                setVendorContact(user.messId?.contactNumber || "N/A");
            }
        } catch (error: any) {
            toast({ variant: "error", title: `Error fetching user data: ${error.message || error}` });
        }
    };

    useEffect(() => {
        getUserData();
    }, []);

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
            if (!user) {
                nav.push("/login");
                return;
            }

            const parsedUser = JSON.parse(user);
            const userId = parsedUser._id;

            const response = await axiosInstance.get(`/tiffin/tiffin-bill/${userId}`);
            const data = response.data || [];
            const formattedMonth = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;

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
                setPendingAmount(currentMonthData.pendingAmount);
                setPaidMeals(currentMonthData.paidMeals || 0);
                setPendingMeals(currentMonthData.pendingMeals || currentMonthData.tiffinMeals);
                setOrderId(currentMonthData.invoiceNumber);
                setPayableAmount(currentMonthData.vendor.amountPerMeal || currentMonthData.vendor.amountPerDay);

                if (!userData && currentMonthData.vendor?.availableMealTypes) {
                    setUserData((prev: any) => ({
                        ...(prev || {}),
                        messId: { availableMealTypes: currentMonthData.vendor.availableMealTypes }
                    }));
                }
            } else {
                toast({ variant: "warning", title: `No data found for ${formattedMonth}` });
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
        } catch (error: any) {
            if (error.status === 403) {
                localStorage.removeItem("token");
                nav.push("/login");
                toast({ variant: "error", title: "Session Expired, Please login again" });
            } else {
                toast({ variant: "error", title: `Error fetching month data: ${error.message || error}` });
            }
            setMonthDays({} as MonthDays);
            setPayableMeals(0);
            setTotalAmount(0);
            setPaidAmount(0);
            setPendingAmount(0);
            setPaidMeals(0);
            setPendingMeals(0);
            setOrderId('');
            setPayableAmount(0);
        } finally {
            setDisableBtn(false);
        }
    };

    // Single effect to fetch data when month or user changes
    useEffect(() => {
        if (userData && !isBlocked) {
            fetchMonthData(currentMonth);
        }
    }, [currentMonth, userData, isBlocked, defaultDayMeals]);

    // Day change detection
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
            if (document.visibilityState === 'visible') checkDayChange();
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(intervalId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [currentDayKey]);

    const handleDayClick = (selectedDate: Date) => {
        if (selectedDate.getMonth() !== currentMonth.getMonth()) return;

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
            toast({ variant: "warning", title: "Cannot save for dates outside the current month." });
            return;
        }

        try {
            setDisableBtn(true);
            const user = localStorage.getItem("user");
            if (!user) {
                nav.push("/login");
                return;
            }

            const parsedUser = JSON.parse(user);
            const userId = parsedUser._id;
            const dayNumber = String(selectedDay.getDate()).padStart(2, "0");
            const formattedMonth = `${selectedDay.getFullYear()}-${String(selectedDay.getMonth() + 1).padStart(2, "0")}`;

            const payload = {
                userId,
                month: formattedMonth,
                days: {
                    ...monthDays,
                    [dayNumber]: dayMeals,
                },
            };

            await axiosInstance.post(`/tiffin/track/add`, payload);
            setMonthDays(prev => ({ ...prev, [dayNumber]: dayMeals }));
            await fetchMonthData(currentMonth);
            setShowMealModal(false);
            toast({ variant: "success", title: "Meals saved successfully!" });
        } catch (error: any) {
            if (error.status === 403) {
                localStorage.removeItem("token");
                nav.push("/login");
                toast({ variant: "error", title: "Session Expired, Please login again" });
            } else {
                toast({ variant: "error", title: `Error updating meals: ${error.response?.data?.message || error.message}` });
            }
        } finally {
            setDisableBtn(false);
        }
    };

    const getVendors = async () => {
        try {
            setIsLoadingVendors(true);
            const response = await axiosInstance.get<VendorDetails[]>(`/tiffin/vendors`);
            setVendors(response.data);
        } catch (error) {
            console.error('Error fetching vendors:', error);
            toast({
                variant: "error",
                title: "Error fetching vendors",
            });
        } finally {
            setIsLoadingVendors(false);
        }
    };

    const openPaidModal = async () => {
        try {
            const user = JSON.parse(localStorage.getItem("user")!);
            const formattedMonth = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`;

            const eligibleRes = await axiosInstance.get(`/payment/eligible-paid-days`, {
                params: { userId: user._id, month: formattedMonth }
            });
            const eligible = eligibleRes.data.data || [];

            const paidRes = await axiosInstance.get(`/payment/get-paid-days`, {
                params: { userId: user._id, month: formattedMonth }
            });
            const alreadyPaid = paidRes.data.data || [];

            setEligibleDays(eligible);
            setSelectedPaidDays(new Set(alreadyPaid)); // pre-check
            setShowPaidRangeModal(true);
        } catch (err: any) {
            toast({
                variant: "error",
                title: err.response?.data?.message || "Failed to load payable days"
            });
        }
    };

    const generatePdf = async () => {
        try {
            const user = localStorage.getItem("user");
            if (!user) {
                nav.push("/login");
                return;
            }

            const parsedUser = JSON.parse(user);
            const payload = { userId: parsedUser._id, date: new Date().toISOString().split('T')[0] };

            const response = await axiosInstance.post(`/tiffin/generate`, payload, { responseType: 'blob' });
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'bill.pdf';
            link.click();

            toast({ variant: "success", title: "Receipt generated successfully" });
        } catch (error: any) {
            toast({ variant: "error", title: `Error generating PDF: ${error.message || error}` });
        }
    };

    const generatePayment = async () => {
        try {
            const user = localStorage.getItem("user");
            if (!user) {
                nav.push("/login");
                return;
            }

            const amountToPay = pendingAmount > 0 ? pendingAmount : totalAmount;
            const payload = { amount: amountToPay, orderId };

            const response = await axiosInstance.post(`/payment/generate-upi-payment-link`, payload);
            const link = response.data?.paymentLink;

            if (link) {
                nav.push(`/payment-fallback?paymentLink=${encodeURIComponent(link)}&totalAmount=${amountToPay}`);
                toast({ variant: "success", title: `Payment link generated for ₹${amountToPay}` });
            } else {
                toast({ variant: "error", title: "Failed to generate payment link." });
            }
        } catch (error: any) {
            toast({ variant: "error", title: `Error: ${error.message || error}` });
        }
    };

    const assignVendor = async () => {
        if (!selectedVendorId) return;
        const selectedVendor = vendors.find(v => v._id === selectedVendorId);
        if (!selectedVendor) return;

        let finalPreferredMeals = preferredMeals;
        if (finalPreferredMeals.length === 0) {
            finalPreferredMeals = selectedVendor.availableMealTypes.length > 0
                ? selectedVendor.availableMealTypes
                : ["breakfast", "lunch", "dinner"];
        }

        const user = localStorage.getItem("user");
        if (!user) {
            nav.push("/login");
            return;
        }

        const parsedUser = JSON.parse(user);

        const payload = {
            userId: parsedUser._id,
            messId: selectedVendor._id,
            preferredMealTypes: finalPreferredMeals
        };

        try {
            setIsAssigning(true);
            await axiosInstance.post(`/tiffin/assign-vendor`, payload);
            toast({
                variant: "success",
                title: "Vendor assigned successfully",
            });
            setShowVendorDialog(false);
            setSelectedVendorId('');
            setPreferredMeals([]);
            // Refetch user data to update
            await getUserData();
        } catch (error) {
            console.error('Error assigning vendor:', error);
            toast({
                variant: "error",
                title: "Error assigning vendor",
            });
        } finally {
            setIsAssigning(false);
        }
    };

    const toggleMeal = (meal: string) => {
        setPreferredMeals(prev =>
            prev.includes(meal) ? prev.filter(m => m !== meal) : [...prev, meal]
        );
    };

    const handlePrevMonth = () => {
        const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
        setCurrentMonth(prev);
    };

    const handleNextMonth = () => {
        const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
        setCurrentMonth(next);
    };

    const getDayMealsCount = (day: Date) => {
        if (!(day instanceof Date) || isNaN(day.getTime())) return 0;
        if (day.getMonth() !== currentMonth.getMonth()) return 0;
        const dayNumber = String(day.getDate()).padStart(2, "0");
        const dayMeals = monthDays[dayNumber];
        return dayMeals ? Object.values(dayMeals).filter(Boolean).length : 0;
    };

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
            for (let i = 0; i < remaining; i++) {
                const date = new Date(year, mon + 1, 1 + i);
                date.setHours(0, 0, 0, 0);
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

    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // EARLY RETURN: Blocked User UI (after all hooks!)
    if (isBlocked) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-6">
                <div className="max-w-2xl w-full">
                    <Alert variant="destructive" className="border-2 shadow-2xl">
                        <span className="flex items-center gap-3">
                            <AlertCircle className="h-8 w-8" />
                            <AlertTitle className="text-2xl font-bold">Access Restricted</AlertTitle>
                        </span>
                        <AlertDescription className="text-lg mt-4 space-y-4">
                            <p>
                                You have been <strong>blocked</strong> by <strong>{userData?.messId?.shopName || "your vendor"}</strong>.
                            </p>
                            <p className="font-semibold">
                                Reason: <span className="text-red-700">{blockReason}</span>
                            </p>
                            <p className="text-sm">
                                You cannot mark attendance, make payments, or generate bills until this is resolved.
                            </p>
                            <div className="mt-6 p-4 bg-red-100 rounded-lg">
                                <p className="font-medium mb-2">Please contact your vendor:</p>
                                <div className="flex items-center gap-3">
                                    <Phone className="w-5 h-5 text-red-700" />
                                    <span className="font-bold">{vendorContact}</span>
                                </div>
                                <div className="flex items-center gap-3 mt-2">
                                    <MessageCircle className="w-5 h-5 text-green-700" />
                                    <a
                                        href={`https://wa.me/+91${vendorContact.replace(/[^0-9]/g, "")}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-green-700 underline font-medium"
                                    >
                                        Message on WhatsApp
                                    </a>
                                </div>
                            </div>
                        </AlertDescription>
                    </Alert>
                </div>
            </div>
        );
    }

    // MAIN UI
    return (
        <div className="p-3 space-y-8 bg-gray-100">
            <h1 className="text-2xl font-bold text-gray-800">Tiffin Timetable</h1>
            <Button style={{ marginTop: "0.5rem" }} onClick={() => {
                getVendors();
                setShowVendorDialog(true);
            }}>Switch Vendor</Button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Calendar */}
                <div className="bg-white shadow-md rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">Attendance Calendar</h2>
                    <div className="w-full overflow-x-auto">
                        <div className="flex justify-between items-center mb-4">
                            <Button variant="destructive" size="sm" onClick={handlePrevMonth}>Previous</Button>
                            <h3 className="text-lg font-semibold">
                                {currentMonth.toLocaleString("default", { month: "long", year: "numeric" })}
                            </h3>
                            <Button variant="success" size="sm" onClick={handleNextMonth}>Next</Button>
                        </div>

                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="text-gray-500">
                                    {weekdays.map(day => <th key={day} className="p-2 text-center font-medium">{day}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {weeks.map((week, weekIndex) => (
                                    <tr key={weekIndex}>
                                        {week.map((day, dayIndex) => (
                                            <td key={dayIndex} className="p-1">
                                                <button
                                                    type="button"
                                                    disabled={day > today || day.getMonth() !== currentMonth.getMonth()}
                                                    onClick={() => day <= today && day.getMonth() === currentMonth.getMonth() && handleDayClick(day)}
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
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Billing */}
                <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-700">Billing Details</h2>
                    <div className="bg-gray-50 p-4 rounded-md shadow-inner border border-gray-200 space-y-2">
                        <p className="text-sm text-gray-600"><strong>Month:</strong> {currentMonth.toLocaleString("default", { month: "long" })} {currentMonth.getFullYear()}</p>
                        <p className="text-sm text-gray-600"><strong>Total Meals:</strong> {payableMeals}</p>
                        <p className="text-sm text-gray-600"><strong>Paid Meals:</strong> {paidMeals}</p>
                        <p className="text-sm text-gray-600"><strong>Pending Meals:</strong> {pendingMeals}</p>
                        <p className="text-sm text-gray-600"><strong>Rate per Meal:</strong> ₹{payableAmount}</p>
                        <p className="text-lg font-bold text-blue-600">Paid Amount: ₹{paidAmount}</p>
                        <p className="text-xl font-bold text-orange-600">Pending Amount: ₹{pendingAmount}</p>
                        <p className="text-xl font-bold text-green-600">Total Amount: ₹{totalAmount}</p>
                        {orderId && <p className="text-sm text-gray-600"><strong>Invoice Number:</strong> {orderId}</p>}
                    </div>

                    {pendingAmount > 0 && (
                        <Button variant="warning" className="w-full" onClick={openPaidModal} disabled={disableBtn}>
                            Mark Paid Days
                        </Button>
                    )}
                    <button disabled={disableBtn} className="w-full bg-green-500 text-white py-2 px-4 rounded-md shadow-lg hover:bg-green-600 transition-all disabled:opacity-50" onClick={generatePayment}>
                        Pay Pending (₹{pendingAmount || totalAmount})
                    </button>
                    <button disabled={disableBtn} className="w-full bg-purple-500 text-white py-2 px-4 rounded-md shadow-lg hover:bg-purple-600 transition-all disabled:opacity-50" onClick={generatePdf}>
                        Generate Bill
                    </button>
                </div>
            </div>

            {/* Meal Modal */}
            <Dialog open={showMealModal} onOpenChange={setShowMealModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Select Meals for {selectedDay?.toLocaleDateString()}</DialogTitle>
                        <DialogDescription>Choose which meals you attended on this day.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {availableMeals.map(meal => (
                            <div key={meal} className="flex items-center space-x-2">
                                <Checkbox id={meal} checked={dayMeals[meal] ?? false} onCheckedChange={(checked) => handleMealToggle(meal, !!checked)} />
                                <Label htmlFor={meal} className="capitalize">{meal}</Label>
                            </div>
                        ))}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowMealModal(false)}>Cancel</Button>
                            <Button onClick={saveDayMeals} disabled={disableBtn}>Save</Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Paid Range Modal */}
            {/* Paid Range Modal – NOW SHOWS ONLY TAKEN DAYS */}
            <Dialog open={showPaidRangeModal} onOpenChange={setShowPaidRangeModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Mark Paid Days</DialogTitle>
                        <DialogDescription>
                            Select the days you have paid for (only days with taken meals are shown).
                        </DialogDescription>
                    </DialogHeader>

                    <div className="max-h-64 overflow-y-auto space-y-2 py-2">
                        {eligibleDays.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">
                                No taken meals this month
                            </p>
                        ) : (
                            eligibleDays.map(day => (
                                <div key={day} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`paid-${day}`}
                                        checked={selectedPaidDays.has(day)}
                                        onCheckedChange={(checked) => {
                                            const newSet = new Set(selectedPaidDays);
                                            checked ? newSet.add(day) : newSet.delete(day);
                                            setSelectedPaidDays(newSet);
                                        }}
                                    />
                                    <Label htmlFor={`paid-${day}`} className="cursor-pointer">
                                        Day {parseInt(day, 10)}
                                    </Label>
                                </div>
                            ))
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowPaidRangeModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={async () => {
                                if (selectedPaidDays.size === 0) {
                                    toast({ variant: "warning", title: "Select at least one day" });
                                    return;
                                }

                                try {
                                    setDisableBtn(true);
                                    const user = JSON.parse(localStorage.getItem("user")!);
                                    const formattedMonth = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`;

                                    await axiosInstance.post(`/payment/mark-paid-selected`, {
                                        userId: user._id,
                                        month: formattedMonth,
                                        selectedDays: Array.from(selectedPaidDays)
                                    });

                                    toast({ variant: "success", title: "Paid days updated!" });
                                    setShowPaidRangeModal(false);
                                    await fetchMonthData(currentMonth);
                                } catch (err: any) {
                                    toast({
                                        variant: "error",
                                        title: err.response?.data?.message || "Failed to mark paid"
                                    });
                                } finally {
                                    setDisableBtn(false);
                                }
                            }}
                            disabled={disableBtn || selectedPaidDays.size === 0}
                        >
                            Confirm Paid
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showVendorDialog} onOpenChange={setShowVendorDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Select Vendor</DialogTitle>
                        <DialogDescription>Choose a vendor to assign for tiffin service.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {isLoadingVendors ? (
                            <p>Loading vendors...</p>
                        ) : vendors.length === 0 ? (
                            <p>No vendors available.</p>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Select Vendor</Label>
                                    <RadioGroup value={selectedVendorId} onValueChange={setSelectedVendorId}>
                                        {vendors.map((vendor) => (
                                            <div key={vendor._id} className="flex items-center space-x-2 p-2 border rounded-md">
                                                <RadioGroupItem value={vendor._id} id={vendor._id} />
                                                <Label htmlFor={vendor._id}>
                                                    <div>
                                                        <h3 className="font-semibold">{vendor.shopName}</h3>
                                                        <p className="text-sm text-gray-600">{vendor.address}</p>
                                                        <p className="text-sm">₹{vendor.amountPerDay}/day</p>
                                                    </div>
                                                </Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </div>
                                {selectedVendorId && (
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Select Preferred Meals</Label>
                                        {(vendors.find(v => v._id === selectedVendorId)?.availableMealTypes || ["breakfast", "lunch", "dinner"]).map((meal) => (
                                            <div key={meal} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={meal}
                                                    checked={preferredMeals.includes(meal)}
                                                    onCheckedChange={() => toggleMeal(meal)}
                                                />
                                                <Label htmlFor={meal} className="text-sm capitalize">
                                                    {meal}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowVendorDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={assignVendor} disabled={!selectedVendorId || isAssigning}>
                            {isAssigning ? 'Assigning...' : 'Assign Vendor'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Info */}
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