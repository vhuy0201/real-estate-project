import React, { useState, useEffect } from "react";
import {
    Box,
    Container,
    Paper,
    Typography,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    InputAdornment,
    Alert,
    Tabs,
    Tab,
    Grid,
    Card,
    CardContent,
    CardActions,
    Stack,
    Pagination,
    IconButton,
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getMyProperties, updateProperty, deleteProperty } from "../services/propertyService";
import type { Property } from "../types/Property";
import PropertyEditModal from "../components/PropertyManagement/PropertyEditModal";
import { getText, containsText } from "../utils/multilang";
import { getLanguage, getUser } from "../utils/storage";
import type { Lang } from "../utils/storage";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

const MyPropertiesPage: React.FC = () => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [currentLang, setCurrentLang] = useState<Lang>(getLanguage());
    const [page, setPage] = useState(1);
    const [imageIndexes, setImageIndexes] = useState<Record<string, number>>({});
    const [isUpdating, setIsUpdating] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const itemsPerPage = 6;
    const { t } = useTranslation("myProperties");
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    useEffect(() => {
        loadProperties();
    }, []);

    useEffect(() => {
        if (id && properties.length > 0 && !isUpdating && !isClosing && !editModalOpen && !selectedProperty) {
            const property = properties.find(p => p._id === id);
            if (property) {
                setSelectedProperty(property);
                setEditModalOpen(true);
            }
        }
    }, [id, properties, isUpdating, isClosing, editModalOpen, selectedProperty]);

    useEffect(() => {
        filterProperties();
    }, [properties, searchTerm, statusFilter]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentLang(getLanguage());
        }, 100);
        return () => clearInterval(interval);
    }, []);

    const loadProperties = async () => {
        const user = getUser();
        const role = user?.role;
        if (role === "buyer") {
            setProperties([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const data = await getMyProperties();
            const validData = Array.isArray(data) ? data.filter(p => p && p._id) : [];
            setProperties(validData);
        } catch (error: any) {
            const status = error.response?.status;

            if (status === 401) {
                toast.error(t("sessionExpired"));
                setTimeout(() => {
                    window.location.href = "/login";
                }, 2000);
            } else if (status === 403) {
                if (role !== "buyer") {
                    toast.error(t("noPermission"));
                }
            } else {
                toast.error(error.response?.data?.message || t("loadFailed"));
            }
        } finally {
            setLoading(false);
        }
    };

    const filterProperties = () => {
        let filtered = properties;

        if (statusFilter !== "all") {
            filtered = filtered.filter(p => p.status === statusFilter);
        }

        if (searchTerm) {
            filtered = filtered.filter(p =>
                containsText(p.title, searchTerm) ||
                containsText(p.address, searchTerm) ||
                containsText(p.city_id?.city_name, searchTerm) ||
                containsText(p.type_id?.type_name, searchTerm) ||
                containsText(p.category_id?.category_name, searchTerm) ||
                p.features?.some(f => containsText(f.feature_name, searchTerm))
            );
        }

        setFilteredProperties(filtered);
        setPage(1);
    };

    const handleImagePrev = (propertyId: string, totalImages: number) => {
        setImageIndexes(prev => ({
            ...prev,
            [propertyId]: ((prev[propertyId] || 0) - 1 + totalImages) % totalImages
        }));
    };

    const handleImageNext = (propertyId: string, totalImages: number) => {
        setImageIndexes(prev => ({
            ...prev,
            [propertyId]: ((prev[propertyId] || 0) + 1) % totalImages
        }));
    };

    const handleEdit = (property: Property) => {
        const user = getUser();
        const role = user?.role;
        if (role === "seller") {
            navigate(`/seller/my-properties/${property._id}`);
        } else if (role === "agent") {
            navigate(`/agent/my-properties/${property._id}`);
        } else {
            setSelectedProperty(property);
            setEditModalOpen(true);
        }
    };

    const handleCloseModal = () => {
        setIsClosing(true);
        setEditModalOpen(false);
        setSelectedProperty(null);
        const user = getUser();
        const role = user?.role;
        if (role === "seller") {
            navigate("/seller/my-properties", { replace: true });
        } else if (role === "agent") {
            navigate("/agent/my-properties", { replace: true });
        }
        setTimeout(() => {
            setIsClosing(false);
        }, 300);
    };

    const handleUpdate = async (id: string, formData: FormData) => {
        setIsUpdating(true);
        try {
            await updateProperty(id, formData);
            toast.success(t("updateSuccess"));
            setEditModalOpen(false);
            setSelectedProperty(null);
            const user = getUser();
            const role = user?.role;
            if (role === "seller") {
                navigate("/seller/my-properties");
            } else if (role === "agent") {
                navigate("/agent/my-properties");
            }
            setTimeout(async () => {
                await loadProperties();
                setIsUpdating(false);
            }, 100);
        } catch (error: any) {
            setIsUpdating(false);
            const message = error.response?.data?.message || t("updateFailed");
            toast.error(`❌ ${message}`);
            throw error;
        }
    };

    const handleDeleteClick = (property: Property) => {
        if (property.status === "rented" || property.status === "sold") {
            toast.error(t("cannotDelete"));
            return;
        }
        setSelectedProperty(property);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedProperty) return;

        setDeletingId(selectedProperty._id);
        try {
            await deleteProperty(selectedProperty._id);
            toast.success(t("deleteSuccess"));
            setDeleteDialogOpen(false);
            setSelectedProperty(null);
            setProperties(prev => prev.filter(p => p._id !== selectedProperty._id));
        } catch (error: any) {
            const message = error.response?.data?.message || t("deleteFailed");
            if (error.response?.status === 403) {
                toast.error(t("noPermissionDelete"));
            } else if (message.includes("đang được sử dụng")) {
                toast.error(`❌ ${message}`);
            } else {
                toast.error(`❌ ${message}`);
            }
        } finally {
            setDeletingId(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "available":
                return "success";
            case "pending":
                return "warning";
            case "approved":
                return "info";
            case "sold":
                return "error";
            case "rejected":
                return "error";
            default:
                return "default";
        }
    };

    const getStatusLabel = (status: string): string => {
        try {
            const label = t(`status.${status}` as any);
            return label && label !== `status.${status}` ? label : status;
        } catch {
            return status;
        }
    };

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: { xs: 1.5, sm: 3, md: 4 } }}>
            <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
                <Paper elevation={3} sx={{ p: { xs: 1.5, sm: 2.5, md: 3 } }}>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: { xs: "column", sm: "row" },
                            justifyContent: "space-between",
                            alignItems: { xs: "flex-start", sm: "center" },
                            gap: { xs: 1.5, sm: 2 },
                            mb: { xs: 2, sm: 2.5, md: 3 }
                        }}
                    >
                        <Typography
                            variant="h4"
                            component="h1"
                            fontWeight="bold"
                            color="primary"
                            sx={{
                                fontSize: { xs: "1.25rem", sm: "1.75rem", md: "2.125rem" },
                                lineHeight: 1.2
                            }}
                        >
                            {t("propertyManagement")}
                        </Typography>
                    </Box>
                    <Tabs
                        value={statusFilter}
                        onChange={(_, newValue) => setStatusFilter(newValue)}
                        variant="scrollable"
                        scrollButtons="auto"
                        allowScrollButtonsMobile
                        sx={{
                            borderBottom: 1,
                            borderColor: "divider",
                            mb: { xs: 2, sm: 2.5, md: 3 },
                            "& .MuiTab-root": {
                                textTransform: "none",
                                fontWeight: 600,
                                fontSize: { xs: "0.7rem", sm: "0.8rem", md: "0.875rem" },
                                minWidth: { xs: 50, sm: 70, md: 90 },
                                px: { xs: 0.75, sm: 1.5, md: 2 },
                                py: { xs: 1, sm: 1.25 },
                            },
                            "& .MuiTabs-scrollButtons": {
                                width: { xs: 32, sm: 40 },
                            }
                        }}
                    >
                        <Tab label={t("all")} value="all" />
                        <Tab label={t("available")} value="available" />
                        <Tab label={t("pending")} value="pending" />
                        <Tab label={t("approved")} value="approved" />
                        <Tab label={t("rejected")} value="rejected" />
                    </Tabs>
                    <Box sx={{ mb: { xs: 2, sm: 2.5, md: 3 } }}>
                        <TextField
                            fullWidth
                            placeholder={t("searchPlaceholder")}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            size="small"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }} />
                                    </InputAdornment>
                                ),
                                sx: {
                                    fontSize: { xs: "0.875rem", sm: "0.9375rem", md: "1rem" },
                                    py: { xs: 0.5, sm: 0.75 }
                                }
                            }}
                        />
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                mt: { xs: 0.75, sm: 1 },
                                textAlign: "right",
                                fontSize: { xs: "0.7rem", sm: "0.8rem", md: "0.875rem" }
                            }}
                        >
                            {t("showing")}: {filteredProperties.length}/{properties.length}
                        </Typography>
                    </Box>

                    {loading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                            <CircularProgress size={60} />
                        </Box>
                    ) : properties.length === 0 ? (
                        <Alert severity="info" sx={{ my: 3 }}>
                            {t("noProperties")}
                        </Alert>
                    ) : filteredProperties.length === 0 ? (
                        <Alert severity="warning" sx={{ my: 3 }}>
                            {t("noPropertiesFound")}
                        </Alert>
                    ) : (
                        <>
                            <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
                                {filteredProperties
                                    .slice((page - 1) * itemsPerPage, page * itemsPerPage)
                                    .map((property) => {
                                        const currentImageIndex = imageIndexes[property._id] || 0;
                                        const images = property.images?.length > 0 ? property.images : ["/defaultHome.png"];

                                        return (
                                            <Grid key={property._id} size={{ xs: 12, sm: 6, md: 4 }}>
                                                <Card
                                                    sx={{
                                                        height: "100%",
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                                                        "&:hover": {
                                                            transform: { xs: "none", sm: "scale(1.02)" },
                                                            boxShadow: { xs: 2, sm: 6 },
                                                        },
                                                        borderRadius: { xs: 2, sm: 3 },
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            position: "relative",
                                                            height: { xs: 180, sm: 220, md: 250 },
                                                            bgcolor: "#f5f5f5",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            borderRadius: { xs: "8px 8px 0 0", sm: "12px 12px 0 0" },
                                                        }}
                                                    >
                                                        <Box
                                                            component="img"
                                                            src={images[currentImageIndex]}
                                                            alt={getText(property.title, currentLang)}
                                                            sx={{
                                                                width: "100%",
                                                                height: "100%",
                                                                objectFit: "contain",
                                                                borderBottom: "1px solid #eee",
                                                            }}
                                                        />

                                                        {images.length > 1 && (
                                                            <>
                                                                <IconButton
                                                                    onClick={() => handleImagePrev(property._id, images.length)}
                                                                    size="small"
                                                                    sx={{
                                                                        position: "absolute",
                                                                        left: { xs: 4, sm: 6, md: 8 },
                                                                        top: "50%",
                                                                        transform: "translateY(-50%)",
                                                                        bgcolor: "rgba(255,255,255,0.9)",
                                                                        "&:hover": { bgcolor: "rgba(255,255,255,1)" },
                                                                        width: { xs: 28, sm: 36, md: 40 },
                                                                        height: { xs: 28, sm: 36, md: 40 },
                                                                        boxShadow: 2,
                                                                    }}
                                                                >
                                                                    <ChevronLeft sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }} />
                                                                </IconButton>
                                                                <IconButton
                                                                    onClick={() => handleImageNext(property._id, images.length)}
                                                                    size="small"
                                                                    sx={{
                                                                        position: "absolute",
                                                                        right: { xs: 4, sm: 6, md: 8 },
                                                                        top: "50%",
                                                                        transform: "translateY(-50%)",
                                                                        bgcolor: "rgba(255,255,255,0.9)",
                                                                        "&:hover": { bgcolor: "rgba(255,255,255,1)" },
                                                                        width: { xs: 28, sm: 36, md: 40 },
                                                                        height: { xs: 28, sm: 36, md: 40 },
                                                                        boxShadow: 2,
                                                                    }}
                                                                >
                                                                    <ChevronRight sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }} />
                                                                </IconButton>
                                                                <Box
                                                                    sx={{
                                                                        position: "absolute",
                                                                        bottom: { xs: 6, sm: 8 },
                                                                        left: "50%",
                                                                        transform: "translateX(-50%)",
                                                                        bgcolor: "rgba(0,0,0,0.7)",
                                                                        color: "white",
                                                                        px: { xs: 1, sm: 1.5 },
                                                                        py: { xs: 0.25, sm: 0.5 },
                                                                        borderRadius: { xs: 1.5, sm: 2 },
                                                                        fontSize: { xs: "0.7rem", sm: "0.8rem", md: "0.875rem" },
                                                                        fontWeight: 600,
                                                                    }}
                                                                >
                                                                    {currentImageIndex + 1} / {images.length}
                                                                </Box>
                                                            </>
                                                        )}
                                                    </Box>
                                                    <CardContent sx={{ flexGrow: 1, p: { xs: 1.5, sm: 2 }, "&:last-child": { pb: { xs: 1.5, sm: 2 } } }}>
                                                        <Typography
                                                            gutterBottom
                                                            variant="h6"
                                                            component="div"
                                                            color="primary"
                                                            sx={{
                                                                fontWeight: 700,
                                                                overflow: "hidden",
                                                                textOverflow: "ellipsis",
                                                                display: "-webkit-box",
                                                                WebkitLineClamp: 2,
                                                                WebkitBoxOrient: "vertical",
                                                                minHeight: { xs: "auto", sm: "3.2em", md: "3.6em" },
                                                                fontSize: { xs: "0.9375rem", sm: "1.125rem", md: "1.25rem" },
                                                                lineHeight: 1.3,
                                                                mb: { xs: 0.75, sm: 1 },
                                                            }}
                                                        >
                                                            {getText(property.title, currentLang)}
                                                        </Typography>
                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                            sx={{
                                                                mb: { xs: 1, sm: 1.5 },
                                                                overflow: "hidden",
                                                                textOverflow: "ellipsis",
                                                                display: "-webkit-box",
                                                                WebkitLineClamp: 2,
                                                                WebkitBoxOrient: "vertical",
                                                                fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                                                                lineHeight: 1.4,
                                                            }}
                                                        >
                                                            {getText(property.address, currentLang)}
                                                        </Typography>
                                                        <Typography
                                                            variant="h6"
                                                            color="error"
                                                            fontWeight={700}
                                                            sx={{
                                                                mb: { xs: 1, sm: 1.5 },
                                                                fontSize: { xs: "1rem", sm: "1.125rem", md: "1.25rem" },
                                                            }}
                                                        >
                                                            {t("price")}: {property.price.toLocaleString("vi-VN")} {t("vnd")}
                                                        </Typography>
                                                        <Box sx={{ display: "flex", gap: { xs: 0.75, sm: 1 }, flexWrap: "wrap", mb: { xs: 0.5, sm: 1 } }}>
                                                            {property.type_id && (
                                                                <Chip
                                                                    label={getText(property.type_id.type_name as any, currentLang)}
                                                                    color="info"
                                                                    size="small"
                                                                    variant="outlined"
                                                                    sx={{
                                                                        fontSize: { xs: "0.7rem", sm: "0.75rem" },
                                                                        height: { xs: 24, sm: 28 },
                                                                        "& .MuiChip-label": { px: { xs: 1, sm: 1.5 } }
                                                                    }}
                                                                />
                                                            )}
                                                            <Chip
                                                                label={getStatusLabel(property.status)}
                                                                color={getStatusColor(property.status)}
                                                                size="small"
                                                                sx={{
                                                                    fontSize: { xs: "0.7rem", sm: "0.75rem" },
                                                                    height: { xs: 24, sm: 28 },
                                                                    "& .MuiChip-label": { px: { xs: 1, sm: 1.5 } }
                                                                }}
                                                            />
                                                        </Box>
                                                    </CardContent>
                                                    <CardActions sx={{
                                                        p: { xs: 1.5, sm: 2 },
                                                        pt: 0,
                                                        gap: { xs: 0.75, sm: 1 },
                                                        flexDirection: { xs: "column", sm: "row" }
                                                    }}>
                                                        <Button
                                                            fullWidth
                                                            variant="contained"
                                                            color="primary"
                                                            startIcon={<EditIcon sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }} />}
                                                            onClick={() => handleEdit(property)}
                                                            sx={{
                                                                fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                                                                py: { xs: 0.75, sm: 0.875 },
                                                                textTransform: "none",
                                                                fontWeight: 600,
                                                            }}
                                                        >
                                                            {t("edit")}
                                                        </Button>
                                                        <Button
                                                            fullWidth
                                                            variant="outlined"
                                                            color="error"
                                                            startIcon={<DeleteIcon sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }} />}
                                                            onClick={() => handleDeleteClick(property)}
                                                            sx={{
                                                                fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                                                                py: { xs: 0.75, sm: 0.875 },
                                                                textTransform: "none",
                                                                fontWeight: 600,
                                                            }}
                                                        >
                                                            {t("delete")}
                                                        </Button>
                                                    </CardActions>
                                                </Card>
                                            </Grid>
                                        );
                                    })}
                            </Grid>

                            <Stack spacing={2} alignItems="center" sx={{ mt: { xs: 3, sm: 4 } }}>
                                <Pagination
                                    count={Math.ceil(filteredProperties.length / itemsPerPage)}
                                    page={page}
                                    onChange={(_, value) => {
                                        setPage(value);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    color="primary"
                                    size="medium"
                                    showFirstButton
                                    showLastButton
                                    siblingCount={0}
                                    boundaryCount={1}
                                    sx={{
                                        "& .MuiPaginationItem-root": {
                                            fontSize: { xs: "0.7rem", sm: "0.8125rem", md: "0.875rem" },
                                            minWidth: { xs: 28, sm: 32, md: 36 },
                                            height: { xs: 28, sm: 32, md: 36 },
                                        },
                                        "& .MuiPaginationItem-icon": {
                                            fontSize: { xs: "1rem", sm: "1.25rem" }
                                        },
                                        "& .MuiPaginationItem-sizeMedium": {
                                            minWidth: { xs: 28, sm: 32, md: 36 },
                                            height: { xs: 28, sm: 32, md: 36 },
                                        }
                                    }}
                                />
                            </Stack>
                        </>
                    )}
                </Paper>

                <PropertyEditModal
                    open={editModalOpen}
                    property={selectedProperty}
                    onClose={handleCloseModal}
                    onSubmit={handleUpdate}
                />

                <Dialog
                    open={deleteDialogOpen}
                    onClose={() => !deletingId && setDeleteDialogOpen(false)}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle sx={{ bgcolor: "error.light", color: "error.contrastText" }}>
                        ⚠️ {t("confirmDelete")}
                    </DialogTitle>
                    <DialogContent sx={{ mt: 2 }}>
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            {t("deleteConfirmation")}
                        </Alert>
                        <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                                {t("title")}
                            </Typography>
                            <Typography variant="body1" fontWeight={600} gutterBottom>
                                {selectedProperty ? getText(selectedProperty.title as any, currentLang) : ""}
                            </Typography>
                            <Typography variant="subtitle2" color="text.secondary">
                                {t("address")}
                            </Typography>
                            <Typography variant="body2">
                                {selectedProperty ? getText(selectedProperty.address as any, currentLang) : ""}
                            </Typography>
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button
                            onClick={() => setDeleteDialogOpen(false)}
                            disabled={deletingId !== null}
                            variant="outlined"
                        >
                            {t("cancel")}
                        </Button>
                        <Button
                            onClick={handleDeleteConfirm}
                            color="error"
                            variant="contained"
                            disabled={deletingId !== null}
                            startIcon={deletingId ? <CircularProgress size={16} /> : <DeleteIcon />}
                        >
                            {deletingId ? t("deleting") : t("confirmDelete")}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
};

export default MyPropertiesPage;

