"use client";

import { useEffect, useState, useMemo } from "react";
import { ArrowLeft, Search, Filter, X } from "lucide-react";
import { useRouter } from "next/navigation";
import whatsapp from '../../../../public/assets/whatsapp-svgrepo-com.svg';

interface User {
    _id: string;
    name: string;
    email: string;
    phone: string;
    alternatePhone?: string;
    address: {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        zipCode: string;
    };
    profilePic?: string;
    preferredMealTypes: string[];
    vendor: { shopName: string };
    joinedAt: string;
}

interface VendorData {
    count: number;
    users: User[];
    vendorMealTypes: string[];
}

export default function VendorCustomers() {
    const router = useRouter();
    const [data, setData] = useState<VendorData | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedMeals, setSelectedMeals] = useState<string[]>([]);
    const [showMealDropdown, setShowMealDropdown] = useState(false);

    useEffect(() => {
        const saved = sessionStorage.getItem("vendorCustomersData");
        if (saved) {
            setData(JSON.parse(saved));
        } else {
            router.push("/vendor/dashboard");
        }
    }, [router]);

    const availableMealTypes = useMemo(() => {
        if (!data) return [];
        const types = new Set<string>();
        data.users.forEach(user => user.preferredMealTypes.forEach(t => types.add(t)));
        return Array.from(types);
    }, [data]);

    const filteredUsers = useMemo(() => {
        if (!data) return [];

        return data.users.filter(user => {
            const matchesSearch =
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.phone.includes(searchQuery) ||
                user.address.city.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesMeal = selectedMeals.length === 0 ||
                selectedMeals.every(meal => user.preferredMealTypes.includes(meal));

            return matchesSearch && matchesMeal;
        });
    }, [data, searchQuery, selectedMeals]);

    const toggleMeal = (meal: string) => {
        setSelectedMeals(prev =>
            prev.includes(meal)
                ? prev.filter(m => m !== meal)
                : [...prev, meal]
        );
    };

    const clearFilters = () => {
        setSearchQuery("");
        setSelectedMeals([]);
    };

    if (!data) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-orange-600 hover:underline"
                >
                    <ArrowLeft className="w-5 h-5" /> Back to Dashboard
                </button>
                <h1 className="text-3xl font-bold">
                    Your Customers ({filteredUsers.length}
                    {data.count !== filteredUsers.length && (
                        <span className="text-gray-500 text-xl"> / {data.count}</span>
                    )})
                </h1>
            </div>

            {/* Search & Filters */}
            <div className="bg-white rounded-3xl shadow-lg p-6 mb-8 border border-gray-100">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search Bar */}
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email, phone, city..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:border-orange-500 focus:outline-none transition"
                        />
                    </div>

                    {/* Meal Filter */}
                    <div className="relative">
                        <button
                            onClick={() => setShowMealDropdown(!showMealDropdown)}
                            className="flex items-center gap-3 px-6 py-4 bg-gray-50 hover:bg-gray-100 rounded-2xl border border-gray-200 transition"
                        >
                            <Filter className="w-5 h-5" />
                            <span>Meals {selectedMeals.length > 0 && `(${selectedMeals.length})`}</span>
                        </button>

                        {showMealDropdown && (
                            <div className="absolute top-full mt-2 right-0 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 z-10 w-64">
                                <div className="space-y-2">
                                    {availableMealTypes.map(meal => (
                                        <label key={meal} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
                                            <input
                                                type="checkbox"
                                                checked={selectedMeals.includes(meal)}
                                                onChange={() => toggleMeal(meal)}
                                                className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                                            />
                                            <span className="capitalize font-medium">{meal}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Clear Filters */}
                    {(searchQuery || selectedMeals.length > 0) && (
                        <button
                            onClick={clearFilters}
                            className="flex items-center gap-2 px-6 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl transition"
                        >
                            <X className="w-5 h-5" />
                            Clear
                        </button>
                    )}
                </div>

                {/* Active Filters Chips */}
                {selectedMeals.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                        {selectedMeals.map(meal => (
                            <span
                                key={meal}
                                className={`px-4 py-2 rounded-full text-white text-sm font-medium flex items-center gap-2 ${meal === "lunch" ? "bg-orange-500" :
                                    meal === "dinner" ? "bg-red-500" :
                                        meal === "breakfast" ? "bg-yellow-500" : "bg-purple-500"
                                    }`}
                            >
                                {meal.charAt(0).toUpperCase() + meal.slice(1)}
                                <button onClick={() => toggleMeal(meal)}>
                                    <X className="w-4 h-4" />
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Customers Grid */}
            <div className="grid gap-8">
                {filteredUsers.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                        <p className="text-xl">No customers found matching your filters.</p>
                    </div>
                ) : (
                    filteredUsers.map((user) => (
                        <div
                            key={user._id}
                            className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl border border-gray-100 overflow-hidden transition-all duration-500 hover:-translate-y-2"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 opacity-0 group-hover:opacity-10 transition-opacity duration-500" />

                            <div className="relative p-8">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="relative">
                                            <img
                                                src={user.profilePic || "/default-avatar.png"}
                                                alt={user.name}
                                                className="w-20 h-20 rounded-full object-cover ring-4 ring-orange-100 group-hover:ring-orange-300 transition-all duration-300"
                                            />
                                            <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-4 border-white" />
                                        </div>

                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
                                            <p className="text-gray-600 flex items-center gap-2">
                                                {user.email}
                                                <span className="text-xs text-gray-400">•</span>
                                                <span className="text-sm">
                                                    Joined {new Date(user.joinedAt).toLocaleDateString('en-IN', {
                                                        day: 'numeric', month: 'short', year: 'numeric'
                                                    })}
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* WhatsApp Button */}
                                    <a
                                        href={`https://wa.me/${user.phone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(user.name)}!%20Your%20meal%20is%20on%20the%20way%20from%20${encodeURIComponent(user.vendor.shopName)}!`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-[#25D366] hover:bg-[#128C7E] text-white p-4 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-110 hover:rotate-3 flex items-center justify-center"
                                        title="Message on WhatsApp"
                                    >
                                        <img src={whatsapp.src} alt="WhatsApp" className="w-7 h-7" />
                                    </a>
                                </div>

                                {/* Details */}
                                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Phone */}
                                    <div
                                        className="flex items-center gap-3 cursor-pointer group/phone"
                                        onClick={() => {
                                            navigator.clipboard.writeText(user.phone);
                                            alert("Phone copied!");
                                        }}
                                    >
                                        <div className="p-3 bg-blue-100 rounded-2xl group-hover/phone:bg-blue-200 transition">
                                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Phone</p>
                                            <p className="font-semibold text-gray-900">{user.phone}</p>
                                            {user.alternatePhone && <p className="text-xs text-gray-500">Alt: {user.alternatePhone}</p>}
                                        </div>
                                    </div>

                                    {/* Meals */}
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-green-100 rounded-2xl">
                                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Meals</p>
                                            <div className="flex gap-2 mt-1">
                                                {user.preferredMealTypes.map((meal) => (
                                                    <span
                                                        key={meal}
                                                        className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${meal === "lunch" ? "bg-orange-500" :
                                                            meal === "dinner" ? "bg-red-500" :
                                                                meal === "breakfast" ? "bg-yellow-500" : "bg-purple-500"
                                                            }`}
                                                    >
                                                        {meal.charAt(0).toUpperCase() + meal.slice(1)}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-purple-100 rounded-2xl">
                                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Delivery Address</p>
                                            <p className="font-medium text-gray-900">
                                                {user.address.line1}{user.address.line2 ? `, ${user.address.line2}` : ""}, {user.address.city}
                                            </p>
                                            <p className="text-xs text-gray-500">{user.address.state} - {user.address.zipCode}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}