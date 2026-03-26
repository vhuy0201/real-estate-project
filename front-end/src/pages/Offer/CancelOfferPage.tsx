import React, { useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  CircularProgress,
  Box,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { toast, ToastContainer } from 'react-toastify';
import { OfferService } from '../../services/offerService';
import AuthContext from '../../context/AuthContext';

const CancelOfferPage: React.FC = () => {
  const { t } = useTranslation('offerManagement');
  const { id: offerId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useContext(AuthContext);
  const hasCancelled = useRef(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (hasCancelled.current) return;

    const cancelOffer = async () => {
      if (!offerId) {
        hasCancelled.current = true;
        toast.error(t('error.propertyNotFound'));
        setTimeout(() => {
          navigate('/buyer/offer');
        }, 1500);
        return;
      }

      if (!state.user || !state.token) {
        hasCancelled.current = true;
        toast.error(t('error.loginRequired'));
        setTimeout(() => {
          navigate('/login');
        }, 1500);
        return;
      }

      if (state.user.role?.toLowerCase() !== 'buyer') {
        hasCancelled.current = true;
        toast.error(t('error.onlyBuyerCanCreate'));
        setTimeout(() => {
          navigate('/home');
        }, 1500);
        return;
      }

      try {
        hasCancelled.current = true;
        await OfferService.cancelOffer(offerId);
        toast.success(t('list.cancelSuccess'));
        
        setTimeout(() => {
          navigate('/buyer/offer');
        }, 1500);
      } catch (error: any) {
        toast.error(error?.message || t('list.cancelError'));
        setTimeout(() => {
          navigate('/buyer/offer');
        }, 2000);
      }
    };

    cancelOffer();
  }, [offerId, state.user, state.token, navigate, t]);

  return (
    <Container
      sx={{
        mt: isMobile ? 2 : 4,
        mb: isMobile ? 2 : 4,
        px: isMobile ? 2 : 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: isMobile ? '40vh' : '50vh',
      }}
    >
      <Box sx={{ textAlign: 'center', maxWidth: 420 }}>
        <CircularProgress />
        <Typography variant={isMobile ? 'subtitle1' : 'h6'} mt={2} px={isMobile ? 1 : 0}>
          {t('list.cancelOffer')}...
        </Typography>
      </Box>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Container>
  );
};

export default CancelOfferPage;

