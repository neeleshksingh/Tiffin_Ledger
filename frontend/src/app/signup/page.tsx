"use client";

import Link from "next/link";
import { useState } from "react";
import axios from "axios";
import { useRouter } from 'next/navigation'
import { useToast } from "@components/hooks/use-toast";

export default function SignUp (){

    const [error, setError] = useState('');
    const [data, setData] = useState({ name: "", email: "", password: "" });
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
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/user/signup`, data);
            toast({
                // variant: "success",
                title: "Signup successful",
            });
            nav.push('/login')
           
        } catch (err : any) {
            setError('Invalid email or password');
            toast({
                // variant: "error",
                title: err.response.data.message,
            });
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="bg-gray-100 h-screen flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Signup Here!</h2>
                
                <form>
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-600">Name</label>
                        <input type="text" id="name" name="name" required onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>

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
                            {loading ? <span>Wait...</span> : <span>Sign Up</span>}
                        </button>
                    </div>
            
                    <div className="mt-4 text-center">
                        <p className="text-sm">Already have an account? <Link href="/login" className="text-blue-500 hover:underline">Login</Link></p>
                    </div>
                </form>
            </div>
        </div>
    )
}