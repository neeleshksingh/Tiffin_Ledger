"use client";

import Link from "next/link";
import { useState } from "react";
import axios from "axios";
import { useRouter } from 'next/navigation'
import { useToast } from "@components/hooks/use-toast";
import { User, Mail, Lock, ArrowRight, Loader2, Menu, X, Store, UserCheck } from "lucide-react";
import Image from "next/image";
import { Button } from "@components/components/ui/button";

export default function SignUp() {
    const [isVendor, setIsVendor] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { toast } = useToast();
    const nav = useRouter();

    // User form state
    const [userData, setUserData] = useState({ name: "", email: "", password: "" });
    // Vendor form state
    const [vendorData, setVendorData] = useState({ vendorId: "", username: "", password: "" });

    const handleUserChange = (e: any) => {
        const { name, value } = e.target;
        setUserData(prev => ({ ...prev, [name]: value }));
    };

    const handleVendorChange = (e: any) => {
        const { name, value } = e.target;
        setVendorData(prev => ({ ...prev, [name]: value }));
    };

    const handleUserSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/user/signup`, userData);
            toast({ variant: "success", title: "Account created successfully!" });
            nav.push('/login');
        } catch (err: any) {
            toast({ variant: "error", title: err.response?.data?.message || "Signup failed" });
        } finally {
            setLoading(false);
        }
    };

    const handleVendorSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/user/vendors/signup`, vendorData);
            toast({ variant: "success", title: "Vendor account created! You can now log in." });
            localStorage.setItem('vendorToken', response.data.token); // optional
            nav.push('/vendor/dashboard'); // or /vendor/login
        } catch (err: any) {
            toast({ variant: "error", title: err.response?.data?.message || "Vendor signup failed" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
            {/* Navigation */}
            <nav className="fixed w-full bg-white/80 backdrop-blur-sm shadow-sm z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <Image src="/assets/logo.png" alt="Logo" width={40} height={40} />
                            <Link href="/" className="text-2xl font-bold text-orange-600">Tiffin Ledger</Link>
                        </div>
                        <div className="hidden md:flex items-center space-x-8">
                            <Link href="/" className="text-gray-600 hover:text-orange-600">Home</Link>
                            <Link href="/about-us" className="text-gray-600 hover:text-orange-600">About</Link>
                            <Link href="/contact" className="text-gray-600 hover:text-orange-600">Contact</Link>
                            <Button asChild className="bg-orange-600 hover:bg-orange-700">
                                <Link href="/login">Login</Link>
                            </Button>
                        </div>
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden">
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                    {isMenuOpen && (
                        <div className="md:hidden px-4 pb-4">
                            <Link href="/" className="block py-2 text-gray-600">Home</Link>
                            <Link href="/about-us" className="block py-2 text-gray-600">About</Link>
                            <Link href="/contact" className="block py-2 text-gray-600">Contact</Link>
                            <Button asChild className="w-full mt-4"><Link href="/login">Login</Link></Button>
                        </div>
                    )}
                </div>
            </nav>

            {/* Main Content */}
            <div className="pt-20 flex items-center justify-center min-h-screen p-4">
                <div className="w-full max-w-lg">
                    {/* Toggle Switch */}
                    <div className="flex justify-center mb-8">
                        <div className="bg-gray-100 p-1 rounded-full flex items-center w-fit">
                            <button
                                onClick={() => setIsVendor(false)}
                                className={`px-6 py-3 rounded-full flex items-center gap-2 transition-all ${!isVendor ? 'bg-orange-600 text-white shadow-md' : 'text-gray-600'}`}
                            >
                                <UserCheck className="w-5 h-5" />
                                User Signup
                            </button>
                            <button
                                onClick={() => setIsVendor(true)}
                                className={`px-6 py-3 rounded-full flex items-center gap-2 transition-all ${isVendor ? 'bg-orange-600 text-white shadow-md' : 'text-gray-600'}`}
                            >
                                <Store className="w-5 h-5" />
                                Vendor Signup
                            </button>
                        </div>
                    </div>

                    {/* Card */}
                    <div className={`bg-white rounded-2xl shadow-2xl p-8 ${isVendor ? 'border-2 border-orange-500' : ''} transition-all`}>
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                                {isVendor ? <Store className="w-10 h-10 text-orange-600" /> : <User className="w-10 h-10 text-orange-600" />}
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900">
                                {isVendor ? "Welcome, Vendor!" : "Create Your Account"}
                            </h2>
                            <p className="text-gray-600 mt-2">
                                {isVendor ? "Set up your mess dashboard login" : "Join thousands of happy customers"}
                            </p>
                        </div>

                        {/* User Signup Form */}
                        {!isVendor && (
                            <form onSubmit={handleUserSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                    <div className="relative mt-2">
                                        <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            onChange={handleUserChange}
                                            className="pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <div className="relative mt-2">
                                        <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            onChange={handleUserChange}
                                            className="pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Password</label>
                                    <div className="relative mt-2">
                                        <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                        <input
                                            type="password"
                                            name="password"
                                            required
                                            minLength={6}
                                            onChange={handleUserChange}
                                            className="pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <Button type="submit" disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700">
                                    {loading ? <Loader2 className="animate-spin" /> : "Create Account"}
                                </Button>
                            </form>
                        )}

                        {/* Vendor Signup Form */}
                        {isVendor && (
                            <form onSubmit={handleVendorSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Vendor ID (Mess ID)</label>
                                    <div className="relative mt-2">
                                        <Store className="absolute left-3 top-3.5 h-5 w-5 text-orange-600" />
                                        <input
                                            type="text"
                                            name="vendorId"
                                            required
                                            value={vendorData.vendorId}
                                            onChange={handleVendorChange}
                                            className="pl-10 w-full px-4 py-3 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            placeholder="60a5f1b2c3d4e5f678901234"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Your unique Vendor ID from admin panel</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Username</label>
                                    <div className="relative mt-2">
                                        <User className="absolute left-3 top-3.5 h-5 w-5 text-orange-600" />
                                        <input
                                            type="text"
                                            name="username"
                                            required
                                            value={vendorData.username}
                                            onChange={handleVendorChange}
                                            className="pl-10 w-full px-4 py-3 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                            placeholder="raj_mess_official"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Password</label>
                                    <div className="relative mt-2">
                                        <Lock className="absolute left-3 top-3.5 h-5 w-5 text-orange-600" />
                                        <input
                                            type="password"
                                            name="password"
                                            required
                                            minLength={6}
                                            value={vendorData.password}
                                            onChange={handleVendorChange}
                                            className="pl-10 w-full px-4 py-3 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                            placeholder="Create a strong password"
                                        />
                                    </div>
                                </div>

                                <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold">
                                    {loading ? <Loader2 className="animate-spin" /> : "Activate Vendor Dashboard"}
                                </Button>

                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                                    <p className="text-sm text-amber-800">
                                        <strong>Note:</strong> Only registered vendors can create an account.
                                        Contact admin if you don't have a Vendor ID.
                                    </p>
                                </div>
                            </form>
                        )}

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                Already have an account?{" "}
                                <Link href="/login" className="font-medium text-orange-600 hover:text-orange-500">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12 mt-20">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p>&copy; {new Date().getFullYear()} Tiffin Ledger. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}