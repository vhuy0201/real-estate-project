import React, { useEffect, useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Box, Container, Tabs, Tab, Typography } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import { ProfileSidebar } from '../../components/Profile/ProfileSidebar';
import { UserService } from '../../services/UsersService';
import type { User } from '../../types/User';
import { useTranslation } from 'react-i18next';

export const ProfileLayout: React.FC = () => {
  const [value, setValue] = React.useState(
    window.location.pathname.includes('change-password') ? 1 : 0
  );
  const [user, setUser] = useState<User | null>(null);
  const { t } = useTranslation('profile');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await UserService.getProfile();
      setUser(data);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  if (!user) {
    return <Box>{t('loading')}</Box>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Box sx={{ flexShrink: 0, display: { xs: 'none', md: 'block' } }}>
        <ProfileSidebar user={user} />
      </Box>

      <Box sx={{ flex: 1 }}>
        <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, md: 3 } }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            {t('accountManagement')}
          </Typography>
          
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, overflowX: 'auto' }}>
            <Tabs value={value} onChange={handleChange} variant="scrollable" scrollButtons="auto">
              <Tab 
                label={t('updateInformation')} 
                component={NavLink}
                to="/profile/info"
                sx={{ textTransform: 'none', fontSize: { xs: '0.95rem', md: '1rem' } }}
              />
              <Tab 
                label={t('accountSettings')} 
                component={NavLink}
                to="/profile/change-password"
                sx={{ textTransform: 'none', fontSize: { xs: '0.95rem', md: '1rem' } }}
              />
            </Tabs>
          </Box>

          <Outlet context={{ user, setUser }} />
        </Container>
      </Box>
    </Box>
  );
};