import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select as MuiSelect,
    MenuItem,
    Box,
    Typography,
    IconButton,
    Chip,
    OutlinedInput,
    InputAdornment,
    Stack,
} from "@mui/material";
import { Close as CloseIcon, CloudUpload as UploadIcon } from "@mui/icons-material";
import type { Property } from "../../types/Property";
import type { Feature } from "../../types/Features";
import type { City } from "../../types/City";
import type { District } from "../../types/District";
import type { Ward } from "../../types/Ward";
import type { PropertyType } from "../../types/PropertyTypes";
import { taxonomyService } from "../../services/taxonomyService";
import { getAllCities, getAllDistrictsByCityId, getAllWardsByDistrictId } from "../../services/propertyService";
import { getText } from "../../utils/multilang";
import { getLanguage, type Lang } from "../../utils/storage";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import Select from "react-select";
import AddressInputOnBlur from "../common/AddressInputOnBlur";

interface PropertyEditModalProps {
    open: boolean;
    property: Property | null;
    onClose: () => void;
    onSubmit: (id: string, formData: FormData) => Promise<void>;
}

const PropertyEditModal: React.FC<PropertyEditModalProps> = ({
    open,
    property,
    onClose,
    onSubmit,
}) => {
    const [loading, setLoading] = useState(false);
    const [features, setFeatures] = useState<Feature[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);
    const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: 0,
        city_id: "",
        district_id: "",
        ward_id: "",
        type_id: "",
        city_name: "",
        type_name: "",
        features: [] as string[],
        address: "",
        bedrooms: 0,
        bathrooms: 0,
        area: 0,
        unit: "m²",
        yearBuilt: new Date().getFullYear(),
        floors: 1,
        coordinates: undefined as { lat: number; lng: number } | undefined,
    });

    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);

    const [currentLang, setCurrentLang] = useState<Lang>(getLanguage());
    const { t } = useTranslation("myProperties");

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentLang(getLanguage());
        }, 100);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        loadCategories();
        loadCities();
    }, []);

    useEffect(() => {
        if (formData.city_id) {
            loadDistricts(formData.city_id);
        } else {
            setDistricts([]);
            setWards([]);
        }
    }, [formData.city_id]);

    useEffect(() => {
        if (formData.district_id) {
            loadWards(formData.district_id);
        } else {
            setWards([]);
        }
    }, [formData.district_id]);

    useEffect(() => {
        if (property && open) {
            let cityId = "";
            if (typeof property.city_id === "object" && property.city_id !== null) {
                cityId = property.city_id._id || "";
            } else if (typeof property.city_id === "string") {
                cityId = property.city_id;
            }
            let districtId = "";
            const propDistrictId = (property as any).district_id;
            if (typeof propDistrictId === "object" && propDistrictId !== null) {
                districtId = propDistrictId._id || "";
            } else if (typeof propDistrictId === "string") {
                districtId = propDistrictId;
            }
            let wardId = "";
            const propWardId = (property as any).ward_id;
            if (typeof propWardId === "object" && propWardId !== null) {
                wardId = propWardId._id || "";
            } else if (typeof propWardId === "string") {
                wardId = propWardId;
            }

            setFormData({
                title: getText(property.title as any, currentLang) || "",
                description: getText(property.description as any, currentLang) || "",
                price: property.price || 0,
                city_id: cityId,
                district_id: districtId,
                ward_id: wardId,
                type_id: property.type_id?._id || "",
                city_name: property.city_id && typeof property.city_id === "object" && property.city_id.city_name ? getText(property.city_id.city_name as any, currentLang) : "",
                type_name: property.type_id?.type_name ? getText(property.type_id.type_name as any, currentLang) : "",
                features: property.features?.map((f) => f._id) || [],
                address: getText(property.address as any, currentLang) || "",
                bedrooms: property.bedrooms || 0,
                bathrooms: property.bathrooms || 0,
                area: property.area || 0,
                unit: property.unit || "m2",
                yearBuilt: property.yearBuilt || new Date().getFullYear(),
                floors: property.floors || 1,
                coordinates: property.coordinates ? {
                    lat: Array.isArray(property.coordinates) ? property.coordinates[1] : property.coordinates.lat,
                    lng: Array.isArray(property.coordinates) ? property.coordinates[0] : property.coordinates.lng,
                } : undefined,
            });
            setExistingImages(property.images || []);
            setImageFiles([]);
            if (cityId) {
                loadDistricts(cityId).then(() => {
                    if (districtId) {
                        loadWards(districtId);
                    }
                });
            }
        }
    }, [property, open, currentLang]);

    const loadCategories = async () => {
        try {
            const data = await taxonomyService.getAll();
            setFeatures(data.features);
            setPropertyTypes(data.propertyTypes);
        } catch (error) {
        }
    };

    const loadCities = async () => {
        try {
            const data = await getAllCities();
            setCities(data);
        } catch (error) {
            console.error("Error loading cities:", error);
        }
    };

    const loadDistricts = async (cityId: string) => {
        try {
            const data = await getAllDistrictsByCityId(cityId);
            setDistricts(data);
        } catch (error) {
            console.error("Error loading districts:", error);
            setDistricts([]);
        }
    };

    const loadWards = async (districtId: string) => {
        try {
            const data = await getAllWardsByDistrictId(districtId);
            setWards(data);
        } catch (error) {
            console.error("Error loading wards:", error);
            setWards([]);
        }
    };

    const handleChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const currentLanguage: Lang = getLanguage();

    const cityOptions = cities.map(city => ({
        value: city._id,
        label: city.city_name[currentLanguage]
    }));

    const districtOptions = districts.map(district => ({
        value: district._id,
        label: district.district_name[currentLanguage]
    }));

    const wardOptions = wards.map(ward => ({
        value: ward._id,
        label: ward.ward_name[currentLanguage]
    }));

    const handleCityChange = (selected: { value: string; label: string } | null) => {
        const value = selected?.value ?? "";
        setFormData(prev => ({
            ...prev,
            city_id: value,
            district_id: "",
            ward_id: "",
        }));
    };

    const handleDistrictChange = (selected: { value: string; label: string } | null) => {
        const value = selected?.value ?? "";
        setFormData(prev => ({
            ...prev,
            district_id: value,
            ward_id: "",
        }));
    };

    const handleWardChange = (selected: { value: string; label: string } | null) => {
        const value = selected?.value ?? "";
        setFormData(prev => ({
            ...prev,
            ward_id: value,
        }));
    };

    const getCityNameById = (cityId: string) => {
        const city = cities.find(city => city._id === cityId);
        return city ? city.city_name[currentLanguage] : "";
    };

    const getDistrictNameById = (districtId: string) => {
        const district = districts.find(district => district._id === districtId);
        return district ? district.district_name[currentLanguage] : "";
    };

    const getWardNameById = (wardId: string) => {
        const ward = wards.find(ward => ward._id === wardId);
        return ward ? ward.ward_name[currentLanguage] : "";
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const files = Array.from(event.target.files);
            setImageFiles((prev) => [...prev, ...files]);
        }
    };

    const handleRemoveNewImage = (index: number) => {
        setImageFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleRemoveExistingImage = (index: number) => {
        setExistingImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!property) return;
        if (!formData.title || !formData.price || !formData.address) {
            toast.error(t("validationRequiredFields"));
            return;
        }

        if (!formData.city_id || !formData.district_id || !formData.ward_id) {
            toast.error(t("validationRequiredLocation"));
            return;
        }

        setLoading(true);
        try {
            const data = new FormData();
            data.append("title", formData.title || "");
            data.append("description", formData.description || "");
            data.append("price", (formData.price ?? 0).toString());
            if (formData.city_id && formData.city_id.trim()) {
                data.append("city_id", formData.city_id.trim());
            } else {
                toast.error("City ID is missing or invalid");
                setLoading(false);
                return;
            }

            if (formData.district_id && formData.district_id.trim()) {
                data.append("district_id", formData.district_id.trim());
            } else {
                toast.error("District ID is missing or invalid");
                setLoading(false);
                return;
            }

            if (formData.ward_id && formData.ward_id.trim()) {
                data.append("ward_id", formData.ward_id.trim());
            } else {
                toast.error("Ward ID is missing or invalid");
                setLoading(false);
                return;
            }

            if (formData.city_name) {
                data.append("city_name", formData.city_name);
            }
            if (formData.type_id) {
                data.append("type_id", formData.type_id);
            }
            if (formData.type_name) {
                data.append("type_name", formData.type_name);
            }

            data.append("address", formData.address || "");

            if (formData.coordinates && formData.coordinates.lat !== undefined && formData.coordinates.lng !== undefined) {
                data.append("coordinates[lat]", formData.coordinates.lat.toString());
                data.append("coordinates[lng]", formData.coordinates.lng.toString());
            }
            data.append("bedrooms", (formData.bedrooms ?? 0).toString());
            data.append("bathrooms", (formData.bathrooms ?? 0).toString());
            data.append("area", (formData.area ?? 0).toString());
            data.append("unit", formData.unit || "m2");
            data.append("yearBuilt", (formData.yearBuilt ?? new Date().getFullYear()).toString());
            data.append("floors", (formData.floors ?? 1).toString());

            formData.features.forEach((featureId) => {
                data.append("features[]", featureId);
            });

            existingImages.forEach((url) => {
                data.append("existingImages[]", url);
            });

            imageFiles.forEach((file) => {
                data.append("images", file);
            });

            console.log("Submitting property update with data:", {
                property_id: property._id,
                city_id: formData.city_id,
                district_id: formData.district_id,
                ward_id: formData.ward_id,
            });

            await onSubmit(property._id, data);
            onClose();
        } catch (error: any) {
            console.error("Error updating property:", error);
            console.error("Error response:", error?.response?.data);
            console.error("Error status:", error?.response?.status);
            const errorMessage = error?.response?.data?.message || error?.message || t("updateFailed") || "Cập nhật thất bại";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (!property) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h6" sx={{ color: "primary.main", fontWeight: "bold", }}>
                    {t("editProperty")}
                </Typography>
                <IconButton onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={3}>
                    <TextField
                        label={t("titleLabel")}
                        fullWidth
                        required
                        value={formData.title}
                        onChange={(e) => handleChange("title", e.target.value)}
                    />

                    <TextField
                        label={t("description")}
                        fullWidth
                        multiline
                        rows={4}
                        value={formData.description}
                        onChange={(e) => handleChange("description", e.target.value)}
                    />

                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                        <TextField
                            label={t("price")}
                            sx={{ flex: 1, minWidth: 200 }}
                            fullWidth
                            required
                            type="number"
                            value={formData.price}
                            onChange={(e) => handleChange("price", parseFloat(e.target.value))}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">{t("vnd")}</InputAdornment>,
                            }}
                        />

                        <FormControl sx={{ flex: 1, minWidth: 200 }} fullWidth>
                            <InputLabel>{t("propertyType")}</InputLabel>
                            <MuiSelect
                                label={t("propertyType")}
                                value={formData.type_id}
                                onChange={(e) => {
                                    const id = e.target.value as string;
                                    const selected = propertyTypes.find((pt) => pt._id === id);
                                    handleChange("type_id", id);
                                    handleChange("type_name", selected ? getText(selected.type_name as any, currentLang) : "");
                                }}
                                required
                            >
                                {propertyTypes.map((pt) => (
                                    <MenuItem key={pt._id} value={pt._id}>
                                        {getText(pt.type_name as any, currentLang)}
                                    </MenuItem>
                                ))}
                            </MuiSelect>
                        </FormControl>
                    </Box>

                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                        <Box sx={{ flex: 1, minWidth: 200 }}>
                            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, fontSize: '0.875rem' }}>
                                {t("city")} <span style={{ color: "red" }}>*</span>
                            </Typography>
                            <Select
                                options={cityOptions}
                                value={cityOptions.find(op => op.value === formData.city_id) || null}
                                onChange={handleCityChange}
                                placeholder={t("selectCity")}
                                isClearable={true}
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                styles={{
                                    control: (base: any) => ({
                                        ...base,
                                        borderRadius: '0.5rem',
                                        padding: '0.125rem',
                                        fontSize: '0.875rem',
                                    }),
                                    menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
                                    menu: (base: any) => ({ ...base, zIndex: 9999 }),
                                }}
                            />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 200 }}>
                            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, fontSize: '0.875rem' }}>
                                {t("district")} <span style={{ color: "red" }}>*</span>
                            </Typography>
                            <Select
                                options={districtOptions}
                                value={districtOptions.find(op => op.value === formData.district_id) || null}
                                onChange={handleDistrictChange}
                                placeholder={t("selectDistrict")}
                                isClearable={true}
                                isDisabled={!formData.city_id}
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                styles={{
                                    control: (base: any) => ({
                                        ...base,
                                        borderRadius: '0.5rem',
                                        padding: '0.125rem',
                                        fontSize: '0.875rem',
                                    }),
                                    menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
                                    menu: (base: any) => ({ ...base, zIndex: 9999 }),
                                }}
                            />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 200 }}>
                            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, fontSize: '0.875rem' }}>
                                {t("ward")} <span style={{ color: "red" }}>*</span>
                            </Typography>
                            <Select
                                options={wardOptions}
                                value={wardOptions.find(op => op.value === formData.ward_id) || null}
                                onChange={handleWardChange}
                                placeholder={t("selectWard")}
                                isClearable={true}
                                isDisabled={!formData.district_id}
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                styles={{
                                    control: (base: any) => ({
                                        ...base,
                                        borderRadius: '0.5rem',
                                        padding: '0.125rem',
                                        fontSize: '0.875rem',
                                    }),
                                    menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
                                    menu: (base: any) => ({ ...base, zIndex: 9999 }),
                                }}
                            />
                        </Box>
                    </Box>

                    <Box>
                        <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                            {t("addressLabel")} <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <AddressInputOnBlur
                            city={getCityNameById(formData.city_id)}
                            district={getDistrictNameById(formData.district_id)}
                            ward={getWardNameById(formData.ward_id)}
                            value={formData.address}
                            onChange={(val) => handleChange("address", val)}
                            onSelect={(lat, lon) =>
                                handleChange("coordinates", { lat, lng: lon })
                            }
                        />
                    </Box>

                    <FormControl fullWidth>
                        <InputLabel>{t("features")}</InputLabel>
                        <MuiSelect
                            multiple
                            value={formData.features}
                            onChange={(e) => handleChange("features", e.target.value)}
                            input={<OutlinedInput label={t("features")} />}
                            renderValue={(selected) => (
                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                    {selected.map((value) => {
                                        const feature = features.find((f) => f._id === value);
                                        return (
                                            <Chip
                                                key={value}
                                                label={feature?.feature_name ? getText(feature.feature_name as any, currentLang) : value}
                                                size="small"
                                            />
                                        );
                                    })}
                                </Box>
                            )}
                        >
                            {features.map((feature) => (
                                <MenuItem key={feature._id} value={feature._id}>
                                    {getText(feature.feature_name as any, currentLang)}
                                </MenuItem>
                            ))}
                        </MuiSelect>
                    </FormControl>

                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                        <TextField
                            label={t("bedrooms")}
                            sx={{ flex: 1, minWidth: 100 }}
                            fullWidth
                            type="number"
                            value={formData.bedrooms}
                            onChange={(e) => handleChange("bedrooms", parseInt(e.target.value))}
                        />

                        <TextField
                            label={t("bathrooms")}
                            sx={{ flex: 1, minWidth: 100 }}
                            fullWidth
                            type="number"
                            value={formData.bathrooms}
                            onChange={(e) => handleChange("bathrooms", parseInt(e.target.value))}
                        />

                        <TextField
                            label={t("area")}
                            sx={{ flex: 1, minWidth: 100 }}
                            fullWidth
                            type="number"
                            value={formData.area}
                            onChange={(e) => handleChange("area", parseFloat(e.target.value))}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">m²</InputAdornment>,
                            }}
                        />

                        <TextField
                            label={t("floors")}
                            sx={{ flex: 1, minWidth: 100 }}
                            fullWidth
                            type="number"
                            value={formData.floors}
                            onChange={(e) => handleChange("floors", parseInt(e.target.value))}
                        />
                    </Box>

                    <TextField
                        label={t("yearBuilt")}
                        fullWidth
                        type="number"
                        value={formData.yearBuilt}
                        onChange={(e) => handleChange("yearBuilt", parseInt(e.target.value))}
                    />

                    <Box>
                        <Typography variant="subtitle2" gutterBottom>
                            {t("currentImages")}
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                            {existingImages.map((url, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        position: "relative",
                                        width: 100,
                                        height: 100,
                                        border: "1px solid #ddd",
                                        borderRadius: 1,
                                        overflow: "hidden",
                                    }}
                                >
                                    <img src={url} alt={`Existing ${index}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    <IconButton
                                        size="small"
                                        sx={{
                                            position: "absolute",
                                            top: 2,
                                            right: 2,
                                            bgcolor: "rgba(255,255,255,0.8)",
                                        }}
                                        onClick={() => handleRemoveExistingImage(index)}
                                    >
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            ))}
                        </Box>

                        <Button
                            variant="outlined"
                            component="label"
                            startIcon={<UploadIcon />}
                        >
                            {t("addNewImages")}
                            <input
                                type="file"
                                hidden
                                multiple
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                        </Button>

                        {imageFiles.length > 0 && (
                            <>
                                <Typography variant="subtitle2" sx={{ mt: 2 }} gutterBottom>
                                    {t("newImages")} ({imageFiles.length})
                                </Typography>
                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                    {imageFiles.map((file, index) => (
                                        <Box
                                            key={index}
                                            sx={{
                                                position: "relative",
                                                width: 100,
                                                height: 100,
                                                border: "1px solid #ddd",
                                                borderRadius: 1,
                                                overflow: "hidden",
                                            }}
                                        >
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`New ${index}`}
                                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                            />
                                            <IconButton
                                                size="small"
                                                sx={{
                                                    position: "absolute",
                                                    top: 2,
                                                    right: 2,
                                                    bgcolor: "rgba(255,255,255,0.8)",
                                                }}
                                                onClick={() => handleRemoveNewImage(index)}
                                            >
                                                <CloseIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    ))}
                                </Box>
                            </>
                        )}
                    </Box>
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    {t("cancel")}
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading || !formData.title || !formData.price}
                >
                    {loading ? t("saving") : t("save")}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PropertyEditModal;

