import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CancelIcon from '@mui/icons-material/Cancel';
import DescriptionIcon from '@mui/icons-material/Description';
import type { Offer, OfferStatus } from '../../types/Offer';
import { getLanguage } from '../../utils/storage';
import { formatCurrency, getStatusColorConfig } from '../../utils/offerUtils';
import PlaceIcon from '@mui/icons-material/Place';

interface OfferListProps {
  offers: Offer[];
  onCancelOffer: (offerId: string) => Promise<void>;
  isLoading?: boolean;
  filters?: {
    status?: OfferStatus;
  };
  onFilterChange?: (status?: OfferStatus) => void;
}

export const OfferList: React.FC<OfferListProps> = ({
  offers,
  onCancelOffer,
  isLoading = false,
  filters,
  onFilterChange,
}) => {
  const { t } = useTranslation('offerManagement');
  const lang = getLanguage();
  const navigate = useNavigate();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const handleCancelClick = (offerId: string) => {
    setSelectedOfferId(offerId);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedOfferId) return;

    try {
      setCancelling(true);
      navigate(`/buyer/offer/${selectedOfferId}/cancel`);
      setCancelDialogOpen(false);
      setSelectedOfferId(null);
    } catch (error) {
    } finally {
      setCancelling(false);
    }
  };

  const handleFilterChange = (status: OfferStatus | 'all') => {
    if (onFilterChange) {
      onFilterChange(status === 'all' ? undefined : status);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (offers.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          {t('list.noOffers')}
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {onFilterChange && (
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>{t('list.filter.filterByStatus')}</InputLabel>
          <Select
            value={filters?.status || 'all'}
            label={t('list.filter.filterByStatus')}
            onChange={(e) => handleFilterChange(e.target.value as OfferStatus | 'all')}
          >
            <MenuItem value="all">{t('list.filter.all')}</MenuItem>
            <MenuItem value="pending">{t('list.status.pending')}</MenuItem>
            <MenuItem value="forwarded_to_seller">{t('list.status.forwarded_to_seller')}</MenuItem>
            <MenuItem value="seller_reviewing">{t('list.status.seller_reviewing')}</MenuItem>
            <MenuItem value="accepted">{t('list.status.accepted')}</MenuItem>
            <MenuItem value="rejected">{t('list.status.rejected')}</MenuItem>
            <MenuItem value="cancelled">{t('list.status.cancelled')}</MenuItem>
          </Select>
        </FormControl>
      )}

      <Stack spacing={3}>
        {offers.map((offer) => {
          const property = typeof offer.property_id === 'object' 
            ? offer.property_id 
            : null;
          
          const propertyTitle = property
            ? (typeof property.title === 'object' ? property.title[lang] : property.title)
            : 'Property';
          
          const propertyAddress = property
            ? (typeof property.address === 'object' ? property.address[lang] : property.address)
            : '';

          const statusColors = getStatusColorConfig(offer.status);

          return (
            <Paper 
              key={offer._id} 
              elevation={2} 
              sx={{ 
                p: 3,
                borderRadius: 3,
                border: `1px solid ${statusColors.borderColor}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Typography 
                variant="h5" 
                fontWeight="bold" 
                mb={1.5}
                sx={{ 
                  color: '#1a1a1a',
                  fontSize: '1.25rem',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
              >
                {propertyTitle}
              </Typography>

              {propertyAddress && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                  <PlaceIcon sx={{ fontSize: 18, color: '#666666' }} />
                  <Typography 
                    variant="body2"
                    sx={{ 
                      color: '#666666',
                      fontSize: '0.9rem',
                    }}
                  >
                    {propertyAddress}
                  </Typography>
                </Box>
              )}

              <Chip
                label={t(`list.status.${offer.status}`)}
                size="small"
                sx={{ 
                  mb: 2.5,
                  backgroundColor: statusColors.backgroundColor,
                  color: statusColors.color,
                  border: `1px solid ${statusColors.borderColor}`,
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  height: 28,
                }}
              />

              <Box 
                mb={2.5}
                sx={{
                  position: 'relative',
                  pl: 3,
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 4,
                    backgroundColor: '#4CAF50',
                    borderRadius: 2,
                  }}
                />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#4CAF50',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    mb: 0.5,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  {t('list.proposedPrice')}
                </Typography>
                <Typography 
                  variant="h4" 
                  fontWeight="bold"
                  sx={{
                    color: '#1a1a1a',
                    fontSize: '1.75rem',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  }}
                >
                  {formatCurrency(offer.amount)} ₫
                </Typography>
              </Box>

              <Stack direction="row" spacing={2} mb={2.5} flexWrap="wrap">
                <Typography 
                  variant="body2"
                  sx={{ 
                    color: '#666666',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  <CalendarTodayIcon sx={{ fontSize: 16, color: '#999999' }} />
                  {t('list.created')} {offer.createdAt ? new Date(offer.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                </Typography>
                <Typography 
                  variant="body2"
                  sx={{ 
                    color: '#666666',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  <AccessTimeIcon sx={{ fontSize: 16, color: '#999999' }} />
                  {t('list.validUntil')} {offer.expires_at ? new Date(offer.expires_at).toLocaleDateString('vi-VN') : 'N/A'}
                </Typography>
              </Stack>

              {offer.note && (
                <Box 
                  mb={2}
                  sx={{
                    border: '1px solid #B3E5FC',
                    borderRadius: 2,
                    p: 2,
                    backgroundColor: '#FAFAFA',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <DescriptionIcon sx={{ fontSize: 18, color: '#2196F3' }} />
                    <Typography 
                      variant="body2" 
                      fontWeight="bold"
                      sx={{ 
                        color: '#333333',
                        fontSize: '0.875rem',
                      }}
                    >
                      {t('list.note')}
                    </Typography>
                  </Box>
                  <Typography 
                    variant="body1"
                    sx={{ 
                      color: '#1a1a1a',
                      fontSize: '0.95rem',
                      lineHeight: 1.6,
                    }}
                  >
                    {offer.note}
                  </Typography>
                </Box>
              )}

              {offer.rejection_reason && (
                <Box mb={2}>
                  <Typography variant="body2" color="error" mb={0.5}>
                    {t('list.rejectionReasonLabel')}
                  </Typography>
                  <Typography variant="body2" color="error">
                    {offer.rejection_reason}
                  </Typography>
                </Box>
              )}

              {offer.status === 'pending' && (
                <Box display="flex" justifyContent="flex-end" mt={2}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<CancelIcon />}
                    onClick={() => handleCancelClick(offer._id)}
                    sx={{
                      backgroundColor: '#F44336',
                      color: 'white',
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: '#D32F2F',
                      },
                    }}
                  >
                    {t('list.cancelOffer')}
                  </Button>
                </Box>
              )}
            </Paper>
          );
        })}
      </Stack>

      <Dialog
        open={cancelDialogOpen}
        onClose={() => !cancelling && setCancelDialogOpen(false)}
      >
        <DialogTitle>{t('list.cancelOffer')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('list.cancelConfirm')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setCancelDialogOpen(false)}
            disabled={cancelling}
          >
            {t('list.cancel')}
          </Button>
          <Button
            onClick={handleCancelConfirm}
            color="error"
            variant="contained"
            disabled={cancelling}
          >
            {cancelling ? t('list.processing') : t('list.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

