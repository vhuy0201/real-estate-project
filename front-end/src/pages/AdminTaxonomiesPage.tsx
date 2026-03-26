import React, { useEffect, useState } from "react";
import { Container, Tabs, Tab, Box, Button, Stack } from "@mui/material";
import { taxonomyApi } from "../api/taxonomyApi";
import { toastSuccess, toastError } from "../utils/toast";
import TaxonomyTable from "../components/admin/taxonomy/TaxonomyTable";
import TaxonomyFormModal from "../components/admin/taxonomy/TaxonomyFormModal";
import ConfirmDialog from "../components/admin/taxonomy/ConfirmDialog";
import type { TaxonomyItem, TaxonomyType } from "../types/Taxonomy";
import { useTranslation } from "react-i18next";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const tabs: TaxonomyType[] = ["cities", "types", "features", "categories"];

const AdminTaxonomyPage: React.FC = () => {
    const [tab, setTab] = useState<number>(0);
    const [data, setData] = useState<TaxonomyItem[]>([]);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [editItem, setEditItem] = useState<TaxonomyItem | null>(null);
    const [confirm, setConfirm] = useState<{ open: boolean; item?: TaxonomyItem }>({
        open: false,
    });

    const currentType = tabs[tab];
    const { t } = useTranslation("taxonomies");

    const fetchData = async () => {
        try {
            const res = await taxonomyApi.getAll(currentType);
            setData(res.data.data);
        } catch (err) {
            toastError(t("error"));
        }
    };

    useEffect(() => {
        fetchData();
    }, [tab]);

    const handleSubmit = async (values: string) => {
        try {
            const keyMap: Record<string, string> = {
                cities: "city_name",
                types: "type_name",
                features: "feature_name",
                categories: "category_name",
            };
            const nameKey = keyMap[currentType];

            if (editItem) {
                await taxonomyApi.update(currentType, editItem._id, {
                    [nameKey]: values,
                });
                toastSuccess(t("updateSuccessful"));
            } else {
                await taxonomyApi.create(currentType, {
                    [nameKey]: values,
                });
                toastSuccess(t("addSuccessful"));
            }

            setModalOpen(false);
            setEditItem(null);
            fetchData();
        } catch (error) {
            toastError(t("error"));
        }
    };

    const handleDelete = async (item: any) => {
        try {
            await taxonomyApi.delete(currentType, item._id);
            toastSuccess(t("deleteSuccessful"));
            fetchData();
        } catch {
            toastError(t("deleteFailure"));
        }
    };

    return (
        <Container sx={{ py: 4 }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)}>
                {tabs.map((label) => (
                    <Tab key={label} label={t(label).toLowerCase()} />
                ))}
            </Tabs>

            <Stack direction="row" justifyContent="flex-end" sx={{ my: 2 }}>
                <Button variant="contained" onClick={() => setModalOpen(true)}>
                    + {t("add")}
                </Button>
            </Stack>

            <TaxonomyTable
                data={data}
                type={currentType}
                onEdit={(item) => {
                    setEditItem(item);
                    setModalOpen(true);
                }}
                onDelete={(item) => setConfirm({ open: true, item })}
            />

            <TaxonomyFormModal
                open={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditItem(null);
                }}
                onSubmit={handleSubmit}
                initialData={editItem}
                type={currentType}
            />

            <ConfirmDialog
                open={confirm.open}
                onClose={() => setConfirm({ open: false })}
                onConfirm={() => {
                    handleDelete(confirm.item);
                    setConfirm({ open: false });
                }}
                message={t("areyoudelete")}
            />
            <ToastContainer position="top-right" autoClose={2000} theme="colored" />
        </Container>
    );
};

export default AdminTaxonomyPage;
