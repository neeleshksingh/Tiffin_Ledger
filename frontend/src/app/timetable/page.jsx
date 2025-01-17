"use client";
import { Calendar } from "@components/components/ui/calendar"
import { useState } from "react"
import { useEffect } from "react"
import axios from "axios"

export default function Timetable() {

    const [date, setDate] = useState(new Date());
    const [monthData, setMonthData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");

                // Check if token is available
                if (!token) {
                    console.error("No token found");
                    return;
                }

                // Pass token in Authorization header
                const response = await axios.get(
                    "http://localhost:1517/tiffin/track/get?userId=67894b6879b5770919747812&month=2025-01",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                console.log("Data fetched successfully:", response.data.data[0]);

                // Access the data from the response
                setMonthData(response.data.data[0]);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    const getDayClass = (day) => {
        if (!monthData?.days) return "";
        return monthData.days[day] ? "bg-green-500" : "bg-red-500";
    };

    const renderDay = (day) => {
        const dayString = String(day).padStart(2, "0");
        const dayClass = getDayClass(dayString);

        return (
            <div className={`h-12 w-12 flex items-center justify-center rounded-full ${dayClass}`}>
                {day}
            </div>
        );
    };

    return (
        <div className="flex flex-col items-center h-screen w-full justify-center">
            <h1>Timetable</h1>
            <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                dayContent={renderDay}
                className="rounded-md border shadow flex flex-col items-center justify-center text-lg"
            />
            <div className="grid grid-cols-7 gap-4 mt-4">
                {Array.from({ length: 31 }).map((_, index) => {
                    const day = String(index + 1).padStart(2, "0");
                    return (
                        <div
                            key={day}
                            className={`h-12 w-12 flex items-center justify-center rounded-full ${getDayClass(
                                day
                            )}`}
                        >
                            {day}
                        </div>
                    );
                })}
            </div>
        </div>
    )
}