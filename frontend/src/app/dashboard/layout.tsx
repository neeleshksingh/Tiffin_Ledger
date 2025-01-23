"use client";
import { ReactNode } from "react";
import { useState, useRef, useEffect, JSX } from "react";
import MenuIcon from "../../../public/assets/menu.png";
import Logo from "../../../public/assets/logo.png";
import Profile from "../../../public/assets/profile.png";
import Image from 'next/image';
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { FaTachometerAlt, FaCog, FaBell, FaSignOutAlt, FaCalendarAlt } from "react-icons/fa";
import Timetable from "./timetable/page";
import Link from "next/link";
import Landing from "./page";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@components/components/ui/alert-dialog"
import axiosInstance from "@components/interceptors/axios.interceptor";
import { useToast } from "@components/hooks/use-toast";


export default function DashboardLayout({ children }: { children: ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const sidebarRef = useRef<HTMLDivElement | null>(null);
    const [userName, setUserName] = useState('');
    const router = useRouter();
    const pathname = usePathname();
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
    const [userData, setUserData] = useState({
        profilePic:''
    });
    const { toast } = useToast();
    

    const getComponentForRoute = () => {
        if (pathname === "/dashboard") return <Landing />;
        if (pathname === "/dashboard/timetable") return <Timetable />;

        return children;
    };

    const getUserData = async () => {
        try {
            const response = await axiosInstance.get(`profile/view-profile/${JSON.parse(localStorage.getItem("user") || "{}")._id}`);
            setUserData(response.data.data.user);
        } catch (error) {
            toast({
                variant: "error",
                title: `Error fetching user data: ${error}`,
            });
        }
    }

    useEffect(()=>{
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
        } else {
            getUserData();
        }
    },[])


    useEffect(() => {
        const userDetails = JSON.parse(localStorage.getItem("user") || "{}");
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
        }
        setUserName(userDetails.name || 'Guest');
    }, []);

    // Close sidebar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
                setIsSidebarOpen(false);
            }
        };

        if (isSidebarOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isSidebarOpen]);

    const handleLogout = () => {
        try {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
            router.push('/login');
        }
    };


    return (
        <>
            <div className="w-full h-screen bg-[#dffded] grid lg:grid-cols-[20%,80%] grid-cols-1">
                {/* Sidebar */}
                <aside
                    ref={sidebarRef}
                    className={`z-[1000] fixed lg:relative lg:block bg-[#dffded] text-black h-screen w-64 lg:w-full transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                        } lg:translate-x-0`}
                >
                    <div className="p-4 h-full flex flex-col justify-between">
                        <div>
                            <div className="mb-4 flex items-center">
                                <Image src={Logo} alt="Logo" width={40} height={40} />
                                <span className="ml-2 text-lg font-bold">Tiffin Ledger</span>
                            </div>
                            <div className="relative mb-6">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full p-2 text-sm border rounded-full outline-none bg-white shadow-md"
                                />
                            </div>
                        </div>

                        {/* Menu Items */}
                        <nav className="flex-1">
                            <ul className="space-y-3">
                                <li>
                                    <Link
                                        href="/dashboard"
                                        className={`rounded-lg hover:bg-white hover:shadow-md p-3 block transition ${pathname === "/dashboard" ? "bg-white shadow-md" : ""
                                            }`}
                                    >
                                        <FaTachometerAlt className="inline-block mr-3" />
                                        <span>Dashboard</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/dashboard/timetable"
                                        className={`rounded-lg hover:bg-white hover:shadow-md p-3 block transition ${pathname === "/dashboard/timetable"
                                            ? "bg-white shadow-md"
                                            : ""
                                            }`}
                                    >
                                        <FaCalendarAlt className="inline-block mr-3" />
                                        <span>Tiffin Timeline</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/dashboard/notifications"
                                        className={`rounded-lg hover:bg-white hover:shadow-md p-3 block transition ${pathname === "/dashboard/notifications"
                                            ? "bg-white shadow-md"
                                            : ""
                                            }`}
                                    >
                                        <FaBell className="inline-block mr-3" />
                                        <span>Notifications</span>
                                    </Link>
                                </li>
                            </ul>
                        </nav>

                        <div>
                            <div className="border-t pt-6">
                                <div className="flex items-center gap-4 mb-5 cursor-pointer hover:bg-[#e1f7e7] hover:shadow-md rounded-xl p-3 transition-all duration-200">
                                    <Image
                                        src={userData.profilePic || Profile}
                                        alt="User Avatar"
                                        width={35}
                                        height={35}
                                        className="rounded-full border-2 border-[#4CAF50] shadow-md"
                                    />

                                    <div className="text-sm">
                                        <p className="font-semibold text-[#374151]">{userName}</p>
                                        <p className="text-xs text-gray-500">View Profile</p>
                                    </div>
                                </div>

                                <div
                                    onClick={() => setIsLogoutDialogOpen(true)}
                                    className="flex items-center gap-2 rounded-lg hover:bg-red-100 p-3 cursor-pointer transition-all duration-200 text-red-600 hover:shadow-md"
                                >
                                    <FaSignOutAlt className="text-lg" />
                                    <span className="font-medium">Logout</span>
                                </div>

                                <div className="rounded-lg hover:bg-gray-100 hover:shadow-md p-3 cursor-pointer transition">
                                    <span>Help Center</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Section */}
                <section className="h-screen bg-[#dffded]">
                    <div className="p-4">
                        <Image
                            src={MenuIcon}
                            alt="Description of the image"
                            width={30}
                            height={30}
                            onClick={() => setIsSidebarOpen(true)}
                            className="cursor-pointer lg:hidden rounded-full bg-gray-100 p-2 shadow-md hover:bg-gray-200 active:bg-gray-300 transition mb-2"
                        />
                        <div className="card shadow-lg h-[97vh] w-full mx-auto rounded-lg border-solid border-1 border-slate-400 bg-gray-100 max-h-[97vh] overflow-y-auto custom-scroll">
                            {getComponentForRoute()}
                        </div>
                        <style jsx>{`
                        .custom-scroll {
                            scrollbar-width: none; /* For Firefox */
                        }
                        .custom-scroll::-webkit-scrollbar {
                            display: none; /* For Chrome, Safari, and Edge */
                        }`}
                        </style>
                    </div>
                </section>
            </div>

            <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to logout? You'll need to sign in again to access your account.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 text-white"
                        >
                            Logout
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}