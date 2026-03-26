import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import * as SecureStore from 'expo-secure-store';
import { authService, LoginParams, RegisterParams, VerifyEmailParams, ResendOtpParams } from '../services/authService';
import { setCredentials } from '../store/auth/authSlice';
import { Alert } from 'react-native';

export const useAuth = () => {
  const dispatch = useDispatch();

  const handleAuthSuccess = async (response: any) => {
    // response là dữ liệu trả về từ authService (response.data)
    // Cấu trúc backend: { success: true, data: { user: {...}, accessToken: "..." } }
    const authData = response.data || {};
    const token = authData.accessToken || response.token || 'fallback_token';
    const user = authData.user || response.user || { email: 'unknown' };
    
    await SecureStore.setItemAsync('userToken', token);
    dispatch(setCredentials({ user, token }));
  };

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginParams) => authService.login(credentials),
    onSuccess: handleAuthSuccess,
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Login failed! Please check your credentials.';
      Alert.alert('Error', message);
    }
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterParams) => authService.register(data),
    onSuccess: () => {
      // Intentionally not showing Alert here because we will navigate to VerifyEmail screen
    },
    onError: (error: any) => {
      const apiMsg = error?.response?.data?.message;
      const netMsg =
        error?.message === 'Network Error'
          ? 'Không kết nối được server. Kiểm tra Wi‑Fi, IP trong mobile/.env (EXPO_PUBLIC_API_URL), và backend đang chạy.'
          : error?.code === 'ECONNABORTED'
            ? 'Request quá lâu (timeout). Kiểm tra backend và mạng.'
            : null;
      const message =
        (typeof apiMsg === 'string' && apiMsg) || netMsg || error?.message || 'Đăng ký thất bại.';
      Alert.alert('Lỗi', message);
    }
  });

  const verifyEmailMutation = useMutation({
    mutationFn: (data: VerifyEmailParams) => authService.verifyEmail(data),
    onSuccess: handleAuthSuccess,
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Verification failed! Invalid OTP.';
      Alert.alert('Error', message);
    }
  });

  const resendOtpMutation = useMutation({
    mutationFn: (data: ResendOtpParams) => authService.resendOtp(data),
    onSuccess: () => {
      Alert.alert('Success', 'A new OTP has been sent to your email.');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to resend OTP.';
      Alert.alert('Error', message);
    }
  });

  const googleLoginMutation = useMutation({
    mutationFn: (idToken: string) => authService.googleLogin(idToken),
    onSuccess: handleAuthSuccess,
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Google Login failed!';
      Alert.alert('Error', message);
    }
  });

  return {
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,

    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,

    verifyEmail: verifyEmailMutation.mutateAsync,
    isVerifying: verifyEmailMutation.isPending,

    resendOtp: resendOtpMutation.mutateAsync,
    isResendingOtp: resendOtpMutation.isPending,

    googleLogin: googleLoginMutation.mutateAsync,
    isGoogleLoggingIn: googleLoginMutation.isPending,
  };
};
