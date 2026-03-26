import type { Property } from '../../types/Property';
import React, { useEffect, useState } from 'react';
import { getUser } from '../../utils/storage';
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
    Box
} from '@mui/material';
import { getPropertiesByAgentOrSeller } from '../../services/propertyService';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AddIcon from '@mui/icons-material/Add';

const SellerProperties = () => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [filtered, setFiltered] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const user = getUser();
    const [itemsPerPage] = useState(6);

    const { t } = useTranslation(['home', 'properties', 'listProperties']);
    const currentLanguage: Lang = getLanguage();

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priceFilter, setPriceFilter] = useState('all');

    const [currentPage, setCurrentPage] = useState(1);


    useEffect(() => {
        const fetchProperties = async () => {
            try {
                if (!user) return;
                const response = await getPropertiesByAgentOrSeller();
                setProperties(response || []);
                setFiltered(response || []);
            } catch (error) {
                console.log("Cannot fetch properties for this role", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProperties();
    }, []);

    // Filtering logic
    useEffect(() => {
        let result = [...properties];

        if (search.trim() !== '') {
            result = result.filter(p =>
                p.title[currentLanguage].toLowerCase().includes(search.toLowerCase())
            );
        }

        if (statusFilter !== 'all') {
            result = result.filter(p => p.status === statusFilter);
        }
        if (priceFilter === 'ascending') {
            result = result.sort((a, b) => a.price - b.price);
        } else if (priceFilter === 'descending') {
            result = result.sort((a, b) => b.price - a.price);
        }
        else {
            result = result;
        }

        setFiltered(result);
        setCurrentPage(1);
    }, [search, statusFilter, properties, priceFilter]);

    if (loading)
        return <p className="text-center text-gray-500 mt-10">{t('listProperties:loading')}</p>;


    // Pagination calculations
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentProperties = filtered.slice(startIndex, startIndex + itemsPerPage);

    const handleChangePage = (_: React.ChangeEvent<unknown>, value: number) => {
        setCurrentPage(value);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <Box className="p-2 bg-gray-50 min-h-screen ">
            <Box className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <Typography variant="h5" fontWeight="bold" color="text.primary">
                    {t('listProperties:text-listProperties')}
                </Typography>

                <Box className=" gap-3 items-center grid grid-cols-1 md:grid-cols-2 ">
                    <TextField className=''
                        label={t('listProperties:search')}
                        variant="outlined"
                        size="small"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <div className='flex gap-3 mt-3 md:mt-0'>
                        <Button
                            size='small'
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            component={Link}
                            to="/seller/create"
                            className='md:mb-0 mb-3'
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 'bold',
                                px: 2,
                            }}
                        >
                            {t('listProperties:createNewProperty')}
                        </Button>


                        <TextField
                            label={t('listProperties:status')}
                            select
                            size="small"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{ minWidth: 100 }}
                        >
                            <MenuItem value="all">{t('listProperties:allStatus')}</MenuItem>
                            <MenuItem value="rejected">{t('listProperties:Rejected')}</MenuItem>
                            <MenuItem value="pending">{t('listProperties:Pending')}</MenuItem>
                            <MenuItem value="available">{t('listProperties:Available')}</MenuItem>
                            <MenuItem value="approved">{t('listProperties:Approved')}</MenuItem>
                        </TextField>

                        <TextField
                            label={t('listProperties:price')}
                            select
                            size="small"
                            value={priceFilter}
                            onChange={(e) => setPriceFilter(e.target.value)}
                            style={{ minWidth: 150 }}
                        >
                            <MenuItem value="all">{t('listProperties:allPrice')}</MenuItem>
                            <MenuItem value="ascending">{t('listProperties:asceding')}</MenuItem>
                            <MenuItem value="descending">{t('listProperties:desceding')}</MenuItem>
                        </TextField>
                    </div>
                </Box>


            </Box>

            {filtered.length === 0 ? (
                <Box className="text-center w-full py-10">
                    <Typography variant="h6" color="text.secondary">
                        {t('listProperties:notHaveProperty')}
                    </Typography>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {currentProperties.map((p) => (
                        <Grid size={{ xs: 12, md: 4, sm: 6 }} key={p._id}>
                            <Card
                                sx={{
                                    borderRadius: 3,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: '100%',
                                    transition: 'transform 0.2s ease',
                                    '&:hover': { transform: 'scale(1.03)' }
                                }}
                            >
                                <CardMedia
                                    component="img"
                                    height="180"
                                    image={p.images?.[0] || '/defaultHome.png'}
                                    alt={p.title.en}
                                    sx={{
                                        height: { xs: 160, sm: 180, md: 200 },
                                        objectFit: 'cover',
                                    }}
                                />
                                <CardContent className="flex flex-col justify-between">
                                    <Box>
                                        <Box className="flex justify-between items-start mb-2">
                                            <Typography
                                                variant="h6"
                                                fontWeight="bold"
                                                color="primary.main"
                                                className="line-clamp-2"
                                            >
                                                {p.title[currentLanguage]}
                                            </Typography>
                                            <Chip
                                                label={p.status || 'Đang xử lý'}
                                                color={
                                                    p.status === 'available'
                                                        ? 'primary'
                                                        : p.status === 'pending'
                                                            ? 'warning'
                                                            : p.status === 'approved'
                                                                ? 'success'
                                                                : p.status === 'rejected'
                                                                    ? 'info'
                                                                    : 'secondary'
                                                }
                                                size="small"
                                            />
                                        </Box>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            className="line-clamp-2 mb-1"
                                        >
                                            {t('listProperties:address')}: {p.address[currentLanguage]}
                                        </Typography>
                                        <Typography variant="body2" color="text.primary" fontWeight="medium">
                                            {t('properties:price')}: {p.price.toLocaleString()} VNĐ
                                        </Typography>
                                    </Box>

                                    <Box className="flex gap-2 mt-4">
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            color="primary"
                                            component={Link}
                                            to={`${p._id}`}
                                            sx={{ borderRadius: 2, textTransform: 'none' }}
                                        >
                                            {t('listProperties:viewDetails')}
                                        </Button>

                                        {p.agent_id ? (
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                color="primary"
                                                disabled
                                                sx={{
                                                    borderRadius: 2,
                                                    textTransform: 'none',
                                                    '&.Mui-disabled': {
                                                        backgroundColor: 'rgba(0, 0, 0, 0.12)',
                                                        color: 'rgba(0, 0, 0, 0.26)'
                                                    }
                                                }}
                                                title={`${t('listProperties:haveAgent')} : ${p.agent_id.fullName}`}
                                            >
                                                {t('listProperties:haveAgent')}
                                            </Button>
                                        ) : p.status !== 'approved' ? (
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                color="primary"
                                                disabled
                                                sx={{
                                                    borderRadius: 2,
                                                    textTransform: 'none',
                                                    '&.Mui-disabled': {
                                                        backgroundColor: 'rgba(0, 0, 0, 0.12)',
                                                        color: 'rgba(0, 0, 0, 0.26)'
                                                    }
                                                }}
                                                title="Chỉ có thể assign agent khi property đã được approved"
                                            >
                                                {t('listProperties:assignAgent')}
                                            </Button>
                                        ) : (
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                color="primary"
                                                component={Link}
                                                to={`${p._id}/agents`}
                                                sx={{ borderRadius: 2, textTransform: 'none' }}
                                            >
                                                {t('listProperties:assignAgent')}
                                            </Button>
                                        )}
                                    </Box>

                                    {p.agent_id && (
                                        <Box className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                                            <Typography variant="caption" color="text.secondary" className="block mb-1">
                                                {t('listProperties:currentAgent')}
                                            </Typography>
                                            <Typography variant="body2" fontWeight="medium" color="primary.main">
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
            )}

            {/* Pagination */}
            {filtered.length > 0 && (
                <Box className="flex justify-center mt-10">
                    <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={handleChangePage}
                        renderItem={(item) => (
                            <PaginationItem
                                slots={{ previous: ArrowBackIcon, next: ArrowForwardIcon }}
                                {...item}
                            />
                        )}
                    />
                </Box>
            )}
        </Box>
    );
};

export default SellerProperties;