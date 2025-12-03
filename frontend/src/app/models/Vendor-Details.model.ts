import { BillingInfo } from "./Billing-Info.model";

export interface VendorDetails {
    _id: string;
    name: string;
    shopName: string;
    address: string;
    contactNumber: string;
    amountPerDay: number;
    gstNumber: string;
    billingInfo: BillingInfo;
    availableMealTypes: string[];
}