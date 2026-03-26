import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Box, Chip, Container, Divider, Grid, Paper, Stack, Typography, Avatar, useMediaQuery, IconButton, Button } from "@mui/material";
import PlaceIcon from "@mui/icons-material/Place";
import BedIcon from "@mui/icons-material/Bed";
import BathtubIcon from "@mui/icons-material/Bathtub";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useTranslation } from "react-i18next";
import { getLanguage } from "../../utils/storage";
import axios from "axios";
import { getDetailPropertiesById } from "../../services/propertyService";
import type { Property } from "@/types/Property";

const PropertyDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [property, setProperty] = useState<Property | null>(null);

    const [currentIndex, setCurrentIndex] = useState(0);
    const isMobile = useMediaQuery("(max-width:900px)");

    const { t } = useTranslation(["propertyDetail", 'listProperties']);
    const lang = getLanguage();

    const nextSlide = () => {
        if (!property || !property.images) return;
        setCurrentIndex((prev) =>
            prev == property.images.length - 1 ? 0 : prev + 1
        );
    };

    const prevSlide = () => {
        if (!property || !property.images) return;
        setCurrentIndex((prev) =>
            prev === 0 ? property.images.length - 1 : prev - 1
        );
    };

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const data: Property = await getDetailPropertiesById(id!);
                setProperty(data);
            } catch (error) {
                console.error("Error fetching property:", error);
            }
        };

        fetchProperty();
    }, [id]);



    if (!property) {
        return <Typography textAlign="center" mt={3}>{t('listProperties:loading')}</Typography>;
    }

    const features = property.features ?? [];

    return (
        <Container sx={{ mt: 1, mb: 1 }}>
            {/* Back button for mobile/responsive */}
            <Box sx={{ mb: 2, display: { xs: 'block', md: 'none' } }}>
                <IconButton
                    onClick={() => navigate('/seller/properties')}
                    sx={{
                        backgroundColor: 'white',
                        boxShadow: 1,
                        '&:hover': {
                            backgroundColor: 'grey.100',
                        },
                    }}
                >
                    <ArrowBackIcon />
                </IconButton>
            </Box>

            {/* CAROUSEL */}
            {property.images && property.images.length > 0 && (
                <Box
                    sx={{
                        position: "relative",
                        width: "100%",
                        height: isMobile ? "100%" : 500,
                        overflow: "hidden",
                        borderRadius: 2,
                    }}
                >
                    {/* IMAGE */}
                    <img
                        src={property.images[currentIndex]}
                        alt="property"
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transition: "0.4s ease"
                        }}
                    />

                    {/* ONLY SHOW BUTTONS IF MORE THAN 1 IMAGE */}
                    {property.images.length > 1 && (
                        <>
                            {/* PREV BTN */}
                            <Box
                                onClick={prevSlide}
                                sx={{
                                    position: "absolute",
                                    top: "50%",
                                    left: 10,
                                    transform: "translateY(-50%)",
                                    background: "rgba(0,0,0,0.5)",
                                    color: "#fff",
                                    p: "6px 10px",
                                    borderRadius: "50%",
                                    cursor: "pointer",
                                    userSelect: "none",
                                    fontWeight: "bold"
                                }}
                            >
                                {"<"}
                            </Box>

                            {/* NEXT BTN */}
                            <Box
                                onClick={nextSlide}
                                sx={{
                                    position: "absolute",
                                    top: "50%",
                                    right: 10,
                                    transform: "translateY(-50%)",
                                    background: "rgba(0,0,0,0.5)",
                                    color: "#fff",
                                    p: "6px 10px",
                                    borderRadius: "50%",
                                    cursor: "pointer",
                                    userSelect: "none",
                                    fontWeight: "bold"
                                }}
                            >
                                {">"}
                            </Box>

                            {/* DOTS */}
                            <Box
                                sx={{
                                    position: "absolute",
                                    bottom: 10,
                                    width: "100%",
                                    display: "flex",
                                    justifyContent: "center",
                                    gap: 1
                                }}
                            >
                                {property.images.map((_: any, i: number) => (
                                    <Box
                                        key={i}
                                        onClick={() => setCurrentIndex(i)}
                                        sx={{
                                            width: 10,
                                            height: 10,
                                            borderRadius: "50%",
                                            background: currentIndex === i ? "#fff" : "rgba(255,255,255,0.5)",
                                            cursor: "pointer"
                                        }}
                                    />
                                ))}
                            </Box>
                        </>
                    )}
                </Box>
            )
            }

            <Grid>
                {/* TITLE + PRICE */}
                <Typography variant="h4" fontWeight="bold" mt={1}>
                    {property.title[lang]}
                </Typography>

                <Typography color="text.secondary" mt={1}>
                    <PlaceIcon sx={{ fontSize: 20, mr: 1 }} />
                    {property.address[lang]}
                </Typography>
                <Box className="flex ml-auto w-fit border-blue-400 border-2 rounded-md mt-1 p-2">
                    {property.agent_id ? (
                        <Button
                            variant="contained"
                            color="primary"
                            disabled
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                width: 'fit-content',
                                px: 3,
                                py: 1,
                                '&.Mui-disabled': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.12)',
                                    color: 'rgba(0, 0, 0, 0.26)'
                                }
                            }}
                            title={`${t('listProperties:haveAgent')} : ${property.agent_id.fullName}`}
                        >
                            {t('listProperties:haveAgent')}
                        </Button>
                    ) : property.status !== 'approved' ? (
                        <Button
                            variant="contained"
                            color="primary"
                            disabled
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                width: 'fit-content',
                                px: 3,
                                py: 1,
                                '&.Mui-disabled': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.12)',
                                    color: 'rgba(0, 0, 0, 0.26)'
                                }
                            }}
                            title="Chỉ có thể assign agent khi property đã được approved"
                        >
                            {t('listProperties:assignAgent')}
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            color="primary"
                            component={Link}
                            to={`agents`}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                width: 'fit-content',
                                px: 3,
                                py: 1
                            }}
                        >
                            {t('listProperties:assignAgent')}
                        </Button>
                    )}
                </Box>

                <Typography variant="h5" color="primary" fontWeight="bold" mt={1}>
                    ${property.price.toLocaleString()}
                </Typography>

                <Stack direction="row" spacing={1} mt={1} className="text-wrap">
                    <Chip label={property.city_id?.city_name[lang]} />
                    <Chip label={property.category_id?.category_name[lang]} />
                    <Chip label={property.type_id?.type_name[lang]} />
                    <Chip label={property.status} color="success" />
                </Stack>

                <Stack direction="row" spacing={2} mt={1}>
                    <Chip icon={<BedIcon />} label={`${property.bedrooms} ${t("bedrooms")}`} />
                    <Chip icon={<BathtubIcon />} label={`${property.bathrooms} ${t("bathrooms")}`} />
                </Stack>


                <Typography variant="h6" fontWeight="bold" mt={2}>{t("description")}</Typography>
                <Typography color="text.secondary">
                    {property.description[lang]}
                </Typography>
                <Typography color="text.secondary">
                    {t("area")}: {property.area}{property.unit}
                </Typography>
                <Typography color="text.secondary">
                    {t("floors")}: {property.floors}
                </Typography>
                <Typography color="text.secondary">
                    {t("yearBuilt")}: {property.yearBuilt}
                </Typography>

                {/* FEATURES */}
                {
                    features?.length > 0 && (
                        <>
                            <Typography variant="h6" fontWeight="bold" mt={2}>
                                {t("features")}
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" mb={1}>
                                {features.map((f: any) => (
                                    <Chip key={f._id} label={f.feature_name[lang]} variant="outlined" />
                                ))}
                            </Stack>
                        </>
                    )
                }
                <Typography variant="h6" fontWeight="bold" mt={2}>
                    {t("owner")} & {t("agent")}
                </Typography>

                <Grid container spacing={3} mt={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" fontWeight="bold">{t("owner")}</Typography>
                            <Stack direction="row" spacing={2}>
                                <Avatar
                                    src={property.owner_id?.avatar}
                                    alt={property.owner_id?.fullName || "Owner"}
                                />
                                <Box>
                                    <Typography fontWeight="bold">{property.owner_id?.fullName}</Typography>
                                    <Typography color="text.secondary">{property.owner_id?.phone}</Typography>
                                    <Typography color="text.secondary">{property.owner_id?.email}</Typography>
                                </Box>
                            </Stack>
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" fontWeight="bold">{t("agent")}</Typography>
                            {property.agent_id ? (
                                <>
                                    <Stack direction="row" spacing={2} mt={1}>
                                        <Avatar>{property.agent_id?.fullName?.charAt(0) || "A"}</Avatar>
                                        <Box>
                                            <Typography fontWeight="bold">{property.agent_id?.fullName || "N/A"}</Typography>
                                            <Typography color="text.secondary">{property.agent_id?.phone || "N/A"}</Typography>
                                            <Typography color="text.secondary">{property.agent_id?.email || "N/A"}</Typography>
                                        </Box>
                                    </Stack>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        color="primary"
                                        disabled
                                        sx={{
                                            mt: 2,
                                            borderRadius: 2,
                                            textTransform: 'none',
                                            '&.Mui-disabled': {
                                                backgroundColor: 'rgba(0, 0, 0, 0.12)',
                                                color: 'rgba(0, 0, 0, 0.26)'
                                            }
                                        }}
                                    >
                                        Đã có agent
                                    </Button>
                                </>
                            ) : property.status !== 'approved' ? (
                                <>
                                    <Typography color="text.secondary" mt={1}>
                                        Chưa có agent được assign
                                    </Typography>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        color="primary"
                                        disabled
                                        sx={{
                                            mt: 2,
                                            borderRadius: 2,
                                            textTransform: 'none',
                                            '&.Mui-disabled': {
                                                backgroundColor: 'rgba(0, 0, 0, 0.12)',
                                                color: 'rgba(0, 0, 0, 0.26)'
                                            }
                                        }}
                                        title="Chỉ có thể assign agent khi property đã được approved"
                                    >
                                        Chỉ định Agent
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Typography color="text.secondary" mt={1}>
                                        Chưa có agent được assign
                                    </Typography>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        color="primary"
                                        component={Link}
                                        to={`/seller/properties/${property._id}/agents`}
                                        sx={{
                                            mt: 2,
                                            borderRadius: 2,
                                            textTransform: 'none',
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        Chỉ định Agent
                                    </Button>
                                </>
                            )}
                        </Paper>
                    </Grid>
                </Grid>

                {/* MAP */}
                {
                    property.coordinates?.lat && property.coordinates?.lng && (
                        <>
                            <Typography variant="h6" fontWeight="bold" mt={2}>
                                {t("location")}
                            </Typography>
                            <Box mt={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
                                <iframe
                                    title="map"
                                    src={`https://www.google.com/maps?q=${property.coordinates.lat},${property.coordinates.lng}&z=15&output=embed`}
                                    width="100%"
                                    height="300"
                                    style={{ border: 0 }}
                                />
                            </Box>
                        </>
                    )
                }

                {/* CREATED AT */}
                <Divider sx={{ mt: 2 }} />
                <Typography color="text.secondary" mt={1}>
                    {t("postedOn")}: {new Date(property.createdAt).toLocaleDateString()}
                </Typography>
                <Typography color="text.secondary">
                    {t("updatedOn")}: {new Date(property.updatedAt).toLocaleDateString()}
                </Typography>
            </Grid >
        </Container >
    );
};

export default PropertyDetails;
