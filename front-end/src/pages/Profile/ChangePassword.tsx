import React, { useState } from 'react';
import type { ChangePasswordDto } from '../../types/User';
import { UserService } from '../../services/UsersService';
import { PasswordForm } from '../../components/Profile/PasswordForm';
import { toast } from 'react-toastify';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export const ChangePassword: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation('profile');

  const handleChangePassword = async (data: ChangePasswordDto) => {
    setIsLoading(true);
    try {
      await UserService.changePassword(data);
      toast.success(t('passwordChangedSuccess'));
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error instanceof Error ? error.message : t('unableToChangePassword'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        {t('changePassword')}
      </Typography>
      <PasswordForm
        onSubmit={handleChangePassword}
        isLoading={isLoading}
      />
    </Box>
  );
};