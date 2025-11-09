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
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingDate, setEditingDate] = useState<string | null>(null);
    const [form, setForm] = useState<MealDetails>({});

    const today = startOfDay(new Date());
    const days = Array.from({ length: 7 }, (_, i) => addDays(today, i));

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
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
            } finally {
                setLoading(false);
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

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-600 mb-4"></div>
                    <p className="text-xl text-gray-700">Loading your menu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-10">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    Your Weekly Menu
                </h1>
                <p className="text-xl text-gray-600 mt-3">Plan delicious meals for your customers</p>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {days.map((day) => {
                    const meal = getMealForDate(day);
                    const isToday = day.toDateString() === today.toDateString();
                    const isEditing = editingDate === format(day, "yyyy-MM-dd");

                    return (
                        <Card
                            key={day.toISOString()}
                            className={`relative transition-all duration-300 hover:shadow-2xl ${isToday ? "ring-4 ring-orange-500 scale-105" : ""
                                } ${isEditing ? "ring-4 ring-green-500" : ""}`}
                        >
                            {isToday && (
                                <Badge className="absolute -top-3 right-4 bg-orange-600 text-white text-lg px-4 py-1">
                                    TODAY
                                </Badge>
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

                            <CardContent className="pt-6 space-y-6">
                                {isEditing ? (
                                    <>
                                        {(["breakfast", "lunch", "dinner"] as const).map((type) => (
                                            <div key={type} className="space-y-2">
                                                <Label className="flex items-center gap-2 capitalize font-medium">
                                                    <MealIcon type={type} />
                                                    {type}
                                                </Label>
                                                <Textarea
                                                    placeholder={`e.g. Poha, Chai, Fruits`}
                                                    value={form[type] || ""}
                                                    onChange={(e) => setForm({ ...form, [type]: e.target.value })}
                                                    rows={2}
                                                    className="resize-none text-sm"
                                                />
                                            </div>
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
                                    </>
                                ) : meal ? (
                                    <div className="space-y-4">
                                        {Object.entries(meal.mealDetails).map(([type, menu]) =>
                                            menu ? (
                                                <div key={type} className="flex gap-3 p-3 rounded-lg bg-gray-50">
                                                    <MealIcon type={type as keyof MealDetails} />
                                                    <div>
                                                        <p className="font-semibold capitalize text-sm">{type}</p>
                                                        <p className="text-sm text-gray-700">{menu}</p>
                                                    </div>
                                                </div>
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
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-400">
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
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Summary */}
            <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
                <CardHeader>
                    <CardTitle>Weekly Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-6 text-center">
                        <div>
                            <p className="text-4xl font-bold text-orange-600">{meals.length}</p>
                            <p className="text-gray-600">Meals Planned</p>
                        </div>
                        <div>
                            <p className="text-4xl font-bold text-green-600">
                                {meals.some(m => startOfDay(new Date(m.date)).getTime() === today.getTime()) ? "Yes" : "No"}
                            </p>
                            <p className="text-gray-600">Today's Menu</p>
                        </div>
                        <div>
                            <p className="text-4xl font-bold text-blue-600">{7 - meals.length}</p>
                            <p className="text-gray-600">Empty Days</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}