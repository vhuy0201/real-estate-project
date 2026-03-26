import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Chip, Container, Divider, Grid, Paper, Stack, Typography, Avatar, useMediaQuery, Button, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText } from "@mui/material";
import PlaceIcon from "@mui/icons-material/Place";
import BedIcon from "@mui/icons-material/Bed";
import BathtubIcon from "@mui/icons-material/Bathtub";
import type { Property } from "../types/Property";
import { useTranslation } from "react-i18next";
import { toast, ToastContainer } from 'react-toastify';
import { getLanguage, getUser } from "../utils/storage";
import { OfferService } from "@/services/offerService";
import BuyerAppointment from "../components/Buyer/Appointment/BuyerAppointment";
import { getDetailPropertiesById } from "@/services/propertyService";
import PropertyAgentReview from "@/components/Buyer/PropertyAgentReview";


const PropertyDetailUser = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [property, setProperty] = useState<Property | null>(null);
    const [restrictionDialogOpen, setRestrictionDialogOpen] = useState(false);

    const [currentIndex, setCurrentIndex] = useState(0);
    const isMobile = useMediaQuery("(max-width:900px)");
    const isMobileSmall = useMediaQuery("(max-width:600px)");
    const user = getUser();

    const { t } = useTranslation("propertyDetail");
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

    const [openTourModal, setOpenTourModal] = useState(false);


    const handleOpenTour = () => setOpenTourModal(true);
    const handleCloseTour = () => setOpenTourModal(false);



    if (!property) {
        return <Typography textAlign="center" mt={3}>Loading...</Typography>;
    }

    const features = property.features ?? [];

    return (
        <>
            <Container sx={{ mt: 1, mb: 1 }}>
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

                    <Box
                        display="flex"
                        justifyContent="flex-end"
                        gap={2}
                        mt={2}
                        mb={2}
                        flexWrap={isMobileSmall ? 'wrap' : 'nowrap'}
                    >
                        <Button
                            variant="contained"
                            onClick={handleOpenTour}
                            sx={{
                                minWidth: 180,
                                background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
                                color: 'white',
                                fontWeight: 700,
                                textTransform: 'none',
                                fontSize: '1rem',
                                py: 1.5,
                                px: 4,
                                boxShadow: '0 4px 15px rgba(25, 118, 210, 0.4)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
                                    boxShadow: '0 6px 20px rgba(25, 118, 210, 0.6)',
                                    transform: 'translateY(-2px)',
                                },
                                '&:active': {
                                    transform: 'translateY(0px)',
                                },
                            }}
                        >
                            {t("requestTour")}
                        </Button>
                        <Button
                            variant="contained"
                            onClick={async () => {
                                const user = getUser();
                                if (!user) {
                                    toast.error(t("pleaseLoginToCreateOffer"));
                                    setTimeout(() => {
                                        navigate('/login');
                                    }, 1500);
                                    return;
                                }
                                if (user.role?.toLowerCase() !== 'buyer') {
                                    setRestrictionDialogOpen(true);
                                    return;
                                }

                                try {
                                    const offers = await OfferService.getMyOffers({ property_id: id });
                                    const activeOffer = offers.find(
                                        offer => offer.status !== 'rejected' && offer.status !== 'cancelled'
                                    );

                                    if (activeOffer) {
                                        toast.error(t("offerAlreadySent"));
                                        return;
                                    }

                                    navigate(`/buyer/offer/create/${id}`);
                                } catch (error: any) {
                                    console.error("Error checking offer:", error);
                                    navigate(`/buyer/offer/create/${id}`);
                                }
                            }}
                            sx={{
                                minWidth: 180,
                                background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
                                color: 'white',
                                fontWeight: 700,
                                textTransform: 'none',
                                fontSize: '1rem',
                                py: 1.5,
                                px: 4,
                                boxShadow: '0 4px 15px rgba(25, 118, 210, 0.4)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
                                    boxShadow: '0 6px 20px rgba(25, 118, 210, 0.6)',
                                    transform: 'translateY(-2px)',
                                },
                                '&:active': {
                                    transform: 'translateY(0px)',
                                },
                            }}
                        >
                            {t("createOffer")}
                        </Button>
                    </Box>
                    {/* TITLE + PRICE */}
                    <Typography variant="h4" fontWeight="bold" mt={1}>
                        {property.title[lang]}
                    </Typography>

                    <Typography color="text.secondary" mt={1}>
                        <PlaceIcon sx={{ fontSize: 20, mr: 1 }} />
                        {property.address[lang]}
                    </Typography>

                    <Typography variant="h5" color="primary" fontWeight="bold" mt={1}>
                        ${property.price.toLocaleString()}
                    </Typography>

                    {/* TAGS */}
                    <Stack direction="row" spacing={1} mt={1}>
                        <Chip label={property.city_id?.city_name[lang]} />
                        <Chip label={property.category_id?.category_name[lang]} />
                        <Chip label={property.type_id?.type_name[lang]} />
                        <Chip label={property.status} color="success" />
                    </Stack>

                    {/* BED - BATH */}
                    <Stack direction="row" spacing={2} mt={1}>
                        <Chip icon={<BedIcon />} label={`${property.bedrooms} ${t("bedrooms")}`} />
                        <Chip icon={<BathtubIcon />} label={`${property.bathrooms} ${t("bathrooms")}`} />
                    </Stack>

                    {/* DESCRIPTION */}
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
                                <Stack direction="row" spacing={2} mt={1}>
                                    <Avatar
                                        src={property.agent_id?.avatar}
                                        alt={property.agent_id?.fullName || "Agent"}
                                    />
                                    <Box>
                                        <Typography fontWeight="bold">{property.agent_id?.fullName}</Typography>
                                        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                                            {property.agent_id?.phone}
                                        </Typography>
                                        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                                            {property.agent_id?.email}
                                        </Typography>
                                        <Box
                                            component="a"
                                            href={`https://zalo.me/${property.agent_id?.phone}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            sx={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 0.5,
                                                mt: 1,
                                                textDecoration: 'none',
                                                color: '#0068FF',
                                                fontWeight: 500,
                                                '&:hover': {
                                                    textDecoration: 'underline',
                                                    opacity: 0.8
                                                }
                                            }}
                                        >
                                            <img src="/zalo.png" width="20" height="20" alt="Zalo" />
                                            Chat Zalo
                                        </Box>
                                    </Box>
                                </Stack>
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* MAP */}
                    {
                        property.coordinates && (
                            <>
                                <Typography variant="h6" fontWeight="bold" mt={2}>
                                    {t("location")}
                                </Typography>
                                <Box mt={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
                                    <iframe
                                        title="map"
                                        src={`https://www.google.com/maps?q=${property.coordinates.coordinates[1]},${property.coordinates.coordinates[0]}&z=15&output=embed`}
                                        width="100%"
                                        height="300"
                                        style={{ border: 0 }}
                                    />
                                </Box>
                            </>
                        )
                    }

                    <Divider sx={{ mt: 2 }} />
                    <Typography color="text.secondary" mt={1}>
                        {t("postedOn")}: {new Date(property.createdAt).toLocaleDateString()}
                    </Typography>
                    <Typography color="text.secondary">
                        {t("updatedOn")}: {new Date(property.updatedAt).toLocaleDateString()}
                    </Typography>
                </Grid >
                {/* Dialog cho agent/seller */}
                <Dialog
                    open={restrictionDialogOpen}
                    onClose={() => setRestrictionDialogOpen(false)}
                    aria-labelledby="restriction-dialog-title"
                    aria-describedby="restriction-dialog-description"
                >
                    <DialogTitle id="restriction-dialog-title">
                        {t("cannotCreateOffer")}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="restriction-dialog-description">
                            {t("onlyBuyersCanCreateOffers")}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setRestrictionDialogOpen(false)} color="primary" variant="contained">
                            {t("close")}
                        </Button>
                    </DialogActions>
                </Dialog>

                <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                />
                <Dialog
                    open={openTourModal}
                    onClose={handleCloseTour}
                    fullScreen={isMobileSmall}
                    fullWidth>
                    <BuyerAppointment
                        property={property}
                        onClose={handleCloseTour}
                    />
                </Dialog>
                <PropertyAgentReview targetType="property" targetId={property._id} />

            </Container >
        </>
    );
};

export default PropertyDetailUser;
