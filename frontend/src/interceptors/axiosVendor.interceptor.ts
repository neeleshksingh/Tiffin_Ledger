import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:5000";

const axiosVendor: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 12000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// === VENDOR-ONLY AUTH KEYS ===
const VENDOR_TOKEN_KEY = 'vendorToken';
const VENDOR_USER_KEY = 'vendorUser';

let loadingContext: { increment: () => void; decrement: () => void } | null = null;

export const setVendorLoadingContext = (context: { increment: () => void; decrement: () => void }) => {
    loadingContext = context;
};

// Request Interceptor
axiosVendor.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        loadingContext?.increment?.();

        if (typeof window !== 'undefined') {
            const token = localStorage.getItem(VENDOR_TOKEN_KEY);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }

        return config;
    },
    (error) => {
        loadingContext?.decrement?.();
        return Promise.reject(error);
    }
);

// Response Interceptor
axiosVendor.interceptors.response.use(
    (response) => {
        loadingContext?.decrement?.();
        return response;
    },
    (error) => {
        loadingContext?.decrement?.();

        // Auto-retry on timeout
        const config = error.config;
        if (error.code === 'ECONNABORTED' && !config._retryCount) {
            config._retryCount = (config._retryCount || 0) + 1;
            if (config._retryCount <= 3) {
                console.log(`Retrying vendor request... (${config._retryCount}/3)`);
                return axiosVendor(config);
            }
        }

        // Handle 401 → Logout Vendor
        if (error.response?.status === 401 && typeof window !== 'undefined') {
            localStorage.removeItem(VENDOR_TOKEN_KEY);
            localStorage.removeItem(VENDOR_USER_KEY);
            window.location.href = '/vendor/login';
        }

        return Promise.reject(error);
    }
);

export default axiosVendor;