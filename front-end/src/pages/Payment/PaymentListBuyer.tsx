import { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton, useMediaQuery, Divider, Stack, Pagination, } from "@mui/material";

import InfoIcon from "@mui/icons-material/Info";
import CreditScoreIcon from "@mui/icons-material/CreditScore";
import QrCode2Icon from "@mui/icons-material/QrCode2";

import { toast } from "react-toastify";
import { getPayments } from "../../api/paymentApi";
import type { Payment } from "../../types/PaymentData ";
import PaymentDetailListBuyer from "./PaymentDetailListBuyer";
import { useTranslation } from "react-i18next";

const PaymentListBuyer = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);

    const [selected, setSelected] = useState<Payment | null>(null);
    const [openDrawer, setOpenDrawer] = useState(false);

    const isMobile = useMediaQuery("(max-width:768px)");
    const { t } = useTranslation("payment");

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 10;

    const formatMoney = (value: number) =>
        value.toLocaleString("vi-VN") + " ₫";

    const formatDate = (date: string) =>
        new Date(date).toLocaleString("vi-VN");

    // Load payments từ backend
    const loadPayments = async (page: number) => {
        setLoading(true);
        try {
            const res = await getPayments({ page, limit: itemsPerPage });
            setPayments(res.items);
            setTotalPages(res.totalPages);
        } catch (err) {
            console.error(err);
            toast.error(t("detail.failedToLoadPayments"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPayments(currentPage);
    }, [currentPage]);

    const openDetails = (p: Payment) => {
        setSelected(p);
        setOpenDrawer(true);
    };

    if (loading)
        return (
            <Box display="flex" justifyContent="center" mt={5}>
                <CircularProgress />
            </Box>
        );

    return (
        <Box p={3}>
            <Typography align="center" variant="h4" fontWeight={700} mb={3}>
                💵 {t("listPayment.paymentHistory")}
            </Typography>

            {isMobile ? (
                <Box display="flex" flexDirection="column" gap={2}>
                    {payments.map((p) => (
                        <Paper key={p._id} elevation={2} sx={{ borderRadius: 2, p: 2 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <CreditScoreIcon color="success" />
                                    <Typography fontWeight={600}>#{p._id.slice(-6)}</Typography>
                                </Box>
                                <IconButton onClick={() => openDetails(p)} color="primary" size="small">
                                    <InfoIcon />
                                </IconButton>
                            </Box>

                            <Divider sx={{ my: 1 }} />

                            <Box display="flex" flexDirection="column" gap={0.5}>
                                <Typography>
                                    <strong>{t("listPayment.amount")}:</strong> {formatMoney(p.amount)}
                                </Typography>
                                <Typography>
                                    <strong>{t("listPayment.status")}:</strong>{" "}
                                    <Chip
                                        label={p.status}
                                        color={p.status === "completed" ? "success" : "warning"}
                                        size="small"
                                        sx={{ fontWeight: 600 }}
                                    />
                                </Typography>
                                <Typography>
                                    <strong>{t("listPayment.method")}:</strong>{" "}
                                    {p.method === "payos_qr" ? (
                                        <Box display="inline-flex" alignItems="center" gap={0.5}>
                                            <QrCode2Icon color="primary" fontSize="small" />
                                            {t("listPayment.payosQr")}
                                        </Box>
                                    ) : (
                                        p.method
                                    )}
                                </Typography>
                                <Typography>
                                    <strong>{t("listPayment.date")}:</strong> {formatDate(p.payment_date)}
                                </Typography>
                            </Box>
                        </Paper>
                    ))}
                </Box>
            ) : (
                <Paper elevation={2} sx={{ borderRadius: "12px", marginLeft: "50px", marginRight: "50px" }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>{t("listPayment.payment")}</TableCell>
                                    <TableCell>{t("listPayment.amount")}</TableCell>
                                    <TableCell>{t("listPayment.status")}</TableCell>
                                    <TableCell>{t("listPayment.date")}</TableCell>
                                    <TableCell align="center">{t("listPayment.detail")}</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {payments.map((p) => (
                                    <TableRow key={p._id} hover>
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <CreditScoreIcon color="success" />
                                                #{p._id.slice(-6)}
                                            </Box>
                                        </TableCell>

                                        <TableCell>
                                            <Typography fontWeight={600}>
                                                {p.deal_id?.amounts?.agreed_price
                                                    ? formatMoney(p.deal_id.amounts.agreed_price)
                                                    : formatMoney(p.amount)}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Chip
                                                label={p.status}
                                                color={p.status === "completed" ? "success" : "warning"}
                                                size="small"
                                                sx={{ fontWeight: 600 }}
                                            />
                                        </TableCell>

                                        <TableCell>{formatDate(p.payment_date)}</TableCell>

                                        <TableCell align="center">
                                            <IconButton onClick={() => openDetails(p)} color="primary">
                                                <InfoIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

            {/* Pagination đẹp */}
            {totalPages > 1 && (
                <Stack direction="row" justifyContent="center" mt={3}>
                    <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={(_, page) => setCurrentPage(page)}
                        color="primary"
                        shape="rounded"
                        showFirstButton
                        showLastButton
                        siblingCount={1}
                        boundaryCount={1}
                    />
                </Stack>
            )}

            <PaymentDetailListBuyer
                open={openDrawer}
                payment={selected}
                onClose={() => setOpenDrawer(false)}
            />
        </Box>
    );
};

export default PaymentListBuyer;
