import axios from "axios";
import { API_BASE_CLIENT_URL } from "../config/apiConfig";
import { getLanguage, type Lang } from "./storage";

export const httpClient = axios.create({
    baseURL: API_BASE_CLIENT_URL,
    timeout: 100000,
    withCredentials: true,
});

httpClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("auth_token");
        const lang: Lang = getLanguage();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        config.headers["Accept-Language"] = lang;
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

httpClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        console.log("API Error Client:", error.response?.data);

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
                    return httpClient(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const res = await httpClient.post('/auth/refresh-token');
                const newAccessToken = res.data?.data?.accessToken;

                if (newAccessToken) {
                    localStorage.setItem("auth_token", newAccessToken);
                    originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
                    processQueue(null, newAccessToken);
                    isRefreshing = false;
                    return httpClient(originalRequest);
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
