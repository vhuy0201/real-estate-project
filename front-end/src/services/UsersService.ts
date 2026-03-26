import type { User, UpdateProfileDto, ChangePasswordDto } from '../types/User';
import api from '../api/api';

export const UserService = {
  getProfile: async (): Promise<User> => {
    try {
      const response = await api.get('/api/client/profile');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to fetch profile');
    }
  },

  updateProfile: async (data: UpdateProfileDto): Promise<User> => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === 'avatar' && value instanceof File) {
            formData.append('avatar', value);
          } else {
            formData.append(key, String(value));
          }
        }
      });

      const response = await api.put('/api/client/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to update profile');
    }
  },
  
  changePassword: async (data: ChangePasswordDto): Promise<void> => {
    try {
      const { confirmPassword, ...payload } = data;
      await api.patch('/api/client/profile/change-password', payload);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to change password';
      throw new Error(message);
    }
  }
};