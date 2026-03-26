import { getPaymentDetail } from "../../../services/paymentService";
import type { Payment } from "../../../types/Payment";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import { useTranslation } from "react-i18next";

const PaymentDetail = () => {
  const { id } = useParams<string>();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const { t } = useTranslation("payment");

  useEffect(() => {
    const fetchPaymentDetail = async () => {
      const res = await getPaymentDetail(id!);
      console.log(res);
      setPayment(res);
    };
    fetchPaymentDetail();
  }, [id]);

  const handleClose = () => {
    setOpen(false);
    navigate(-1);
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{t("PaymentDetails")}</DialogTitle>
        <DialogContent sx={{ pb: 0 }}>
          {payment ? (
            <Box>
              {[
                {
                  label: t("initiated"),
                  value: payment.initiated_by?.fullName,
                },
                {
                  label: t("amount"),
                  value: `${payment.amount?.toLocaleString()} ${
                    payment.currency
                  }`,
                  color: "primary.main",
                },
                {
                  label: t("method"),
                  value:
                    payment.method === "payos_qr"
                      ? t("payos_qr")
                      : payment.method === "internal_release"
                      ? t("internal_release")
                      : "",
                },
                {
                  label: t("deal_status"),
                  value: payment.deal_id.status === "completed"
                          ? t("Completed")
                          : payment.deal_id.status === "cancelled"
                          ? t("Cancelled")
                          : payment.deal_id.status === "awaiting_contract"
                          ? t("Awaiting")
                          : payment.deal_id.status === "contract_under_review"
                          ? t("UnderReview")
                          : payment.deal_id.status === "awaiting_escrow_payment"
                          ? t("EscrowPayment")
                          : payment.deal_id.status === "escrow_funded"
                          ? t("EscrowFunded")
                          : payment.deal_id.status
                },
                {
                  label: t("status"),
                  value:
                    payment.status === "completed"
                      ? t("completed")
                      : payment.status === "cancelled"
                      ? t("cancelled")
                      : payment.status === "failed"
                      ? t("cancelled")
                      : payment.status === "processing"
                      ? t("processing")
                      : payment.status === "pending"
                      ? t("pending")
                      : "",
                  color:
                    payment.status === "completed"
                      ? "success.main"
                      : payment.status === "cancelled"
                      ? "error.main"
                      : payment.status === "failed"
                      ? "error.main"
                      : payment.status === "processing"
                      ? "info.main"
                      : payment.status === "pending"
                      ? "warning.main"
                      : "grey.main",
                },
                {
                  label: t("type"),
                  value:
                    payment.type === "escrow_fund"
                      ? t("escrow_fund")
                      : payment.type === "release_to_seller"
                      ? t("release_to_seller")
                      : payment.type === "agent_fee"
                      ? t("agent_fee")
                      : payment.type === "platform_fee"
                      ? t("platform_fee")
                      : payment.type === "refund"
                      ? t("refund")
                      : "",
                },
              ].map((row, index) => (
                <Box
                  key={row.label}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  py={1}
                  sx={index === 0 ? { mt: 0 } : { mt: 1 }}
                >
                  <Typography color="text.secondary">{row.label}</Typography>
                  <Typography
                    fontWeight="medium"
                    sx={
                      row.color
                        ? { color: row.color, textTransform: "capitalize" }
                        : {}
                    }
                  >
                    {row.value}
                  </Typography>
                </Box>
              ))}

              <Divider sx={{ my: 2 }} />

              <Typography color="text.secondary" gutterBottom>
                {t("Notes")}
              </Typography>
              <Typography
                variant="body2"
                sx={{ whiteSpace: "pre-line", color: "text.primary" }}
              >
                {payment.notes ? payment.notes : "(No notes)"}
              </Typography>
            </Box>
          ) : (
            <Typography>{t("Loading")}</Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} variant="contained" color="primary">
            {t("Close_btn")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PaymentDetail;
