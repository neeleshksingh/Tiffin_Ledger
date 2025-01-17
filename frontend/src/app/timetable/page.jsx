"use client";
import { Calendar } from "@components/components/ui/calendar"
import { useState } from "react"
import { useEffect } from "react"
import axiosInstance from "@components/interceptors/axios.interceptor";
import { set } from "date-fns";

export default function Timetable() {

    const [date, setDate] = useState(new Date());
    const [monthData, setMonthData] = useState(null);

    const currentYearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const user = localStorage.getItem("user");
                if (user) {
                    const parsedUser = JSON.parse(user);
                    const userId = parsedUser._id;
                    const response = await axiosInstance.get(`http://localhost:1517/tiffin/track/get?userId=${userId}&month=${currentYearMonth}`);

                    console.log("Data fetched successfully:", response.data.data[0]);

                    setMonthData(response.data.data[0]);
                }


            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);


    return (
        <div className="flex flex-col items-center h-screen w-full justify-center">
            <h1>Timetable</h1>
            <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border shadow flex flex-col items-center justify-center text-lg"
            />
            <p>{date.toDateString()}</p>
        </div>
    )
}