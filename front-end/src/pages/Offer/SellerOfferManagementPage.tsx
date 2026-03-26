import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
  Collapse,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { SellerOfferList } from '../../components/Offer/SellerOfferList';
import { OfferService } from '../../services/offerService';
import type { Offer, OfferStatus } from '../../types/Offer';
import AuthContext from '../../context/AuthContext';
import { getStatusColorConfig } from '../../utils/offerUtils';
import { getLanguage } from '../../utils/storage';

interface PropertyGroup {
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  offers: Offer[];
}

const SellerOfferManagementPage: React.FC = () => {
  const { t } = useTranslation('offerManagement');
  const lang = getLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { state } = useContext(AuthContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<OfferStatus | undefined>();
  const [expandedProperties, setExpandedProperties] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'table' | 'list'>('table');
  useEffect(() => {
    if (isMobile && viewMode !== 'list') {
      setViewMode('list');
    }
  }, [isMobile, viewMode]);

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!state.loading && (!state.user || state.user.role?.toLowerCase() !== 'seller')) {
      toast.error(t('error.noPermission'));
      setTimeout(() => {
        navigate('/home');
      }, 1500);
    }
  }, [state.loading, state.user, navigate]);

  useEffect(() => {
    const loadOffers = async () => {
      try {
        setIsLoading(true);
        const statusParam = searchParams.get('status') as OfferStatus | null;
        
        const filters: { status?: OfferStatus } = {};
        if (statusParam) filters.status = statusParam;
        
        const data = await OfferService.getSellerOffers(filters);
        setOffers(Array.isArray(data) ? data : []);
        setStatusFilter(filters.status);
      } catch (error: any) {
        console.error('Load offers error:', error);
        toast.error(error?.message || t('error.loadFailed'));
        setOffers([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (!state.loading) {
      loadOffers();
    }
  }, [searchParams, state.loading]);

  const openAcceptDialog = (offerId: string) => {
    setSelectedOfferId(offerId);
    setAcceptDialogOpen(true);
  };

  const closeAcceptDialog = () => {
    setAcceptDialogOpen(false);
    setSelectedOfferId('');
  };

  const handleAcceptOffer = async () => {
    try {
      setProcessing(true);
      
      const toastId = toast.loading(
        t('sellerList.acceptProcessing') || 'Processing offer acceptance...'
      );
      
      await OfferService.acceptOffer(selectedOfferId);
      
      toast.update(toastId, {
        render: t('sellerList.acceptSuccess'),
        type: 'success',
        isLoading: false,
        autoClose: 5000,
      });
      
      setTimeout(() => {
        toast.info(
          t('sellerList.dealCreatedInfo') || 'Deal has been automatically created. Check your deals page.',
          { autoClose: 7000 }
        );
      }, 1000);
      
      const statusParam = searchParams.get('status') as OfferStatus | null;
      const filters: { status?: OfferStatus } = {};
      if (statusParam) filters.status = statusParam;
      
      const updatedOffers = await OfferService.getSellerOffers(filters);
      setOffers(Array.isArray(updatedOffers) ? updatedOffers : []);
      closeAcceptDialog();
    } catch (error: any) {
      console.error('Accept offer error:', error);
      toast.error(error?.message || t('sellerList.acceptError'));
    } finally {
      setProcessing(false);
    }
  };

  const openRejectDialog = (offerId: string) => {
    setSelectedOfferId(offerId);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  const closeRejectDialog = () => {
    setRejectDialogOpen(false);
    setSelectedOfferId('');
    setRejectionReason('');
  };

  const handleRejectOfferInTable = async () => {
    if (!rejectionReason.trim()) {
      toast.error(t('sellerList.rejectReasonRequired') || 'Please provide a rejection reason');
      return;
    }

    try {
      setProcessing(true);
      await OfferService.rejectOffer(selectedOfferId, rejectionReason);
      toast.success(t('sellerList.rejectSuccess'));
      
      const statusParam = searchParams.get('status') as OfferStatus | null;
      const filters: { status?: OfferStatus } = {};
      if (statusParam) filters.status = statusParam;
      
      const updatedOffers = await OfferService.getSellerOffers(filters);
      setOffers(Array.isArray(updatedOffers) ? updatedOffers : []);
      closeRejectDialog();
    } catch (error: any) {
      console.error('Reject offer error:', error);
      toast.error(error?.message || t('sellerList.rejectError'));
    } finally {
      setProcessing(false);
    }
  };

  const handleAcceptOfferForList = async (offerId: string) => {
    try {
      await OfferService.acceptOffer(offerId);
      toast.success(t('sellerList.acceptSuccess'));
      
      const statusParam = searchParams.get('status') as OfferStatus | null;
      const filters: { status?: OfferStatus } = {};
      if (statusParam) filters.status = statusParam;
      
      const updatedOffers = await OfferService.getSellerOffers(filters);
      setOffers(Array.isArray(updatedOffers) ? updatedOffers : []);
    } catch (error: any) {
      console.error('Accept offer error:', error);
      toast.error(error?.message || t('sellerList.acceptError'));
    }
  };

  const handleRejectOffer = async (offerId: string, reason?: string) => {
    try {
      await OfferService.rejectOffer(offerId, reason);
      toast.success(t('sellerList.rejectSuccess'));
      
      const statusParam = searchParams.get('status') as OfferStatus | null;
      const filters: { status?: OfferStatus } = {};
      if (statusParam) filters.status = statusParam;
      
      const updatedOffers = await OfferService.getSellerOffers(filters);
      setOffers(Array.isArray(updatedOffers) ? updatedOffers : []);
    } catch (error: any) {
      console.error('Reject offer error:', error);
      toast.error(error?.message || t('sellerList.rejectError'));
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

  const togglePropertyExpanded = (propertyId: string) => {
    const newExpanded = new Set(expandedProperties);
    if (newExpanded.has(propertyId)) {
      newExpanded.delete(propertyId);
    } else {
      newExpanded.add(propertyId);
    }
    setExpandedProperties(newExpanded);
  };

  const groupedOffers: PropertyGroup[] = offers.reduce((acc, offer) => {
    const property = typeof offer.property_id === 'object' ? offer.property_id : null;
    if (!property) return acc;

    const propertyId = property._id;
    const propertyTitle = typeof property.title === 'object' 
      ? property.title[lang] 
      : property.title || 'Unknown Property';
    const propertyAddress = typeof property.address === 'object'
      ? property.address[lang]
      : property.address || '';

    const existingGroup = acc.find(g => g.propertyId === propertyId);
    if (existingGroup) {
      existingGroup.offers.push(offer);
    } else {
      acc.push({
        propertyId,
        propertyTitle,
        propertyAddress,
        offers: [offer],
      });
    }
    return acc;
  }, [] as PropertyGroup[]);

  const handleViewDetail = (offerId: string) => {
    navigate(`/seller/offers/${offerId}`);
  };

  return (
    <Container
      sx={{
        mt: isMobile ? 2 : 4,
        mb: isMobile ? 3 : 4,
        px: isMobile ? 2 : 0,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography 
            variant={isMobile ? 'h5' : 'h4'} 
            fontWeight="bold"
            sx={{ 
              color: '#1976D2',
              letterSpacing: '-0.02em',
            }}
          >
            {t('sellerList.title')}
          </Typography>
          <Typography 
            variant="body1" 
            mt={1}
            sx={{ 
              color: '#424242',
              fontSize: '0.95rem',
            }}
          >
            {t('sellerList.subtitle')}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'flex-end',
          gap: 2,
          mb: isMobile ? 2 : 3,
          flexDirection: isMobile ? 'column' : 'row',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: isMobile ? 'stretch' : 'flex-start' }}>
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant={viewMode === 'table' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('table')}
                size="small"
              >
                {t('sellerList.tableView')}
              </Button>
              <Button
                variant={viewMode === 'list' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('list')}
                size="small"
              >
                {t('sellerList.listView')}
              </Button>
            </Box>
          )}
        </Box>
        
        <FormControl
          sx={{ minWidth: isMobile ? '100%' : 200 }}
          size={isMobile ? 'small' : 'medium'}
        >
          <InputLabel>{t('list.filter.filterByStatus')}</InputLabel>
          <Select
            value={statusFilter || 'all'}
            label={t('list.filter.filterByStatus')}
            onChange={(e) => handleFilterChange(e.target.value === 'all' ? undefined : (e.target.value as OfferStatus))}
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 360 },
              },
            }}
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
      </Box>

      {viewMode === 'table' ? (
        <TableContainer
          component={Paper}
          elevation={3}
          sx={{
            borderRadius: 2,
            overflowX: 'auto',
          }}
        >
          <Table sx={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold', border: 0, borderBottom: 1, borderColor: 'primary.dark', width: '5%' }}></TableCell>
                <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold', border: 0, borderBottom: 1, borderColor: 'primary.dark', width: '20%' }}>{t('sellerList.table.buyer')}</TableCell>
                <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold', border: 0, borderBottom: 1, borderColor: 'primary.dark', width: '16%' }}>{t('sellerList.table.amount')}</TableCell>
                <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold', border: 0, borderBottom: 1, borderColor: 'primary.dark', width: '14%' }}>{t('sellerList.table.status')}</TableCell>
                <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold', border: 0, borderBottom: 1, borderColor: 'primary.dark', width: '12%' }}>{t('sellerList.table.createdAt')}</TableCell>
                <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold', border: 0, borderBottom: 1, borderColor: 'primary.dark', width: '33%' }}>{t('sellerList.table.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : groupedOffers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">{t('sellerList.noOffers')}</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                groupedOffers.map((group) => (
                  <React.Fragment key={group.propertyId}>
                    <TableRow 
                      sx={{ 
                        bgcolor: 'grey.100',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'grey.200' },
                      }}
                      onClick={() => togglePropertyExpanded(group.propertyId)}
                    >
                      <TableCell sx={{ width: '5%' }}>
                        <IconButton size="small">
                          {expandedProperties.has(group.propertyId) ? (
                            <KeyboardArrowUpIcon />
                          ) : (
                            <KeyboardArrowDownIcon />
                          )}
                        </IconButton>
                      </TableCell>
                      <TableCell colSpan={5} sx={{ width: '95%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box>
                            <Typography fontWeight="bold">{group.propertyTitle}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {group.propertyAddress}
                            </Typography>
                          </Box>
                          <Chip 
                            label={`${group.offers.length} ${t('sellerList.table.offers')}`}
                            size="small"
                            color="primary"
                          />
                        </Box>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={6} sx={{ py: 0, border: 0 }}>
                        <Collapse in={expandedProperties.has(group.propertyId)} timeout="auto" unmountOnExit>
                          <Table size="small">
                            <TableBody>
                              {group.offers.map((offer) => {
                                const buyer = typeof offer.buyer_id === 'object' ? offer.buyer_id : null;
                                const statusColors = getStatusColorConfig(offer.status);
                                const canAccept = offer.status === 'forwarded_to_seller' || offer.status === 'seller_reviewing';
                                const canReject = offer.status === 'forwarded_to_seller' || offer.status === 'seller_reviewing';

                                return (
                                  <TableRow 
                                    key={offer._id} 
                                    sx={{ 
                                      '&:hover': { bgcolor: 'action.hover' },
                                      bgcolor: 'grey.50',
                                    }}
                                  >
                                    <TableCell sx={{ width: '5%', pl: 4 }} />
                                    <TableCell sx={{ width: '20%' }}>
                                      {buyer ? (
                                        <Box>
                                          <Typography variant="body2" fontWeight="medium">
                                            {buyer.fullName}
                                          </Typography>
                                          <Typography variant="caption" color="text.secondary">
                                            {buyer.email}
                                          </Typography>
                                        </Box>
                                      ) : (
                                        <Typography variant="body2" color="text.secondary">
                                          {t('sellerList.unknownBuyer')}
                                        </Typography>
                                      )}
                                    </TableCell>
                                    <TableCell sx={{ width: '16%' }}>
                                      <Typography variant="body2" fontWeight="bold" color="success.main">
                                        {new Intl.NumberFormat('vi-VN').format(offer.amount)} ₫
                                      </Typography>
                                    </TableCell>
                                    <TableCell sx={{ width: '14%' }}>
                                      <Chip
                                        label={t(`list.status.${offer.status}`)}
                                        size="small"
                                        sx={{
                                          backgroundColor: statusColors.backgroundColor,
                                          color: statusColors.color,
                                          border: `1px solid ${statusColors.borderColor}`,
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell sx={{ width: '12%' }}>
                                      <Typography variant="body2">
                                        {offer.createdAt ? new Date(offer.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                                      </Typography>
                                    </TableCell>
                                    <TableCell sx={{ width: '33%' }}>
                                      <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button
                                          size="small"
                                          variant="outlined"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleViewDetail(offer._id);
                                          }}
                                        >
                                          {t('sellerList.viewDetail')}
                                        </Button>
                                        {canAccept && (
                                          <Button
                                            size="small"
                                            variant="contained"
                                            color="success"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              openAcceptDialog(offer._id);
                                            }}
                                          >
                                            {t('sellerList.accept')}
                                          </Button>
                                        )}
                                        {canReject && (
                                          <Button
                                            size="small"
                                            variant="contained"
                                            color="error"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              openRejectDialog(offer._id);
                                            }}
                                          >
                                            {t('sellerList.reject')}
                                          </Button>
                                        )}
                                      </Box>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <SellerOfferList
          offers={offers}
          onAcceptOffer={handleAcceptOfferForList}
          onRejectOffer={handleRejectOffer}
          isLoading={isLoading}
          onViewDetail={handleViewDetail}
        />
      )}

      <Dialog 
        open={acceptDialogOpen} 
        onClose={closeAcceptDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t('sellerList.acceptDialogTitle') || 'Accept Offer'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {t('sellerList.acceptConfirm')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAcceptDialog} color="inherit" disabled={processing}>
            {t('sellerList.cancel') || 'Cancel'}
          </Button>
          <Button 
            onClick={handleAcceptOffer} 
            color="success" 
            variant="contained"
            disabled={processing}
          >
            {processing 
              ? (t('sellerList.processing') || 'Processing...') 
              : (t('sellerList.confirmAccept') || 'Confirm Accept')
            }
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={rejectDialogOpen} 
        onClose={closeRejectDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t('sellerList.rejectDialogTitle') || 'Reject Offer'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('sellerList.rejectDialogDescription') || 'Please provide a reason for rejecting this offer. This will be shared with the buyer.'}
          </Typography>
          <TextField
            autoFocus
            multiline
            rows={4}
            fullWidth
            label={t('sellerList.rejectionReason') || 'Rejection Reason'}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder={t('sellerList.rejectionReasonPlaceholder') || 'Enter the reason for rejection...'}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeRejectDialog} color="inherit" disabled={processing}>
            {t('sellerList.cancel') || 'Cancel'}
          </Button>
          <Button 
            onClick={handleRejectOfferInTable} 
            color="error" 
            variant="contained"
            disabled={processing || !rejectionReason.trim()}
          >
            {processing 
              ? (t('sellerList.processing') || 'Processing...') 
              : (t('sellerList.confirmReject') || 'Confirm Rejection')
            }
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SellerOfferManagementPage;

