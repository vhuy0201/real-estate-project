import React, { useState } from "react";
import { Modal, Box, Button, TextField, Typography, MenuItem } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { contractApiAgent } from "../../api/contractApiAgent";
import type { Contract } from "../../types/Contract";
import { toastSuccess, toastError } from "../../utils/toast";
import { useTranslation } from "react-i18next";

interface Props {
    open: boolean;
    onClose: () => void;
    dealId: string;
    onUploaded?: () => void;
    existingContracts?: Contract[];
    initialContractType?: "initial" | "buyer_signed" | "final";
    initialStatus?: "draft" | "submitted";
}

const FILE_TYPES = ["application/pdf"];

export const ContractUploaderModalAgent: React.FC<Props> = ({
    open,
    onClose,
    dealId,
    onUploaded,
    existingContracts = [],
    initialContractType = "initial",
    initialStatus = "submitted",
}) => {
    const { t } = useTranslation("dealContact");
    const [file, setFile] = useState<File | null>(null);
    const [contractType, setContractType] = useState(initialContractType);
    const [status, setStatus] = useState(initialStatus);
    const [notes, setNotes] = useState("");
    const [error, setError] = useState("");

    const [confirmOpen, setConfirmOpen] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;

        if (!FILE_TYPES.includes(f.type)) {
            setError(t("onlyAcceptPDFFiles"));
            return;
        }

        if (f.size > 10 * 1024 * 1024) {
            setError(t("fileTooLargeMaximum10MB"));
            return;
        }

        setFile(f);
        setError("");
    };

    const handleSubmit = async () => {
        if (!file) {
            setError(t("pleaseSelectFile"));
            return;
        }

        if (existingContracts.length > 0) {
            setConfirmOpen(true);
            return;
        }

        await uploadFile(false);
    };

    const uploadFile = async (replace: boolean) => {
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("contract_type", contractType);
        formData.append("status", status);
        formData.append("notes", notes);

        try {
            await contractApiAgent.uploadOrReplaceContract(dealId, formData, replace);
            toastSuccess(t("uploadContractSuccessfully"));
            onUploaded?.();
            setFile(null);
            setNotes("");
            setContractType(initialContractType);
            setStatus(initialStatus);
            onClose();
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || t("uploadContractFailed"));
            toastError(t("uploadContractFailed"));
        }
    };

    return (
        <>
            {/* Modal upload chính */}
            <Modal open={open} onClose={onClose}>
                <Box sx={{ width: 400, margin: "100px auto", padding: 3, bgcolor: "background.paper", borderRadius: 2 }}>
                    <Typography variant="h6" mb={2}>{t("upload")}</Typography>

                    <Button variant="contained" component="label">
                        {t("selectFile")}
                        <input type="file" hidden onChange={handleFileChange} />
                    </Button>
                    {file && <Typography mt={1}>{file.name}</Typography>}

                    <TextField
                        select
                        fullWidth
                        label={t("contractType")}
                        value={contractType}
                        onChange={e => setContractType(e.target.value as any)}
                        margin="normal"
                    >
                        <MenuItem value="initial">Initial</MenuItem>
                        <MenuItem value="buyer_signed">Buyer Signed</MenuItem>
                        <MenuItem value="final">Final</MenuItem>
                    </TextField>

                    <TextField
                        select
                        fullWidth
                        label={t("status")}
                        value={status}
                        onChange={e => setStatus(e.target.value as any)}
                        margin="normal"
                    >
                        <MenuItem value="draft">Draft</MenuItem>
                        <MenuItem value="submitted">Submitted</MenuItem>
                    </TextField>

                    <TextField
                        fullWidth
                        label={t("notes")}
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        margin="normal"
                    />

                    {error && <Typography color="error" mt={1}>{error}</Typography>}

                    <Box mt={2} display="flex" justifyContent="space-between">
                        <Button variant="outlined" onClick={onClose}>{t("cancel")}</Button>
                        <Button variant="contained" onClick={handleSubmit}>{t("upload")}</Button>
                    </Box>
                </Box>
            </Modal>

            {/* Modal xác nhận Replace */}
            <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                <Box sx={{ width: 320, margin: "150px auto", padding: 3, bgcolor: "background.paper", borderRadius: 2, textAlign: "center" }}>
                    <WarningAmberIcon sx={{ fontSize: 40, color: "orange", mb: 2 }} />
                    <Typography variant="h6" mb={2}>{t("confirm")}</Typography>
                    <Typography mb={3}>{t("thisContractAlreadyExistsDoYouWantToReplaceIt")}</Typography>
                    <Box display="flex" justifyContent="space-between">
                        <Button variant="outlined" onClick={() => setConfirmOpen(false)}>
                            {t("cancel")}
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => { uploadFile(true); setConfirmOpen(false); }}
                        >
                            {t("replace")}
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </>
    );
};
