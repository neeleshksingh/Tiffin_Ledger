"use client";

import React, { useEffect, useState } from 'react';
import { useToast } from '@components/hooks/use-toast';
import { useRouter } from 'next/navigation';
import axiosInstance from '@components/interceptors/axios.interceptor';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@components/components/ui/dialog';
import { Button } from '@components/components/ui/button';

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
            address: {
                line1: string;
                line2: string;
                city: string;
                state: string;
                zipCode: string;
            }
            contact: {
                phone: string;
                alternatePhone: string;
            };
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

interface Address {
    line1: string;
    line2: string;
    city: string;
    state: string;
    zipCode: string;
}

interface Contact {
    phone: string;
    alternatePhone: string;
}

interface FormData {
    userId: string;
    name: string;
    email: string;
    address: Address;
    contact: Contact;
    messId: string;
    profilePic?: string;
}

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function ProfileManage({ params }: PageProps) {
    const [data, setData] = useState<UserData['data'] | null>(null);
    const [showDialog, setShowDialog] = useState(false);
    const { toast } = useToast();
    const nav = useRouter();
    const resolvedParams = React.use(params);
    const [formData, setFormData] = useState<FormData>({
        userId: '',
        name: '',
        email: '',
        address: {
            line1: '',
            line2: '',
            city: '',
            state: '',
            zipCode: '',
        },
        contact: {
            phone: '',
            alternatePhone: '',
        },
        messId: '',
        profilePic: '',
    });
    const [vendors, setVendors] = useState<VendorDetails[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name in formData.address) {
            setFormData((prevState) => ({
                ...prevState,
                address: {
                    ...prevState.address,
                    [name]: value,
                },
            }));
        } else if (name in formData.contact) {
            setFormData((prevState) => ({
                ...prevState,
                contact: {
                    ...prevState.contact,
                    [name]: value,
                },
            }));
        } else {
            setFormData((prevState) => ({
                ...prevState,
                [name]: value,
            }));
        }
    };

    const handleDropdownChange = (e: any) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };


    useEffect(() => {
        getUserData();
        getVendors();
    }, [resolvedParams.id, nav, toast]);

    const getUserData = async () => {
        try {
            const userJson = localStorage.getItem("user");
            if (userJson) {
                const userData = JSON.parse(userJson);
                const messId = userData?.messId;

                if (!messId) {
                    setShowDialog(true);
                    return;
                }

                const response = await axiosInstance.get<UserData>(`/profile/view-profile/${resolvedParams.id}`);
                const user = response.data.data.user;

                if (user) {
                    setFormData({
                        userId: user._id || '',
                        name: user.name || '',
                        email: user.email || '',
                        address: {
                            line1: user.address?.line1 || '',
                            line2: user.address?.line2 || '',
                            city: user.address?.city || '',
                            state: user.address?.state || '',
                            zipCode: user.address?.zipCode || '',
                        },
                        contact: {
                            phone: user.contact?.phone || '',
                            alternatePhone: user.contact?.alternatePhone || '',
                        },
                        messId: user.messId?._id || '',
                        profilePic: user.profilePic || '',
                    });
                } else {
                    console.error('User data is missing!');
                    toast({
                        variant: 'error',
                        title: 'User data is missing!',
                    });
                }
            } else {
                nav.push("/login");
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error("Error fetching user data:", error);
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
                        title: `Error fetching user data: ${error.message}`,
                    });
                }
            }
        }
    };

    const getVendors = async () => {
        try {
            const response = await axiosInstance.get(`/tiffin/vendors`);
            setVendors(response.data);
        } catch (error) {

        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const formPayload = {
                userId: resolvedParams.id,
                name: formData.name,
                email: formData.email,
                address: formData.address,
                contact: formData.contact,
                messId: formData.messId,
                profilePic: formData.profilePic,
            };

            const response = await axiosInstance.post(`/profile/add-profile`, formPayload);

            const userJson = localStorage.getItem("user");

            if (userJson) {
                const userData = JSON.parse(userJson);

                if (!userData.messId || userData.messId === '') {
                    userData.messId = formData.messId;
                    localStorage.setItem("user", JSON.stringify(userData));
                }
            }

            toast({
                variant: "success",
                title: "Profile updated successfully",
            });
            await getUserData();
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast({
                    variant: "error",
                    title: `Error updating profile: ${error.message}`,
                });
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
            <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-xl p-6">
                <h2 className="text-3xl font-bold text-center text-blue-800 mb-6">Manage Profile</h2>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        <div className="flex flex-col">
                            <label htmlFor="name" className="text-sm font-medium text-blue-700">Name</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="Enter your name"
                                className="border-2 border-gray-300 rounded-lg p-2 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="email" className="text-sm font-medium text-blue-700">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Enter your email"
                                className="border-2 border-gray-300 rounded-lg p-2 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Address fields */}
                        <div className="flex flex-col">
                            <label htmlFor="line1" className="text-sm font-medium text-blue-700">Address Line 1</label>
                            <input
                                id="line1"
                                name="line1"
                                type="text"
                                placeholder="Enter address line 1"
                                className="border-2 border-gray-300 rounded-lg p-2 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.address.line1 || ""}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="line2" className="text-sm font-medium text-blue-700">Address Line 2</label>
                            <input
                                id="line2"
                                name="line2"
                                type="text"
                                placeholder="Enter address line 2"
                                className="border-2 border-gray-300 rounded-lg p-2 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.address.line2 || ""}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="city" className="text-sm font-medium text-blue-700">City</label>
                            <input
                                id="city"
                                name="city"
                                type="text"
                                placeholder="Enter city"
                                className="border-2 border-gray-300 rounded-lg p-2 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.address.city || ""}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="state" className="text-sm font-medium text-blue-700">State</label>
                            <input
                                id="state"
                                name="state"
                                type="text"
                                placeholder="Enter state"
                                className="border-2 border-gray-300 rounded-lg p-2 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.address.state || ""}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="zipCode" className="text-sm font-medium text-blue-700">Zip Code</label>
                            <input
                                id="zipCode"
                                name="zipCode"
                                type="text"
                                placeholder="Enter zip code"
                                className="border-2 border-gray-300 rounded-lg p-2 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.address.zipCode || ""}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Contact fields */}
                        <div className="flex flex-col">
                            <label htmlFor="phone" className="text-sm font-medium text-blue-700">Phone Number</label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                placeholder="Enter phone number"
                                className="border-2 border-gray-300 rounded-lg p-2 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.contact.phone}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="alternatePhone" className="text-sm font-medium text-blue-700">Alternate Phone Number</label>
                            <input
                                id="alternatePhone"
                                name="alternatePhone"
                                type="tel"
                                placeholder="Enter alternate phone number"
                                className="border-2 border-gray-300 rounded-lg p-2 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.contact.alternatePhone}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="messId" className="text-sm font-medium text-blue-700">Mess</label>
                            <select
                                id="messId"
                                name="messId"
                                className="border-2 border-gray-300 rounded-lg p-2 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.messId}
                                onChange={handleDropdownChange}
                            >
                                <option value="" disabled>Select a vendor</option>
                                {vendors.length > 0 ? (
                                    vendors.map((vendor) => (
                                        <option key={vendor._id} value={vendor._id}>
                                            {vendor.name} {/* Display vendor's name */}
                                        </option>
                                    ))
                                ) : (
                                    <option value="">No vendors available</option>
                                )}
                            </select>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-center">
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-all w-full sm:w-auto"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="sm:max-w-md animate-in slide-in-from-bottom-4 duration-300 ease-out">
                    <div className="text-center">
                        <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-yellow-400 to-pink-500 rounded-full flex items-center justify-center animate-bounce">
                            <span className="text-2xl">🍱</span>
                        </div>
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-blue-800 flex items-center justify-center gap-2 mb-2">
                                🎉 Adventure Awaits!
                            </DialogTitle>
                            <DialogDescription className="text-gray-600 leading-relaxed space-y-2">
                                <span>Hey foodie! Before we dive into the delicious details, let's spruce up your profile. ✨</span>
                                <span>And oh, don't forget to pick your fave mess – it's where the magic (and meals) happen! 😋</span>
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="sm:justify-center mt-4">
                            <Button
                                onClick={() => setShowDialog(false)}
                                className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-8 py-3 rounded-full shadow-lg transform hover:scale-110 transition-all duration-300 animate-pulse"
                            >
                                Let's Go! 🚀
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}