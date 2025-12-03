import { TiffinOverview } from "./Tiffin-Overview.model";
import { VendorDetails } from "./Vendor-Details.model";

export interface UserData {
    data: {
        user: {
            _id: string;
            name: string;
            email: string;
            createdAt: string;
            updatedAt: string;
            __v?: number;
            messId: VendorDetails;
            profilePic: string;
        };
        tiffinOverview: TiffinOverview[];
        vendor: VendorDetails;
    };
}