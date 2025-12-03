import { TiffinDay } from "./Tiffin-Day.model";

export interface TiffinOverview {
    month: string;
    totalDays: number;
    totalMeals: number;
    tiffinTakenDays: number;
    days: TiffinDay[];
}