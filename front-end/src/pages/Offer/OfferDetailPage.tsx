import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Avatar,
  Chip,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ScheduleIcon from '@mui/icons-material/Schedule';
import NoteIcon from '@mui/icons-material/Note';
import CancelIcon from '@mui/icons-material/Cancel';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { OfferService } from '../../services/offerService';
import type { Offer } from '../../types/Offer';
import AuthContext from '../../context/AuthContext';

const OfferDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useContext(AuthContext);
  const { t, i18n } = useTranslation('offerManagement');
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOffer = async () => {
      if (!id) {
        toast.error(t('detail.errors.noId'));
        navigate(-1);
        return;
      }

      const userRole = state.user?.role?.toLowerCase();
      if (userRole !== 'seller' && userRole !== 'agent') {
        toast.error(t('detail.errors.noPermission'));
        navigate(-1);
        return;
      }

      try {
        setLoading(true);
        const data = await OfferService.getOfferById(id, userRole as 'seller' | 'agent');
        setOffer(data);
      } catch (error: any) {
        toast.error(error?.message || t('detail.errors.loadFailed'));
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    if (!state.loading) {
      loadOffer();
    }
  }, [id, state.user, state.loading, navigate]);

  const formatCurrency = (amount: number, currency: string = 'VND') => {
    const locale = i18n.language === 'vi' ? 'vi-VN' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return t('detail.deadline.noDeadline');
    const date = new Date(dateString);
    const locale = i18n.language === 'vi' ? 'vi-VN' : 'en-US';
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateForDisplay = (dateString?: string) => {
    if (!dateString) return { date: '', time: '' };
    const date = new Date(dateString);
    const locale = i18n.language === 'vi' ? 'vi-VN' : 'en-US';
    const datePart = date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const timePart = date.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return { date: datePart, time: timePart };
  };

  const getStatusLabel = (status: string): string => {
    const statusKey = `detail.status.${status}`;
    try {
      const translated = t(statusKey as any);
      return translated || status;
    } catch {
      return status;
    }
  };

  if (loading) {
    return (
      <Container
        sx={{
          mt: 4,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (!offer) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography>{t('detail.errors.notFound')}</Typography>
      </Container>
    );
  }

  const buyer = typeof offer.buyer_id === 'object' ? offer.buyer_id : null;
  const seller = typeof offer.seller_id === 'object' ? offer.seller_id : null;
  const agent = typeof offer.agent_id === 'object' ? offer.agent_id : null;
  const property = typeof offer.property_id === 'object' ? offer.property_id : null;

  const lang = i18n.language as 'vi' | 'en';
  const propertyTitle = property
    ? typeof property.title === 'object'
      ? property.title[lang]
      : property.title
    : 'Property';
  const propertyAddress = property
    ? typeof property.address === 'object'
      ? property.address[lang]
      : property.address
    : '';

  const userRole = state.user?.role?.toLowerCase();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f5f5f5',
      }}
    >
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          py: { xs: 2, sm: 3 },
          px: { xs: 2, sm: 3 },
        }}
      >
        <Container maxWidth="xl">
          <Button
            variant="contained"
            onClick={() => navigate(-1)}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              textTransform: 'none',
              borderRadius: 2,
              px: 3,
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.3)',
              },
            }}
          >
            ← {t('back')}
          </Button>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>

        <Paper
          elevation={6}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            bgcolor: 'white',
          }}
        >
          <Box
            sx={{
              p: { xs: 2, sm: 3 },
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="h5" fontWeight="bold">
              {t('detail.title')}
            </Typography>

            {offer.status && (
              <Chip
                label={getStatusLabel(offer.status)}
                sx={{
                  bgcolor: offer.status === 'rejected' ? 'error.main' :
                    offer.status === 'accepted' ? 'success.main' :
                      'warning.main',
                  color: 'white',
                  fontWeight: 'bold',
                  px: 3,
                  py: 0.5,
                  fontSize: '0.95rem',
                  alignSelf: { xs: 'flex-end', sm: 'auto' },
                }}
                size="medium"
              />
            )}
          </Box>

          <Box sx={{ p: { xs: 2, sm: 3 } }}>

            {property && (
              <Box sx={{ mb: 3 }}>
                <Paper
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    p: { xs: 2.5, sm: 3 },
                    borderRadius: 3,
                    color: 'white',
                  }}
                >
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    sx={{
                      mb: 1.5,
                      color: 'white',
                      fontSize: { xs: '1.25rem', sm: '1.5rem' }
                    }}
                  >
                    {propertyTitle}
                  </Typography>

                  {propertyAddress && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box
                        component="span"
                        sx={{
                          color: '#ff4444',
                          fontSize: '1.2rem',
                          fontWeight: 'bold',
                        }}
                      >
                        ★
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(255,255,255,0.95)',
                          fontSize: { xs: '0.875rem', sm: '0.95rem' }
                        }}
                      >
                        {propertyAddress}
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Box>
            )}

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
                mb: 3,
              }}
            >
              {buyer && (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Avatar sx={{ bgcolor: '#667eea', width: 28, height: 28 }}>
                      <PersonIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                    >
                      {t('detail.buyerInfo.title')}
                    </Typography>
                  </Box>

                  <Paper
                    sx={{
                      p: { xs: 1.5, sm: 2 },
                      borderRadius: 2,
                      bgcolor: 'grey.50',
                      border: '1px solid',
                      borderColor: 'grey.200',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
                      <Avatar
                        src={buyer.avatar}
                        sx={{
                          bgcolor: '#667eea',
                          width: { xs: 48, sm: 56 },
                          height: { xs: 48, sm: 56 },
                          fontSize: { xs: '1.25rem', sm: '1.5rem' },
                          fontWeight: 'bold',
                        }}
                      >
                        {buyer.fullName?.charAt(0) || 'N'}
                      </Avatar>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}
                        >
                          {buyer.fullName}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            fontSize: { xs: '0.813rem', sm: '0.875rem' },
                            wordBreak: 'break-word'
                          }}
                        >
                          {buyer.email}
                        </Typography>
                        {buyer.phone && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}
                          >
                            {buyer.phone}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Paper>
                </Box>
              )}

              {userRole === 'agent' && seller && (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Avatar sx={{ bgcolor: '#667eea', width: 28, height: 28 }}>
                      <PersonIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                    >
                      {t('detail.sellerInfo.title')}
                    </Typography>
                  </Box>

                  <Paper
                    sx={{
                      p: { xs: 1.5, sm: 2 },
                      borderRadius: 2,
                      bgcolor: 'grey.50',
                      border: '1px solid',
                      borderColor: 'grey.200',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
                      <Avatar
                        src={seller.avatar}
                        sx={{
                          bgcolor: '#667eea',
                          width: { xs: 48, sm: 56 },
                          height: { xs: 48, sm: 56 },
                          fontSize: { xs: '1.25rem', sm: '1.5rem' },
                          fontWeight: 'bold',
                        }}
                      >
                        {seller.fullName?.charAt(0) || 'S'}
                      </Avatar>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}
                        >
                          {seller.fullName}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            fontSize: { xs: '0.813rem', sm: '0.875rem' },
                            wordBreak: 'break-word'
                          }}
                        >
                          {seller.email}
                        </Typography>
                        {seller.phone && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}
                          >
                            {seller.phone}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Paper>
                </Box>
              )}

              {userRole === 'seller' && agent && (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Avatar sx={{ bgcolor: '#667eea', width: 28, height: 28 }}>
                      <PersonIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                    >
                      {t('detail.agentInfo.title')}
                    </Typography>
                  </Box>

                  <Paper
                    sx={{
                      p: { xs: 1.5, sm: 2 },
                      borderRadius: 2,
                      bgcolor: 'grey.50',
                      border: '1px solid',
                      borderColor: 'grey.200',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
                      <Avatar
                        src={agent.avatar}
                        sx={{
                          bgcolor: '#667eea',
                          width: { xs: 48, sm: 56 },
                          height: { xs: 48, sm: 56 },
                          fontSize: { xs: '1.25rem', sm: '1.5rem' },
                          fontWeight: 'bold',
                        }}
                      >
                        {agent.fullName?.charAt(0) || 'A'}
                      </Avatar>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}
                        >
                          {agent.fullName}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            fontSize: { xs: '0.813rem', sm: '0.875rem' },
                            wordBreak: 'break-word'
                          }}
                        >
                          {agent.email}
                        </Typography>
                        {agent.phone && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}
                          >
                            {agent.phone}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Paper>
                </Box>
              )}
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Avatar sx={{ bgcolor: '#FFA500', width: 28, height: 28 }}>
                  <AttachMoneyIcon sx={{ fontSize: 18 }} />
                </Avatar>
                <Typography variant="h6" fontWeight="bold">
                  {t('detail.amount.title')}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 2,
                }}
              >
                {property && (
                  <Paper
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      p: { xs: 2.5, sm: 3 },
                      borderRadius: 3,
                      textAlign: 'center',
                      color: 'white',
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1.5,
                        opacity: 0.9,
                        fontSize: { xs: '0.813rem', sm: '0.875rem' }
                      }}
                    >
                      {t('detail.propertyInfo.listedPrice')}
                    </Typography>
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      sx={{
                        color: 'white',
                        fontSize: { xs: '1.75rem', sm: '2.125rem' }
                      }}
                    >
                      {formatCurrency(property.price, 'VND').replace('₫', 'đ')}
                    </Typography>
                  </Paper>
                )}

                <Paper
                  sx={{
                    background: 'linear-gradient(135deg, #d4a574 0%, #5a7d8c 100%)',
                    p: { xs: 2.5, sm: 3 },
                    borderRadius: 3,
                    textAlign: 'center',
                    color: 'white',
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1.5,
                      opacity: 0.9,
                      fontSize: { xs: '0.813rem', sm: '0.875rem' }
                    }}
                  >
                    {i18n.language === 'vi' ? 'Giá đề xuất' : 'Offer Price'}
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    sx={{
                      color: 'white',
                      fontSize: { xs: '1.75rem', sm: '2.125rem' }
                    }}
                  >
                    {formatCurrency(offer.amount, offer.currency || 'VND').replace('₫', 'đ')}
                  </Typography>
                </Paper>
              </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Avatar sx={{ bgcolor: '#667eea', width: 28, height: 28 }}>
                  <ScheduleIcon sx={{ fontSize: 18 }} />
                </Avatar>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                >
                  {t('detail.deadline.title')}
                </Typography>
              </Box>

              <Paper
                sx={{
                  p: { xs: 2, sm: 2.5 },
                  borderRadius: 2,
                  bgcolor: 'grey.50',
                  border: '1px solid',
                  borderColor: 'grey.200',
                }}
              >
                {offer.expires_at ? (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography
                        variant="body2"
                        sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' }, color: 'text.secondary' }}
                      >
                        📅
                      </Typography>
                      <Typography
                        variant="body1"
                        fontWeight="medium"
                        sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}
                      >
                        {i18n.language === 'vi' ? 'Ngày hết hạn' : 'Expiry Date'}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body1"
                      sx={{
                        mb: 1,
                        fontSize: { xs: '0.95rem', sm: '1rem' }
                      }}
                    >
                      {formatDateForDisplay(offer.expires_at).date}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' }, color: 'text.secondary' }}
                      >
                        ⏰
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}
                      >
                        {i18n.language === 'vi'
                          ? `Hạn chót lúc ${formatDateForDisplay(offer.expires_at).time}`
                          : `Deadline at ${formatDateForDisplay(offer.expires_at).time}`}
                      </Typography>
                    </Box>
                  </>
                ) : (
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}
                  >
                    {t('detail.deadline.noDeadline')}
                  </Typography>
                )}
              </Paper>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Avatar sx={{ bgcolor: '#667eea', width: 28, height: 28 }}>
                  <NoteIcon sx={{ fontSize: 18 }} />
                </Avatar>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                >
                  {t('detail.note.title')}
                </Typography>
              </Box>

              <Paper
                sx={{
                  p: { xs: 2, sm: 2.5 },
                  bgcolor: '#FFF9F0',
                  minHeight: { xs: '60px', sm: '80px' },
                  borderRadius: 2,
                  border: '1px solid #FFE5CC',
                  borderLeft: '4px solid #FF6B6B',
                }}
              >
                <Typography
                  variant="body1"
                  whiteSpace="pre-wrap"
                  sx={{
                    color: 'text.primary',
                    fontSize: { xs: '0.95rem', sm: '1rem' }
                  }}
                >
                  {offer.note || t('detail.note.noNote')}
                </Typography>
              </Paper>
            </Box>

            {offer.status === 'rejected' && offer.rejection_reason && (
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'error.main', width: 28, height: 28 }}>
                    <CancelIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="error.main"
                    sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                  >
                    {t('detail.rejectionReason.title') || 'Rejection Reason'}
                  </Typography>
                </Box>

                <Paper
                  sx={{
                    p: { xs: 2, sm: 2.5 },
                    bgcolor: '#ffebee',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'error.light',
                    borderLeft: '4px solid',
                    borderLeftColor: 'error.main',
                  }}
                >
                  <Typography
                    variant="body1"
                    whiteSpace="pre-wrap"
                    color="error.dark"
                    sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}
                  >
                    {offer.rejection_reason}
                  </Typography>
                </Paper>
              </Box>
            )}

            <Box
              sx={{
                pt: 2,
                borderTop: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.813rem' }}>
                {t('detail.additional.createdAt')}: {formatDate(offer.createdAt)}
              </Typography>

              {offer.updatedAt && offer.updatedAt !== offer.createdAt && (
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.813rem' }}>
                  {t('detail.additional.updatedAt')}: {formatDate(offer.updatedAt)}
                </Typography>
              )}

              {offer.reviewed_at && (
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.813rem' }}>
                  {t('detail.additional.reviewedAt')}: {formatDate(offer.reviewed_at)}
                </Typography>
              )}
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default OfferDetailPage;
