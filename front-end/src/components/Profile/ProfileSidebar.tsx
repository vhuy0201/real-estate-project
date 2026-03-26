import React from 'react';
import { NavLink } from 'react-router-dom';
import { Box, Typography, Avatar, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import MailIcon from '@mui/icons-material/Mail';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { getLanguage, type Lang } from '../../utils/storage';
import { useTranslation } from 'react-i18next';

interface ProfileSidebarProps {
  user: {
    fullName: string;
    avatar?: string;
  };
}

export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ user }) => {
  const [currentLang, setCurrentLang] = React.useState<Lang>(getLanguage());
  const { t } = useTranslation('profile');

  React.useEffect(() => {
    const interval = setInterval(() => setCurrentLang(getLanguage()), 100);
    return () => clearInterval(interval);
  }, []);
  return (
    <Box
      sx={{
        width: { xs: '100%', md: 240 },
        backgroundColor: 'rgb(234, 249, 249)',
        minHeight: { xs: 'auto', md: '100vh' },
        borderRight: { xs: 'none', md: '1px solid rgb(224, 224, 224)' },
        borderBottom: { xs: '1px solid rgb(224, 224, 224)', md: 'none' },
        py: 3,
        px: 2,
        position: { xs: 'relative', md: 'sticky' },
        top: { md: 0 },
        zIndex: 1,
        mb: { xs: 2, md: 0 }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, px: 1 }}>
        <Avatar
          src={user.avatar}
          sx={{
            width: 48,
            height: 48,
            backgroundColor: '#1967d2',
            color: '#ffffff',
            fontWeight: 600
          }}
        >
          {user.fullName.charAt(0)}
        </Avatar>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          {user.fullName}
        </Typography>
      </Box>

      <List sx={{ p: 0, display: { xs: 'grid', md: 'block' }, gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr', md: 'none' }, gap: { xs: 1, md: 0 } }}>
        <ListItem
          component={NavLink}
          to="/"
          sx={{
            py: 1.5,
            px: 2,
            borderRadius: 1,
            mb: 0.5,
            color: '#5f6368',
            textDecoration: 'none',
            '&:hover': { backgroundColor: '#e8eaed' },
            '&.active': {
              backgroundColor: '#e8f0fe',
              color: '#1967d2',
              '& .MuiListItemIcon-root': { color: '#1967d2' }
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary={t('home')} />
        </ListItem>

        <ListItem
          component={NavLink}
          to="/dwello/myProperties"
          sx={{
            py: 1.5,
            px: 2,
            borderRadius: 1,
            mb: 0.5,
            color: '#5f6368',
            textDecoration: 'none',
            '&:hover': { backgroundColor: '#e8eaed' },
            '&.active': {
              backgroundColor: '#e8f0fe',
              color: '#1967d2',
              '& .MuiListItemIcon-root': { color: '#1967d2' }
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
            <MailIcon />
          </ListItemIcon>
          <ListItemText primary={t('newPost')} />
        </ListItem>

        <ListItem
          component={NavLink}
          to="/manage-posts"
          sx={{
            py: 1.5,
            px: 2,
            borderRadius: 1,
            mb: 0.5,
            color: '#5f6368',
            textDecoration: 'none',
            '&:hover': { backgroundColor: '#e8eaed' },
            '&.active': {
              backgroundColor: '#e8f0fe',
              color: '#1967d2',
              '& .MuiListItemIcon-root': { color: '#1967d2' }
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
            <ManageAccountsIcon />
          </ListItemIcon>
          <ListItemText primary={t('manageListings')} />
        </ListItem>

        <ListItem
          component={NavLink}
          to="/notifications"
          sx={{
            py: 1.5,
            px: 2,
            borderRadius: 1,
            mb: 0.5,
            color: '#5f6368',
            textDecoration: 'none',
            '&:hover': { backgroundColor: '#e8eaed' },
            '&.active': {
              backgroundColor: '#e8f0fe',
              color: '#1967d2',
              '& .MuiListItemIcon-root': { color: '#1967d2' }
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
            <NotificationsIcon />
          </ListItemIcon>
          <ListItemText primary={t('notification')} />
        </ListItem>
      </List>

      <Box sx={{ mt: 4, px: 2 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
          {t('accountBalance')}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {t('adAccount')}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            0
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {t('promotionalAccount')}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            0
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
