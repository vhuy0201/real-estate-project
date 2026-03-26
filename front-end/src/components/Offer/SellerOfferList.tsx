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
  TextField,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import type { Offer } from '../../types/Offer';
import { getLanguage } from '../../utils/storage';
import { formatCurrency, getStatusColorConfig } from '../../utils/offerUtils';
import PlaceIcon from '@mui/icons-material/Place';

interface SellerOfferListProps {
  offers: Offer[];
  onAcceptOffer: (offerId: string) => Promise<void>;
  onRejectOffer: (offerId: string, reason?: string) => Promise<void>;
  isLoading?: boolean;
  onViewDetail?: (offerId: string) => void;
}

export const SellerOfferList: React.FC<SellerOfferListProps> = ({
  offers,
  onAcceptOffer,
  onRejectOffer,
  isLoading = false,
  onViewDetail,
}) => {
  const { t } = useTranslation('offerManagement');
  const lang = getLanguage();
  const navigate = useNavigate();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleRejectClick = (offerId: string) => {
    setSelectedOfferId(offerId);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  const handleAcceptClick = (offerId: string) => {
    setSelectedOfferId(offerId);
    setAcceptDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedOfferId || !rejectionReason.trim()) {
      return;
    }

    try {
      setProcessing(true);
      await onRejectOffer(selectedOfferId, rejectionReason);
      setRejectDialogOpen(false);
      setSelectedOfferId(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting offer:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleAcceptConfirm = async () => {
    if (!selectedOfferId) return;

    try {
      setProcessing(true);
      await onAcceptOffer(selectedOfferId);
      setAcceptDialogOpen(false);
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
      navigate(`/seller/offers/${offerId}`);
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
          {t('sellerList.noOffers')}
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
          const agent = typeof offer.agent_id === 'object' ? offer.agent_id : null;

          const statusColors = getStatusColorConfig(offer.status);
          const canAccept = offer.status === 'forwarded_to_seller' || offer.status === 'seller_reviewing';
          const canReject = offer.status === 'forwarded_to_seller' || offer.status === 'seller_reviewing';

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
                    {t('sellerList.buyerInfo')}:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {buyer.fullName} - {buyer.email}
                    {buyer.phone && ` - ${buyer.phone}`}
                  </Typography>
                </Box>
              )}

              {agent && (
                <Box sx={{ mb: 2, p: 2, bgcolor: 'blue.50', borderRadius: 2 }}>
                  <Typography variant="body2" fontWeight="bold" mb={0.5}>
                    {t('sellerList.agentInfo')}:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {agent.fullName} - {agent.email}
                    {agent.phone && ` - ${agent.phone}`}
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
                    {t('sellerList.listedPrice')}: {formatCurrency(property.price)} ₫
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

              {offer.rejection_reason && (
                <Box mb={2} sx={{ p: 2, bgcolor: '#FFEBEE', borderRadius: 2 }}>
                  <Typography variant="body2" color="error" fontWeight="bold" mb={0.5}>
                    {t('sellerList.rejectionReason')}:
                  </Typography>
                  <Typography variant="body2" color="error">
                    {offer.rejection_reason}
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
                  {t('sellerList.viewDetail')}
                </Button>
                {canAccept && (
                  <Button
                    variant="contained"
                    color="success"
                    size="medium"
                    startIcon={<CheckCircleIcon />}
                    onClick={() => handleAcceptClick(offer._id)}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    {t('sellerList.accept')}
                  </Button>
                )}
                {canReject && (
                  <Button
                    variant="contained"
                    color="error"
                    size="medium"
                    startIcon={<CancelIcon />}
                    onClick={() => handleRejectClick(offer._id)}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    {t('sellerList.reject')}
                  </Button>
                )}
              </Box>
            </Paper>
          );
        })}
      </Stack>

      <Dialog
        open={acceptDialogOpen}
        onClose={() => !processing && setAcceptDialogOpen(false)}
      >
        <DialogTitle>{t('sellerList.acceptOffer')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('sellerList.acceptConfirm')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setAcceptDialogOpen(false)}
            disabled={processing}
          >
            {t('list.cancel')}
          </Button>
          <Button
            onClick={handleAcceptConfirm}
            color="success"
            variant="contained"
            disabled={processing}
          >
            {processing ? t('list.processing') : t('list.confirm')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={rejectDialogOpen}
        onClose={() => !processing && setRejectDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('sellerList.rejectOffer')}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {t('sellerList.rejectConfirm')}
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={4}
            label={t('sellerList.rejectionReason')}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder={t('sellerList.rejectionReasonPlaceholder')}
            variant="outlined"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setRejectDialogOpen(false)}
            disabled={processing}
          >
            {t('list.cancel')}
          </Button>
          <Button
            onClick={handleRejectConfirm}
            color="error"
            variant="contained"
            disabled={processing || !rejectionReason.trim()}
          >
            {processing ? t('list.processing') : t('list.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

