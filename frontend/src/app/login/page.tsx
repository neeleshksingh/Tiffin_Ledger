"use client";

import { useToast } from "@components/hooks/use-toast";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Cookies from 'js-cookie';
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import Image from "next/image";

export default function Login() {

    const [error, setError] = useState('');
    const [data, setData] = useState({ email: "", password: "" });
    const { toast } = useToast();
    const nav = useRouter();
    const [loading, setLoading] = useState(false);


    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        try {
            setLoading(true);
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/user/signin`, data);
            const token = response.data.token;
            const user = response.data.user;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            Cookies.set('token', token, { secure: true, httpOnly: false });
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            nav.push('/dashboard')
            toast({
                variant: "success",
                title: `Welcome, ${response.data.user.name}`,
            });

        } catch (err: any) {
            setError('Invalid email or password');
            toast({
                variant: "error",
                title: err.response.data.message,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50 p-4">
            <div className="w-full max-w-md">
                {/* Logo and Title */}
                <div className="text-center mb-8">
                    <div className="inline-block p-2 bg-orange-100 rounded-lg mb-4">
                        <div className="text-3xl font-bold text-orange-600">
                            <Image src="/assets/logo.png" alt="Logo" width={40} height={40} />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Welcome back to Tiffin Ledger</h2>
                    <p className="text-gray-600 mt-2">Please sign in to your account</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 transition-transform transform hover:scale-[1.02]">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Input */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                    placeholder="Enter your email"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    required
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                    placeholder="Enter your password"
                                />
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                />
                                <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                                    Remember me
                                </label>
                            </div>
                            <Link
                                href="/forgot-password"
                                className="text-sm font-medium text-orange-600 hover:text-orange-500"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Sign in</span>
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </>
                            )}
                        </button>

                        {/* Sign Up Link */}
                        <div className="text-center mt-6">
                            <p className="text-sm text-gray-600">
                                Don't have an account?{" "}
                                <Link
                                    href="/signup"
                                    className="font-medium text-orange-600 hover:text-orange-500"
                                >
                                    Sign up now
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-sm text-gray-500">
                    <p>Protected by reCAPTCHA and subject to the Tiffin Ledger</p>
                    <p>
                        <Link href="/privacy" className="text-orange-600 hover:text-orange-500">
                            Privacy Policy
                        </Link>
                        {" and "}
                        <Link href="/terms" className="text-orange-600 hover:text-orange-500">
                            Terms of Service
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}