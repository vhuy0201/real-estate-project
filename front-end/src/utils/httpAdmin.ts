import axios from "axios";
import { API_BASE_ADMIN_URL } from "../config/apiConfig";

export const httpAdmin = axios.create({
    baseURL: API_BASE_ADMIN_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // Gửi cookie (refresh_token)
});


httpAdmin.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("auth_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: tự động refresh token khi gặp 401
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

httpAdmin.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        console.log("API Error Admin:", error.response?.data);

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (originalRequest.url?.includes('/auth/login') ||
                originalRequest.url?.includes('/auth/refresh-token')) {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers['Authorization'] = 'Bearer ' + token;
                    return httpAdmin(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Gọi refresh token từ client auth endpoint
                const res = await axios.post(
                    `${import.meta.env.VITE_API_BASE || "http://localhost:3000"}/api/client/auth/refresh-token`,
                    {},
                    { withCredentials: true }
                );
                const newAccessToken = res.data?.data?.accessToken;

                if (newAccessToken) {
                    localStorage.setItem("auth_token", newAccessToken);
                    originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
                    processQueue(null, newAccessToken);
                    isRefreshing = false;
                    return httpAdmin(originalRequest);
                }
            } catch (refreshError) {
                processQueue(refreshError, null);
                isRefreshing = false;
                localStorage.removeItem("auth_token");
                localStorage.removeItem("auth_user");

                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);
