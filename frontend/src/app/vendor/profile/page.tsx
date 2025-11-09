"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { Copy, Edit2, Save, X, Store, Phone, MapPin, IndianRupee, FileText, Milk, Loader2 } from "lucide-react";
import axiosInstance from '@components/interceptors/axiosVendor.interceptor';

export default function VendorProfile() {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [vendorData, setVendorData] = useState<any>(null);

    const [formData, setFormData] = useState({
        shopName: "",
        name: "",
        address: "",
        contactNumber: "",
        amountPerDay: "",
        gstNumber: "",
        billingName: "",
        billingGSTIN: "",
        billingAddress: "",
        availableMealTypes: [] as string[],
    });

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get("/vendor/profile");

            const { user } = res.data;
            const vendor = user.vendor;


            if (!vendor) {
                throw new Error("Vendor data not found");
            }

            setVendorData(user);
            setFormData({
                shopName: vendor.shopName || "",
                name: vendor.name || "",
                address: vendor.address || "",
                contactNumber: vendor.contactNumber || "",
                amountPerDay: vendor.amountPerDay?.toString() || "",
                gstNumber: vendor.gstNumber || "",
                billingName: vendor.billingInfo?.name || "",
                billingGSTIN: vendor.billingInfo?.gstin || "",
                billingAddress: vendor.billingInfo?.address || "",
                availableMealTypes: vendor.availableMealTypes || [],
            });

            localStorage.setItem("vendorUser", JSON.stringify(user));
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || "Failed to load profile";
            toast({ variant: "error", title: "Error", description: msg });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleSave = async () => {
        try {
            setSaving(true);

            const payload = {
                shopName: formData.shopName,
                name: formData.name,
                address: formData.address,
                contactNumber: formData.contactNumber,
                amountPerDay: parseInt(formData.amountPerDay) || 0,
                gstNumber: formData.gstNumber,
                billingInfo: {
                    name: formData.billingName,
                    gstin: formData.billingGSTIN,
                    address: formData.billingAddress,
                },
                availableMealTypes: formData.availableMealTypes,
            };

            const res = await axiosInstance.put("/vendor/profile", payload);

            const updatedVendor = res.data.vendor;
            const updatedUser = {
                ...vendorData,
                vendor: updatedVendor,
            };

            setVendorData(updatedUser);
            localStorage.setItem("vendorUser", JSON.stringify(updatedUser));

            setIsEditing(false);
            toast({ variant: "success", title: "Success", description: "Profile updated successfully!" });
        } catch (err: any) {
            const msg = err.response?.data?.message || "Update failed";
            toast({ variant: "error", title: "Error", description: msg });
        } finally {
            setSaving(false);
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({ variant: "success", title: "Copied!", description: `${label} copied to clipboard.` });
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-orange-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-orange-600" />
                    <p className="text-lg text-gray-600">Loading your profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-10">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-8 rounded-3xl shadow-2xl">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-4xl font-bold border-4 border-white/30">
                            {vendorData?.vendor?.shopName?.[0] || "V"}
                        </div>
                        <div className="text-center sm:text-left">
                            <h1 className="text-4xl font-bold">{vendorData?.vendor?.shopName}</h1>
                            <p className="text-orange-100 text-lg mt-1">Managed by {vendorData?.vendor?.name}</p>
                            <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-3">
                                {vendorData?.vendor?.availableMealTypes?.map((type: string) => (
                                    <Badge key={type} variant="secondary" className="bg-white/20">
                                        <Milk className="w-4 h-4 mr-1" />
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                    <Button
                        onClick={() => setIsEditing(!isEditing)}
                        size="lg"
                        disabled={saving}
                        className="shadow-lg"
                    >
                        {isEditing ? (
                            <>
                                <X className="w-5 h-5 mr-2" /> Cancel
                            </>
                        ) : (
                            <>
                                <Edit2 className="w-5 h-5 mr-2" /> Edit Profile
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Business Info */}
                <Card className="shadow-xl border-0">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-xl">
                            <Store className="w-6 h-6 text-orange-600" />
                            Business Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {isEditing ? (
                            <>
                                <div>
                                    <Label>Shop Name</Label>
                                    <Input value={formData.shopName} onChange={(e) => setFormData({ ...formData, shopName: e.target.value })} className="mt-2" />
                                </div>
                                <div>
                                    <Label>Owner Name</Label>
                                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="mt-2" />
                                </div>
                                <div>
                                    <Label>Address</Label>
                                    <Textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="mt-2" rows={3} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Contact Number</Label>
                                        <Input value={formData.contactNumber} onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })} className="mt-2" />
                                    </div>
                                    <div>
                                        <Label>Amount Per Day</Label>
                                        <Input type="number" value={formData.amountPerDay} onChange={(e) => setFormData({ ...formData, amountPerDay: e.target.value })} className="mt-2" placeholder="60" />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-5">
                                <div className="flex justify-between"><span className="text-gray-600">Shop Name</span><span className="font-semibold">{vendorData?.vendor?.shopName}</span></div>
                                <Separator />
                                <div className="flex justify-between"><span className="text-gray-600">Owner</span><span className="font-semibold">{vendorData?.vendor?.name}</span></div>
                                <Separator />
                                <div><span className="text-gray-600 flex items-center gap-2"><MapPin className="w-4 h-4" /> Address</span><p className="font-medium mt-1">{vendorData?.vendor?.address}</p></div>
                                <Separator />
                                <div className="flex justify-between"><span className="text-gray-600 flex items-center gap-2"><Phone className="w-4 h-4" /> Contact</span><span className="font-medium">{vendorData?.vendor?.contactNumber}</span></div>
                                <Separator />
                                <div className="flex justify-between"><span className="text-gray-600 flex items-center gap-2"><IndianRupee className="w-4 h-4" /> Daily Rate</span><span className="font-bold text-green-600">₹{vendorData?.vendor?.amountPerDay}/day</span></div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* GST & Billing */}
                {/* GST & Billing + Meal Types */}
                <Card className="shadow-xl border-0">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-xl">
                            <FileText className="w-6 h-6 text-orange-600" />
                            GST, Billing & Meal Types
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {isEditing ? (
                            <>
                                {/* GST Number */}
                                <div>
                                    <Label>GST Number</Label>
                                    <Input value={formData.gstNumber} onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })} className="mt-2 font-mono" />
                                </div>
                                <Separator />

                                {/* Billing Info */}
                                <div>
                                    <Label>Billing Name</Label>
                                    <Input value={formData.billingName} onChange={(e) => setFormData({ ...formData, billingName: e.target.value })} className="mt-2" />
                                </div>
                                <div>
                                    <Label>Billing GSTIN</Label>
                                    <Input value={formData.billingGSTIN} onChange={(e) => setFormData({ ...formData, billingGSTIN: e.target.value })} className="mt-2 font-mono" />
                                </div>
                                <div>
                                    <Label>Billing Address</Label>
                                    <Textarea value={formData.billingAddress} onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })} className="mt-2" rows={3} />
                                </div>

                                <Separator />

                                {/* === MEAL TYPES SELECTOR === */}
                                <div>
                                    <Label className="flex items-center gap-2">
                                        <Milk className="w-5 h-5" />
                                        Available Meal Types
                                    </Label>
                                    <p className="text-sm text-gray-500 mb-3">Select all that you serve</p>
                                    <div className="space-y-3">
                                        {["lunch", "dinner", "breakfast", "milk"].map((type) => (
                                            <label
                                                key={type}
                                                className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-orange-50 transition"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.availableMealTypes.includes(type)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setFormData({
                                                                ...formData,
                                                                availableMealTypes: [...formData.availableMealTypes, type],
                                                            });
                                                        } else {
                                                            setFormData({
                                                                ...formData,
                                                                availableMealTypes: formData.availableMealTypes.filter((t) => t !== type),
                                                            });
                                                        }
                                                    }}
                                                    className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                                                />
                                                <span className="capitalize font-medium">{type}</span>
                                                {type === "lunch" && <span className="text-xs text-gray-500 ml-auto">11:30 AM - 2:30 PM</span>}
                                                {type === "dinner" && <span className="text-xs text-gray-500 ml-auto">7:30 PM - 10:00 PM</span>}
                                                {type === "breakfast" && <span className="text-xs text-gray-500 ml-auto">7:00 AM - 9:30 AM</span>}
                                                {type === "milk" && <span className="text-xs text-gray-500 ml-auto">Morning & Evening</span>}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="space-y-5">
                                    {/* GST */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">GST Number</span>
                                        <div className="flex items-center gap-2">
                                            <code className="font-mono bg-gray-100 px-3 py-1 rounded text-sm">{vendorData?.vendor?.gstNumber}</code>
                                            <Button size="sm" variant="ghost" onClick={() => copyToClipboard(vendorData?.vendor?.gstNumber, "GSTIN")}>
                                                <Copy className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <Separator />

                                    {/* Billing Info */}
                                    <div><span className="text-gray-600">Billing Name</span><p className="font-medium">{vendorData?.vendor?.billingInfo?.name}</p></div>
                                    <Separator />
                                    <div>
                                        <span className="text-gray-600">Billing GSTIN</span>
                                        <div className="flex items-center gap-2 mt-1">
                                            <code className="font-mono bg-gray-100 px-3 py-1 rounded text-sm">{vendorData?.vendor?.billingInfo?.gstin}</code>
                                            <Button size="sm" variant="ghost" onClick={() => copyToClipboard(vendorData?.vendor?.billingInfo?.gstin, "Billing GSTIN")}>
                                                <Copy className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <Separator />
                                    <div>
                                        <span className="text-gray-600 flex items-center gap-2"><MapPin className="w-4 h-4" /> Billing Address</span>
                                        <p className="font-medium mt-1 text-sm">{vendorData?.vendor?.billingInfo?.address}</p>
                                    </div>

                                    <Separator />

                                    {/* === MEAL TYPES DISPLAY === */}
                                    <div>
                                        <span className="text-gray-600 flex items-center gap-2">
                                            <Milk className="w-4 h-4" />
                                            Serving
                                        </span>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {vendorData?.vendor?.availableMealTypes?.length > 0 ? (
                                                vendorData.vendor.availableMealTypes.map((type: string) => (
                                                    <Badge key={type} variant="secondary" className="bg-orange-100 text-orange-700">
                                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <p className="text-sm text-gray-500">No meal types selected</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Save Button */}
            {isEditing && (
                <div className="flex justify-center mt-10">
                    <Button
                        onClick={handleSave}
                        size="lg"
                        disabled={saving}
                        className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 shadow-2xl px-12"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5 mr-2" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}