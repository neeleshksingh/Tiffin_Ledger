"use client";

import { useState, useEffect } from "react";
import axiosInstance from "@components/interceptors/axios.interceptor";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export default function Timetable() {
    const [date, setDate] = useState(new Date());
    const [monthDays, setMonthDays] = useState({});
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const fetchMonthData = async (month) => {
        try {
            const user = localStorage.getItem("user");
            if (user) {
                const parsedUser = JSON.parse(user);
                const userId = parsedUser._id;

                const formattedMonth = `${month.getFullYear()}-${String(
                    month.getMonth() + 1
                ).padStart(2, "0")}`;

                const response = await axiosInstance.get(
                    `http://localhost:1517/tiffin/track/get?userId=${userId}&month=${formattedMonth}`
                );

                console.log("Data fetched successfully:", response.data);
                const data = response.data.data[0];
                setMonthDays(data?.days || {});
            }
        } catch (error) {
            console.error("Error fetching month data:", error);
        }
    };

    useEffect(() => {
        fetchMonthData(currentMonth);
    }, [currentMonth]);

    const handleDayClick = async (selectedDate) => {
        try {
            const user = localStorage.getItem("user");
            if (user) {
                const parsedUser = JSON.parse(user);
                const userId = parsedUser._id;

                const dayNumber = String(selectedDate.getDate()).padStart(2, "0");

                const formattedMonth = `${selectedDate.getFullYear()}-${String(
                    selectedDate.getMonth() + 1
                ).padStart(2, "0")}`;

                const newDayStatus = !monthDays[dayNumber];

                const payload = {
                    userId: userId,
                    month: formattedMonth,
                    days: {
                        ...monthDays,
                        [dayNumber]: newDayStatus,
                    },
                };

                const response = await axiosInstance.post(
                    `http://localhost:1517/tiffin/track/add`,
                    payload
                );

                setMonthDays((prevDays) => ({
                    ...prevDays,
                    [dayNumber]: newDayStatus,
                }));
            }
        } catch (error) {
            console.error("Error updating date:", error);
        }
    };


    const handleMonthChange = (newMonth) => {
        setCurrentMonth(newMonth);
        setMonthDays({});
    };

    const getDayStatus = (day) => {
        const dayNumber = String(day.getDate()).padStart(2, "0");
        return monthDays[dayNumber];
    };

    return (
        <div className="flex flex-col items-center h-screen w-full justify-center">
            <h1>Timetable</h1>
            <div className="rounded-lg shadow-lg bg-white flex flex-col items-center w-full 
                max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">
                <DayPicker
                    mode="single"
                    selected={date}
                    onDayClick={(day) => {
                        setDate(day);
                        handleDayClick(day);
                    }}
                    onMonthChange={handleMonthChange}
                    modifiersClassNames={{
                        greenDay: "bg-green-400 text-white",
                        redDay: "bg-red-400 text-white",
                    }}
                    modifiers={{
                        greenDay: (day) => getDayStatus(day) === true,
                        redDay: (day) => getDayStatus(day) === false,
                    }}
                    className="w-full text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl p-2"
                    styles={{
                        caption: { fontSize: "1rem", textAlign: "center" },
                        day: { height: "2.5rem", width: "2.5rem" },
                        month: { padding: "1rem" },
                    }}
                />
            </div>
            <p>{date.toDateString()}</p>
        </div>
    );
}