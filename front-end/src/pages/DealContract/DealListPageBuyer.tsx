import React, { useEffect, useMemo, useState } from "react";
import { Container, Box, Typography, CircularProgress, Alert, Card, CardContent, CardActions, Button, Chip, Stack, Avatar, Divider, Pagination, } from "@mui/material";
import { dealApiBuyer } from "../../api/dealApiBuyer";
import type { Deal } from "../../types/Deal";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getLanguage } from "../../utils/storage";

const BuyerDealsPage: React.FC = () => {
    const { t } = useTranslation("dealContact");
    const lang = getLanguage();
    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const itemsPerPage = 6;

    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        setError(null);

        dealApiBuyer
            .getDeals()
            .then((data) => setDeals(data))
            .catch(() => {
                setError("Không thể tải danh sách giao dịch.");
            })
            .finally(() => setLoading(false));
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
    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={10}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "success";
            case "cancelled":
                return "error";
            case "contract_under_review":
                return "warning";
            case "escrow_funded":
                return "secondary";
            default:
                return "default";
        }
    };

    return (
        <Container sx={{ mt: 4, mb: 4 }}>
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
                        maxWidth: 450,
                        mx: "auto",
                        mt: 1,
                    }}
                >
                    {t("manageAndTrackAllRealEstateTransactions")}
                </Typography>
            </Box>

            {deals.length === 0 ? (
                <Card sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
                    <Typography variant="h6" color="text.secondary">
                        {t("noDealsAvailable")}
                    </Typography>
                </Card>
            ) : (
                <Box
                    display="flex"
                    flexWrap="wrap"
                    gap={3}
                    justifyContent="center"
                >
                    {paginatedAssignments.map((deal) => (
                        <Card
                            key={deal._id}
                            sx={{
                                width: 350,
                                borderRadius: 3,
                                boxShadow: 6,
                                transition: "0.25s",
                                "&:hover": {
                                    transform: "translateY(-5px)",
                                    boxShadow: 12,
                                },
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            <CardContent sx={{ flexGrow: 1 }}>
                                {/* Header */}
                                <Box
                                    display="flex"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    mb={2}
                                >
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Avatar sx={{ bgcolor: "#1976d2" }}>
                                            {deal.property_id.title[lang].charAt(0)}
                                        </Avatar>

                                        <Typography
                                            variant="h6"
                                            fontWeight={600}
                                            sx={{ maxWidth: 180 }}
                                        >
                                            {deal.property_id.title[lang]}
                                        </Typography>
                                    </Stack>

                                    <Chip
                                        label={deal.status}
                                        color={getStatusColor(deal.status)}
                                        size="small"
                                        sx={{ fontWeight: 600 }}
                                    />
                                </Box>

                                <Divider sx={{ mb: 2 }} />

                                {/* Property Info */}
                                <Stack spacing={1} divider={<Divider flexItem />}>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            <strong>{t("address")}:</strong>{" "}
                                            {deal.property_id.address[lang]}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            <strong>{t("finalPrice")}:</strong>{" "}
                                            {deal.amounts.agreed_price.toLocaleString()}{" "}
                                            {deal.amounts.currency}
                                        </Typography>
                                    </Box>

                                    {/* Participants */}
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            <strong>{t("seller")}:</strong>{" "}
                                            {deal.seller_id.fullName} ({deal.seller_id.phone})
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            <strong>{t("agent")}:</strong>{" "}
                                            {deal.agent_id.fullName} ({deal.agent_id.phone})
                                        </Typography>
                                    </Box>

                                    {/* Amount details */}
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            <strong>{t("platformFee")}:</strong>{" "}
                                            {deal.amounts.platform_fee.toLocaleString()} VND
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            <strong>{t("agentFee")}:</strong>{" "}
                                            {deal.amounts.agent_fee.toLocaleString()} VND
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            <strong>{t("sellerPayout")}:</strong>{" "}
                                            {deal.amounts.seller_payout.toLocaleString()} VND
                                        </Typography>
                                    </Box>
                                </Stack>
                            </CardContent>

                            <CardActions sx={{ p: 2 }}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
                                    onClick={() =>
                                        navigate(`/buyer/contracts/deals/${deal._id}`)
                                    }
                                >
                                    {t("viewContractDetails")}
                                </Button>
                            </CardActions>
                        </Card>
                    ))}
                </Box>
            )}
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

export default BuyerDealsPage;
