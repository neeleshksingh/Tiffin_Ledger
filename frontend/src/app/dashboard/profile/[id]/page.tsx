"use client";
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { FaMapMarkerAlt, FaPhoneAlt, FaRegBuilding, FaCalendar, FaPen } from 'react-icons/fa';
import { useToast } from '@components/hooks/use-toast';
import { useRouter } from 'next/navigation';
import axiosInstance from '@components/interceptors/axios.interceptor';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import defaultPic from '../../../../../public/assets/profile.png';
import ImageCompression from 'browser-image-compression';
type MealType = "breakfast" | "lunch" | "dinner";
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
interface PageProps {
    params: Promise<{
        id: string;
    }>;
}
export default function Profile({ params }: PageProps) {
    const [data, setData] = useState<UserData['data'] | null>(null);
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);
    const [vendors, setVendors] = useState<VendorDetails[]>([]);
    const [selectedVendorId, setSelectedVendorId] = useState<string>('');
    const [preferredMeals, setPreferredMeals] = useState<string[]>([]);
    const [showVendorDialog, setShowVendorDialog] = useState(false);
    const { toast } = useToast();
    const nav = useRouter();
    const resolvedParams = React.use(params);
    const [isLoadingVendors, setIsLoadingVendors] = useState(false);
    const [isAssigning, setIsAssigning] = useState(false);

    useEffect(() => {
        const getUserData = async () => {
            try {
                const userJson = localStorage.getItem("user");
                if (userJson) {
                    const response = await axiosInstance.get<UserData>(`/profile/view-profile/${resolvedParams.id}`);
                    setData(response.data.data);
                } else {
                    nav.push("/login");
                }
            } catch (error: unknown) {
                if (error instanceof Error) {
                    console.error("Error fetching vendor data:", error);
                    const axiosError = error as { response?: { status?: number } };
                    if (axiosError.response?.status === 403) {
                        localStorage.removeItem("token");
                        nav.push("/login");
                        toast({
                            variant: "error",
                            title: "Session Expired, Please login again",
                        });
                    } else {
                        toast({
                            variant: "error",
                            title: `Error fetching vendor data: ${error.message}`,
                        });
                    }
                }
            }
        };
        getUserData();
    }, [resolvedParams.id, nav, toast]);

    useEffect(() => {
        if (selectedVendorId) {
            const selectedVendor = vendors.find(v => v._id === selectedVendorId);
            const available = selectedVendor?.availableMealTypes || ["breakfast", "lunch", "dinner"];
            setPreferredMeals(available);
        } else {
            setPreferredMeals([]);
        }
    }, [selectedVendorId, vendors]);

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

    const toggleMeal = (meal: string) => {
        setPreferredMeals(prev =>
            prev.includes(meal) ? prev.filter(m => m !== meal) : [...prev, meal]
        );
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

        const payload = {
            userId: resolvedParams.id,
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
            const getUserData = async () => {
                try {
                    const userJson = localStorage.getItem("user");
                    if (userJson) {
                        const response = await axiosInstance.get<UserData>(`/profile/view-profile/${resolvedParams.id}`);
                        setData(response.data.data);
                    }
                } catch (error: unknown) {
                    if (error instanceof Error) {
                        console.error("Error refetching user data:", error);
                    }
                }
            };
            getUserData();
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

    useEffect(() => {
        if (data?.tiffinOverview && selectedIndex === -1) {
            setSelectedIndex(data.tiffinOverview.length - 1);
        }
    }, [data, selectedIndex]);

    const calculateTiffinAttendance = (tiffinOverview: TiffinOverview | null): string => {
        if (!tiffinOverview) return '0.00';
        const daysWithTiffin = tiffinOverview.days?.filter(day =>
            Object.values(day.meals).some(Boolean)
        ).length;
        const attendancePercentage = (daysWithTiffin / tiffinOverview.totalDays) * 100;
        return attendancePercentage.toFixed(2);
    };

    const getTiffinTakenDays = (tiffinOverview: TiffinOverview | null): number => {
        if (!tiffinOverview) return 0;
        return tiffinOverview.days?.filter(day =>
            Object.values(day.meals).some(Boolean)
        ).length;
    };

    const currentTiffinOverview = data?.tiffinOverview && selectedIndex >= 0 ? data.tiffinOverview[selectedIndex] : null;

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const maxSizeMB = 10;
                if (file.size / 1024 / 1024 > maxSizeMB) {
                    const options = {
                        maxSizeMB: maxSizeMB,
                        maxWidthOrHeight: 800,
                        useWebWorker: true,
                    };
                    const compressedFile = await ImageCompression(file, options);
                    await uploadImageToCloudinary(compressedFile);
                } else {
                    await uploadImageToCloudinary(file);
                }
            } catch (error) {
                console.error('Error uploading profile picture:', error);
                toast({
                    variant: 'error',
                    title: 'Error uploading profile picture',
                    description: error instanceof Error ? error.message : 'Something went wrong',
                });
            }
        }
    };

    const uploadImageToCloudinary = async (file: File) => {
        try {
            const formData = new FormData();
            formData.append('profilePic', file);
            const userId = resolvedParams.id;
            const response = await axiosInstance.post(`/profile-pic/upload-profile-pic/${userId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setData((prevData) => {
                if (prevData) {
                    return {
                        ...prevData,
                        user: {
                            ...prevData.user,
                            profilePic: response.data.data.profilePic,
                        },
                    };
                }
                return prevData;
            });
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            toast({
                variant: 'error',
                title: 'Error uploading profile picture',
                description: error instanceof Error ? error.message : 'Something went wrong',
            });
        }
    };

    const hasOverview = data?.tiffinOverview && data.tiffinOverview.length > 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
            <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-br from-black via-gray-900 to-gray-800 p-6 text-center relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shine pointer-events-none"></div>
                    <div className="relative w-32 h-32 mx-auto mb-4 z-10">
                        <Image
                            src={data?.user.profilePic || defaultPic}
                            alt={data?.user.name || 'Profile Picture'}
                            fill
                            className="rounded-full object-cover border-4 border-white"
                        />
                        <label htmlFor="file-upload" className="absolute right-0 bottom-0 bg-blue-600 p-2 rounded-full cursor-pointer">
                            <FaPen className="text-white" />
                        </label>
                        <input
                            id="file-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                    </div>
                    <h1 className="text-2xl font-bold text-white z-10">{data?.user?.name}</h1>
                    <p className="text-blue-100 z-10">{data?.user?.email}</p>
                    <div className="mt-4 flex flex-col sm:flex-row justify-center gap-4 z-10">
                        <button
                            onClick={() => nav.push('/dashboard/profile/profile-manage/' + resolvedParams.id)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-all w-full sm:w-auto"
                        >
                            Edit Profile
                        </button>
                        <button
                            onClick={() => {
                                getVendors();
                                setShowVendorDialog(true);
                            }}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition-all w-full sm:w-auto"
                        >
                            Select Vendor Preferences
                        </button>
                    </div>
                </div>
                <div className="p-6 grid md:grid-cols-2 gap-6 z-10">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h2 className="text-xl font-semibold mb-4 text-blue-800">Tiffin Service Details</h2>
                        <div className="space-y-3">
                            {[
                                { icon: FaRegBuilding, text: data?.vendor?.shopName || 'Not assigned' },
                                { icon: FaMapMarkerAlt, text: data?.vendor?.address || 'Not assigned' },
                                { icon: FaPhoneAlt, text: data?.vendor?.contactNumber || 'Not assigned' },
                                { icon: FaCalendar, text: data?.vendor ? `₹${data.vendor.amountPerDay} per day` : 'Not assigned' }
                            ].map(({ icon: Icon, text }, index) => (
                                <div key={index} className="flex items-center">
                                    <Icon className="mr-3 text-blue-600" />
                                    <span>{text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <h2 className="text-xl font-semibold mb-4 text-green-800">Tiffin Attendance</h2>
                        {!hasOverview ? (
                            <div>No tiffin overview available</div>
                        ) : (
                            <>
                                <div className="mb-4">
                                    <label className="text-sm font-medium text-gray-500 block mb-2">Select Month:</label>
                                    <select
                                        value={selectedIndex}
                                        onChange={(e) => setSelectedIndex(parseInt(e.target.value))}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        {data.tiffinOverview.map((overview, index) => {
                                            const monthDate = new Date(`${overview.month}-01`);
                                            const label = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                                            return (
                                                <option key={index} value={index}>
                                                    {label}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                                {currentTiffinOverview ? (
                                    <div className="space-y-3">
                                        {[
                                            { label: 'Total Days', value: currentTiffinOverview.totalDays },
                                            { label: 'Tiffin Taken Days', value: getTiffinTakenDays(currentTiffinOverview) },
                                            {
                                                label: 'Total Meals',
                                                value: currentTiffinOverview.totalMeals,
                                                className: 'text-blue-600'
                                            },
                                            {
                                                label: 'Attendance Percentage',
                                                value: `${calculateTiffinAttendance(currentTiffinOverview)}%`,
                                                className: 'text-green-600'
                                            }
                                        ].map(({ label, value, className }) => (
                                            <div key={label} className="flex justify-between">
                                                <span>{label}:</span>
                                                <span className={`font-bold ${className || ''}`}>{value}</span>
                                            </div>
                                        ))}
                                        <div className="mt-4">
                                            <h3 className="text-lg font-semibold mb-2">
                                                Tiffin Calendar for {new Date(`${currentTiffinOverview.month}-01`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                            </h3>
                                            <div className="grid grid-cols-7 gap-1">
                                                {Array.from({ length: currentTiffinOverview.totalDays }, (_, i) => {
                                                    const dateString = (i + 1).toString().padStart(2, '0');
                                                    const dayInfo = currentTiffinOverview.days?.find(day => day.date === dateString);
                                                    const hasTiffin = dayInfo ? Object.values(dayInfo.meals).some(Boolean) : false;
                                                    return (
                                                        <div
                                                            key={dateString}
                                                            className={`h-6 w-6 rounded-full
                                                        ${hasTiffin ? 'bg-green-500' : 'bg-red-500'}`}
                                                            title={`Date: ${dateString}, Tiffin Taken: ${hasTiffin ? 'Yes' : 'No'}`}
                                                        >
                                                            <span className="text-xs text-white flex items-center justify-center h-full">{i + 1}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div>No tiffin overview available for selected month</div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
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
            <style jsx>{`
                @keyframes shine {
                    0% {
                        transform: translateX(-100%);
                    }
                    100% {
                        transform: translateX(100%);
                    }
                }
                .animate-shine {
                    animation: shine 8s linear infinite;
                    background-size: 200% 100%;
                }
            `}</style>
        </div>
    );
}