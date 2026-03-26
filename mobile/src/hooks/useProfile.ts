import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/auth/authSlice';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  profileService,
  UpdateProfileParams,
  ChangePasswordParams,
  UserProfile,
} from '../services/profileService';

export const useProfile = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { token } = useSelector((state: RootState) => state.auth);

  // ── Fetch profile ──
  const profileQuery = useQuery<UserProfile>({
    queryKey: ['profile'],
    queryFn: profileService.getProfile,
  });

  // ── Helper to parse validation error string ──
  const getErrorMessage = (error: any, defaultMsg: string) => {
    let msg = error?.response?.data?.message || defaultMsg;
    if (typeof msg === 'string' && msg.includes('Validation failed:')) {
      try {
        const jsonStart = msg.indexOf('[');
        if (jsonStart !== -1) {
          const jsonStr = msg.substring(jsonStart);
          const errors = JSON.parse(jsonStr);
          if (Array.isArray(errors)) {
            return errors.map((err: any) => `• ${err.msg}`).join('\n');
          }
        }
      } catch {
        // Fallback to original layout
      }
    }
    return msg;
  };

  // ── Update profile ──
  const updateProfileMutation = useMutation({
    mutationFn: ({ data, avatarUri }: { data: UpdateProfileParams; avatarUri?: string }) =>
      profileService.updateProfile(data, avatarUri),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      // Also update Redux store so the whole app reflects changes immediately
      if (token) {
        dispatch(
          setCredentials({
            user: {
              id: updatedUser._id,
              _id: updatedUser._id,
              email: updatedUser.email,
              role: updatedUser.role,
              fullName: updatedUser.fullName,
              avatar: updatedUser.avatar,
              phone: updatedUser.phone,
            },
            token,
          })
        );
      }
      Alert.alert('Thành công', 'Cập nhật hồ sơ thành công!');
    },
    onError: (error: any) => {
      Alert.alert('Lỗi cập nhật', getErrorMessage(error, 'Cập nhật hồ sơ thất bại.'));
    },
  });

  // ── Change password ──
  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordParams) => profileService.changePassword(data),
    onSuccess: (message) => {
      Alert.alert('Thành công', message || 'Đổi mật khẩu thành công!');
    },
    onError: (error: any) => {
      Alert.alert('Lỗi', getErrorMessage(error, 'Đổi mật khẩu thất bại.'));
    },
  });

  return {
    // Profile data
    profile: profileQuery.data,
    isLoadingProfile: profileQuery.isLoading,
    refetchProfile: profileQuery.refetch,

    // Update profile
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,

    // Change password
    changePassword: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isPending,
  };
};
