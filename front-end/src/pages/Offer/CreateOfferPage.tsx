import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Button,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useTranslation } from 'react-i18next';
import { toast, ToastContainer } from 'react-toastify';
import { OfferForm } from '../../components/Offer/OfferForm';
import { OfferService } from '../../services/offerService';
import type { CreateOfferDto } from '../../types/Offer';
import type { Property } from '../../types/Property';
import { getDetailPropertiesById } from '../../services/propertyService';
import AuthContext from '../../context/AuthContext';

const CreateOfferPage: React.FC = () => {
  const { t } = useTranslation('offerManagement');
  const { id: propertyId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useContext(AuthContext);

  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!state.loading) {
      if (!state.user || !state.token) {
        toast.error(t('error.loginRequired'));
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else if (state.user.role?.toLowerCase() !== 'buyer') {
        toast.error(t('error.onlyBuyerCanCreate'));
        setTimeout(() => {
          navigate('/home');
        }, 1500);
      }
    }
  }, [state.loading, state.user, state.token, navigate]);

  useEffect(() => {
    if (propertyId) {
      const loadProperty = async () => {
        try {
          setIsLoading(true);
          const data = await getDetailPropertiesById(propertyId);
          setProperty(data);
        } catch (error: any) {
          toast.error(error?.message || t('error.propertyNotFound'));
        } finally {
          setIsLoading(false);
        }
      };
      loadProperty();
    }
  }, [propertyId]);

  const handleSubmitOffer = async (data: CreateOfferDto) => {
    if (!state.user || !state.token) {
      toast.error(t('error.loginRequired'));
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      return;
    }

    if (state.user.role?.toLowerCase() !== 'buyer') {
      toast.error(t('error.onlyBuyerCanCreate'));
      setTimeout(() => {
        navigate('/home');
      }, 1500);
      return;
    }

    try {
      setIsSubmitting(true);
      await OfferService.createOffer(data);
      toast.success(t('success.offerCreated'));

      navigate('/buyer/offer');
    } catch (error: any) {
      toast.error(error?.message || t('error.createFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (state.loading || isLoading) {
    return (
      <Container sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!state.user || !state.token || state.user.role?.toLowerCase() !== 'buyer') {
    return null;
  }

  if (!property) {
    return (
      <Container sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" mb={2}>
          {t('createTitle')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('error.propertyNotFound')}
        </Typography>
      </Container>
    );
  }

  return (
    <Container
      sx={{
        mt: { xs: 2, sm: 3, md: 4 },
        mb: { xs: 2, sm: 3, md: 4 },
        px: { xs: 1.5, sm: 2, md: 3 },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          mb: { xs: 1, sm: 2 },
          gap: { xs: 1.5, sm: 0 },
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight="bold"
            mb={1}
            sx={{
              color: '#1976D2',
              letterSpacing: '-0.02em',
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontSize: { xs: '1.6rem', sm: '2rem' },
            }}
          >
            {t('createTitle')}
          </Typography>

          <Typography
            variant="body1"
            mb={{ xs: 2, sm: 4 }}
            sx={{
              color: '#424242',
              fontSize: { xs: '0.85rem', sm: '0.95rem' },
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              maxWidth: { xs: '90%', sm: '100%' },
            }}
          >
            {t('subtitle')}
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{
            backgroundColor: '#90CAF9',
            color: 'white',
            fontWeight: 600,
            textTransform: 'none',
            fontSize: { xs: '0.85rem', sm: '0.95rem' },
            px: { xs: 2, sm: 3 },
            py: { xs: 1, sm: 1.5 },
            borderRadius: 2,
            alignSelf: { xs: 'flex-start', sm: 'center' },
            boxShadow: '0 2px 8px rgba(144, 202, 249, 0.3)',
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            '&:hover': {
              backgroundColor: '#64B5F6',
              boxShadow: '0 4px 12px rgba(144, 202, 249, 0.4)',
            },
          }}
        >
          {t('back')}
        </Button>
      </Box>

      <OfferForm property={property} onSubmit={handleSubmitOffer} isLoading={isSubmitting} />

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

export default CreateOfferPage;

