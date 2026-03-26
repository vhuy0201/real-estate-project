import type { Property } from '../../types/Property';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { getLanguage } from '../../utils/storage';
import type { Lang } from '../../utils/storage';
import {
    Button,
    Card,
    CardContent,
    CardMedia,
    Chip,
    Grid,
    Pagination,
    Typography,
    TextField,
    MenuItem,
    PaginationItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Box,
    CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SearchIcon from '@mui/icons-material/Search';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CancelIcon from '@mui/icons-material/Cancel';
import SendIcon from '@mui/icons-material/Send';
import { getPropertiesNoAgent, requestJoinProperty, getAllAssignments, cancelRequestJoinProperty } from '@/services/agent.service';
import { Bounce, toast, ToastContainer } from "react-toastify"
import type { AssignAgent } from '@/types/AsssignAgents';

const SellerProperties = () => {
    const [proNoAgent, setProNoAgent] = useState<Property[]>([]);
    const [filtered, setFiltered] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [itemsPerPage] = useState(6);

    const { t } = useTranslation(['home', 'properties', 'listProperties']);
    const currentLanguage: Lang = getLanguage();

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const [currentPage, setCurrentPage] = useState(1);
    const [fileteredPrice, setFilteredPrice] = useState('all');
    const [open, setOpen] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);


    const [requestedProperties, setRequestedProperties] = useState<Map<string, string>>(new Map()); // propertyId -> assignmentId


    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch properties with no agent
                const propertiesResponse = await getPropertiesNoAgent();
                setProNoAgent(propertiesResponse);

                // Fetch agent's assignments to check pending requests
                const assignmentsResponse = await getAllAssignments();
                const pendingRequests = new Map<string, string>();

                assignmentsResponse.forEach((assignment: AssignAgent) => {
                    if (assignment.status === 'pending') {
                        pendingRequests.set(assignment.property_id._id, assignment._id);
                    }
                });

                setRequestedProperties(pendingRequests);
            } catch (error) {
                console.log("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);
    const handleRequestJoin = async (id: string, ownerId: string) => {
        try {
            const response = await requestJoinProperty(id, ownerId);
            toast.success("Request sent successfully");

            if (response?.data?._id) {
                setRequestedProperties(prev => new Map(prev).set(id, response.data._id));
            }

            return response;
        } catch (error) {
            toast.error("Failed to send request");
            console.log("Error requesting to join property:", error);
            throw error;
        }
    }

    const handleCancelRequest = async (propertyId: string) => {
        const assignmentId = requestedProperties.get(propertyId);
        if (!assignmentId) return;

        try {
            await cancelRequestJoinProperty(assignmentId);
            toast.success("Request cancelled successfully");

            setRequestedProperties(prev => {
                const newMap = new Map(prev);
                newMap.delete(propertyId);
                return newMap;
            });
        } catch (error) {
            toast.error("Failed to cancel request");
            console.log("Error cancelling request:", error);
            throw error;
        }
    }

    useEffect(() => {
        let result = [...proNoAgent];
        if (search.trim() !== '') {
            result = result.filter(p =>
                p.title[currentLanguage].toLowerCase().includes(search.toLowerCase()) ||
                p.address[currentLanguage].toLowerCase().includes(search.toLowerCase())
            );
        }

        if (statusFilter !== 'all') {
            result = result.filter(p => p.status === statusFilter);
        }
        if (fileteredPrice === 'ascending') {
            result = result.sort((a, b) => a.price - b.price);

        } else if (fileteredPrice === 'descending') {
            result = result.sort((a, b) => b.price - a.price);
        }
        else {
            result = result;
        }

        setFiltered(result);
        setCurrentPage(1);
    }, [search, statusFilter, proNoAgent, fileteredPrice]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    const handleClose = () => {
        setOpen(false);
        setSelectedProperty(null);
    }

    const handleOpen = (property: Property) => {
        setSelectedProperty(property);
        setOpen(true);
    }


    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentProperties = filtered.slice(startIndex, startIndex + itemsPerPage);

    const handleChangePage = (_: React.ChangeEvent<unknown>, value: number) => {
        setCurrentPage(value);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <Box className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50" sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
            {/* Header Section */}
            <Box sx={{ maxWidth: 1400, mx: 'auto', mb: 4 }}>
                <Box sx={{
                    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                    borderRadius: 4,
                    p: { xs: 3, md: 4 },
                    color: 'white',
                    boxShadow: '0 10px 40px rgba(17, 153, 142, 0.3)'
                }}>
                    <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>
                        🏢 {t('listProperties:text-listProperties')}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
                        {t('listProperties:subtitle')}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Chip
                            label={`${t('listProperties:totalProperties')}: ${proNoAgent.length}`}
                            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold' }}
                        />
                        <Chip
                            label={`${t('listProperties:showing')}: ${filtered.length}`}
                            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold' }}
                        />
                    </Box>
                </Box>
            </Box>

            {/* Filter Section */}
            <Box sx={{ maxWidth: 1400, mx: 'auto', mb: 3 }}>
                <Card sx={{ p: 2.5, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', borderRadius: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                        <TextField
                            placeholder={t('listProperties:search')}
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
                            label={t('listProperties:statusLabel')}
                            size="small"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            sx={{
                                minWidth: { xs: '100%', md: 180 },
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2
                                }
                            }}
                        >
                            <MenuItem value="all">{t('listProperties:allStatus')}</MenuItem>
                            <MenuItem value="rejected">{t('listProperties:Rejected')}</MenuItem>
                            <MenuItem value="pending">{t('listProperties:Pending')}</MenuItem>
                            <MenuItem value="available">{t('listProperties:Available')}</MenuItem>
                            <MenuItem value="approved">{t('listProperties:Approved')}</MenuItem>
                        </TextField>

                        <TextField
                            select
                            label={t('listProperties:priceLabel')}
                            size="small"
                            value={fileteredPrice}
                            onChange={(e) => setFilteredPrice(e.target.value)}
                            sx={{
                                minWidth: { xs: '100%', md: 180 },
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2
                                }
                            }}
                        >
                            <MenuItem value="all">{t('listProperties:allPrice')}</MenuItem>
                            <MenuItem value="ascending">{t('listProperties:asceding')}</MenuItem>
                            <MenuItem value="descending">{t('listProperties:desceding')}</MenuItem>
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
                            <HomeWorkIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h5" color="text.secondary" gutterBottom>
                                {t('listProperties:notHaveProperty')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {search || statusFilter !== 'all'
                                    ? t('listProperties:filterHelp')
                                    : t('listProperties:noPropertiesWithoutAgent')}
                            </Typography>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <Grid container spacing={3}>
                            {currentProperties.map((p) => (
                                <Grid size={{ xs: 12, md: 4, sm: 6 }} key={p._id}>
                                    <Card
                                        sx={{
                                            borderRadius: 3,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            height: '100%',
                                            transition: 'all 0.3s ease',
                                            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            '&:hover': {
                                                transform: 'translateY(-8px)',
                                                boxShadow: '0 12px 40px rgba(17, 153, 142, 0.2)'
                                            }
                                        }}
                                    >
                                        <Box sx={{ position: 'relative' }}>
                                            <CardMedia
                                                component="img"
                                                height="180"
                                                image={p.images?.[0] || '/defaultHome.png'}
                                                alt={p.title.en}
                                                sx={{
                                                    height: { xs: 180, sm: 200, md: 220 },
                                                    objectFit: 'cover',
                                                }}
                                            />
                                            <Box sx={{ position: 'absolute', top: 12, right: 12, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                <Chip
                                                    label={p.status || t('listProperties:processing')}
                                                    color={
                                                        p.status === 'available'
                                                            ? 'success'
                                                            : p.status === 'pending'
                                                                ? 'warning'
                                                                : p.status === 'approved'
                                                                    ? 'primary'
                                                                    : p.status === 'rejected'
                                                                        ? 'error'
                                                                        : 'default'
                                                    }
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 'bold',
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                                                    }}
                                                />
                                                {requestedProperties.has(p._id) && (
                                                    <Chip
                                                        label={`⏳ ${t('listProperties:requestSent')}`}
                                                        size="small"
                                                        sx={{
                                                            fontWeight: 'bold',
                                                            bgcolor: 'rgba(255, 152, 0, 0.9)',
                                                            color: 'white',
                                                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                        </Box>

                                        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2.5 }}>
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Typography
                                                    variant="h6"
                                                    fontWeight="bold"
                                                    color="text.primary"
                                                    sx={{
                                                        mb: 1.5,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        minHeight: '3.6em'
                                                    }}
                                                >
                                                    {p.title[currentLanguage]}
                                                </Typography>

                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                                                    <LocationOnIcon sx={{ fontSize: 18, color: 'text.secondary', mt: 0.2 }} />
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            flex: 1
                                                        }}
                                                    >
                                                        {p.address[currentLanguage]}
                                                    </Typography>
                                                </Box>

                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                    bgcolor: 'rgba(17, 153, 142, 0.1)',
                                                    p: 1.5,
                                                    borderRadius: 2,
                                                    mt: 2
                                                }}>
                                                    <AttachMoneyIcon sx={{ fontSize: 20, color: 'success.main' }} />
                                                    <Typography variant="h6" color="success.main" fontWeight="bold">
                                                        {p.price.toLocaleString()} VNĐ
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2 }}>
                                                <Button
                                                    fullWidth
                                                    variant="outlined"
                                                    color="primary"
                                                    component={Link}
                                                    to={`${p._id}`}
                                                    sx={{
                                                        borderRadius: 2,
                                                        textTransform: 'none',
                                                        fontWeight: 'bold',
                                                        py: 1
                                                    }}
                                                >
                                                    {t('insideProperty.viewDetail')}
                                                </Button>

                                                {requestedProperties.has(p._id) ? (
                                                    <Button
                                                        fullWidth
                                                        variant="contained"
                                                        color="error"
                                                        startIcon={<CancelIcon />}
                                                        onClick={() => handleCancelRequest(p._id)}
                                                        sx={{
                                                            borderRadius: 2,
                                                            textTransform: 'none',
                                                            fontWeight: 'bold',
                                                            py: 1,
                                                            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                                                            transition: 'all 0.3s ease',
                                                            '&:hover': {
                                                                boxShadow: '0 6px 20px rgba(239, 68, 68, 0.4)',
                                                                transform: 'translateY(-2px)'
                                                            }
                                                        }}
                                                    >
                                                        {t('listProperties:cancelRequest')}
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        fullWidth
                                                        variant="contained"
                                                        color="success"
                                                        startIcon={<SendIcon />}
                                                        onClick={() => handleOpen(p)}
                                                        sx={{
                                                            borderRadius: 2,
                                                            textTransform: 'none',
                                                            fontWeight: 'bold',
                                                            py: 1,
                                                            boxShadow: '0 4px 12px rgba(17, 153, 142, 0.3)',
                                                            transition: 'all 0.3s ease',
                                                            '&:hover': {
                                                                boxShadow: '0 6px 20px rgba(17, 153, 142, 0.4)',
                                                                transform: 'translateY(-2px)'
                                                            }
                                                        }}
                                                    >
                                                        {t('listProperties:requestJoin')}
                                                    </Button>
                                                )}
                                            </Box>

                                            {p.agent_id && (
                                                <Box sx={{
                                                    mt: 2,
                                                    p: 1.5,
                                                    bgcolor: 'primary.50',
                                                    borderRadius: 2,
                                                    border: '1px solid',
                                                    borderColor: 'primary.200'
                                                }}>
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                                        {t('listProperties:currentAgent')}
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight="bold" color="primary.main">
                                                        {p.agent_id.fullName}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {p.agent_id.email}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>

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
                                            slots={{ previous: ArrowBackIcon, next: ArrowForwardIcon }}
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

                <Dialog
                    open={open}
                    onClose={handleClose}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        sx: {
                            borderRadius: 3,
                            p: 1
                        }
                    }}
                >
                    <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
                        {t('listProperties:confirmChoice')}
                    </DialogTitle>
                    <DialogContent>
                        {selectedProperty && (
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    {t('listProperties:requestingProperty')}:
                                </Typography>
                                <Box sx={{
                                    p: 2,
                                    bgcolor: 'grey.50',
                                    borderRadius: 2,
                                    mt: 1,
                                    border: '1px solid',
                                    borderColor: 'divider'
                                }}>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                                        {selectedProperty.title[currentLanguage]}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {selectedProperty.address[currentLanguage]}
                                    </Typography>
                                    <Typography variant="body2" color="success.main" fontWeight="bold" sx={{ mt: 1 }}>
                                        {selectedProperty.price.toLocaleString()} VNĐ
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                        <DialogContentText>
                            {t('listProperties:confirmMessage')}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ p: 2, gap: 1 }}>
                        <Button
                            onClick={handleClose}
                            variant="outlined"
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 'bold'
                            }}
                        >
                            {t('listProperties:cancel')}
                        </Button>
                        <Button
                            onClick={() => {
                                if (selectedProperty) {
                                    handleRequestJoin(selectedProperty._id, selectedProperty.owner_id?._id!);
                                    handleClose();
                                }
                            }}
                            variant="contained"
                            color="success"
                            autoFocus
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 'bold',
                                boxShadow: '0 4px 12px rgba(17, 153, 142, 0.3)'
                            }}
                        >
                            {t('listProperties:confirm')}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>

            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                transition={Bounce}
            />
        </Box>
    );
};

export default SellerProperties;


