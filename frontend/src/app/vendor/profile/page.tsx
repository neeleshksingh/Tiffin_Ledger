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
import { motion, AnimatePresence } from "framer-motion";

export default function VendorProfile() {
    const [isEditing, setIsEditing] = useState(false);
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
            const res = await axiosInstance.get("/vendor/profile");
            const { user } = res.data;
            const vendor = user.vendor;

            if (!vendor) throw new Error("Vendor data not found");

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
            const updatedUser = { ...vendorData, vendor: updatedVendor };

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

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="space-y-8 max-w-5xl mx-auto pb-10"
        >
            {/* Floating Header */}
            <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                whileHover={{ y: -4 }}
                className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-8 rounded-3xl shadow-2xl"
            >
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <motion.div
                            whileHover={{ scale: 1.1, rotate: 360 }}
                            transition={{ duration: 0.6 }}
                            className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-4xl font-bold border-4 border-white/30"
                        >
                            {vendorData?.vendor?.shopName?.[0] || "V"}
                        </motion.div>
                        <div className="text-center sm:text-left">
                            <motion.h1
                                initial={{ x: -50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-4xl font-bold"
                            >
                                {vendorData?.vendor?.shopName}
                            </motion.h1>
                            <motion.p
                                initial={{ x: -30, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-orange-100 text-lg mt-1"
                            >
                                Managed by {vendorData?.vendor?.name}
                            </motion.p>
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="flex flex-wrap gap-2 justify-center sm:justify-start mt-3"
                            >
                                {vendorData?.vendor?.availableMealTypes?.map((type: string, i: number) => (
                                    <motion.div
                                        key={type}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.5 + i * 0.1, type: "spring" }}
                                    >
                                        <Badge variant="secondary" className="bg-white/20 backdrop-blur">
                                            <Milk className="w-4 h-4 mr-1" />
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </Badge>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    </div>

                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
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
                    </motion.div>
                </div>
            </motion.div>

            {/* Cards Grid */}
            <motion.div
                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: { opacity: 0 },
                    visible: {
                        opacity: 1,
                        transition: { staggerChildren: 0.2, delayChildren: 0.3 }
                    }
                }}
            >
                {/* Business Info Card */}
                <motion.div
                    variants={{
                        hidden: { y: 60, opacity: 0 },
                        visible: { y: 0, opacity: 1 }
                    }}
                    whileHover={{ y: -8, transition: { duration: 0.3 } }}
                >
                    <Card className="shadow-2xl border-0 overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
                            <CardTitle className="flex items-center gap-3 text-xl">
                                <Store className="w-6 h-6 text-orange-600" />
                                Business Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <AnimatePresence mode="wait">
                                {isEditing ? (
                                    <motion.div
                                        key="edit"
                                        initial={{ opacity: 0, x: -50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 50 }}
                                        transition={{ type: "spring", stiffness: 120 }}
                                        className="space-y-6"
                                    >
                                        {[
                                            { label: "Shop Name", key: "shopName" },
                                            { label: "Owner Name", key: "name" },
                                            { label: "Address", key: "address", textarea: true },
                                            { label: "Contact Number", key: "contactNumber" },
                                            { label: "Amount Per Day", key: "amountPerDay", type: "number" }
                                        ].map((field, i) => (
                                            <motion.div
                                                key={field.key}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                            >
                                                <Label>{field.label}</Label>
                                                {field.textarea ? (
                                                    <Textarea
                                                        value={formData[field.key as keyof typeof formData] as string}
                                                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                                        className="mt-2"
                                                        rows={3}
                                                    />
                                                ) : (
                                                    <Input
                                                        type={field.type || "text"}
                                                        value={formData[field.key as keyof typeof formData] as string}
                                                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                                        className="mt-2"
                                                    />
                                                )}
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="view"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="space-y-5 text-lg"
                                    >
                                        {[
                                            { icon: Store, label: "Shop Name", value: vendorData?.vendor?.shopName },
                                            { icon: null, label: "Owner", value: vendorData?.vendor?.name },
                                            { icon: MapPin, label: "Address", value: vendorData?.vendor?.address, multiline: true },
                                            { icon: Phone, label: "Contact", value: vendorData?.vendor?.contactNumber },
                                            { icon: IndianRupee, label: "Daily Rate", value: `₹${vendorData?.vendor?.amountPerDay}/day`, bold: true, color: "text-green-600" }
                                        ].map((item, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -30 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <span className="text-gray-600 flex items-center gap-2">
                                                        {item.icon && <item.icon className="w-5 h-5" />}
                                                        {item.label}
                                                    </span>
                                                    <span className={`font-semibold ${item.color || ""} ${item.bold ? "text-xl" : ""}`}>
                                                        {item.multiline ? <p className="text-right max-w-xs">{item.value}</p> : item.value}
                                                    </span>
                                                </div>
                                                {i < 4 && <Separator className="mt-4" />}
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* GST & Billing Card */}
                <motion.div
                    variants={{
                        hidden: { y: 60, opacity: 0 },
                        visible: { y: 0, opacity: 1 }
                    }}
                    whileHover={{ y: -8, transition: { duration: 0.3 } }}
                >
                    <Card className="shadow-2xl border-0 overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
                            <CardTitle className="flex items-center gap-3 text-xl">
                                <FileText className="w-6 h-6 text-orange-600" />
                                GST, Billing & Meal Types
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <AnimatePresence mode="wait">
                                {isEditing ? (
                                    <motion.div
                                        key="edit"
                                        initial={{ opacity: 0, x: 50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -50 }}
                                        transition={{ type: "spring", stiffness: 120 }}
                                        className="space-y-6"
                                    >
                                        <div>
                                            <Label>GST Number</Label>
                                            <Input value={formData.gstNumber} onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })} className="mt-2 font-mono" />
                                        </div>
                                        <Separator />
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
                                        <div>
                                            <Label className="flex items-center gap-2">
                                                <Milk className="w-5 h-5" />
                                                Available Meal Types
                                            </Label>
                                            <p className="text-sm text-gray-500 mb-3">Select all that you serve</p>
                                            <div className="space-y-3">
                                                {["lunch", "dinner", "breakfast", "milk"].map((type, i) => (
                                                    <motion.label
                                                        key={type}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.1 }}
                                                        className="flex items-center gap-3 cursor-pointer p-4 rounded-xl hover:bg-orange-50 transition"
                                                        whileHover={{ scale: 1.02 }}
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
                                                        <span className="text-xs text-gray-500 ml-auto">
                                                            {type === "lunch" && "11:30 AM - 2:30 PM"}
                                                            {type === "dinner" && "7:30 PM - 10:00 PM"}
                                                            {type === "breakfast" && "7:00 AM - 9:30 AM"}
                                                            {type === "milk" && "Morning & Evening"}
                                                        </span>
                                                    </motion.label>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="view"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="space-y-6 text-lg"
                                    >
                                        {[
                                            { label: "GST Number", value: vendorData?.vendor?.gstNumber, copy: true },
                                            { label: "Billing Name", value: vendorData?.vendor?.billingInfo?.name },
                                            { label: "Billing GSTIN", value: vendorData?.vendor?.billingInfo?.gstin, copy: true },
                                            { label: "Billing Address", value: vendorData?.vendor?.billingInfo?.address, multiline: true },
                                        ].map((item, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: 30 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <span className="text-gray-600">{item.label}</span>
                                                    <div className="text-right">
                                                        {item.copy ? (
                                                            <div className="flex items-center gap-2">
                                                                <code className="font-mono bg-gray-100 px-3 py-1 rounded text-sm">{item.value || "-"}</code>
                                                                <motion.div whileTap={{ scale: 0.8 }}>
                                                                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(item.value || "", item.label)}>
                                                                        <Copy className="w-4 h-4" />
                                                                    </Button>
                                                                </motion.div>
                                                            </div>
                                                        ) : (
                                                            <p className="font-medium max-w-xs">{item.multiline ? item.value : item.value || "-"}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                {i < 3 && <Separator className="my-4" />}
                                            </motion.div>
                                        ))}

                                        <Separator className="my-6" />

                                        <div>
                                            <span className="text-gray-600 flex items-center gap-2">
                                                <Milk className="w-5 h-5" />
                                                Serving
                                            </span>
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="flex flex-wrap gap-3 mt-4"
                                            >
                                                {vendorData?.vendor?.availableMealTypes?.length > 0 ? (
                                                    vendorData.vendor.availableMealTypes.map((type: string, i: number) => (
                                                        <motion.div
                                                            key={type}
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            transition={{ delay: i * 0.1, type: "spring" }}
                                                        >
                                                            <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-lg px-4 py-2">
                                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                                            </Badge>
                                                        </motion.div>
                                                    ))
                                                ) : (
                                                    <p className="text-sm text-gray-500">No meal types selected</p>
                                                )}
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>

            {/* Save Button */}
            <AnimatePresence>
                {isEditing && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 100 }}
                        className="flex justify-center mt-12"
                    >
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button
                                onClick={handleSave}
                                size="lg"
                                disabled={saving}
                                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 shadow-2xl px-16 py-8 text-xl"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-6 h-6 mr-3" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}