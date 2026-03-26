import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack, } from "@mui/material";
import { useTranslation } from "react-i18next";
import { getLanguage } from "../../../utils/storage";

interface Props {
    open: boolean;
    onClose: () => void;
    onSubmit: (value: string) => void;
    initialData?: any;
    type: string;
}

const TaxonomyFormModal: React.FC<Props> = ({
    open,
    onClose,
    onSubmit,
    initialData,
    type,
}) => {
    const [value, setValue] = useState("");

    const { t } = useTranslation("taxonomies");
    const lang = getLanguage();

    useEffect(() => {
        if (initialData) {
            const key = Object.keys(initialData).find((k) => k.endsWith("_name"));
            if (key) {
                setValue(initialData[key]?.[lang] || "");
            }
        } else {
            setValue("");
        }
    }, [initialData]);

    const handleSubmit = () => {
        if (!value.trim()) return;
        onSubmit(value);
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{initialData ? t("edit") : t("add")}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} mt={1}>
                    <TextField
                        label={t("name")}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        fullWidth
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t("cancel")}</Button>
                <Button onClick={handleSubmit} variant="contained">
                    {t("save")}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default TaxonomyFormModal;
