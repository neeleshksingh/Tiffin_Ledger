"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { format, addDays, startOfDay } from "date-fns";
import { Coffee, Sun, Moon, Plus, Save, Edit2, X, Utensils } from "lucide-react";
import axiosVendor from "@components/interceptors/axiosVendor.interceptor";
import { motion, AnimatePresence } from "framer-motion";

interface MealDetails {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
}

interface Meal {
    _id: string;
    date: string;
    mealDetails: MealDetails;
}

export default function VendorMeals() {
    const [meals, setMeals] = useState<Meal[]>([]);
    const [vendorId, setVendorId] = useState<string>("");
    const [saving, setSaving] = useState(false);
    const [editingDate, setEditingDate] = useState<string | null>(null);
    const [form, setForm] = useState<MealDetails>({});

    const today = startOfDay(new Date());
    const days = Array.from({ length: 7 }, (_, i) => addDays(today, i));

    useEffect(() => {
        const fetchData = async () => {
            try {
                const profileRes = await axiosVendor.get("/vendor/profile");
                const vendor = profileRes.data.user.vendor;
                setVendorId(vendor._id);

                const mealsRes = await axiosVendor.get(`/tiffin/get-meals/${vendor._id}`);
                setMeals(mealsRes.data);
            } catch (err: any) {
                toast({
                    variant: "error",
                    title: "Error",
                    description: err.response?.data?.message || "Failed to load data",
                });
            }
        };
        fetchData();
    }, []);

    const getMealForDate = (date: Date) => {
        return meals.find(m => startOfDay(new Date(m.date)).getTime() === date.getTime());
    };

    const startEdit = (date: Date, existing?: Meal) => {
        setEditingDate(format(date, "yyyy-MM-dd"));
        setForm(existing?.mealDetails || { breakfast: "", lunch: "", dinner: "" });
    };

    const cancelEdit = () => {
        setEditingDate(null);
        setForm({});
    };

    const saveMeal = async (date: Date) => {
        if (!vendorId) return;

        const existingMeal = getMealForDate(date);
        const payload = {
            vendorId,
            date: format(date, "yyyy-MM-dd"),
            mealDetails: {
                breakfast: form.breakfast?.trim() || null,
                lunch: form.lunch?.trim() || null,
                dinner: form.dinner?.trim() || null,
            },
        };

        try {
            setSaving(true);

            if (existingMeal) {
                await axiosVendor.put("/tiffin/update-multiple-meals", [
                    {
                        _id: existingMeal._id,
                        date: payload.date,
                        mealDetails: payload.mealDetails,
                    }
                ]);
                toast({ variant: "success", title: "Updated!", description: "Menu updated" });
            } else {
                await axiosVendor.post("/tiffin/add-multiple-meals", [payload]);
                toast({ variant: "success", title: "Saved!", description: "Menu added" });
            }

            const res = await axiosVendor.get(`/tiffin/get-meals/${vendorId}`);
            setMeals(res.data);
            cancelEdit();
        } catch (err: any) {
            toast({
                variant: "error",
                title: "Error",
                description: err.response?.data?.message || "Save failed",
            });
        } finally {
            setSaving(false);
        }
    };

    const MealIcon = ({ type }: { type: keyof MealDetails }) => {
        switch (type) {
            case "breakfast": return <Coffee className="w-5 h-5 text-amber-600" />;
            case "lunch": return <Sun className="w-5 h-5 text-orange-600" />;
            case "dinner": return <Moon className="w-5 h-5 text-indigo-600" />;
            default: return <Utensils className="w-5 h-5" />;
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-10">
            {/* Header */}
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-center"
            >
                <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    Your Weekly Menu
                </h1>
                <p className="text-xl text-gray-600 mt-3">Plan delicious meals for your customers</p>
            </motion.div>

            {/* Days Grid */}
            <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: { opacity: 0 },
                    visible: {
                        opacity: 1,
                        transition: {
                            staggerChildren: 0.15,
                        },
                    },
                }}
            >
                {days.map((day, index) => {
                    const meal = getMealForDate(day);
                    const isToday = day.toDateString() === today.toDateString();
                    const isEditing = editingDate === format(day, "yyyy-MM-dd");

                    return (
                        <motion.div
                            key={day.toISOString()}
                            variants={{
                                hidden: { y: 60, opacity: 0 },
                                visible: { y: 0, opacity: 1 },
                            }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            whileHover={{ y: -8, transition: { duration: 0.2 } }}
                        >
                            <Card
                                className={`relative transition-all duration-300 ${isToday
                                    ? "ring-4 ring-orange-500 shadow-2xl"
                                    : "shadow-lg"
                                    } ${isEditing ? "ring-4 ring-green-500" : ""}`}
                            >
                                {isToday && (
                                    <motion.div
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                    >
                                        <Badge className="absolute -top-3 right-4 bg-orange-600 text-white text-lg px-4 py-1 z-10">
                                            TODAY
                                        </Badge>
                                    </motion.div>
                                )}

                                <CardHeader className={isToday ? "bg-orange-50" : "bg-gray-50"}>
                                    <CardTitle className="flex justify-between items-start">
                                        <div>
                                            <p className="text-2xl font-bold">{format(day, "EEEE")}</p>
                                            <p className="text-sm text-gray-600">{format(day, "dd MMM yyyy")}</p>
                                        </div>
                                        {!isEditing && !meal && (
                                            <Button size="sm" onClick={() => startEdit(day)}>
                                                <Plus className="w-4 h-4 mr-1" /> Add
                                            </Button>
                                        )}
                                    </CardTitle>
                                </CardHeader>

                                <CardContent className="pt-6">
                                    <AnimatePresence mode="wait">
                                        {isEditing ? (
                                            <motion.div
                                                key="edit"
                                                initial={{ opacity: 0, x: -30 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 30 }}
                                                transition={{ duration: 0.3, type: "spring", stiffness: 120 }}
                                            >
                                                {(["breakfast", "lunch", "dinner"] as const).map((type) => (
                                                    <motion.div
                                                        key={type}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: index * 0.05 }}
                                                        className="space-y-2 mb-4"
                                                    >
                                                        <Label className="flex items-center gap-2 capitalize font-medium">
                                                            <MealIcon type={type} />
                                                            {type}
                                                        </Label>
                                                        <Textarea
                                                            placeholder={`e.g. ${type === "breakfast" ? "Poha, Chai" : type === "lunch" ? "Dal, Rice, Sabzi" : "Roti, Paneer, Salad"}`}
                                                            value={form[type] || ""}
                                                            onChange={(e) => setForm({ ...form, [type]: e.target.value })}
                                                            rows={2}
                                                            className="resize-none text-sm"
                                                        />
                                                    </motion.div>
                                                ))}

                                                <div className="flex gap-3 pt-4">
                                                    <Button
                                                        onClick={() => saveMeal(day)}
                                                        disabled={saving}
                                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                                    >
                                                        {saving ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save</>}
                                                    </Button>
                                                    <Button variant="outline" onClick={cancelEdit}>
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        ) : meal ? (
                                            <motion.div
                                                key="view"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="space-y-4"
                                            >
                                                {Object.entries(meal.mealDetails).map(([type, menu]) =>
                                                    menu ? (
                                                        <motion.div
                                                            key={type}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: 0.1 }}
                                                            className="flex gap-3 p-3 rounded-lg bg-gray-50"
                                                        >
                                                            <MealIcon type={type as keyof MealDetails} />
                                                            <div>
                                                                <p className="font-semibold capitalize text-sm">{type}</p>
                                                                <p className="text-sm text-gray-700">{menu}</p>
                                                            </div>
                                                        </motion.div>
                                                    ) : null
                                                )}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full mt-4"
                                                    onClick={() => startEdit(day, meal)}
                                                >
                                                    <Edit2 className="w-4 h-4 mr-2" /> Edit Menu
                                                </Button>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="empty"
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="text-center py-12 text-gray-400"
                                            >
                                                <Utensils className="w-16 h-16 mx-auto mb-3 opacity-30" />
                                                <p className="text-sm">No menu yet</p>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="mt-4"
                                                    onClick={() => startEdit(day)}
                                                >
                                                    <Plus className="w-4 h-4 mr-2" /> Add Menu
                                                </Button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Summary */}
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
            >
                <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200 shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-2xl">Weekly Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-6 text-center">
                            {[
                                { value: meals.length, label: "Meals Planned", color: "text-orange-600" },
                                { value: meals.some(m => startOfDay(new Date(m.date)).getTime() === today.getTime()) ? "Yes" : "No", label: "Today's Menu", color: "text-green-600" },
                                { value: 7 - meals.length, label: "Empty Days", color: "text-blue-600" },
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.8 + i * 0.2, type: "spring", stiffness: 200 }}
                                >
                                    <p className={`text-4xl font-bold ${stat.color}`}>{stat.value}</p>
                                    <p className="text-gray-600">{stat.label}</p>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}