import React, { useState, useEffect } from "react";
import { Box, Container, Typography, IconButton, Stack, CardMedia, CardContent, Card, Chip } from "@mui/material";
import Grid from "@mui/material/Grid";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import { getAllPropertiesPublic } from "../services/propertyService";
import type { Property } from "@/types/Property";
import { getLanguage } from "../utils/storage";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import useTitle from "@/hooks/useTitle";
const HomePage: React.FC = () => {
    const images = [
        "https://cdnmedia.baotintuc.vn/Upload/GBzr0rzEkBb6ua36h4mJ9w/files/2022/09/P3.jpg",
        "https://watermark.lovepik.com/photo/40191/1085.jpg_wh1200.jpg",
        "https://static1.cafeland.vn/cafelandData/upload/tintuc/thitruong/2022/10/tuan-03/shizen-nami-1666176055.jpg",
    ];

    const [current, setCurrent] = useState(0);
    const [properties, setProperties] = useState<Property[]>();
    const [loading, setLoading] = useState(true);
    const currentLanguage = getLanguage();
    const { t } = useTranslation(['home', 'properties']);
    useTitle(t("titlePage"));
    // Auto slide
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % images.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const propertiesData = await getAllPropertiesPublic();
                console.log(propertiesData)
                setProperties(propertiesData);
            } catch (error) {
                console.log("Cannot fetch data", error);
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const prevSlide = () => {
        setCurrent((prev) => (prev - 1 + images.length) % images.length);
    };

    const nextSlide = () => {
        setCurrent((prev) => (prev + 1) % images.length);
    };

    return (
        <>
            <Box sx={{ position: "relative", height: 400, overflow: "hidden" }}>
                {images.map((img, index) => (
                    <Box
                        key={index}
                        sx={{
                            position: index === current ? "relative" : "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            backgroundImage: `url(${img})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            transition: "opacity 1s ease-in-out",
                            opacity: index === current ? 1 : 0,
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        <Container>
                            <Typography variant="h3" color="white" sx={{ fontWeight: 700 }}>
                                {t('home:hero.title')}
                            </Typography>
                            <Typography variant="h6" color="white" sx={{ mt: 1 }}>
                                {t('home:hero.subtitle')}
                            </Typography>
                        </Container>
                    </Box>
                ))}

                {/* Left arrow */}
                <IconButton
                    onClick={prevSlide}
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: 16,
                        transform: "translateY(-50%)",
                        color: "white",
                        backgroundColor: "rgba(0,0,0,0.3)",
                        "&:hover": { backgroundColor: "rgba(0,0,0,0.5)" },
                    }}
                >
                    <ArrowBackIosNewIcon />
                </IconButton>

                {/* Right arrow */}
                <IconButton
                    onClick={nextSlide}
                    sx={{
                        position: "absolute",
                        top: "50%",
                        right: 16,
                        transform: "translateY(-50%)",
                        color: "white",
                        backgroundColor: "rgba(0,0,0,0.3)",
                        "&:hover": { backgroundColor: "rgba(0,0,0,0.5)" },
                    }}
                >
                    <ArrowForwardIosIcon />
                </IconButton>

                <Box
                    sx={{
                        position: "absolute",
                        bottom: 16,
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                        gap: 1,
                    }}
                >
                    {images.map((_, idx) => (
                        <Box
                            key={idx}
                            onClick={() => setCurrent(idx)}
                            sx={{
                                width: 12,
                                height: 12,
                                borderRadius: "50%",
                                backgroundColor: idx === current ? "white" : "rgba(255,255,255,0.5)",
                                cursor: "pointer",
                            }}
                        />
                    ))}
                </Box>
            </Box>

            {/*List property*/}
            <Container maxWidth="xl">
                <Box paddingY={6}>
                    <Grid container spacing={3}>
                        {properties?.filter((p) => p.status !== "pending" && p.status !== "rented" && p.status !== "sold").map((p) => (
                            <Grid size={{ xs: 12, md: 4, sm: 6 }} key={p._id}>
                                <Card
                                    component={Link}
                                    to={`/property/detail/${p._id}`}
                                    sx={{
                                        borderRadius: 3,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: '100%',
                                        transition: 'transform 0.2s ease',
                                        '&:hover': { transform: 'scale(1.03)' }
                                    }}
                                >
                                    <CardMedia
                                        component="img"
                                        height="1"
                                        image={p.images?.[0] || '/defaultHome.png'}
                                        alt={p.title.en}
                                        sx={{
                                            height: { xs: 160, sm: 180, md: 200 },
                                            objectFit: 'cover',
                                        }}
                                    />
                                    <CardContent className="flex flex-col justify-between ">
                                        <Box>
                                            <Box className="flex justify-between items-start mb-2">
                                                <Typography
                                                    variant="h6"
                                                    fontWeight="bold"
                                                    color="primary.main"
                                                    className="line-clamp-2"
                                                >
                                                    {p.title[currentLanguage]}
                                                </Typography>
                                                <Chip
                                                    label={p.status === "approved" ? t('home:property.status.available') : t('home:property.status.processing')}
                                                    color={p.status === 'approved' ? 'success' : 'warning'}
                                                    size="small"
                                                />
                                            </Box>

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                className="line-clamp-2 mb-1"
                                            >
                                                {p.address[currentLanguage]}
                                            </Typography>
                                            <Typography variant="body2" color="text.primary" fontWeight="medium">
                                                {t('properties:price')}: {p.price.toLocaleString()} VNĐ
                                            </Typography>
                                        </Box>

                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Container>


            {/*Footer */}
            <Box sx={{ background: "#414141", color: "white", mt: 2, pt: 4, pb: 2 }}>
                <Container maxWidth="xl">
                    <Grid container spacing={2}>

                        {/* Column 1 */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Typography variant="h5" fontWeight={700}>{t('home:footer.appName')}</Typography>
                            <Typography sx={{ mt: 1, color: "gray" }}>
                                {t('home:footer.tagline')}
                            </Typography>
                        </Grid>

                        {/* Column 2 */}
                        <Grid size={{ xs: 6, md: 2 }}>
                            <Typography fontWeight={600}>{t('home:footer.explore')}</Typography>
                            <Stack spacing={1} sx={{ mt: 1 }}>
                                <Typography sx={{ color: "gray", cursor: "pointer" }}>{t('home:footer.buy')}</Typography>
                                <Typography sx={{ color: "gray", cursor: "pointer" }}>{t('home:footer.rent')}</Typography>
                                <Typography sx={{ color: "gray", cursor: "pointer" }}>{t('home:footer.sell')}</Typography>
                                <Typography sx={{ color: "gray", cursor: "pointer" }}>{t('home:footer.agents')}</Typography>
                            </Stack>
                        </Grid>

                        {/* Column 3 */}
                        <Grid size={{ xs: 6, md: 2 }}>
                            <Typography fontWeight={600}>{t('home:footer.support')}</Typography>
                            <Stack spacing={1} sx={{ mt: 1 }}>
                                <Typography sx={{ color: "gray", cursor: "pointer" }}>{t('home:footer.helpCenter')}</Typography>
                                <Typography sx={{ color: "gray", cursor: "pointer" }}>{t('home:footer.privacyPolicy')}</Typography>
                                <Typography sx={{ color: "gray", cursor: "pointer" }}>{t('home:footer.termsOfUse')}</Typography>
                            </Stack>
                        </Grid>

                        {/* Column 4 */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Typography fontWeight={600}>{t('home:footer.followUs')}</Typography>
                            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                <IconButton sx={{ color: "white" }} href="https://www.facebook.com/lopkstla16"><FacebookIcon /></IconButton>
                                <IconButton sx={{ color: "white" }} href="http://instagram.com/t.v.anh1910/"><InstagramIcon /></IconButton>
                            </Stack>
                        </Grid>
                    </Grid>

                    {/* Bottom line */}
                    <Box sx={{ borderTop: "1px solid #333", mt: 4, pt: 2, textAlign: "center", color: "gray" }}>
                        {t('home:footer.copyright')}
                    </Box>
                </Container>
            </Box>

        </>
    );
};

export default HomePage;
