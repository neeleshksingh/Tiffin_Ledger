// src/lib/axios.interceptor.ts
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

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    loadingContext?.incrementRequests();
    
    // Get token from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
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
    
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;