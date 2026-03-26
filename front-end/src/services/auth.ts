import { http } from './api';
import api from '../api/api';

export interface RegisterPayload {
  fullName: string;
  email: string;
  phone: number;
  password: string;
  role?: 'buyer' | 'seller' | 'agent' | 'admin';
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface RegisterResult {
  userId: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role?: string;
  };
  token?: string;
}

export async function register(payload: RegisterPayload) {
  return http<ApiResponse<RegisterResult>>('/client/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function verifyEmail(payload: { userId: string; otp: string }) {
  const res = await api.post('/api/client/auth/verify-email', payload);
  return res.data;
}


export async function resendOtp(payload: { userId: string; email: string }) {
  const res = await api.post('/api/client/auth/resend-verification', payload);
  return res.data;
}
