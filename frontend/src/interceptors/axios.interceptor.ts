"use client";

import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

interface LoadingContextType {
  incrementRequests: () => void;
  decrementRequests: () => void;
}

let loadingContext: LoadingContextType | null = null;

export const setLoadingContext = (context: LoadingContextType) => {
  loadingContext = context;
};

const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const MAX_RETRIES = 3;

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    loadingContext?.incrementRequests();

    // Get token from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const messId = userData?.messId;
      if (!messId) {
        const id = userData?._id;
        if (id) {
          if (!window.location.pathname.includes('/profile-manage/')) {
            window.location.href = `/dashboard/profile/profile-manage/${id}`;
            return Promise.reject('Redirecting to profile manage page');
          }
        }
      }

      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    loadingContext?.decrementRequests();
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    loadingContext?.decrementRequests();
    return response;
  },
  (error) => {
    loadingContext?.decrementRequests();

    const config = error.config;
    const isTimeoutError = error.code === "ECONNABORTED" && error.message.includes("timeout");
    // Retry logic
    if (isTimeoutError && config && !config._retry) {
      config._retry = true;
      config.retryCount = (config.retryCount || 0) + 1;

      if (config.retryCount <= MAX_RETRIES) {
        console.log(`Retrying request... Attempt ${config.retryCount}`);
        return axiosInstance(config);
      }
    }

    if (
      (error.response?.status === 401 ||
        error.response?.status === 403) &&
      typeof window !== "undefined"
    ) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;