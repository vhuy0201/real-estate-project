import { acceptAgentRequest, getAllJoinedAgentsRequest, rejectAgentRequest } from '@/services/seller.service';
import type { RequestJoinProperty } from '@/types/RequestJoinProperty';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Grid,
    Typography,
    CircularProgress,
    TextField,
    MenuItem,
    Pagination,
    PaginationItem
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Bounce, toast, ToastContainer } from 'react-toastify';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';
import { getLanguage, type Lang } from '@/utils/storage';

const ListRequestJoin = () => {
    const { t } = useTranslation('listRequestJoin');
    const language: Lang = getLanguage();
    const [requestJoin, setRequestJoin] = useState<RequestJoinProperty[]>([]);
    const [filtered, setFiltered] = useState<RequestJoinProperty[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(6);

    const handleAccept = async (id: string) => {
        setActionLoading(prev => ({ ...prev, [id]: true }));
        try {
            await acceptAgentRequest(id);
            toast.success(t('acceptSuccess'), { transition: Bounce });
            setRequestJoin(prev => prev.map(r =>
                r._id === id ? { ...r, status: 'approved' } : r
            ));
        } catch (error) {
            toast.error(t('acceptError'));
        } finally {
            setActionLoading(prev => ({ ...prev, [id]: false }));
        }
    };

    const handleReject = async (id: string) => {
        setActionLoading(prev => ({ ...prev, [id]: true }));
        try {
            await rejectAgentRequest(id);
            toast.success(t('rejectSuccess'), { transition: Bounce });
            setRequestJoin(prev => prev.map(r =>
                r._id === id ? { ...r, status: 'rejected' } : r
            ));
        } catch (error) {
            toast.error(t('rejectError'));
        } finally {
            setActionLoading(prev => ({ ...prev, [id]: false }));
        }
    };

    useEffect(() => {
        const fetchDataRequest = async () => {
            try {
                const response = await getAllJoinedAgentsRequest();
                setRequestJoin(response);
                setFiltered(response);
            } catch (error) {
                console.error("Error fetching joined agents requests:", error);
                toast.error(t('loadingError'));
            } finally {
                setLoading(false);
            }
        };
        fetchDataRequest();
    }, [t]);

    useEffect(() => {
        let result = [...requestJoin];

        if (search.trim() !== '') {
            result = result.filter(r =>
                r.property_id?.title?.vi?.toLowerCase().includes(search.toLowerCase()) ||
                r.property_id?.title?.en?.toLowerCase().includes(search.toLowerCase()) ||
                r.property_id?.address?.vi?.toLowerCase().includes(search.toLowerCase()) ||
                r.property_id?.address?.en?.toLowerCase().includes(search.toLowerCase()) ||
                r.agent_id?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
                r.agent_id?.email?.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (statusFilter !== 'all') {
            result = result.filter(r => r.status === statusFilter);
        }

        setFiltered(result);
        setCurrentPage(1);
    }, [search, statusFilter, requestJoin]);

    const getStatusChip = (status: string) => {
        const statusConfig = {
            pending: { label: t('pending'), color: 'warning' as const },
            approved: { label: t('approved'), color: 'success' as const },
            rejected: { label: t('rejected'), color: 'error' as const }
        };
        const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'default' as const };
        return <Chip label={config.label} color={config.color} size="small" />;
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentRequests = filtered.slice(startIndex, startIndex + itemsPerPage);

    const handleChangePage = (_: React.ChangeEvent<unknown>, value: number) => {
        setCurrentPage(value);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <Box className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50" sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Header Section */}
            <Box sx={{ maxWidth: 1400, mx: 'auto', mb: 4 }}>
                <Box sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: 4,
                    p: { xs: 3, md: 4 },
                    color: 'white',
                    boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)'
                }}>
                    <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>
                        🏘️ {t('pageTitle')}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
                        {t('pageDescription')}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Chip
                            label={`${t('totalRequests')}: ${requestJoin.length}`}
                            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold' }}
                        />
                        <Chip
                            label={`${t('showing')}: ${filtered.length}`}
                            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold' }}
                        />
                    </Box>
                </Box>
            </Box>

            {/* Filter Section */}
            <Box sx={{ maxWidth: 1400, mx: 'auto', mb: 3 }}>
                <Card sx={{ p: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', borderRadius: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'center' }}>
                        <TextField
                            placeholder={t('searchPlaceholder')}
                            variant="outlined"
                            size="small"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            sx={{
                                flex: 1,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2
                                }
                            }}
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            }}
                        />
                        <TextField
                            select
                            label={t('filterStatus')}
                            size="small"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            sx={{
                                minWidth: { xs: '100%', sm: 180 },
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2
                                }
                            }}
                        >
                            <MenuItem value="all">{t('allStatus')}</MenuItem>
                            <MenuItem value="pending">{t('pending')}</MenuItem>
                            <MenuItem value="approved">{t('approved')}</MenuItem>
                            <MenuItem value="rejected">{t('rejected')}</MenuItem>
                        </TextField>
                    </Box>
                </Card>
            </Box>

            {/* Content Section */}
            <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
                {filtered.length === 0 ? (
                    <Card sx={{
                        textAlign: 'center',
                        py: 8,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        borderRadius: 3
                    }}>
                        <CardContent>
                            <Typography variant="h5" color="text.secondary" gutterBottom>
                                📭 {t('noRequestsFound')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {search || statusFilter !== 'all'
                                    ? t('noRequestsFoundDescription')
                                    : t('noRequestsYet')}
                            </Typography>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <Grid container spacing={3}>
                            {currentRequests.map((r) => {
                                const isPending = r.status === 'pending';
                                const isLoading = actionLoading[r._id];

                                return (
                                    <Grid size={{ xs: 12 }} key={r._id}>
                                        <Card
                                            sx={{
                                                transition: 'all 0.3s ease',
                                                borderRadius: 3,
                                                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                                                '&:hover': {
                                                    boxShadow: '0 8px 30px rgba(102, 126, 234, 0.25)',
                                                    transform: 'translateY(-4px)'
                                                },
                                                border: '1px solid',
                                                borderColor: 'divider'
                                            }}
                                        >
                                            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                                                <Grid container spacing={{ xs: 2, md: 3 }}>
                                                    {/* Property Info */}
                                                    <Grid size={{ xs: 12, md: 6 }}>
                                                        <Box sx={{
                                                            display: 'flex',
                                                            alignItems: 'flex-start',
                                                            gap: 2,
                                                            p: 2,
                                                            bgcolor: 'rgba(102, 126, 234, 0.05)',
                                                            borderRadius: 2
                                                        }}>
                                                            <Box sx={{
                                                                bgcolor: 'primary.main',
                                                                borderRadius: '50%',
                                                                p: 1,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}>
                                                                <HomeIcon sx={{ color: 'white', fontSize: 24 }} />
                                                            </Box>
                                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                                <Typography variant="overline" color="text.secondary" fontWeight="bold">
                                                                    {t('propertyInfo')}
                                                                </Typography>
                                                                <Typography
                                                                    variant="h6"
                                                                    fontWeight="bold"
                                                                    sx={{
                                                                        mb: 0.5,
                                                                        fontSize: { xs: '1rem', md: '1.25rem' },
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis',
                                                                        display: '-webkit-box',
                                                                        WebkitLineClamp: 2,
                                                                        WebkitBoxOrient: 'vertical'
                                                                    }}
                                                                >
                                                                    {r.property_id?.title?.[language] || r.property_id?.title?.vi || r.property_id?.title?.en}
                                                                </Typography>
                                                                <Typography
                                                                    variant="body2"
                                                                    color="text.secondary"
                                                                    sx={{
                                                                        mb: 1,
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis',
                                                                        display: '-webkit-box',
                                                                        WebkitLineClamp: 2,
                                                                        WebkitBoxOrient: 'vertical'
                                                                    }}
                                                                >
                                                                    📍 {r.property_id?.address?.[language] || r.property_id?.address?.vi || r.property_id?.address?.en}
                                                                </Typography>
                                                                <Chip
                                                                    label={`${r.property_id?.price?.toLocaleString('vi-VN')} VNĐ`}
                                                                    color="primary"
                                                                    size="small"
                                                                    sx={{ fontWeight: 'bold' }}
                                                                />
                                                            </Box>
                                                        </Box>
                                                    </Grid>

                                                    {/* Agent Info */}
                                                    <Grid size={{ xs: 12, md: 6 }}>
                                                        <Box sx={{
                                                            p: 2,
                                                            bgcolor: 'rgba(118, 75, 162, 0.05)',
                                                            borderRadius: 2,
                                                            height: '100%'
                                                        }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                                                <Box sx={{
                                                                    bgcolor: 'secondary.main',
                                                                    borderRadius: '50%',
                                                                    p: 0.5,
                                                                    display: 'flex'
                                                                }}>
                                                                    <PersonIcon sx={{ color: 'white', fontSize: 20 }} />
                                                                </Box>
                                                                <Typography variant="overline" color="text.secondary" fontWeight="bold">
                                                                    {t('agentInfo')}
                                                                </Typography>
                                                            </Box>
                                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                                                <Typography variant="body1" fontWeight="bold" color="text.primary">
                                                                    {r.agent_id?.fullName}
                                                                </Typography>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <EmailIcon fontSize="small" color="action" />
                                                                    <Typography
                                                                        variant="body2"
                                                                        color="text.secondary"
                                                                        sx={{
                                                                            overflow: 'hidden',
                                                                            textOverflow: 'ellipsis',
                                                                            whiteSpace: 'nowrap'
                                                                        }}
                                                                    >
                                                                        {r.agent_id?.email}
                                                                    </Typography>
                                                                </Box>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <PhoneIcon fontSize="small" color="action" />
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        {r.agent_id?.phone}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                        </Box>
                                                    </Grid>

                                                    {/* Status and Actions */}
                                                    <Grid size={{ xs: 12 }}>
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                flexDirection: { xs: 'column', sm: 'row' },
                                                                justifyContent: 'space-between',
                                                                alignItems: { xs: 'stretch', sm: 'center' },
                                                                gap: 2,
                                                                pt: 2,
                                                                borderTop: '2px solid',
                                                                borderColor: 'divider'
                                                            }}
                                                        >
                                                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: { xs: 'flex-start', sm: 'center' } }}>
                                                                {getStatusChip(r.status)}
                                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                    🕐 {t('createdAt')}: <strong>{new Date(r.createdAt).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')}</strong>
                                                                </Typography>
                                                            </Box>

                                                            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                                                                <Button
                                                                    variant="outlined"
                                                                    color="error"
                                                                    startIcon={<CancelIcon />}
                                                                    onClick={() => handleReject(r._id)}
                                                                    disabled={!isPending || isLoading}
                                                                    sx={{
                                                                        borderRadius: 2,
                                                                        textTransform: 'none',
                                                                        fontWeight: 'bold',
                                                                        px: 3
                                                                    }}
                                                                >
                                                                    {isLoading ? t('processing') : t('rejectButton')}
                                                                </Button>
                                                                <Button
                                                                    variant="contained"
                                                                    color="success"
                                                                    startIcon={<CheckCircleIcon />}
                                                                    onClick={() => handleAccept(r._id)}
                                                                    disabled={!isPending || isLoading}
                                                                    sx={{
                                                                        borderRadius: 2,
                                                                        textTransform: 'none',
                                                                        fontWeight: 'bold',
                                                                        px: 3,
                                                                        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
                                                                    }}
                                                                >
                                                                    {isLoading ? t('processing') : t('acceptButton')}
                                                                </Button>
                                                            </Box>
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                );
                            })}
                        </Grid>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                                <Pagination
                                    count={totalPages}
                                    page={currentPage}
                                    onChange={handleChangePage}
                                    color="primary"
                                    size="large"
                                    showFirstButton
                                    showLastButton
                                    renderItem={(item) => (
                                        <PaginationItem
                                            slots={{
                                                previous: ArrowBackIcon,
                                                next: ArrowForwardIcon
                                            }}
                                            {...item}
                                        />
                                    )}
                                    sx={{
                                        '& .MuiPaginationItem-root': {
                                            borderRadius: 2,
                                            fontWeight: 'bold'
                                        }
                                    }}
                                />
                            </Box>
                        )}
                    </>
                )}
            </Box>
        </Box>
    );
};

export default ListRequestJoin;