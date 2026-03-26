import api from "./api";

export const forgotResetPasswordApi = {
    forgotPassword: (email: string) =>
        api.post("/api/client/auth/forgot-password", { email }),

    resetPassword: (token: string, newPassword: string) =>
        api.post("/api/client/auth/reset-password", { token, newPassword }),
};
