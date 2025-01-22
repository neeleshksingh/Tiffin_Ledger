"use client";

import { useToast } from "@components/hooks/use-toast";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Cookies from 'js-cookie';

export default function Login (){

    const [error, setError] = useState('');
    const [data, setData] = useState({email: "", password: "" });
    const { toast } = useToast();
    const nav = useRouter();
    const [loading, setLoading] = useState(false);


    const handleChange = (e:any) => {
        const { name, value } = e.target;
        setData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e:any) => {
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
           
        } catch (err : any) {
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
        <div className="bg-gray-100 h-screen flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Login to Your Account</h2>
                
                <form>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-600">Email</label>
                        <input type="email" id="email" name="email" required onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    
        
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-600">Password</label>
                        <input type="password" id="password" name="password" required onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    
                
                    <div className="flex items-center justify-between mb-4">
                    <button type="button"  disabled={loading} onClick={handleSubmit}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            {loading ? <span>Wait...</span> : <span>Login</span>}
                        </button>
                    </div>
                    
            
                    <div className="text-center">
                        <a href="#" className="text-sm text-blue-500 hover:underline">Forgot your password?</a>
                    </div>

            
                    <div className="mt-4 text-center">
                        <p className="text-sm">Don't have an account? <Link href="/signup" className="text-blue-500 hover:underline">Sign up</Link></p>
                    </div>
                </form>
            </div>
        </div>
    )
}