"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@components/interceptors/axios.interceptor";
import { useToast } from "@components/hooks/use-toast";
import { useRouter } from "next/navigation";
import { FaMapMarkerAlt, FaPhoneAlt, FaRegBuilding } from "react-icons/fa";
import Image from "next/image";
import cooking from "../../../../../public/assets/cooking.png";

interface VendorData {
  name: string;
  shopName: string;
  address: string;
  contactNumber: string;
  amountPerDay: number;
  billingInfo?: {
    name: string;
    gstin: string;
    address: string;
  };
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function VendorViewPage({ params }: PageProps) {
  const [data, setData] = useState<VendorData | null>(null);
  const { toast } = useToast();
  const nav = useRouter();
  const resolvedParams = React.use(params);

  useEffect(() => {
    const getVendorData = async () => {
      try {
        const user = localStorage.getItem("user");
        if (user) {
          const parsedUser = JSON.parse(user);
          const userId = parsedUser._id;

          const response = await axiosInstance.get(`/tiffin/vendors/${resolvedParams.id}`);
          setData(response.data);
        } else {
          nav.push("/login");
        }
      } catch (error: any) {
        console.error("Error fetching vendor data:", error);
        if (error.response?.status === 403) {
          localStorage.removeItem("token");
          nav.push("/login");
          toast({
            variant: "error",
            title: `Session Expired, Please login again`,
          });
        } else {
          toast({
            variant: "error",
            title: `Error fetching vendor data: ${error.message}`,
          });
        }
      }
    };

    getVendorData();
  }, [resolvedParams.id, nav, toast]);

  return (
    <div className="p-3 space-y-8 bg-gray-100">
      <>
        {/* Vendor Image and Name Section */}
        <div className="flex flex-col items-center mb-6 bg-gradient-to-r from-blue-700 to-teal-700 p-6 rounded-lg shadow-lg w-full">
          <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center mb-4">
            <Image
              src={cooking}
              alt="Vendor Logo"
              className="w-20 h-20 object-cover rounded-full"
            />
          </div>
          <h1 className="text-3xl font-semibold text-white">{data?.name}</h1>
          <p className="text-lg text-white">{data?.shopName}</p>
        </div>

        {/* Address Section */}
        <div className="flex items-center justify-start w-full text-gray-800 mb-4">
          <FaMapMarkerAlt className="text-xl mr-3 text-teal-500" />
          <p className="text-sm">{data?.address}</p>
        </div>

        {/* Contact Number Section */}
        <div className="flex items-center justify-start w-full text-gray-800 mb-4">
          <FaPhoneAlt className="text-xl mr-3 text-teal-500" />
          <p className="text-sm">{data?.contactNumber}</p>
        </div>

        {/* Billing Information Section */}
        <div className="w-full bg-white p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Billing Information</h2>
          <div className="flex items-center justify-start w-full text-gray-700 mb-3">
            <FaRegBuilding className="text-xl mr-3 text-teal-500" />
            <div>
              <p className="text-sm font-semibold">Name: {data?.billingInfo?.name}</p>
              <p className="text-sm">GSTIN: {data?.billingInfo?.gstin}</p>
              <p className="text-sm">Address: {data?.billingInfo?.address}</p>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="w-full text-center mb-4">
          <p className="text-xl font-semibold text-gray-800">Amount Per Day</p>
          <p className="text-lg text-teal-600 font-bold">{data?.amountPerDay} INR</p>
        </div>

        {/* Action Button */}
        <div className="w-full text-center">
          <button className="bg-teal-500 text-white py-2 px-6 rounded-full shadow-md hover:bg-teal-600 transition-colors duration-300">
            Contact Vendor
          </button>
        </div>
      </>
    </div>
  );
}