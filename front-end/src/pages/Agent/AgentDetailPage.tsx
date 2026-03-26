import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Paper,
  CircularProgress,
  Chip,
  Button,
  IconButton,
  Pagination,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useTranslation } from "react-i18next";
import {
  getPublicAgentInfo,
  getAgentProperties,
  getAgentReviews,
} from "../../services/publicAgent.service";
import type {
  AgentInfoResponse,
  AgentProperty,
  AgentReview,
} from "../../types/AgentDetail";
import useTitle from "@/hooks/useTitle";
import { getLanguage } from "@/utils/storage";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import PropertyAgentReview from "@/components/Buyer/PropertyAgentReview";

``
const AgentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation(["agentDetail"]);
  const lang = getLanguage() as "vi" | "en";
  const navigate = useNavigate();

  const [agentInfo, setAgentInfo] = useState<AgentInfoResponse | null>(null);
  const [properties, setProperties] = useState<AgentProperty[]>([]);
  const [reviews, setReviews] = useState<AgentReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageIndexes, setImageIndexes] = useState<{ [key: string]: number }>(
    {}
  );

  const [propertiesPage, setPropertiesPage] = useState(1);
  const PROPERTIES_PER_PAGE = 5;

  useTitle(
    agentInfo
      ? `${agentInfo.agent.fullName} - ${t("agentDetail:pageTitle")}`
      : t("agentDetail:pageTitle")
  );

  useEffect(() => {
    const fetchAgentData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const [infoData, propertiesData, reviewsData] = await Promise.all([
          getPublicAgentInfo(id),
          getAgentProperties(id),
          getAgentReviews(id),
        ]);

        setAgentInfo(infoData);
        setProperties(propertiesData);
        setReviews(reviewsData);
      } catch (error) {
        console.error("Error fetching agent data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgentData();
  }, [id]);

  const handlePropertyClick = (propertyId: string) => {
    navigate(`/property/detail/${propertyId}`);
  };

  const handlePrevImage = (
    e: React.MouseEvent,
    propertyId: string,
    totalImages: number
  ) => {
    e.stopPropagation();
    setImageIndexes((prev) => ({
      ...prev,
      [propertyId]: ((prev[propertyId] || 0) - 1 + totalImages) % totalImages,
    }));
  };

  const handleNextImage = (
    e: React.MouseEvent,
    propertyId: string,
    totalImages: number
  ) => {
    e.stopPropagation();
    setImageIndexes((prev) => ({
      ...prev,
      [propertyId]: ((prev[propertyId] || 0) + 1) % totalImages,
    }));
  };

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  const totalPropertiesPages = Math.ceil(
    properties.length / PROPERTIES_PER_PAGE
  );

  const paginatedProperties = properties.slice(
    (propertiesPage - 1) * PROPERTIES_PER_PAGE,
    propertiesPage * PROPERTIES_PER_PAGE
  );

  const handlePropertiesPageChange = (
    _: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPropertiesPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!agentInfo) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h6" textAlign="center">
          {t("agentDetail:agentNotFound")}
        </Typography>
      </Container>
    );
  }

  const { agent, stats } = agentInfo;
  const totalProperties = stats.sold_properties + stats.active_listings;

  return (
    <Box sx={{ bgcolor: "#EEEEEE", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="lg">
        <Paper
          elevation={3}
          sx={{
            p: { xs: 2, md: 3 },
            mb: 3,
            bgcolor: "white",
            borderRadius: 3,
          }}
        >
          <Box
            display="flex"
            alignItems="flex-start"
            gap={{ xs: 2, md: 3 }}
            flexDirection={{ xs: "column", sm: "row" }}
          >
            <Avatar
              src={agent.avatar || "/defaultUser.png"}
              alt={agent.fullName}
              sx={{
                width: { xs: 60, md: 80 },
                height: { xs: 60, md: 80 },
              }}
            />

            <Box flex={1} minWidth={{ xs: "100%", sm: 250 }}>
              <Box
                display="flex"
                alignItems="center"
                gap={1}
                mb={1}
                flexWrap="wrap"
              >
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  color="#111"
                  sx={{ fontSize: { xs: "1.5rem", md: "2.125rem" } }}
                >
                  {agent.fullName}
                </Typography>
                <CheckCircleIcon
                  sx={{ color: "#4ade80", fontSize: { xs: 20, md: 28 } }}
                />
              </Box>

              <Typography
                variant="body1"
                color="rgba(0,0,0,0.7)"
                mb={1}
                sx={{ fontSize: { xs: "0.875rem", md: "1rem" } }}
              >
                {agent.email}
              </Typography>

              <Chip
                label={t("broker")}
                size="small"
                sx={{
                  bgcolor: "#667eea",
                  color: "white",
                  fontWeight: 600,
                  mb: 2,
                }}
              />

              <Box display="flex" alignItems="baseline" gap={1}>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  color="#111"
                  sx={{ fontSize: { xs: "1.25rem", md: "1.5rem" } }}
                >
                  {totalProperties}
                </Typography>
                <Typography
                  variant="body2"
                  color="rgba(0,0,0,0.6)"
                  sx={{ fontSize: { xs: "0.75rem", md: "0.875rem" } }}
                >
                  {t("listings")}
                </Typography>
              </Box>
            </Box>

            {agent.phone && (
              <Button
                variant="contained"
                startIcon={<LocalPhoneIcon />}
                sx={{
                  bgcolor: "#3b82f6",
                  color: "white",
                  px: { xs: 2, md: 3 },
                  py: { xs: 1, md: 1.5 },
                  borderRadius: 2,
                  textTransform: "none",
                  fontSize: { xs: "0.875rem", md: "1rem" },
                  fontWeight: 600,
                  width: { xs: "100%", sm: "auto" },
                  "&:hover": {
                    bgcolor: "#2563eb",
                  },
                }}
              >
                {agent.phone}
              </Button>
            )}
          </Box>
        </Paper>

        <Grid container spacing={{ xs: 2, md: 3 }}>
          {/* Left */}
          <Grid size={{ xs: 12, md: 7.2 }}>
            <Paper
              sx={{
                bgcolor: "white",
                borderRadius: 3,
                p: { xs: 2, md: 3 },
                minHeight: { xs: "300px", md: "750px" },
                maxHeight: { xs: "auto", md: "750px" },
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                gap={2}
                mb={{ xs: 2, md: 3 }}
              >
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  color="#111"
                  sx={{ fontSize: { xs: "1rem", md: "1.25rem" } }}
                >
                  {t("propertiesSold")} ({stats.sold_properties})
                </Typography>
              </Box>

              {properties.length > 0 ? (
                <>
                  <Box
                    display="flex"
                    flexDirection="column"
                    gap={2}
                    flex={1}
                    sx={{
                      overflowY: "auto",
                      "&::-webkit-scrollbar": {
                        width: "6px",
                      },
                      "&::-webkit-scrollbar-track": {
                        background: "#f1f1f1",
                        borderRadius: "10px",
                      },
                      "&::-webkit-scrollbar-thumb": {
                        background: "#888",
                        borderRadius: "10px",
                      },
                      "&::-webkit-scrollbar-thumb:hover": {
                        background: "#555",
                      },
                    }}
                  >
                    {paginatedProperties.map((property) => {
                      const currentImageIndex = imageIndexes[property._id] || 0;
                      const hasMultipleImages = property.images.length > 1;

                      return (
                        <Card
                          key={property._id}
                          sx={{
                            display: "flex",
                            bgcolor: "white",
                            cursor: "pointer",
                            transition: "transform 0.2s",
                            minHeight: { xs: "120px", sm: "140px" },
                            "&:hover": {
                              transform: "translateY(-2px)",
                            },
                          }}
                          onClick={() => handlePropertyClick(property._id)}
                        >
                          <Box
                            sx={{
                              position: "relative",
                              width: { xs: 100, sm: 140 },
                              height: { xs: 100, sm: 140 },
                              flexShrink: 0,
                            }}
                          >
                            <Box
                              component="img"
                              src={
                                property.images[currentImageIndex] ||
                                "/defaultHome.png"
                              }
                              alt={property.title[lang]}
                              sx={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                borderRadius: 1,
                              }}
                            />

                            {hasMultipleImages && (
                              <>
                                <IconButton
                                  onClick={(e) =>
                                    handlePrevImage(
                                      e,
                                      property._id,
                                      property.images.length
                                    )
                                  }
                                  sx={{
                                    position: "absolute",
                                    left: 4,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    bgcolor: "rgba(255,255,255,0.8)",
                                    color: "#111",
                                    width: 24,
                                    height: 24,
                                    "&:hover": {
                                      bgcolor: "white",
                                    },
                                  }}
                                  size="small"
                                >
                                  <ArrowBackIosNewIcon sx={{ fontSize: 14 }} />
                                </IconButton>

                                <IconButton
                                  onClick={(e) =>
                                    handleNextImage(
                                      e,
                                      property._id,
                                      property.images.length
                                    )
                                  }
                                  sx={{
                                    position: "absolute",
                                    right: 4,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    bgcolor: "rgba(255,255,255,0.8)",
                                    color: "#111",
                                    width: 24,
                                    height: 24,
                                    "&:hover": {
                                      bgcolor: "white",
                                    },
                                  }}
                                  size="small"
                                >
                                  <ArrowForwardIosIcon sx={{ fontSize: 14 }} />
                                </IconButton>

                                <Box
                                  sx={{
                                    position: "absolute",
                                    bottom: 4,
                                    right: 4,
                                    bgcolor: "rgba(255,255,255,0.9)",
                                    color: "#111",
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: 1,
                                    fontSize: "0.7rem",
                                  }}
                                >
                                  {currentImageIndex + 1}/
                                  {property.images.length}
                                </Box>
                              </>
                            )}
                          </Box>

                          <CardContent
                            sx={{
                              flex: 1,
                              py: { xs: 1.5, sm: 2 },
                              px: { xs: 1.5, sm: 2 },
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                            }}
                          >
                            <Box>
                              <Typography
                                variant="subtitle1"
                                fontWeight="bold"
                                color="#111"
                                gutterBottom
                                noWrap
                                sx={{
                                  fontSize: { xs: "0.875rem", sm: "1rem" },
                                }}
                              >
                                {property.title[lang]}
                              </Typography>

                              <Typography
                                variant="body2"
                                color="rgba(0,0,0,0.6)"
                                gutterBottom
                                noWrap
                                sx={{
                                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                }}
                              >
                                {property.address[lang]}
                              </Typography>
                            </Box>

                            <Box>
                              <Typography
                                variant="h6"
                                color="#ef4444"
                                fontWeight="bold"
                                sx={{
                                  fontSize: { xs: "1rem", sm: "1.25rem" },
                                  mb: 0.5,
                                }}
                              >
                                {new Intl.NumberFormat("vi-VN").format(
                                  property.price
                                )}{" "}
                                ₫
                              </Typography>

                              {property.area && (
                                <Typography
                                  variant="caption"
                                  color="rgba(0,0,0,0.6)"
                                  sx={{
                                    fontSize: { xs: "0.7rem", sm: "0.75rem" },
                                  }}
                                >
                                  {property.area} m²
                                </Typography>
                              )}
                            </Box>
                          </CardContent>

                          <Box
                            sx={{
                              position: "relative",
                              display: { xs: "none", sm: "flex" },
                              alignItems: "flex-start",
                              p: 1,
                            }}
                          >
                            <Chip
                              label={
                                averageRating > 0
                                  ? averageRating.toFixed(1)
                                  : "5.0"
                              }
                              size="small"
                              sx={{
                                bgcolor: "#3b82f6",
                                color: "white",
                                fontWeight: "bold",
                              }}
                            />
                          </Box>
                        </Card>
                      );
                    })}
                  </Box>

                  {totalPropertiesPages > 1 && (
                    <Box
                      display="flex"
                      justifyContent="center"
                      mt="auto"
                      pt={3}
                    >
                      <Pagination
                        count={totalPropertiesPages}
                        page={propertiesPage}
                        onChange={handlePropertiesPageChange}
                        color="primary"
                        size="medium"
                        showFirstButton
                        showLastButton
                      />
                    </Box>
                  )}
                </>
              ) : (
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flex={1}
                >
                  <Typography
                    variant="body1"
                    color="rgba(0,0,0,0.6)"
                    textAlign="center"
                  >
                    {t("agentDetail:noProperties")}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Right */}
          <Grid size={{ xs: 12, md: 4.8 }}>
            <Paper
              sx={{
                bgcolor: "white",
                borderRadius: 3,
                p: { xs: 2, md: 3 },
                minHeight: { xs: "300px", md: "750px" },
                maxHeight: { xs: "auto", md: "750px" },
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box>
                <PropertyAgentReview
                  targetType="agent"
                  targetId={agentInfo.agent._id}
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Box>
  );
};

export default AgentDetailPage;
