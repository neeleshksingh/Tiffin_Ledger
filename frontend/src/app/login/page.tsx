"use client";

import { useToast } from "@components/hooks/use-toast";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Cookies from 'js-cookie';
import Image from "next/image";
import { Mail, Lock, ArrowRight, Loader2, Menu, X, UserCheck, Store } from 'lucide-react';
import { Button } from "@components/components/ui/button";

export default function Login() {
    const [isVendor, setIsVendor] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { toast } = useToast();
    const nav = useRouter();

    // Shared form state
    const [form, setForm] = useState({
        email: "",
        password: "",
        username: "", // for vendor
    });

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);

        try {
            let response;
            if (isVendor) {
                // Vendor Login
                response = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/user/vendors/login`,
                    {
                        username: form.username,
                        password: form.password,
                    }
                );

                const { token, user } = response.data;
                localStorage.setItem("vendorToken", token);
                localStorage.setItem("vendorUser", JSON.stringify(user));
                Cookies.set("vendorToken", token, { secure: true });
                axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

                toast({ variant: "success", title: `Welcome, ${user.vendor.shopName}!` });
                nav.push("/vendor/dashboard"); // Vendor dashboard
            } else {
                // Customer Login
                response = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/user/signin`,
                    {
                        email: form.email,
                        password: form.password,
                    }
                );

                const { token, user } = response.data;
                localStorage.setItem("token", token);
                localStorage.setItem("user", JSON.stringify(user));
                Cookies.set("token", token, {
                    expires: 7,
                    path: '/',
                    secure: true,
                    sameSite: 'lax'
                });
                axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

                toast({ variant: "success", title: `Welcome back, ${user.name}!` });
                nav.push("/dashboard"); // Customer dashboard
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || "Invalid credentials";
            toast({ variant: "error", title: msg });
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
                                <Link href="/signup">Sign Up</Link>
                            </Button>
                        </div>

                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden">
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>

                    {isMenuOpen && (
                        <div className="md:hidden px-4 pb-4 bg-white">
                            <Link href="/" className="block py-2 text-gray-600">Home</Link>
                            <Link href="/about-us" className="block py-2 text-gray-600">About</Link>
                            <Link href="/contact" className="block py-2 text-gray-600">Contact</Link>
                            <Button asChild className="w-full mt-4"><Link href="/signup">Sign Up</Link></Button>
                        </div>
                    )}
                </div>
            </nav>

            {/* Main Content */}
            <div className="pt-20 flex items-center justify-center min-h-screen p-4">
                <div className="w-full max-w-lg">
                    {/* Toggle Switch */}
                    <div className="flex justify-center mb-10">
                        <div className="bg-gray-100 p-1 rounded-full flex items-center">
                            <button
                                onClick={() => setIsVendor(false)}
                                className={`px-6 py-3 rounded-full flex items-center gap-2 transition-all ${!isVendor ? 'bg-orange-600 text-white shadow-md' : 'text-gray-600'}`}
                            >
                                <UserCheck className="w-5 h-5" />
                                Customer Login
                            </button>
                            <button
                                onClick={() => setIsVendor(true)}
                                className={`px-6 py-3 rounded-full flex items-center gap-2 transition-all ${isVendor ? 'bg-orange-600 text-white shadow-md' : 'text-gray-600'}`}
                            >
                                <Store className="w-5 h-5" />
                                Vendor Login
                            </button>
                        </div>
                    </div>

                    {/* Login Card */}
                    <div className={`bg-white rounded-2xl shadow-2xl p-8 ${isVendor ? 'border-2 border-orange-500' : ''} transition-all`}>
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                                {isVendor ? <Store className="w-10 h-10 text-orange-600" /> : <UserCheck className="w-10 h-10 text-orange-600" />}
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900">
                                {isVendor ? "Vendor Dashboard Login" : "Welcome Back!"}
                            </h2>
                            <p className="text-gray-600 mt-2">
                                {isVendor ? "Manage your mess operations" : "Sign in to continue your tiffin journey"}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Vendor Username */}
                            {isVendor && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Username</label>
                                    <div className="relative mt-2">
                                        <UserCheck className="absolute left-3 top-3.5 h-5 w-5 text-orange-600" />
                                        <input
                                            type="text"
                                            name="username"
                                            required={isVendor}
                                            value={form.username}
                                            onChange={handleChange}
                                            className="pl-10 w-full px-4 py-3 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                            placeholder="raj_mess"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Customer Email */}
                            {!isVendor && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <div className="relative mt-2">
                                        <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                        <input
                                            type="email"
                                            name="email"
                                            required={!isVendor}
                                            value={form.email}
                                            onChange={handleChange}
                                            className="pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Password</label>
                                <div className="relative mt-2">
                                    <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        value={form.password}
                                        onChange={handleChange}
                                        className="pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className={`w-full font-bold py-3 ${isVendor ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700' : 'bg-orange-600 hover:bg-orange-700'}`}
                            >
                                {loading ? <Loader2 className="animate-spin" /> : (
                                    <>
                                        Sign In <ArrowRight className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </Button>
                        </form>

                        {/* Links */}
                        <div className="mt-6 text-center space-y-3">
                            {!isVendor && (
                                <Link href="/forgot-password" className="text-sm text-orange-600 hover:underline">
                                    Forgot password?
                                </Link>
                            )}
                            <p className="text-sm text-gray-600">
                                Don't have an account?{" "}
                                <Link href="/signup" className="font-medium text-orange-600 hover:underline">
                                    Sign up here
                                </Link>
                            </p>
                        </div>

                        {isVendor && (
                            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <p className="text-sm text-amber-800">
                                    <strong>Tip:</strong> Use the username you set during vendor registration.
                                </p>
                            </div>
                        )}
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