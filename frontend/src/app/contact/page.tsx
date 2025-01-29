"use client";
import { Button } from "@components/components/ui/button";
import Link from "next/link";
import { Menu, X, MapPin, Phone, Mail, Clock, Facebook, Twitter, Instagram } from "lucide-react";
import { useState } from "react";
import Logo from "../../../public/assets/logo.png";
import Image from "next/image";

export default function ContactUs() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });

    const handleSubmit = (e: any) => {
        e.preventDefault();
        console.log(formData);
    };

    return (
        <div className="min-h-screen">
            {/* Navigation */}
            <nav className="fixed w-full bg-white/80 backdrop-blur-sm shadow-sm z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                    <div className="flex items-center gap-2">
                            <Image src={Logo} alt="Logo" width={40} height={40} />
                            <Link href="/" className="text-2xl font-bold text-orange-600">Tiffin Ledger</Link>
                        </div>

                        <div className="hidden md:flex items-center space-x-8">
                            <Link href="/" className="text-gray-600 hover:text-orange-600 transition">Home</Link>
                            <Link href="/about-us" className="text-gray-600 hover:text-orange-600 transition">About</Link>
                            <Link href="#" className="text-orange-600">Contact</Link>
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
                                <Link href="/about-us" className="block px-3 py-2 text-gray-600 hover:text-orange-600 transition">About</Link>
                                <Link href="#" className="block px-3 py-2 text-orange-600">Contact</Link>
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
                        Get in Touch
                    </h1>
                    <p className="text-lg text-gray-600 mb-8 animate-fade-in-delay max-w-2xl mx-auto">
                        Have questions about Tiffin Ledger? We're here to help! Reach out to us through any of the channels below.
                    </p>
                </div>
            </section>

            {/* Contact Information Cards */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-orange-50 p-8 rounded-lg text-center hover:shadow-lg transition duration-300">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MapPin className="w-8 h-8 text-orange-600" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Visit Us</h3>
                            <p className="text-gray-600">
                                Kalinagar, Namkum<br />
                                Ranchi<br />
                                Jharkhand, 831015
                            </p>
                        </div>

                        <div className="bg-orange-50 p-8 rounded-lg text-center hover:shadow-lg transition duration-300">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Phone className="w-8 h-8 text-orange-600" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Call Us</h3>
                            <p className="text-gray-600">
                                Main: +91 8877450120<br />
                                Support: +91 8877450120<br />
                                Toll-free: +91 8877450120
                            </p>
                        </div>

                        <div className="bg-orange-50 p-8 rounded-lg text-center hover:shadow-lg transition duration-300">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Clock className="w-8 h-8 text-orange-600" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Business Hours</h3>
                            <p className="text-gray-600">
                                Monday - Friday: 9:00 AM - 6:00 PM<br />
                                Saturday: 10:00 AM - 4:00 PM<br />
                                Sunday: Closed
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map and Contact Form Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Map */}
                        <div className="bg-white p-4 rounded-lg shadow-lg">
                            <iframe 
                                src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d6160.635598481471!2d85.41711522015228!3d23.347092572144856!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1738129773465!5m2!1sen!2sin" 
                                width="100%" height="450" className="rounded-lg" style={{ border: 0 }}
                                allowFullScreen={true} loading="lazy" referrerPolicy="no-referrer-when-downgrade">
                            </iframe>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-white p-8 rounded-lg shadow-lg">
                            <h3 className="text-2xl font-semibold mb-6">Send us a Message</h3>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <input
                                        type="email"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                    <textarea
                                        rows={4}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        required
                                    ></textarea>
                                </div>
                                <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">
                                    Send Message
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Social Media Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-orange-600 text-white">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-8">Connect With Us</h2>
                    <div className="flex justify-center space-x-8">
                        <a href="https://www.facebook.com/neelesh1517" target="_blank" className="hover:text-orange-200 transition">
                            <Facebook className="w-8 h-8" />
                        </a>
                        <a href="#" target="_blank" className="hover:text-orange-200 transition">
                            <Twitter className="w-8 h-8" />
                        </a>
                        <a href="https://www.instagram.com/404_nks/" target="_blank" className="hover:text-orange-200 transition">
                            <Instagram className="w-8 h-8" />
                        </a>
                    </div>
                </div>
            </section>

            {/* Footer */}
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
                                <li><Link href="/about-us" className="text-gray-400 hover:text-orange-500 transition">About</Link></li>
                                <li><Link href="#" className="text-gray-400 hover:text-orange-500 transition">Contact</Link></li>
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