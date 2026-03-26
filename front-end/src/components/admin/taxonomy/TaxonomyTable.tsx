import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Paper,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import type { TaxonomyItem, TaxonomyType } from "../../../types/Taxonomy";
import { useTranslation } from "react-i18next";
import { getLanguage } from "../../../utils/storage";

interface Props {
    data: TaxonomyItem[];
    type: TaxonomyType;
    onEdit: (item: TaxonomyItem) => void;
    onDelete: (item: TaxonomyItem) => void;
}

const TaxonomyTable: React.FC<Props> = ({ data, type, onEdit, onDelete }) => {
    const getNameKey = () => {
        switch (type) {
            case "cities":
                return "city_name";
            case "categories":
                return "category_name";
            case "features":
                return "feature_name";
            case "types":
                return "type_name";
            default:
                return "name";
        }
    };

    const { t } = useTranslation("taxonomies");
    const lang = getLanguage();

    return (
        <TableContainer
            component={Paper}
            sx={{
                borderRadius: 2,
                boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                mt: 2,
            }}
        >
            <Table>
                <TableHead>
                    <TableRow
                        sx={{
                            backgroundColor: "#f9fafb",
                            "& th": {
                                fontWeight: 600,
                                color: "#374151",
                                fontSize: "0.95rem",
                            },
                        }}
                    >
                        <TableCell>{t("name")}</TableCell>
                        <TableCell align="right">{t("action")}</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {data.map((item) => (
                        <TableRow
                            key={item._id}
                            hover
                            sx={{
                                "&:hover": {
                                    backgroundColor: "#f3f4f6",
                                },
                            }}
                        >
                            <TableCell sx={{ color: "#111827" }}>
                                {(item as any)[getNameKey()]?.[lang] || "---"}
                            </TableCell>
                            <TableCell align="right">
                                <IconButton
                                    size="medium"
                                    color="primary"
                                    onClick={() => onEdit(item)}
                                >
                                    <EditIcon fontSize="medium" />
                                </IconButton>
                                <IconButton
                                    size="medium"
                                    color="error"
                                    onClick={() => onDelete(item)}
                                >
                                    <DeleteIcon fontSize="medium" />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>

    );
};

export default TaxonomyTable;
