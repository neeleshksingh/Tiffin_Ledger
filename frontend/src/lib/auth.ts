import Cookies from 'js-cookie';

export const loginVendor = (token: string, user: any) => {
    if (typeof window !== "undefined") {
        localStorage.setItem("vendorToken", token);
        localStorage.setItem("vendorUser", JSON.stringify(user));
    }
};

export const logoutVendor = () => {
    if (typeof window !== "undefined") {
        localStorage.removeItem("vendorToken");
        localStorage.removeItem("vendorUser");
        Cookies.remove('vendorToken', { path: '/' });
    }
    window.location.href = "/login";
};

export const getToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("vendorToken");
};

export const getVendorUser = () => {
    if (typeof window === "undefined") return null;
    const user = localStorage.getItem("vendorUser");
    return user ? JSON.parse(user) : null;
};

export const isVendorLoggedIn = () => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("vendorToken");
};