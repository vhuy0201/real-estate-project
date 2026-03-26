import axios from "axios";

export const createAxiosInstance = () => {
    const token = localStorage.getItem("auth_token");
    
    return axios.create({
        baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
        timeout: 10000,
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    });
};

