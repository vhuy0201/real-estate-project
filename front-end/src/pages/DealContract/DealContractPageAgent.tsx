import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import { Box, Button, Typography, Card, CardContent, Stack, Chip, Avatar, Modal } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import DescriptionIcon from "@mui/icons-material/Description";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { contractApiAgent } from "../../api/contractApiAgent";
import type { Contract } from "../../types/Contract";
import { toastSuccess, toastError } from "../../utils/toast";
import { ToastContainer } from "react-toastify";
import { getLanguage } from "../../utils/storage";
import { ContractUploaderModalAgent } from "../../components/upload/ContractUploaderModalAgent";

const DealContractPageAgent: React.FC = () => {
    const { t } = useTranslation("dealContact");
    const { dealId } = useParams<{ dealId: string }>();
    if (!dealId) return <div>{t("dealUnavailable")}</div>;

    const lang = getLanguage();
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [modalOpen, setModalOpen] = useState(false);

    // State modal xác nhận xóa
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [contractToDelete, setContractToDelete] = useState<Contract | null>(null);

    const fetchContracts = async () => {
        try {
            const res = await contractApiAgent.getContracts(dealId);
            setContracts(res.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchContracts();
    }, [dealId]);

    // Thay cho window.confirm
    const handleDeleteClick = (contract: Contract) => {
        setContractToDelete(contract);
        setConfirmDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!contractToDelete) return;
        try {
            await contractApiAgent.deleteContract(dealId, contractToDelete._id);
            toastSuccess(t("deleteContractSuccessfully"));
            fetchContracts();
        } catch (err) {
            console.error(err);
            toastError(t("deleteContractFailed"));
        } finally {
            setConfirmDeleteOpen(false);
            setContractToDelete(null);
        }
    };

    const handleDownload = async (url: string, filename: string) => {
        try {
            const res = await fetch(url);
            const blob = await res.blob();
            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.download = filename;
            link.click();
            window.URL.revokeObjectURL(link.href);
            toastSuccess(t("downloadSuccessfully"));
        } catch (err) {
            console.error(t("downloadFailed"), err);
            toastError(t("downloadFailed"));
        }
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "superseded":
                return {
                    chipColor: "default" as const,
                    chipLabel: "Superseded",
                    cardBorder: "1px solid #e0e0e0",
                    cardBgColor: "rgba(245, 245, 245, 0.5)",
                    avatarBgColor: "#9e9e9e",
                    cardOpacity: 0.7,
                    cardShadow: 1
                };
            default:
                return {
                    chipColor: "error" as const,
                    chipLabel: status,
                    cardBorder: "2px solid #A8BDE2",
                    cardBgColor: "rgba(3, 169, 244, 0.08)",
                    avatarBgColor: "#3063BA",
                    cardOpacity: 1,
                    cardShadow: 2
                };
        }
    };

    return (
        <Box sx={{ py: 4, width: "90%", mx: "auto" }}>
            {/* Header */}
            <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                mb={3}
                spacing={2}
            >
                <Box>
                    <Typography variant="h3" fontWeight={500} gutterBottom>
                        📄{t("contracts")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ marginLeft: "15%" }}>
                        {t("manageAllContractsOfTheTransaction")}
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setModalOpen(true)}
                    sx={{ px: 3, py: 1.5, borderRadius: 2, textTransform: "none", fontWeight: 600, boxShadow: 2 }}
                >
                    + {t("addContract")}
                </Button>
            </Stack>

            {contracts.length === 0 && (
                <Card
                    sx={{ p: 6, textAlign: "center", borderRadius: 3, bgcolor: "background.default", border: "2px dashed #e0e0e0" }}
                >
                    <DescriptionIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        {t("noContractsYet")}
                    </Typography>
                    <Typography variant="body2" color="text.disabled">
                        {t("clickTheUploadContractButtonToAddANewContract")}
                    </Typography>
                </Card>
            )}

            <Stack spacing={2.5}>
                {contracts.map((c) => {
                    const statusConfig = getStatusConfig(c.status);
                    return (
                        <Card
                            key={c._id}
                            sx={{
                                borderRadius: 2.5,
                                boxShadow: statusConfig.cardShadow,
                                transition: "all 0.3s ease",
                                border: statusConfig.cardBorder,
                                bgcolor: statusConfig.cardBgColor,
                                opacity: statusConfig.cardOpacity,
                                "&:hover": {
                                    boxShadow: c.status === "superseded" ? 3 : 6,
                                    transform: "translateY(-2px)"
                                },
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Stack
                                    direction={{ xs: "column", sm: "row" }}
                                    justifyContent="space-between"
                                    alignItems={{ xs: "flex-start", sm: "center" }}
                                    spacing={2}
                                >
                                    {/* File info */}
                                    <Stack direction="row" alignItems="flex-start" spacing={2} flex={1}>
                                        <Avatar
                                            sx={{ bgcolor: statusConfig.avatarBgColor, width: 48, height: 48 }}
                                        >
                                            <DescriptionIcon />
                                        </Avatar>
                                        <Box flex={1}>
                                            <Typography
                                                variant="h6"
                                                fontWeight={600}
                                                sx={{ color: c.status === "superseded" ? "text.secondary" : "text.primary" }}
                                            >
                                                {c.original_filename}
                                            </Typography>
                                            <Stack direction="row" spacing={1} mt={1} flexWrap="wrap" gap={0.5}>
                                                <Chip
                                                    label={c.contract_type}
                                                    color="primary"
                                                    size="small"
                                                    variant={c.status === "superseded" ? "outlined" : "filled"}
                                                    sx={{ fontWeight: 500 }}
                                                />
                                                <Chip
                                                    label={statusConfig.chipLabel}
                                                    color={statusConfig.chipColor}
                                                    size="small"
                                                    variant="filled"
                                                    sx={{ fontWeight: 500 }}
                                                />
                                            </Stack>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                mt={1}
                                                sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                                            >
                                                📅 {new Date(c.createdAt).toLocaleDateString(lang, {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit"
                                                })}
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    {/* Action buttons */}
                                    <Stack direction="row" spacing={1} mt={{ xs: 2, sm: 0 }} flexWrap="wrap" gap={1}>
                                        {c.file_url && (
                                            <>
                                                <Button
                                                    variant={c.status === "superseded" ? "outlined" : "contained"}
                                                    size="small"
                                                    startIcon={<OpenInNewIcon />}
                                                    onClick={() => window.open(c.file_url, "_blank")}
                                                    sx={{ textTransform: "none", borderRadius: 1.5, px: 2 }}
                                                >
                                                    {t("view")}
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    startIcon={<DownloadIcon />}
                                                    onClick={() => handleDownload(c.file_url, c.original_filename)}
                                                    sx={{ textTransform: "none", borderRadius: 1.5, px: 2 }}
                                                >
                                                    {t("download")}
                                                </Button>
                                            </>
                                        )}
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            color="error"
                                            startIcon={<DeleteIcon />}
                                            onClick={() => handleDeleteClick(c)}
                                            sx={{ textTransform: "none", borderRadius: 1.5, px: 2 }}
                                        >
                                            {t("delete")}
                                        </Button>
                                    </Stack>
                                </Stack>
                            </CardContent>
                        </Card>
                    );
                })}
            </Stack>

            {/* Modal upload */}
            <ContractUploaderModalAgent
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                dealId={dealId}
                onUploaded={fetchContracts}
                existingContracts={contracts}
            />

            {/* Modal xác nhận xóa */}
            <Modal open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
                <Box sx={{ width: 320, margin: "150px auto", padding: 3, bgcolor: "background.paper", borderRadius: 2, textAlign: "center" }}>
                    <WarningAmberIcon sx={{ fontSize: 40, color: "orange", mb: 2 }} />
                    <Typography variant="h6" mb={2}>{t("confirm")}</Typography>
                    <Typography mb={3}>{t("areYouSureYouWantToDeleteThisContract")}</Typography>
                    <Box display="flex" justifyContent="space-between">
                        <Button variant="outlined" onClick={() => setConfirmDeleteOpen(false)}>
                            {t("cancel")}
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleConfirmDelete}
                        >
                            {t("delete")}
                        </Button>
                    </Box>
                </Box>
            </Modal>

            <ToastContainer position="top-right" autoClose={2000} theme="colored" />
        </Box>
    );
};

export default DealContractPageAgent;
