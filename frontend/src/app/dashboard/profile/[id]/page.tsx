"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { FaMapMarkerAlt, FaPhoneAlt, FaRegBuilding, FaCalendar, FaPen } from 'react-icons/fa';
import { useToast } from '@components/hooks/use-toast';
import { useRouter } from 'next/navigation';
import axiosInstance from '@components/interceptors/axios.interceptor';
import defaultPic from '../../../../../public/assets/profile.png';
import ImageCompression from 'browser-image-compression';

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
}

interface TiffinDay {
    date: string;
    isTiffinTaken: boolean;
}

interface TiffinOverview {
    month: string;
    totalDays: number;
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
    const { toast } = useToast();
    const nav = useRouter();
    const resolvedParams = React.use(params);

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

    const calculateTiffinAttendance = (tiffinOverview: TiffinOverview[] = []): string => {
        if (!tiffinOverview || tiffinOverview.length === 0) return '0.00';
        const { totalDays, tiffinTakenDays } = tiffinOverview[0];
        const attendancePercentage = (tiffinTakenDays / totalDays) * 100;
        return attendancePercentage.toFixed(2);
    };

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
            <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-br from-black via-gray-900 to-gray-800 p-6 text-center relative">
                    {/* Use pointer-events: none to ensure shine doesn't block interactions */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shine pointer-events-none"></div>
                    <div className="relative w-32 h-32 mx-auto mb-4 z-10">
                        <Image
                            src={data?.user.profilePic || defaultPic}
                            alt={data?.user.name || 'Profile Picture'}
                            fill
                            className="rounded-full object-cover border-4 border-white"
                        />
                        {/* Pencil Icon */}
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
                            onClick={() => nav.push('/dashboard/vendor-preferences')}
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
                                { icon: FaRegBuilding, text: data?.vendor?.shopName },
                                { icon: FaMapMarkerAlt, text: data?.vendor?.address },
                                { icon: FaPhoneAlt, text: data?.vendor?.contactNumber },
                                { icon: FaCalendar, text: `₹${data?.vendor?.amountPerDay} per day` }
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
                        {data?.tiffinOverview && data.tiffinOverview.length > 0 ? (
                            <div className="space-y-3">
                                {[
                                    { label: 'Total Days', value: data.tiffinOverview[0].totalDays },
                                    { label: 'Tiffin Taken Days', value: data.tiffinOverview[0].tiffinTakenDays },
                                    {
                                        label: 'Attendance Percentage',
                                        value: `${calculateTiffinAttendance(data.tiffinOverview)}%`,
                                        className: 'text-green-600'
                                    }
                                ].map(({ label, value, className }) => (
                                    <div key={label} className="flex justify-between">
                                        <span>{label}:</span>
                                        <span className={`font-bold ${className}`}>{value}</span>
                                    </div>
                                ))}

                                <div className="mt-4">
                                    <h3 className="text-lg font-semibold mb-2">Monthly Tiffin Calendar</h3>
                                    <div className="grid grid-cols-7 gap-1">
                                        {Array.from({ length: 31 }, (_, i) => {
                                            const dateString = (i + 1).toString().padStart(2, '0');
                                            const dayInfo = data.tiffinOverview[0].days.find(day => day.date === dateString);
                                            return (
                                                <div
                                                    key={dateString}
                                                    className={`h-6 w-6 rounded-full 
                                                ${dayInfo ? (dayInfo.isTiffinTaken ? 'bg-green-500' : 'bg-red-500')
                                                            : 'bg-gray-300'
                                                        }`}
                                                    title={`Date: ${dateString}, Tiffin Taken: ${dayInfo?.isTiffinTaken || 'Not marked'}`}
                                                >
                                                    <span className="text-xs text-white flex items-center justify-center h-full">{dateString}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div>No tiffin overview available</div>
                        )}
                    </div>
                </div>
            </div>
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