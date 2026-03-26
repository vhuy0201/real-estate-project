import { api } from './api';
import * as FileSystem from 'expo-file-system';

export interface UpdateProfileParams {
  fullName?: string;
  phone?: string;
}

export interface ChangePasswordParams {
  oldPassword: string;
  newPassword: string;
}

export interface UserProfile {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export const profileService = {
  /** GET /client/profile */
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get('/client/profile');
    return response.data.data; // backend wraps in { success, message, data }
  },

  /** PUT /client/profile (multipart/form-data for avatar upload) */
  updateProfile: async (data: UpdateProfileParams, avatarUri?: string): Promise<UserProfile> => {
    const formData = new FormData();

    if (data.fullName) formData.append('fullName', data.fullName);
    if (data.phone) formData.append('phone', data.phone);

    if (avatarUri) {
      const fileName = avatarUri.split('/').pop() || 'avatar.jpg';
      const match = /\.(\w+)$/.exec(fileName);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('avatar', {
        uri: avatarUri,
        name: fileName,
        type,
      } as any);
    }

    const response = await api.put('/client/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  /** PATCH /client/profile/change-password */
  changePassword: async (data: ChangePasswordParams): Promise<string> => {
    const response = await api.patch('/client/profile/change-password', data);
    return response.data.message;
  },
};
