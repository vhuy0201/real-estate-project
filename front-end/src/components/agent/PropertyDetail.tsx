import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Chip, Container, Divider, Grid, Paper, Stack, Typography, Avatar, useMediaQuery, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import PlaceIcon from "@mui/icons-material/Place";
import BedIcon from "@mui/icons-material/Bed";
import BathtubIcon from "@mui/icons-material/Bathtub";
import SendIcon from "@mui/icons-material/Send";
import CancelIcon from "@mui/icons-material/Cancel";

import { useTranslation } from "react-i18next";

import type { Property } from "@/types/Property";
import { getLanguage } from "@/utils/storage";
import { cancelRequestJoinProperty, requestJoinProperty, getAllAssignments } from "@/services/agent.service";
import { toast } from "react-toastify";
import type { AssignAgent } from '@/types/AsssignAgents';



const PropertyDetailUser = () => {
    const { id } = useParams();
    const [property, setProperty] = useState<Property | null>(null);

    const [currentIndex, setCurrentIndex] = useState(0);
    const isMobile = useMediaQuery("(max-width:900px)");
    const [requestedProperties, setRequestedProperties] = useState<Map<string, string>>(new Map());

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
        const fetchData = async () => {
            try {
                // Fetch property details
                const response = await fetch(`http://localhost:3000/api/public/properties/${id}`);
                const data = await response.json();
                setProperty(data.data.data);

                // Fetch agent's assignments to check pending requests
                const assignmentsResponse = await getAllAssignments();
                const pendingRequests = new Map<string, string>();

                assignmentsResponse.forEach((assignment: AssignAgent) => {
                    if (assignment.status === 'pending') {
                        pendingRequests.set(assignment.property_id._id, assignment._id);
                    }
                });

                setRequestedProperties(pendingRequests);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, [id]);

    const [openRequestModal, setOpenRequestModal] = useState(false);

    const handleOpenRequesetToJoin = (property: Property) => {
        setProperty(property);
        setOpenRequestModal(true);
    }
    const handleCloseRequesetToJoin = () => {
        setOpenRequestModal(false);
    }
    const handleRequestJoin = async (id: string, ownerId: string) => {
        try {
            const response = await requestJoinProperty(id, ownerId);
            toast.success("Request sent successfully");

            if (response?.data?._id) {
                setRequestedProperties(prev => new Map(prev).set(id, response.data._id));
            }

            return response;
        } catch (error) {
            toast.error("Failed to send request");
            console.log("Error requesting to join property:", error);
            throw error;
        }
    }

    const handleCancelRequest = async (propertyId: string) => {
        const assignmentId = requestedProperties.get(propertyId);
        if (!assignmentId) return;

        try {
            await cancelRequestJoinProperty(assignmentId);
            toast.success("Request cancelled successfully");

            setRequestedProperties(prev => {
                const newMap = new Map(prev);
                newMap.delete(propertyId);
                return newMap;
            });
        } catch (error) {
            toast.error("Failed to cancel request");
            console.log("Error cancelling request:", error);
            throw error;
        }
    }


    if (!property) {
        return <Typography textAlign="center" mt={3}>Loading...</Typography>;
    }

    const features = property.features ?? [];



    return (
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



                <Typography variant="h4" fontWeight="bold" mt={1}>
                    {property.title[lang]}
                </Typography>

                <Typography color="text.secondary" mt={1}>
                    <PlaceIcon sx={{ fontSize: 20, mr: 1 }} />
                    {property.address[lang]}
                </Typography>
                <div className="flex flex-row space-x-4 items-center justify-between">
                    <Typography variant="h5" color="primary" fontWeight="bold" mt={1} className="flex-start">
                        ${property.price.toLocaleString()}
                    </Typography>
                    <Box className="flex-end" sx={{ display: 'flex', gap: 1 }}>
                        {requestedProperties.has(property._id) ? (
                            <Button
                                variant="contained"
                                color="error"
                                startIcon={<CancelIcon />}
                                onClick={() => handleCancelRequest(property._id)}
                                sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 'bold',
                                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        boxShadow: '0 6px 20px rgba(239, 68, 68, 0.4)',
                                        transform: 'translateY(-2px)'
                                    }
                                }}
                            >
                                {t('cancelRequest', { ns: 'listProperties' })}
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<SendIcon />}
                                onClick={() => handleOpenRequesetToJoin(property)}
                                sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 'bold',
                                    boxShadow: '0 4px 12px rgba(17, 153, 142, 0.3)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        boxShadow: '0 6px 20px rgba(17, 153, 142, 0.4)',
                                        transform: 'translateY(-2px)'
                                    }
                                }}
                            >
                                {t('requestJoin', { ns: 'listProperties' })}
                            </Button>
                        )}
                    </Box>
                </div>

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
                                    <Typography color="text.secondary">{property.agent_id?.phone}</Typography>
                                    <Typography color="text.secondary">{property.agent_id?.email}</Typography>

                                </Box>
                            </Stack>
                        </Paper>
                    </Grid>
                </Grid>

                {/* MAP */}
                {
                    property.coordinates?.coordinates && (
                        <>
                            <Typography variant="h6" fontWeight="bold" mt={2}>
                                {t("location")}
                            </Typography>
                            <Box mt={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
                                <iframe
                                    title="map"
                                    src={`https://www.google.com/maps?q=${property.coordinates.coordinates[0]},${property.coordinates.coordinates[1]}&z=15&output=embed`}
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


            <Dialog
                open={openRequestModal}
                onClose={handleCloseRequesetToJoin}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        p: 1
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
                    {t('confirmChoice', { ns: 'listProperties' })}
                </DialogTitle>
                <DialogContent>
                    {property && (
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Bạn đang yêu cầu tham gia bất động sản:
                            </Typography>
                            <Box sx={{
                                p: 2,
                                bgcolor: 'grey.50',
                                borderRadius: 2,
                                mt: 1,
                                border: '1px solid',
                                borderColor: 'divider'
                            }}>
                                <Typography variant="h6" fontWeight="bold" gutterBottom>
                                    {property.title[lang]}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {property.address[lang]}
                                </Typography>
                                <Typography variant="body2" color="success.main" fontWeight="bold" sx={{ mt: 1 }}>
                                    {property.price.toLocaleString()} VNĐ
                                </Typography>
                            </Box>
                        </Box>
                    )}
                    <DialogContentText>
                        {t('confirmMessage', { ns: 'listProperties' })}
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button
                        onClick={handleCloseRequesetToJoin}
                        variant="outlined"
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 'bold'
                        }}
                    >
                        {t('cancel', { ns: 'listProperties' })}
                    </Button>
                    <Button
                        onClick={() => {
                            if (property) {
                                handleRequestJoin(property._id, property.owner_id?._id!);
                                handleCloseRequesetToJoin();
                            }
                        }}
                        variant="contained"
                        color="success"
                        autoFocus
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 12px rgba(17, 153, 142, 0.3)'
                        }}
                    >
                        {t('confirm', { ns: 'listProperties' })}
                    </Button>
                </DialogActions>
            </Dialog>

        </Container >
    );
};

export default PropertyDetailUser;
