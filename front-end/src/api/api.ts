import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE || "http://localhost:3000",
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
});

/* REQUEST INTERCEPTOR */
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("auth_token");

        // Nếu KHÔNG phải refresh-token thì mới thêm Authorization
        if (!config.url?.includes("/auth/refresh-token")) {
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

/*  REFRESH TOKEN HANDLER  */
let isRefreshing = false;
let subscribers: Array<(token: string) => void> = [];

const onRefreshed = (token: string) => {
    subscribers.forEach((cb) => cb(token));
    subscribers = [];
};

const addSubscriber = (cb: (token: string) => void) => {
    subscribers.push(cb);
};

/* RESPONSE INTERCEPTOR */
api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            if (!isRefreshing) {
                isRefreshing = true;

                try {
                    // GỌI API REFRESH TOKEN (KHÔNG CÓ BEARER)
                    const { data } = await api.post(
                        "/api/client/auth/refresh-token",
                        {},
                        { withCredentials: true }
                    );

                    // TRẢ ĐÚNG ĐƯỜNG DẪN (BE CỦA BẠN TRẢ VỀ: { data: { accessToken } })
                    const newToken = data.data.accessToken;

                    if (!newToken) {
                        console.error("❌ Refresh trả về accessToken = undefined!");
                    }

                    // Lưu vào localStorage
                    localStorage.setItem("auth_token", newToken);

                    isRefreshing = false;
                    onRefreshed(newToken);

                    // Gắn token mới vào request gốc
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;

                    return api(originalRequest);
                } catch (err) {
                    isRefreshing = false;
                    subscribers = [];
                    return Promise.reject(err);
                }
            }

            // Nếu đang refresh → chờ
            return new Promise((resolve) => {
                addSubscriber((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    resolve(api(originalRequest));
                });
            });
        }

        return Promise.reject(error);
    }
);

export default api;
