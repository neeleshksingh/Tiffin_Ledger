"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axiosInstance from "@components/interceptors/axiosVendor.interceptor";
import { ArrowLeft, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

interface MonthSummary {
    month: string;
    totalDelivered: number;
    totalPaid: number;
    totalAmount: number;
    paidAmount: number;
    dueAmount: number;
}

export default function CustomerPaymentHistory() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [summaries, setSummaries] = useState<MonthSummary[]>([]);
    const [userName, setUserName] = useState("");

    useEffect(() => {
        let isMounted = true;

        const fetchHistory = async () => {
            try {
                const res = await axiosInstance.get(`/vendor/users/${id}/payment-history`);
                if (isMounted) {
                    setUserName(res.data.name);
                    setSummaries(res.data.history);
                }
            } catch (e: any) {
                if (isMounted) {
                    toast({
                        title: "Error",
                        description: e.response?.data?.message ?? "Failed to load history",
                        variant: "error",
                    });
                }
            }
        };

        fetchHistory();
        return () => {
            isMounted = false;
        };
    }, [id]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
            <div className="mx-auto max-w-5xl">
                {/* Header */}
                <div className="sticky top-0 z-10 mb-6 flex items-center gap-3 bg-gradient-to-br from-orange-50 to-red-50 pb-3 -mt-4 pt-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-xl sm:text-2xl font-bold text-orange-700 truncate">
                        Payment History – {userName || "..."}
                    </h1>
                </div>

                {/* Desktop Table */}
                <div className="hidden sm:block overflow-x-auto rounded-xl bg-white shadow-lg">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-orange-50">
                                <TableHead className="font-semibold">Month</TableHead>
                                <TableHead className="text-center">Delivered</TableHead>
                                <TableHead className="text-center">Paid</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead className="text-right">Paid</TableHead>
                                <TableHead className="text-right">Due</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {summaries.map((s) => (
                                <TableRow key={s.month} className="hover:bg-orange-50/50">
                                    <TableCell className="font-medium">{s.month}</TableCell>
                                    <TableCell className="text-center">{s.totalDelivered}</TableCell>
                                    <TableCell className="text-center">{s.totalPaid}</TableCell>
                                    <TableCell className="text-right font-medium">
                                        <IndianRupee className="inline h-3 w-3" />
                                        {s.totalAmount}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                                            <IndianRupee className="inline h-3 w-3" />
                                            {s.paidAmount}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {s.dueAmount > 0 ? (
                                            <Badge variant="secondary" className="bg-red-100 text-red-700">
                                                <IndianRupee className="inline h-3 w-3" />
                                                {s.dueAmount}
                                            </Badge>
                                        ) : (
                                            <span className="text-green-600">—</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Mobile Cards */}
                <div className="sm:hidden space-y-3">
                    {summaries.map((s) => (
                        <div
                            key={s.month}
                            className="bg-white rounded-xl p-4 shadow-sm border border-orange-100 hover:shadow-md transition-shadow"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-orange-700">{s.month}</h3>
                                <span className="text-xs text-gray-600">
                                    {s.totalDelivered} delivered
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm">
                                    Total: <IndianRupee className="inline h-3 w-3" />
                                    {s.totalAmount}
                                </span>

                                {s.dueAmount > 0 ? (
                                    <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs">
                                        <IndianRupee className="inline h-3 w-3 mr-0.5" />
                                        {s.dueAmount} due
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                                        <IndianRupee className="inline h-3 w-3 mr-0.5" />
                                        {s.paidAmount}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {summaries.length === 0 && (
                    <p className="mt-8 text-center text-gray-500">
                        No payment records yet.
                    </p>
                )}
            </div>
        </div>
    );
}