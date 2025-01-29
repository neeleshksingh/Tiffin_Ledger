"use client";
import { Button } from "@components/components/ui/button";
import Link from "next/link";
import { Menu, X, Users, Heart, Clock, Award } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import Neelesh from "../../../public/assets/neelesh.jpg";
import Kajal from "../../../public/assets/kajal.jpg";
import Neelu from "../../../public/assets/neelu.jpg";
import Logo from "../../../public/assets/logo.png";

export default function AboutUs() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const stats = [
        { number: "1000+", label: "Happy Customers" },
        { number: "50+", label: "Tiffin Providers" },
        { number: "10K+", label: "Daily Meals" },
        { number: "4.9/5", label: "Customer Ratings" }
    ];

    const team = [
        {
            name: "Neelesh Kumar Singh",
            role: "Founder & CEO",
            description: "After years of forgetting my own tiffin records, I built an app to save myself—now it saves everyone!",
            image: Neelesh
        },
        {
            name: "Kajal Kumari",
            role: "Operations Head",
            description: "Kajal ensures smooth daily operations and maintains service quality standards.",
            image: Kajal
        },
        {
            name: "Neelu Paji",
            role: "Tech Lead",
            description: "Neelu Paji leads our technical initiatives and platform development.",
            image: Neelu
        }
    ];

    return (
        <div className="min-h-screen">
            {/* Navigation - Same as landing page */}
            <nav className="fixed w-full bg-white/80 backdrop-blur-sm shadow-sm z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <Image src={Logo} alt="Logo" width={40} height={40} />
                            <Link href="/" className="text-2xl font-bold text-orange-600">Tiffin Ledger</Link>
                        </div>

                        <div className="hidden md:flex items-center space-x-8">
                            <Link href="/" className="text-gray-600 hover:text-orange-600 transition">Home</Link>
                            <Link href="#" className="text-orange-600">About</Link>
                            <Link href="/contact" className="text-gray-600 hover:text-orange-600 transition">Contact</Link>
                            <Button asChild className="bg-orange-600 hover:bg-orange-700">
                                <Link href="/login">Login</Link>
                            </Button>
                        </div>

                        <div className="md:hidden">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="text-gray-600 hover:text-orange-600 transition"
                            >
                                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>

                    {isMenuOpen && (
                        <div className="md:hidden">
                            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                                <Link href="/" className="block px-3 py-2 text-gray-600 hover:text-orange-600 transition">Home</Link>
                                <Link href="#" className="block px-3 py-2 text-orange-600">About</Link>
                                <Link href="/contact" className="block px-3 py-2 text-gray-600 hover:text-orange-600 transition">Contact</Link>
                                <Button asChild className="w-full bg-orange-600 hover:bg-orange-700 mt-4">
                                    <Link href="/login">Login</Link>
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-orange-50 to-white">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 animate-fade-in">
                        Our Story
                    </h1>
                    <div className="max-w-3xl mx-auto">
                        <p className="text-lg text-gray-600 mb-8 animate-fade-in-delay leading-relaxed">
                            Founded in 2025, Tiffin Ledger emerged from a simple vision: to revolutionize how tiffin services manage their
                            operations. We understand the challenges of running a tiffin service, and we're here to make it easier.
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center transform hover:scale-105 transition duration-300">
                                <div className="text-3xl font-bold text-orange-600 mb-2">{stat.number}</div>
                                <div className="text-gray-600">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-orange-50">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                We're committed to empowering tiffin service providers with digital tools that simplify their
                                operations. Our platform brings efficiency, transparency, and reliability to the traditional
                                tiffin service industry.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <Clock className="w-6 h-6 text-orange-600" />
                                    <span>Streamlined Operations</span>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <Heart className="w-6 h-6 text-orange-600" />
                                    <span>Customer Satisfaction</span>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <Award className="w-6 h-6 text-orange-600" />
                                    <span>Quality Service</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-8 rounded-lg shadow-xl">
                            <blockquote className="text-lg italic text-gray-600">
                                "Our goal is to make tiffin service management as easy as possible, allowing providers to focus
                                on what they do best - preparing delicious, homestyle meals."
                            </blockquote>
                            <p className="mt-4 font-semibold">- Founder, Tiffin Ledger</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">Meet Our Team</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {team.map((member, index) => (
                            <div key={index} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition">
                                <div className="w-32 h-32 bg-orange-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                                    <Image src={member.image} alt={member.name} width={100} height={100} className="w-32 h-32 rounded-full" />
                                </div>
                                <h3 className="text-xl font-semibold text-center mb-2">{member.name}</h3>
                                <p className="text-orange-600 text-center mb-4">{member.role}</p>
                                <p className="text-gray-600 text-center">{member.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact CTA Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-orange-600 text-white">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-6">Ready to Streamline Your Tiffin Service?</h2>
                    <p className="text-lg mb-8 opacity-90">Join our growing community of satisfied tiffin service providers</p>
                    <Button asChild className="bg-white text-orange-600 hover:bg-gray-100">
                        <Link href="/login">Get Started Today</Link>
                    </Button>
                </div>
            </section>

            {/* Footer - Same as landing page */}
            <footer className="bg-gray-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="text-2xl font-bold text-orange-500 mb-4">Tiffin Ledger</h3>
                            <p className="text-gray-400">Making tiffin service management simple and efficient</p>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                            <ul className="space-y-2">
                                <li><Link href="/" className="text-gray-400 hover:text-orange-500 transition">Home</Link></li>
                                <li><Link href="#" className="text-gray-400 hover:text-orange-500 transition">About</Link></li>
                                <li><Link href="/contact" className="text-gray-400 hover:text-orange-500 transition">Contact</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
                            <p className="text-gray-400">Email: neelesh1517@gmail.com</p>
                            <p className="text-gray-400">Phone: +91 8877450120</p>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center">
                        <p className="text-gray-400">&copy; {new Date().getFullYear()} Tiffin Ledger. All rights reserved.</p>
                    </div>
                </div>
            </footer>

            {/* Custom animations */}
            <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        .animate-fade-in-delay {
          animation: fade-in 1s ease-out 0.3s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
      `}</style>
        </div>
    );
}