import { Drawer, Box, Typography, Divider, IconButton, Stack, Chip, Card, CardContent, Button, useMediaQuery, } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { Payment } from "../../types/PaymentData ";
import { useTranslation } from "react-i18next";

interface PaymentDetailsDrawerProps {
    open: boolean;
    onClose: () => void;
    payment: Payment | null;
}

const PaymentDetailListBuyer = ({ open, onClose, payment }: PaymentDetailsDrawerProps) => {
    if (!payment) return null;

    const deal = payment.deal_id;
    const amounts = deal.amounts;

    const isMobile = useMediaQuery("(max-width:768px)");
    const { t } = useTranslation("payment");

    const formatMoney = (n: number) => n.toLocaleString("vi-VN") + " ₫";
    const formatDate = (date: string) => new Date(date).toLocaleString("vi-VN");

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: isMobile ? "100%" : 460,
                },
            }}
        >
            <Box sx={{ p: isMobile ? 2 : 3 }}>
                {/* HEADER */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant={isMobile ? "h6" : "h5"} fontWeight={700}>
                        {t("detail.paymentDetails")}
                    </Typography>
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Stack>

                <Typography variant="body2" color="text.secondary" mb={1}>
                    {t("detail.paymentId")}: {payment._id}
                </Typography>

                <Divider sx={{ my: 1.5 }} />

                <Chip
                    label={payment.status}
                    color={payment.status === "completed" ? "success" : "warning"}
                    sx={{ fontWeight: 600, mb: 2 }}
                />

                <Card sx={{ mb: 2, borderRadius: 3 }}>
                    <CardContent>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                            {t("detail.transactionInfo")}
                        </Typography>
                        <SectionItem label={t("detail.amount")} value={formatMoney(payment.deal_id.amounts.agreed_price)} />
                        <SectionItem label={t("detail.currency")} value={payment.currency} />
                        <SectionItem label={t("detail.method")} value={payment.method} />
                        <SectionItem label={t("detail.type")} value={payment.type} />
                        <SectionItem
                            label={t("detail.notes")}
                            value={
                                <Typography sx={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}>
                                    {payment.notes}
                                </Typography>
                            }
                        />
                        <SectionItem label={t("detail.createdAt")} value={formatDate(payment.createdAt)} />
                        <SectionItem label={t("detail.paymentDate")} value={formatDate(payment.payment_date)} />
                    </CardContent>
                </Card>

                <Card sx={{ mb: 2, borderRadius: 3 }}>
                    <CardContent>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                            Payment Breakdown
                        </Typography>

                        <SectionItem label={t("detail.agreedPrice")} value={formatMoney(amounts.agreed_price)} />
                        <SectionItem label={t("detail.platformFee")} value={formatMoney(amounts.platform_fee)} />
                        <SectionItem label={t("detail.agentFee")} value={formatMoney(amounts.agent_fee)} />
                        <SectionItem label={t("detail.sellerPayout")} value={formatMoney(amounts.seller_payout)} />
                    </CardContent>
                </Card>

                <Card sx={{ mb: 2, borderRadius: 3 }}>
                    <CardContent>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                            {t("detail.dealInformation")}
                        </Typography>

                        <SectionItem label={t("detail.dealId")} value={deal._id} />
                        <SectionItem label={t("detail.propertyId")} value={deal.property_id} />
                        <SectionItem label={t("detail.sellerId")} value={deal.seller_id} />
                        <SectionItem label={t("detail.agentId")} value={deal.agent_id} />
                    </CardContent>
                </Card>

                <Divider sx={{ my: 2 }} />

                <Button fullWidth variant="outlined" onClick={onClose}>
                    {t("detail.close")}
                </Button>
            </Box>
        </Drawer>
    );
};

export default PaymentDetailListBuyer;

const SectionItem = ({ label, value }: { label: string; value: any }) => (
    <Stack
        direction="row"
        justifyContent="space-between"
        sx={{
            mb: 1.2,
            flexWrap: "wrap",
        }}
    >
        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
            {label}
        </Typography>
        <Box sx={{ flex: 1, ml: 4 }}>{value || "--"}</Box>
    </Stack>
);
