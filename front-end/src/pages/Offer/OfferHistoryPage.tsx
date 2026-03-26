import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { OfferList } from '../../components/Offer/OfferList';
import { OfferService } from '../../services/offerService';
import type { Offer, OfferStatus } from '../../types/Offer';

const OfferHistoryPage: React.FC = () => {
  const { t } = useTranslation('offerManagement');
  const [searchParams, setSearchParams] = useSearchParams();

  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<OfferStatus | undefined>();

  useEffect(() => {
    const loadOffers = async () => {
      try {
        setIsLoading(true);
        const statusParam = searchParams.get('status') as OfferStatus | null;
        const propertyId = searchParams.get('property_id');

        const filters: { status?: OfferStatus; property_id?: string } = {};
        if (statusParam) filters.status = statusParam;
        if (propertyId) filters.property_id = propertyId;

        const data = await OfferService.getMyOffers(filters);
        setOffers(data);
        setStatusFilter(filters.status);
      } catch (error: any) {
        toast.error(error?.message || t('error.loadFailed'));
      } finally {
        setIsLoading(false);
      }
    };
    loadOffers();
  }, [searchParams]);

  const handleCancelOffer = async (offerId: string) => {
    try {
      await OfferService.cancelOffer(offerId);
      toast.success(t('list.cancelSuccess'));

      const statusParam = searchParams.get('status') as OfferStatus | null;
      const propertyId = searchParams.get('property_id');

      const filters: { status?: OfferStatus; property_id?: string } = {};
      if (statusParam) filters.status = statusParam;
      if (propertyId) filters.property_id = propertyId;

      const updatedOffers = await OfferService.getMyOffers(filters);
      setOffers(updatedOffers);
    } catch (error: any) {
      toast.error(error?.message || t('list.cancelError'));
    }
  };

  const handleFilterChange = (status?: OfferStatus) => {
    setStatusFilter(status);
    const params = new URLSearchParams(searchParams);
    if (status) {
      params.set('status', status);
    } else {
      params.delete('status');
    }
    setSearchParams(params);
  };

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
          mb: { xs: 2, sm: 1 },
          gap: { xs: 2, sm: 0 },
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{
              color: '#1976D2',
              letterSpacing: '-0.02em',
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontSize: { xs: '1.6rem', sm: '2rem' },
            }}
          >
            {t('title')}
          </Typography>

          <Typography
            variant="body1"
            mt={1}
            sx={{
              color: '#424242',
              fontSize: { xs: '0.85rem', sm: '0.95rem' },
              maxWidth: { xs: '92%', sm: '100%' },
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            {t('subtitle')}
          </Typography>
        </Box>

        {/* Filter */}
        <FormControl
          sx={{
            minWidth: { xs: '100%', sm: 200 },
            mt: { xs: 2, sm: 0 },
          }}
        >
          <InputLabel>{t('list.filter.filterByStatus')}</InputLabel>
          <Select
            value={statusFilter || 'all'}
            label={t('list.filter.filterByStatus')}
            onChange={(e) =>
              handleFilterChange(
                e.target.value === 'all' ? undefined : (e.target.value as OfferStatus)
              )
            }
            sx={{
              fontSize: { xs: '0.85rem', sm: '1rem' },
            }}
          >
            <MenuItem value="all">{t('list.filter.all')}</MenuItem>
            <MenuItem value="pending">{t('list.status.pending')}</MenuItem>
            <MenuItem value="forwarded_to_seller">
              {t('list.status.forwarded_to_seller')}
            </MenuItem>
            <MenuItem value="seller_reviewing">
              {t('list.status.seller_reviewing')}
            </MenuItem>
            <MenuItem value="accepted">{t('list.status.accepted')}</MenuItem>
            <MenuItem value="rejected">{t('list.status.rejected')}</MenuItem>
            <MenuItem value="cancelled">{t('list.status.cancelled')}</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ mb: { xs: 2, sm: 4 } }} />

      <OfferList
        offers={offers}
        onCancelOffer={handleCancelOffer}
        isLoading={isLoading}
        filters={{ status: statusFilter }}
        onFilterChange={undefined}
      />
    </Container>
  );
};

export default OfferHistoryPage;

