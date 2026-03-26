import { api } from './api';

export interface LoginParams {
  email?: string;
  password?: string;
}

export interface RegisterParams {
  fullName?: string;
  email?: string;
  password?: string;
  role?: string;
}

export interface VerifyEmailParams {
  userId: string;
  otp: string;
}

export interface ResendOtpParams {
  userId: string;
  email: string;
}

export const authService = {
  login: async (credentials: LoginParams) => {
    const response = await api.post('/client/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterParams) => {
    const response = await api.post('/client/auth/register', data);
    return response.data;
  },

  verifyEmail: async (data: VerifyEmailParams) => {
    const response = await api.post('/client/auth/verify-email', data);
    return response.data;
  },

  resendOtp: async (data: ResendOtpParams) => {
    const response = await api.post('/client/auth/resend-verification', data);
    return response.data;
  },

  googleLogin: async (idToken: string) => {
    // Assuming backend takes { idToken: "..." } or similar
    const response = await api.post('/client/auth/google', { token: idToken });
    return response.data;
  }
};
