import { useState, useEffect } from 'react';
import { getAllAgents, assignAgent } from '../../services/seller.service';
import type { Agent } from '@/types/Agent';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Pagination,
    TextField,
    MenuItem,
    Card,
    CardContent,
    CardMedia,
    Chip,
    Typography,
    Grid,
    CircularProgress
} from '@mui/material';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Bounce, ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const ListAgent = () => {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation(['listAgents']);
    const { id: propertyId } = useParams();
    const navigate = useNavigate();
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [page, setPage] = useState(1);
    const [itemsPerPage] = useState(6);

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        const fetchAgents = async () => {
            try {
                const response = await getAllAgents();
                setAgents(response || []);
            } catch (error) {
                console.log('Cannot fetch agents', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAgents();
    }, []);

    if (!propertyId) {
        console.log('Không tìm thấy ID bất động sản!');
        return null;
    }

    const handleOpenConfirm = (agent: Agent) => {
        setSelectedAgent(agent);
        setOpenConfirm(true);
    };

    const handleChangePage = (_: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleConfirmAssign = async () => {
        if (!propertyId || !selectedAgent) return;
        try {
            const data = await assignAgent(propertyId, selectedAgent._id);
            console.log(data);
            toast.success(t('listAgents:succesessAssign'));
        } catch (error: any) {
            if (error.response) {
                const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Có lỗi xảy ra';
                const statusCode = error.response?.status;
                console.error("Response error:", {
                    status: statusCode,
                    message: errorMessage,
                    data: error.response.data
                });
                toast.error(t('listAgents:failAssign'));
            } else if (error.request) {
                console.error('Request error:', error.request);

            } else {
                console.error('Other error:', error.message);

            }
        } finally {
            setOpenConfirm(false);
            setSelectedAgent(null);
        }
    };


    const filteredAgents = agents.filter(a => {
        const matchesSearch = a.fullName.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' ? true : statusFilter === 'active' ? a.isActive : !a.isActive;
        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredAgents.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const currentAgents = filteredAgents.slice(startIndex, startIndex + itemsPerPage);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', py: 4, px: { xs: 2, md: 4 } }}>
            <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
                {/* Header */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
                        {t('agentList')}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {t('listAgents:description', { defaultValue: 'Chọn chuyên viên phù hợp để theo sát giao dịch và hỗ trợ người bán nhanh chóng.' })}
                    </Typography>
                </Box>

                {/* Filter Section */}
                <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                    <TextField
                        label={t('listAgents:findAgents')}
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        sx={{ bgcolor: 'white' }}
                    />
                    <TextField
                        select
                        label={t('status')}
                        size="small"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        sx={{ minWidth: { xs: '100%', sm: 200 }, bgcolor: 'white' }}
                    >
                        <MenuItem value="all">{t('listAgents:allStatus')}</MenuItem>
                        <MenuItem value="active">{t('listAgents:active')}</MenuItem>
                        <MenuItem value="inactive">{t('listAgents:inactive')}</MenuItem>
                    </TextField>
                </Box>

                {/* No Results */}
                {currentAgents.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 8, bgcolor: 'white', borderRadius: 2 }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            {t('listAgents:noResultTitle', { defaultValue: 'Không tìm thấy chuyên viên phù hợp' })}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {t('listAgents:noResultDesc', { defaultValue: 'Hãy thay đổi từ khóa tìm kiếm hoặc trạng thái hoạt động để có thêm kết quả.' })}
                        </Typography>
                    </Box>
                )}

                {/* Agent Cards */}
                <Grid container spacing={3}>
                    {currentAgents.map((agent) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={agent._id}>
                            <Card
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    p: 3,
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 4,
                                    },
                                }}
                            >
                                <CardMedia
                                    component="img"
                                    image={agent.avatar || '/defaultUser.png'}
                                    alt={agent.fullName}
                                    sx={{
                                        width: 100,
                                        height: 100,
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        mb: 2,
                                        border: '3px solid',
                                        borderColor: 'primary.main',
                                    }}
                                />

                                <Chip
                                    label={agent.role?.toUpperCase() || 'AGENT'}
                                    color="warning"
                                    size="small"
                                    sx={{ mb: 1, fontWeight: 'bold' }}
                                />

                                <Typography variant="h6" fontWeight="bold" align="center" gutterBottom>
                                    {agent.fullName}
                                </Typography>

                                <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 1 }}>
                                    {agent.email}
                                </Typography>

                                {agent.phone && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <LocalPhoneIcon fontSize="small" color="primary" />
                                        <Typography variant="body2">{agent.phone}</Typography>
                                    </Box>
                                )}

                                <Chip
                                    label={agent.isActive ? t('listAgents:active') : t('listAgents:inactive')}
                                    color={agent.isActive ? 'success' : 'error'}
                                    size="small"
                                    sx={{ mb: 2 }}
                                />

                                <CardContent sx={{ width: '100%', p: 0, '&:last-child': { pb: 0 } }}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        color="primary"
                                        onClick={() => handleOpenConfirm(agent)}
                                        sx={{ textTransform: 'none', fontWeight: 'bold' }}
                                    >
                                        {t('listAgents:assignAgent')}
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* Pagination */}
                {totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={handleChangePage}
                            color="primary"
                            size="large"
                            showFirstButton
                            showLastButton
                        />
                    </Box>
                )}
            </Box>

            {/* Confirm Dialog */}
            <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {t('listAgents:titileConfirmAssign')}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>{t('listAgents:confirmAssign')}</DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button onClick={() => setOpenConfirm(false)} variant="outlined">
                        {t('listAgents:cancel')}
                    </Button>
                    <Button onClick={handleConfirmAssign} variant="contained" color="primary">
                        {t('listAgents:confirm')}
                    </Button>
                </DialogActions>
            </Dialog>

            <ToastContainer position="top-right" autoClose={3000} theme="light" transition={Bounce} />
        </Box>
    );
};

export default ListAgent;
