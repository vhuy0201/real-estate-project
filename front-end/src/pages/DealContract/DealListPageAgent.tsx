import React, { useEffect, useMemo, useState } from "react";
import { dealApiAgent } from "../../api/dealApiAgent";
import type { Deal } from "../../types/Deal";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, Typography, Button, Box, Chip, Grid, Container, Divider, IconButton, Pagination } from "@mui/material";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import BedIcon from '@mui/icons-material/Bed';
import BathtubIcon from '@mui/icons-material/Bathtub';
import PersonIcon from '@mui/icons-material/Person';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { useTranslation } from "react-i18next";
import { getLanguage } from "../../utils/storage";

const statusColors: Record<string, "default" | "success" | "warning" | "error" | "secondary"> = {
    contract_under_review: "warning",
    escrow_funded: "secondary",
    completed: "success",
    cancelled: "error",
    default: "default",
};

const statusLabels: Record<string, string> = {
    contract_under_review: "Contract under review",
    escrow_funded: "Escrow funded",
    completed: "Completed",
    cancelled: "Cancelled",
};

const DealListPageAgent: React.FC = () => {
    const { t } = useTranslation("dealContact");
    const lang = getLanguage();
    const [deals, setDeals] = useState<Deal[]>([]);

    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const itemsPerPage = 6;

    // State lưu index ảnh cho từng deal
    const [imageIndexes, setImageIndexes] = useState<{ [dealId: string]: number }>({});

    // Lấy index hiện tại của deal
    const getIndex = (dealId: string) => {
        return imageIndexes[dealId] ?? 0;
    };

    const nextImage = (dealId: string, length: number) => {
        setImageIndexes(prev => ({
            ...prev,
            [dealId]: ((prev[dealId] ?? 0) + 1) % length
        }));
    };

    const prevImage = (dealId: string, length: number) => {
        setImageIndexes(prev => ({
            ...prev,
            [dealId]: ((prev[dealId] ?? 0) - 1 + length) % length
        }));
    };

    useEffect(() => {
        dealApiAgent.getDeals().then(setDeals).catch(console.error);
    }, []);
    const paginatedAssignments = useMemo(() => {
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return deals.slice(startIndex, endIndex);
    }, [deals, page]);

    const totalPages = Math.ceil(deals.length / itemsPerPage);
    const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>

            {/* Tiêu đề đẹp */}
            <Box
                sx={{
                    mb: 5,
                    textAlign: "center",
                }}
            >
                <Typography
                    variant="h3"
                    sx={{
                        fontWeight: 600,
                        letterSpacing: "0.5px",
                        background: "linear-gradient(90deg, #1976d2, #42a5f5)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    }}
                >
                    {t("listDeal")}
                </Typography>

                <Typography
                    variant="subtitle1"
                    sx={{
                        color: "text.secondary",
                        fontSize: "1rem",
                        maxWidth: 400,
                        mx: "auto",
                        lineHeight: 1.6,
                        marginBottom: -3,
                    }}
                >
                    {t("manageAndTrackAllRealEstateTransactions")}
                </Typography>
            </Box>

            {deals.length === 0 && (
                <Card sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
                    <Typography variant="h6" color="text.secondary">
                        {t("noDealsAvailable")}
                    </Typography>
                </Card>
            )}

            <Grid container spacing={3}>
                {paginatedAssignments.map((deal) => {
                    const property = deal.property_id;
                    const buyer = deal.buyer_id;
                    const seller = deal.seller_id;
                    const agent = deal.agent_id;
                    const statusColor = statusColors[deal.status] || "default";
                    const statusLabel = statusLabels[deal.status] || deal.status;

                    const currentIndex = getIndex(deal._id);

                    return (
                        <Box key={deal._id} sx={{ width: "90%", mx: "auto" }}>
                            <Card
                                sx={{
                                    display: "flex",
                                    flexDirection: { xs: "column", md: "row" },
                                    borderRadius: 3,
                                    overflow: "hidden",
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        boxShadow: 6,
                                        transform: "translateY(-4px)",
                                    }
                                }}
                            >

                                {/* Hình ảnh + nút chuyển ảnh */}
                                <Box
                                    sx={{
                                        position: "relative",
                                        width: { md: 360 },
                                        height: { md: 280 },
                                        display: { xs: "none", sm: "block" },
                                        my: "auto",
                                        overflow: "hidden",
                                        flexShrink: 0,
                                        marginLeft: 2.5
                                    }}
                                >
                                    {property.images.length === 0 ? (
                                        // Không có ảnh → fallback image
                                        <img
                                            src="/no-image.png"
                                            alt="No Image"
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                                opacity: 0.8,
                                            }}
                                        />
                                    ) : (
                                        // Có 1 hoặc nhiều ảnh → hiển thị
                                        <img
                                            src={property.images[currentIndex]}
                                            alt={property.title[lang] || "Image"}
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                            }}
                                        />
                                    )}

                                    {property.images.length > 1 && (
                                        <>
                                            {/* Prev */}
                                            <IconButton
                                                onClick={() =>
                                                    prevImage(deal._id, property.images.length)
                                                }
                                                sx={{
                                                    position: "absolute",
                                                    top: "50%",
                                                    left: 10,
                                                    transform: "translateY(-50%)",
                                                    bgcolor: "rgba(0,0,0,0.4)",
                                                    color: "white",
                                                    "&:hover": { bgcolor: "rgba(0,0,0,0.6)" },
                                                }}
                                            >
                                                ‹
                                            </IconButton>

                                            {/* Next */}
                                            <IconButton
                                                onClick={() =>
                                                    nextImage(deal._id, property.images.length)
                                                }
                                                sx={{
                                                    position: "absolute",
                                                    top: "50%",
                                                    right: 10,
                                                    transform: "translateY(-50%)",
                                                    bgcolor: "rgba(0,0,0,0.4)",
                                                    color: "white",
                                                    "&:hover": { bgcolor: "rgba(0,0,0,0.6)" },
                                                }}
                                            >
                                                ›
                                            </IconButton>
                                        </>
                                    )}
                                </Box>

                                {/* Nội dung deal */}
                                <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
                                    <CardContent sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2, flexDirection: { xs: "column", sm: "row" }, gap: 1 }}>
                                            <Typography variant="h5" fontWeight="700" sx={{ flex: 1, pr: { sm: 2 }, fontSize: { xs: "1.25rem", md: "1.5rem" } }}>
                                                {property.title[lang]}
                                            </Typography>
                                            <Chip
                                                label={statusLabel}
                                                color={statusColor}
                                                sx={{ fontWeight: 600 }}
                                            />
                                        </Box>

                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 2 }}>
                                            <AttachMoneyIcon sx={{ fontSize: { xs: 18, md: 20 }, color: "primary.main" }} />
                                            <Typography variant="h6" color="primary" fontWeight="700">
                                                {deal.amounts.agreed_price.toLocaleString()} {deal.amounts.currency}
                                            </Typography>
                                        </Box>

                                        {/* Info */}
                                        <Box sx={{ display: "flex", gap: { xs: 2, sm: 3 }, mb: 2, flexWrap: "wrap" }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                <AspectRatioIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                                                <Typography variant="body2" color="text.secondary">
                                                    {property.area} {property.unit}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                <BedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                                                <Typography variant="body2" color="text.secondary">
                                                    {property.bedrooms} {t("bedrooms")}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                <BathtubIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                                                <Typography variant="body2" color="text.secondary">
                                                    {property.bathrooms} {t("bathrooms")}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5, mb: 2 }}>
                                            <LocationOnIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                                            <Typography variant="body2" color="text.secondary">
                                                {property.address[lang]}
                                            </Typography>
                                        </Box>

                                        <Divider sx={{ my: 2 }} />

                                        {/* Buyer - Seller - Agent */}
                                        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", flexDirection: { xs: "column", sm: "row" } }}>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="caption" color="text.secondary">{t("buyer")}</Typography>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                    <PersonIcon sx={{ fontSize: 16, color: "primary.main" }} />
                                                    <Typography variant="body2" fontWeight="600">{buyer.fullName}</Typography>
                                                </Box>
                                            </Box>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="caption" color="text.secondary">{t("seller")}</Typography>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                    <PersonIcon sx={{ fontSize: 16, color: "primary.main" }} />
                                                    <Typography variant="body2" fontWeight="600">{seller.fullName}</Typography>
                                                </Box>
                                            </Box>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="caption" color="text.secondary">{t("agent")}</Typography>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                    <PersonIcon sx={{ fontSize: 16, color: "primary.main" }} />
                                                    <Typography variant="body2" fontWeight="600">{agent.fullName}</Typography>
                                                </Box>
                                            </Box>
                                        </Box>

                                    </CardContent>

                                    <Box sx={{ px: 3, pb: 3 }}>
                                        <Button
                                            variant="contained"
                                            fullWidth
                                            size="large"
                                            onClick={() => navigate(`/agent/contracts/deals/${deal._id}`)}
                                            sx={{
                                                borderRadius: 2,
                                                textTransform: "none",
                                                fontWeight: 600
                                            }}
                                        >
                                            {t("viewContractDetails")}
                                        </Button>
                                    </Box>
                                </Box>
                            </Card>
                        </Box>

                    );
                })}

            </Grid>
            {totalPages > 1 && (
                <div className="flex justify-center mt-8 pb-4 truncate">

                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={handlePageChange}
                        color="primary"
                        size="large"
                        showFirstButton
                        showLastButton
                        siblingCount={0}
                        boundaryCount={1}
                        sx={{
                            '& .MuiPaginationItem-root': {
                                fontSize: { xs: '0.75rem', sm: '1rem' },
                            },
                        }}
                    />

                </div>
            )}
        </Container>
    );
};

export default DealListPageAgent;
