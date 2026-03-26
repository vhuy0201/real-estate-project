import React, { useState } from 'react';
import type { ChangePasswordDto } from '../../types/User';
import { Box, TextField, Button, Typography } from '@mui/material';
import { getLanguage, type Lang } from '../../utils/storage';
import { useTranslation } from 'react-i18next';
import { validatePassword } from '@/utils/validation';

interface PasswordFormProps {
  onSubmit: (data: ChangePasswordDto) => Promise<void>;
  isLoading?: boolean;
}

export const PasswordForm: React.FC<PasswordFormProps> = ({
  onSubmit,
  isLoading
}) => {
  const [currentLang, setCurrentLang] = useState<Lang>(getLanguage());
  const { t } = useTranslation('profile');

  React.useEffect(() => {
    const interval = setInterval(() => setCurrentLang(getLanguage()), 100);
    return () => clearInterval(interval);
  }, []);
  const [formData, setFormData] = useState<ChangePasswordDto>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'newPassword') {
      if (!validatePassword(value)) {
        setErrors(prev => ({
          ...prev,
          newPassword: t('passwordMustBeAtLeast8')
        }));
      } else {
        setErrors(prev => ({ ...prev, newPassword: '' }));
      }
    }

    if (name === 'confirmPassword') {
      if (value !== formData.newPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: t('passwordMismatch') }));
      } else {
        setErrors(prev => ({ ...prev, confirmPassword: '' }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword(formData.newPassword)) {
      setErrors(prev => ({
        ...prev,
        newPassword: t('passwordMustBeAtLeast8')
      }));
      return;
    }
    if (formData.confirmPassword !== formData.newPassword) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: t('passwordMismatch')
      }));
      return;
    }
    if (Object.values(errors).some(error => error)) return;
    await onSubmit(formData);
  };


  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Box sx={{ display: 'grid', gap: 2.5, maxWidth: 1000 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '200px 1fr' }, alignItems: { md: 'center' }, gap: 2 }}>
          <Typography>{t('currentPassword')}</Typography>
          <TextField
            fullWidth
            type="password"
            name="oldPassword"
            value={formData.oldPassword}
            onChange={handleChange}
            required
            placeholder={t('enterPassword')}
            size="small"
          />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '200px 1fr' }, alignItems: { md: 'center' }, gap: 2 }}>
          <Typography>{t('newPassword')}</Typography>
          <TextField
            fullWidth
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            error={!!errors.newPassword}
            helperText={errors.newPassword}
            required
            placeholder={t('enterNewPassword')}
            size="small"
          />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '200px 1fr' }, alignItems: { md: 'center' }, gap: 2 }}>
          <Typography>{t('confirmPassword')}</Typography>
          <TextField
            fullWidth
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            required
            placeholder={t('confirmNewPassword')}
            size="small"
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: { xs: 'stretch', md: 'flex-end' }, mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            sx={{
              textTransform: 'none',
              px: { xs: 2.5, md: 4 },
              bgcolor: '#1f61cc',
              '&:hover': {
                bgcolor: '#4B5563'
              }
            }}
          >
            💾 {isLoading ? t('saving') : t('saveChanges')}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};