import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  InputAdornment,
  Alert,
  useMediaQuery,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DescriptionIcon from '@mui/icons-material/Description';
import SendIcon from '@mui/icons-material/Send';
import PlaceIcon from '@mui/icons-material/Place';
import BedIcon from '@mui/icons-material/Bed';
import BathtubIcon from '@mui/icons-material/Bathtub';
import HomeIcon from '@mui/icons-material/Home';
import type { CreateOfferDto } from '../../types/Offer';
import type { Property } from '../../types/Property';
import { getLanguage, type Lang } from '../../utils/storage';

interface OfferFormProps {
  property: Property;
  onSubmit: (data: CreateOfferDto) => Promise<void>;
  isLoading?: boolean;
}

export const OfferForm: React.FC<OfferFormProps> = ({
  property,
  onSubmit,
  isLoading = false,
}) => {
  const { t, i18n } = useTranslation('offerManagement');
  const [currentLang, setCurrentLang] = useState<Lang>(getLanguage());
  const isMobile = useMediaQuery('(max-width:900px)');

  const [formData, setFormData] = useState<CreateOfferDto>({
    property_id: property._id,
    amount: 0,
    validityPeriod: '',
    note: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayAmount, setDisplayAmount] = useState<string>('');
  const hasAgent = property.agent_id !== null && property.agent_id !== undefined;

  const nextSlide = () => {
    if (!property.images || property.images.length === 0) return;
    setCurrentIndex((prev) =>
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    if (!property.images || property.images.length === 0) return;
    setCurrentIndex((prev) =>
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  useEffect(() => {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);
    const dateString = defaultDate.toISOString().split('T')[0];
    setFormData(prev => ({
      ...prev,
      validityPeriod: dateString,
    }));
  }, []);

  useEffect(() => {
    const updateLang = () => {
      const newLang = getLanguage();
      setCurrentLang((prevLang) => {
        if (newLang !== prevLang) {
          return newLang;
        }
        return prevLang;
      });
    };
    
    updateLang();
    
    i18n.on('languageChanged', updateLang);
    
    const interval = setInterval(updateLang, 100);
    
    return () => {
      i18n.off('languageChanged', updateLang);
      clearInterval(interval);
    };
  }, [i18n]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = formData.amount <= 0
        ? t('form.priceInvalid')
        : t('form.priceRequired');
    }

    if (!formData.validityPeriod) {
      newErrors.validityPeriod = t('form.dateRequired');
    } else {
      const selectedDate = new Date(formData.validityPeriod);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (isNaN(selectedDate.getTime())) {
        newErrors.validityPeriod = t('form.dateInvalid');
      } else if (selectedDate <= today) {
        newErrors.validityPeriod = t('form.datePast');
      }
    }

    if (formData.note && formData.note.length > 500) {
      newErrors.note = t('form.notesMaxLength');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    const validityPeriodISO = new Date(formData.validityPeriod).toISOString();
    
    await onSubmit({
      ...formData,
      validityPeriod: validityPeriodISO,
    });
  };

  const formatCurrency = (value: number): string => {
    if (!value || value === 0) return '';
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^\d]/g, '');
    const numValue = rawValue ? parseInt(rawValue, 10) : 0;
    
    setFormData(prev => ({
      ...prev,
      amount: numValue,
    }));
    if (rawValue) {
      setDisplayAmount(formatCurrency(numValue));
    } else {
      setDisplayAmount('');
    }

    if (errors.amount) {
      setErrors(prev => ({
        ...prev,
        amount: '',
      }));
    }
  };

  const handleAmountBlur = () => {
    if (formData.amount > 0) {
      setDisplayAmount(formatCurrency(formData.amount));
    }
  };


  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, mb: 3, backgroundColor: '#FFFFFF' }}>
        {property.images && property.images.length > 0 && (
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: isMobile ? 300 : 400,
              mb: 2,
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <img
              src={property.images[currentIndex]}
              alt={typeof property.title === 'object' ? property.title[currentLang] : property.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: '0.4s ease',
              }}
            />

            {property.images.length > 1 && (
              <>
                <Box
                  onClick={prevSlide}
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: 10,
                    transform: 'translateY(-50%)',
                    background: 'rgba(0,0,0,0.5)',
                    color: '#fff',
                    p: '6px 10px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    userSelect: 'none',
                    fontWeight: 'bold',
                    '&:hover': {
                      background: 'rgba(0,0,0,0.7)',
                    },
                  }}
                >
                  {'<'}
                </Box>

                <Box
                  onClick={nextSlide}
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    right: 10,
                    transform: 'translateY(-50%)',
                    background: 'rgba(0,0,0,0.5)',
                    color: '#fff',
                    p: '6px 10px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    userSelect: 'none',
                    fontWeight: 'bold',
                    '&:hover': {
                      background: 'rgba(0,0,0,0.7)',
                    },
                  }}
                >
                  {'>'}
                </Box>

                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 10,
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 1,
                  }}
                >
                  {property.images.map((_: any, i: number) => (
                    <Box
                      key={i}
                      onClick={() => setCurrentIndex(i)}
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: currentIndex === i ? '#fff' : 'rgba(255,255,255,0.5)',
                        cursor: 'pointer',
                        transition: 'background 0.3s ease',
                        '&:hover': {
                          background: currentIndex === i ? '#fff' : 'rgba(255,255,255,0.8)',
                        },
                      }}
                    />
                  ))}
                </Box>
              </>
            )}
          </Box>
        )}
        <Typography 
          variant="h6" 
          fontWeight="bold" 
          mb={2}
          sx={{ 
            color: '#1a1a1a',
            fontSize: '1.25rem',
          }}
        >
          {typeof property.title === 'object' ? property.title[currentLang] : property.title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <PlaceIcon sx={{ color: '#E91E63', fontSize: 20 }} />
          <Typography 
            sx={{ 
              color: '#666666',
              fontSize: '0.9rem',
            }}
          >
            {typeof property.address === 'object' ? property.address[currentLang] : property.address}
          </Typography>
        </Box>
        
        <Box
          sx={{
            background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
            borderRadius: 2,
            p: 2.5,
            mb: 2,
            border: '1px solid #90CAF9',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <AttachMoneyIcon sx={{ fontSize: 18, color: '#666666' }} />
            <Typography variant="body2" sx={{ color: '#666666', opacity: 0.8 }}>
              {t('propertyInfo.listedPrice')}
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight="bold" sx={{ color: '#1976D2' }}>
            {formatCurrency(property.price)} ₫
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
          {property.bedrooms && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1.5,
                  backgroundColor: '#F8BBD0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BedIcon sx={{ color: '#C2185B', fontSize: 20 }} />
              </Box>
              <Typography 
                variant="body2" 
                fontWeight="medium"
                sx={{ 
                  color: '#333333',
                  fontSize: '0.875rem',
                }}
              >
                {property.bedrooms} {t('propertyInfo.bedrooms')}
              </Typography>
            </Box>
          )}
          {property.area && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1.5,
                  backgroundColor: '#C8E6C9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography sx={{ color: '#2E7D32', fontSize: 18, fontWeight: 'bold' }}>[]</Typography>
              </Box>
              <Typography 
                variant="body2" 
                fontWeight="medium"
                sx={{ 
                  color: '#333333',
                  fontSize: '0.875rem',
                }}
              >
                {property.area} m²
              </Typography>
            </Box>
          )}
          {property.bathrooms && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1.5,
                  backgroundColor: '#B3E5FC',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BathtubIcon sx={{ color: '#0277BD', fontSize: 20 }} />
              </Box>
              <Typography 
                variant="body2" 
                fontWeight="medium"
                sx={{ 
                  color: '#333333',
                  fontSize: '0.875rem',
                }}
              >
                {property.bathrooms} {t('propertyInfo.bathrooms')}
              </Typography>
            </Box>
          )}
          {property.floors && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1.5,
                  backgroundColor: '#FFE0B2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <HomeIcon sx={{ color: '#E65100', fontSize: 20 }} />
              </Box>
              <Typography 
                variant="body2" 
                fontWeight="medium"
                sx={{ 
                  color: '#333333',
                  fontSize: '0.875rem',
                }}
              >
                {property.floors} {t('propertyInfo.floors')}
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {!hasAgent && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            backgroundColor: '#FFEBEE',
            border: '1px solid #EF9A9A',
            '& .MuiAlert-icon': {
              color: '#D32F2F',
            },
          }}
        >
          <Typography variant="body2" fontWeight="bold" mb={1}>
            {t('propertyInfo.cannotCreateOffer')}
          </Typography>
          <Typography variant="body2">
            {t('propertyInfo.cannotCreateOfferMessage')}
          </Typography>
        </Alert>
      )}

      <Alert 
        severity="warning" 
        sx={{ 
          mb: 3,
          backgroundColor: '#FFF4E6',
          border: '1px solid #FFD89B',
          '& .MuiAlert-icon': {
            color: '#FF9800',
          },
        }}
      >
        <Typography variant="body2" fontWeight="bold" mb={1}>
          {t('propertyInfo.importantNote')}
        </Typography>
        <Typography variant="body2" component="div">
          <Box component="ul" sx={{ m: 0, pl: 2 }}>
            <li>{t('propertyInfo.tip')}</li>
            <li>{t('propertyInfo.agentReviewTip')}</li>
            <li>{t('propertyInfo.cancelOfferTip')}</li>
          </Box>
        </Typography>
      </Alert>

      <Paper elevation={3} sx={{ p: 3, backgroundColor: '#FAFAFA' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1.5,
              background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #90CAF9',
            }}
          >
            <DescriptionIcon sx={{ color: '#1976D2', fontSize: 20 }} />
          </Box>
          <Typography 
            variant="h6" 
            fontWeight="bold"
            sx={{ 
              color: '#1a1a1a',
              fontSize: '1.1rem',
            }}
          >
            {t('form.title')}
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography 
                variant="body2" 
                fontWeight="bold" 
                mb={1}
                sx={{ 
                  color: '#1a1a1a',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {t('form.proposedPrice')}
              </Typography>
              <TextField
                name="amount"
                placeholder={t('form.enterProposedPricePlaceholder')}
                value={displayAmount}
                onChange={handleAmountChange}
                onBlur={handleAmountBlur}
                error={!!errors.amount}
                helperText={errors.amount}
                required
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#E3F2FD',
                    '& fieldset': {
                      borderColor: '#BBDEFB',
                    },
                    '&:hover fieldset': {
                      borderColor: '#90CAF9',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#64B5F6',
                    },
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography variant="body2" color="text.secondary">
                        VNĐ
                      </Typography>
                    </InputAdornment>
                  ),
                }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <Typography 
                  variant="body2" 
                  fontWeight="medium"
                  sx={{ 
                    color: '#1976D2',
                    fontSize: '0.875rem',
                  }}
                >
                  💎 {t('propertyInfo.listedPrice')} {formatCurrency(property.price)} ₫
                </Typography>
              </Box>
            </Box>

            <Box>
              <Typography 
                variant="body2" 
                fontWeight="bold" 
                mb={1}
                sx={{ 
                  color: '#1a1a1a',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {t('form.validityPeriod')}
              </Typography>
              <TextField
                name="validityPeriod"
                type="date"
                value={formData.validityPeriod}
                onChange={handleChange}
                error={!!errors.validityPeriod}
                helperText={errors.validityPeriod || t('form.validityPeriodHelper')}
                required
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarTodayIcon sx={{ color: '#999999' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiInputBase-input': {
                    color: '#1a1a1a',
                  },
                }}
              />
            </Box>

            <Box>
              <Typography 
                variant="body2" 
                fontWeight="bold" 
                mb={1}
                sx={{ 
                  color: '#1a1a1a',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {t('form.notes')}
              </Typography>
              <TextField
                name="note"
                placeholder={t('form.notesPlaceholder')}
                value={formData.note}
                onChange={handleChange}
                error={!!errors.note}
                helperText={errors.note || `${formData.note?.length || 0}/500 ${t('form.characters')}`}
                multiline
                rows={4}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                      <DescriptionIcon sx={{ color: '#999999' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiInputBase-input': {
                    color: '#1a1a1a',
                  },
                }}
              />
            </Box>

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isLoading || !hasAgent}
              startIcon={<SendIcon />}
              sx={{ 
                mt: 2,
                background: !hasAgent 
                  ? 'linear-gradient(135deg, #9E9E9E 0%, #757575 100%)'
                  : 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
                color: 'white',
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '1rem',
                py: 1.75,
                px: 4,
                boxShadow: !hasAgent ? 'none' : '0 6px 20px rgba(25, 118, 210, 0.5)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
                  boxShadow: '0 8px 25px rgba(25, 118, 210, 0.6)',
                  transform: 'translateY(-2px)',
                },
                '&:active': {
                  transform: 'translateY(0px)',
                },
                '&:disabled': {
                  background: 'rgba(0, 0, 0, 0.12)',
                  boxShadow: 'none',
                },
              }}
            >
              {isLoading 
                ? t('form.sending') 
                : !hasAgent
                  ? t('form.cannotSendNoAgent')
                  : t('form.sendProposalNow')
              }
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

