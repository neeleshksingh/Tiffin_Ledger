"use client";
import { Button } from "@components/components/ui/button";
import Link from "next/link";
import { Menu, X, ChefHat, Calculator, Calendar, Clock } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import Logo from "../../public/assets/logo.png";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    {
      icon: <ChefHat className="w-12 h-12 text-orange-500" />,
      title: "Meal Planning",
      description: "Plan your tiffin meals in advance with our easy-to-use interface"
    },
    {
      icon: <Calculator className="w-12 h-12 text-orange-500" />,
      title: "Smart Billing",
      description: "Automated billing and payment tracking for hassle-free management"
    },
    {
      icon: <Calendar className="w-12 h-12 text-orange-500" />,
      title: "Delivery Schedule",
      description: "Organize and track your delivery schedules efficiently"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-sm shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Image src={Logo} alt="Logo" width={40} height={40} />
              <span className="text-2xl font-bold text-orange-600">Tiffin Ledger</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-600 hover:text-orange-600 transition">Features</Link>
              <Link href="#about" className="text-gray-600 hover:text-orange-600 transition">About</Link>
              <Link href="#contact" className="text-gray-600 hover:text-orange-600 transition">Contact</Link>
              <Button asChild className="bg-orange-600 hover:bg-orange-700">
                <Link href="/login">Login</Link>
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-orange-600 transition"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <Link href="#features" className="block px-3 py-2 text-gray-600 hover:text-orange-600 transition">Features</Link>
                <Link href="#about" className="block px-3 py-2 text-gray-600 hover:text-orange-600 transition">About</Link>
                <Link href="#contact" className="block px-3 py-2 text-gray-600 hover:text-orange-600 transition">Contact</Link>
                <Button asChild className="w-full bg-orange-600 hover:bg-orange-700 mt-4">
                  <Link href="/login">Login</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-orange-50 to-white">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 animate-fade-in">
            Manage Your Tiffin Service <span className="text-orange-600">Effortlessly</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 animate-fade-in-delay">
            Streamline your tiffin service operations with our smart ledger system
          </p>
          <Button asChild className="bg-orange-600 hover:bg-orange-700 text-lg px-8 py-6 animate-bounce">
            <Link href="/login">Get Started Today</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Tiffin Ledger?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-lg bg-white shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
              >
                <div className="flex flex-col items-center text-center">
                  {feature.icon}
                  <h3 className="text-xl font-semibold mt-4 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-orange-500 mb-4">Tiffin Ledger</h3>
              <p className="text-gray-400">Making tiffin service management simple and efficient</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-400 hover:text-orange-500 transition">Home</Link></li>
                <li><Link href="#features" className="text-gray-400 hover:text-orange-500 transition">Features</Link></li>
                <li><Link href="#about" className="text-gray-400 hover:text-orange-500 transition">About Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
              <p className="text-gray-400">Email: info@tiffinledger.com</p>
              <p className="text-gray-400">Phone: (123) 456-7890</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">&copy; {new Date().getFullYear()} Tiffin Ledger. All rights reserved.</p>
          </div>
        </div>
      </footer>

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