'use client';

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import paytm from '../../../public/assets/paytm.svg';
import phonepe from '../../../public/assets/phonepe.svg';
import googlepay from '../../../public/assets/google.svg';
import qrCode from '../../../public/assets/qrcode.jpg';

const PaymentFallbackPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams(); // Get the query parameters
    const [paymentLink, setPaymentLink] = useState<string | null>(null);
    const [totalAmount, setTotalAmount] = useState<number | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Detect if the user is on a mobile device
        const userAgent = navigator.userAgent.toLowerCase();
        setIsMobile(/android|iphone|ipad|ipod/.test(userAgent));

        // Get paymentLink and totalAmount from the URL
        const paymentLinkFromUrl = searchParams.get('paymentLink');
        const totalAmountFromUrl = searchParams.get('totalAmount');

        if (paymentLinkFromUrl) {
            setPaymentLink(paymentLinkFromUrl);
        }
        if (totalAmountFromUrl) {
            setTotalAmount(Number(totalAmountFromUrl)); // Ensure it's a number
        }
    }, [searchParams]);

    const handleUPIPayment = () => {
        if (paymentLink) {
            if (isMobile) {
                // Try to open the UPI payment link
                window.location.href = paymentLink;
            } else {
                // Provide a fallback option for desktop users
                alert("Please use a UPI-enabled app on your mobile device to complete the payment.");
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">Payment Fallback</h1>
                <p className="text-center text-lg text-gray-700 mb-4">
                    We couldn't open your UPI payment app automatically. Please use one of the options below to complete your payment.
                </p>

                {totalAmount && (
                    <div className="bg-gray-50 p-4 rounded-lg shadow-md mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Summary</h2>
                        <p className="text-md text-gray-700">Amount: <strong>₹{totalAmount}</strong></p>
                    </div>
                )}

                {/* Payment Option Buttons */}
                <div className="flex flex-col gap-4">
                    <button
                        onClick={handleUPIPayment}
                        className="flex items-center justify-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-200"
                    >
                        <Image src={paytm} alt="Paytm" className="w-8 h-8" ></Image>
                        Pay with Paytm
                    </button>

                    <button
                        onClick={handleUPIPayment}
                        className="flex items-center justify-center gap-3 px-6 py-3 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition duration-200"
                    >
                       <Image src={googlepay} alt="Paytm" className="w-8 h-8" ></Image>
                        Pay with Google Pay
                    </button>

                    <button
                        onClick={handleUPIPayment}
                        className="flex items-center justify-center gap-3 px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition duration-200"
                    >
                        <Image src={phonepe} alt="Paytm" className="w-8 h-8" ></Image>
                        Pay with PhonePe
                    </button>

                    {/* Fallback option */}
                    <p className="text-center text-md text-gray-700 mt-4">
                        Alternatively, you can scan the QR code below to complete your payment.
                    </p>
                    <Image src={qrCode} alt="Payment QR Code" className="w-[25rem] h-[35rem] mx-auto" ></Image>
                </div>
            </div>
        </div>
    );
};

export default PaymentFallbackPage;