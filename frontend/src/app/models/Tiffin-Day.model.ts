type MealType = "breakfast" | "lunch" | "dinner";

export interface TiffinDay {
    date: string;
    meals: Record<MealType, boolean>;
}