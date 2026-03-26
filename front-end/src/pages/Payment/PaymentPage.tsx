import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Button, CircularProgress, Card, CardContent, Divider, Paper } from "@mui/material";
import { createPayment, paymentSuccess } from "../../api/paymentApi";
import type { PaymentData } from "../../types/PaymentData ";
import { useTranslation } from "react-i18next";
import { Bounce, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { toast } from 'react-toastify';

const PaymentPage = () => {
    const { dealId } = useParams<{ dealId: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation("payment");

    const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [paying, setPaying] = useState<boolean>(false);

    useEffect(() => {
        if (!dealId) return;

        const loadPayment = async () => {
            try {
                const data = await createPayment(dealId);
                console.log("DEBUG paymentData:", data);
                setPaymentData(data);
            } catch (err) {
                console.log(err)
            } finally {
                setLoading(false);
            }
        };

        loadPayment();
    }, [dealId]);

    const handleFakePayment = async () => {
        if (!paymentData) return;

        try {
            setPaying(true);
            await paymentSuccess(paymentData.paymentId);
            toast.success(t("paymentPage.paymentSuccess"), {
                autoClose: 3000,
                onClose: () => {
                    navigate('/home');
                }
            });
        } catch (err) {
            console.error(err);
            toast.error(t("paymentPage.webhookError"));
        } finally {
            setPaying(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    if (!paymentData) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <Typography variant="h6" color="text.secondary">
                    {t("paymentPage.noPaymentData")}
                </Typography>
            </Box>
        );
    }

    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                transition={Bounce}
                style={{ zIndex: 9999 }}
            />

            <Box sx={{
                minHeight: '100vh',
                backgroundColor: '#f8f9fa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 3
            }}>
                <Card sx={{
                    maxWidth: 500,
                    width: '100%',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    borderRadius: 3,
                    backgroundColor: '#fff',
                    border: '1px solid #f8f9fa'
                }}>
                    <CardContent sx={{ p: 4 }}>
                        <Typography
                            variant="h4"
                            sx={{
                                mb: 3,
                                fontWeight: 600,
                                textAlign: 'center',
                                color: '#414141'
                            }}
                        >
                            {t("paymentPage.title")}
                        </Typography>

                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                mb: 3,
                                backgroundColor: '#f8f9fa',
                                borderRadius: 2
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="body1" color="text.secondary">
                                    {t("paymentPage.amountLabel")}
                                </Typography>
                                <Typography variant="body1" fontWeight={600}>
                                    {(paymentData.amount - paymentData.platformFee - paymentData.agentFee).toLocaleString()} VNĐ
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="body1" color="text.secondary">
                                    {t("paymentPage.platformFeeLabel")}
                                </Typography>
                                <Typography variant="body1" fontWeight={600}>
                                    {paymentData.platformFee.toLocaleString()} VNĐ
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body1" color="text.secondary">
                                    {t("paymentPage.agentFeeLabel")}
                                </Typography>
                                <Typography variant="body1" fontWeight={600}>
                                    {paymentData.agentFee.toLocaleString()} VNĐ
                                </Typography>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="h6" fontWeight={700}>
                                    {t("paymentPage.totalLabel")}
                                </Typography>
                                <Typography variant="h6" fontWeight={700} color="#667eea">
                                    {paymentData.amount.toLocaleString()} VNĐ
                                </Typography>
                            </Box>
                        </Paper>

                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            mb: 3,
                            p: 2,
                            backgroundColor: '#fff',
                            borderRadius: 2,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}>
                            <img
                                src={paymentData.qrUrl}
                                alt="QR Payment"
                                style={{
                                    maxWidth: '280px',
                                    width: '100%',
                                    height: 'auto',
                                    display: 'block'
                                }}
                            />
                        </Box>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ textAlign: 'center', mb: 3 }}
                        >
                            {t("paymentPage.instruction")}
                        </Typography>

                        <Button
                            variant="contained"
                            fullWidth
                            size="large"
                            onClick={handleFakePayment}
                            disabled={paying}
                            sx={{
                                fontSize: 16,
                                fontWeight: 600,
                                py: 1.5,
                                borderRadius: 2,
                                textTransform: 'none',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                                    boxShadow: '0 6px 16px rgba(102, 126, 234, 0.5)',
                                },
                                '&:disabled': {
                                    background: '#ccc'
                                }
                            }}
                        >
                            {paying ? t("paymentPage.processing") : t("paymentPage.confirmButton")}
                        </Button>
                    </CardContent>
                </Card>
            </Box>

        </>
    );
};

export default PaymentPage;