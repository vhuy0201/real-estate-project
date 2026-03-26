import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Stack,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DescriptionIcon from '@mui/icons-material/Description';
import ForwardIcon from '@mui/icons-material/Forward';
import VisibilityIcon from '@mui/icons-material/Visibility';
import type { Offer } from '../../types/Offer';
import { getLanguage } from '../../utils/storage';
import { formatCurrency, getStatusColorConfig } from '../../utils/offerUtils';
import PlaceIcon from '@mui/icons-material/Place';

interface AgentOfferListProps {
  offers: Offer[];
  onForwardOffer: (offerId: string) => Promise<void>;
  isLoading?: boolean;
  onViewDetail?: (offerId: string) => void;
}

export const AgentOfferList: React.FC<AgentOfferListProps> = ({
  offers,
  onForwardOffer,
  isLoading = false,
  onViewDetail,
}) => {
  const { t } = useTranslation('offerManagement');
  const lang = getLanguage();
  const navigate = useNavigate();
  const [forwardDialogOpen, setForwardDialogOpen] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleForwardClick = (offerId: string) => {
    setSelectedOfferId(offerId);
    setForwardDialogOpen(true);
  };

  const handleForwardConfirm = async () => {
    if (!selectedOfferId) return;

    try {
      setProcessing(true);
      await onForwardOffer(selectedOfferId);
      setForwardDialogOpen(false);
      setSelectedOfferId(null);
    } catch (error) {
    } finally {
      setProcessing(false);
    }
  };

  const handleViewDetail = (offerId: string) => {
    if (onViewDetail) {
      onViewDetail(offerId);
    } else {
      navigate(`/agent/offers/${offerId}`);
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
          {t('agentList.noOffers')}
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
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

          const buyer = typeof offer.buyer_id === 'object' ? offer.buyer_id : null;
          const seller = typeof offer.seller_id === 'object' ? offer.seller_id : null;

          const statusColors = getStatusColorConfig(offer.status);
          const canForward = offer.status === 'pending';

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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography 
                    variant="h5" 
                    fontWeight="bold" 
                    mb={1}
                    sx={{ 
                      color: '#1a1a1a',
                      fontSize: '1.25rem',
                    }}
                  >
                    {propertyTitle}
                  </Typography>

                  {propertyAddress && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
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
                </Box>
                <Chip
                  label={t(`list.status.${offer.status}`)}
                  size="small"
                  sx={{ 
                    backgroundColor: statusColors.backgroundColor,
                    color: statusColors.color,
                    border: `1px solid ${statusColors.borderColor}`,
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    height: 28,
                  }}
                />
              </Box>

              {buyer && (
                <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="body2" fontWeight="bold" mb={0.5}>
                    {t('agentList.buyerInfo')}:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {buyer.fullName} - {buyer.email}
                    {buyer.phone && ` - ${buyer.phone}`}
                  </Typography>
                </Box>
              )}

              {seller && (
                <Box sx={{ mb: 2, p: 2, bgcolor: 'green.50', borderRadius: 2 }}>
                  <Typography variant="body2" fontWeight="bold" mb={0.5}>
                    {t('agentList.sellerInfo')}:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {seller.fullName} - {seller.email}
                    {seller.phone && ` - ${seller.phone}`}
                  </Typography>
                </Box>
              )}

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
                  }}
                >
                  {formatCurrency(offer.amount)} ₫
                </Typography>
                {property && (
                  <Typography variant="body2" color="text.secondary" mt={0.5}>
                    {t('agentList.listedPrice')}: {formatCurrency(property.price)} ₫
                  </Typography>
                )}
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

              {offer.forwarded_at && (
                <Box mb={2} sx={{ p: 1.5, bgcolor: '#E3F2FD', borderRadius: 2 }}>
                  <Typography variant="body2" color="info.main">
                    {t('agentList.forwardedAt')}: {new Date(offer.forwarded_at).toLocaleString('vi-VN')}
                  </Typography>
                </Box>
              )}

              <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                <Button
                  variant="outlined"
                  size="medium"
                  startIcon={<VisibilityIcon />}
                  onClick={() => handleViewDetail(offer._id)}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  {t('agentList.viewDetail')}
                </Button>
                {canForward && (
                  <Button
                    variant="contained"
                    color="primary"
                    size="medium"
                    startIcon={<ForwardIcon />}
                    onClick={() => handleForwardClick(offer._id)}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    {t('agentList.forward')}
                  </Button>
                )}
              </Box>
            </Paper>
          );
        })}
      </Stack>

      <Dialog
        open={forwardDialogOpen}
        onClose={() => !processing && setForwardDialogOpen(false)}
      >
        <DialogTitle>{t('agentList.forwardOffer')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('agentList.forwardConfirm')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setForwardDialogOpen(false)}
            disabled={processing}
          >
            {t('list.cancel')}
          </Button>
          <Button
            onClick={handleForwardConfirm}
            color="primary"
            variant="contained"
            disabled={processing}
          >
            {processing ? t('list.processing') : t('list.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

