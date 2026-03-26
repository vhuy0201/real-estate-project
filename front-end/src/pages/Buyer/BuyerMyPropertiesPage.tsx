import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
	Alert,
	Box,
	Button,
	Card,
	CardActions,
	CardContent,
	Chip,
	CircularProgress,
	Container,
	Divider,
	IconButton,
	InputAdornment,
	Paper,
	Stack,
	TextField,
	Typography,
	useMediaQuery,
} from "@mui/material";
import type { ChipProps } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PriceChangeIcon from "@mui/icons-material/PriceChange";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { Property } from "@/types/Property";
import { getBuyerPurchasedProperties } from "@/services/propertyService";
import { containsText, getText } from "@/utils/multilang";
import { getUser } from "@/utils/storage";
import useTitle from "@/hooks/useTitle";
import { t } from "i18next";

const BuyerMyPropertiesPage: React.FC = () => {
	const [properties, setProperties] = useState<Property[]>([]);
	const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [errorKey, setErrorKey] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [activeIndex, setActiveIndex] = useState(0);
	const navigate = useNavigate();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
	const { t: rawT, i18n } = useTranslation();
	const translate = useCallback(
		(key: string, options?: Record<string, unknown>) =>
			rawT(`buyerMyProperties:${key}` as any, options as any),
		[rawT]
	);
	const lang = i18n.language?.startsWith("vi") ? "vi" : "en";

	useEffect(() => {
		const user = getUser();
		if (user?.role?.toLowerCase() !== "buyer") {
			setErrorKey("alerts.onlyBuyer");
			setError(null);
			setLoading(false);
			return;
		}

		const fetchProperties = async () => {
			try {
				setLoading(true);
				setError(null);
				setErrorKey(null);
				const data = await getBuyerPurchasedProperties();
				const sortedData = Array.isArray(data)
					? data.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
					: [];
				setProperties(sortedData);
				setFilteredProperties(sortedData);
			} catch (err: any) {
				const message = err?.response?.data?.message || err?.message || "";
				if (message) {
					setError(message);
					setErrorKey(null);
				} else {
					setErrorKey("alerts.fetchFailed");
					setError(null);
				}
			} finally {
				setLoading(false);
			}
		};
		fetchProperties();
	}, []);

	useEffect(() => {
		if (!searchTerm.trim()) {
			setFilteredProperties(properties);
			setActiveIndex(0);
			return;
		}
		const normalized = searchTerm.trim();
		const filtered = properties.filter(
			(property) =>
				containsText(property.title, normalized) ||
				containsText(property.address, normalized) ||
				containsText(property.category_id?.category_name, normalized) ||
				containsText(property.type_id?.type_name, normalized)
		);
		setFilteredProperties(filtered);
		setActiveIndex(0);
	}, [properties, searchTerm]);

	useEffect(() => {
		setActiveIndex(0);
	}, [filteredProperties.length]);

	const totalSpent = useMemo(
		() => properties.reduce((sum, item) => sum + (Number(item.price) || 0), 0),
		[properties]
	);

	const lastUpdated = useMemo(() => {
		if (!properties.length) return null;
		const latest = properties
			.filter((item) => item.updatedAt)
			.sort(
				(a, b) =>
					new Date(b.updatedAt || "").getTime() - new Date(a.updatedAt || "").getTime()
			)[0];
		return latest?.updatedAt
			? new Date(latest.updatedAt).toLocaleDateString(lang === "vi" ? "vi-VN" : "en-US")
			: null;
	}, [properties, lang]);

	const statusColor = (status?: string): ChipProps["color"] => {
		switch (status?.toLowerCase()) {
			case "sold":
			case "completed":
				return "success";
			case "rented":
			case "leased":
				return "info";
			default:
				return "default";
		}
	};

	const formatCurrency = (value: number) =>
		new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
			maximumFractionDigits: 0,
		}).format(value);

	const formatDate = (value?: string) => {
		if (!value) return "—";
		try {
			return new Date(value).toLocaleDateString(lang === "vi" ? "vi-VN" : "en-US");
		} catch {
			return value;
		}
	};

	const goPrev = () => {
		setActiveIndex((prev) => (prev === 0 ? filteredProperties.length - 1 : prev - 1));
	};

	const goNext = () => {
		setActiveIndex((prev) => (prev === filteredProperties.length - 1 ? 0 : prev + 1));
	};

	const renderPropertyCard = useCallback(
		(property: Property) => {
			const heroImage =
				property.images && property.images.length > 0 ? property.images[0] : "/defaultHome.png";

			const statusLabel =
				translate(`status.${property.status ?? "completed"}`, {
					defaultValue: property.status ?? "completed",
				}) || property.status || "completed";
			const categoryLabel =
				property.category_id?.category_name ? getText(property.category_id.category_name, lang).trim() : "";
			const typeLabel =
				property.type_id?.type_name ? getText(property.type_id.type_name, lang).trim() : "";

			return (
				<Card
					sx={{
						height: "100%",
						display: "flex",
						flexDirection: "column",
						borderRadius: 3,
						boxShadow: "0 20px 45px rgba(15,12,41,0.1)",
					}}
				>
					<Box
						component="img"
						src={heroImage}
						alt={getText(property.title, lang)}
						sx={{
							height: { xs: 220, md: 220 },
							width: "100%",
							objectFit: "cover",
							borderRadius: "12px 12px 0 0",
						}}
					/>
					<CardContent sx={{ flexGrow: 1 }}>
						<Stack
							direction="row"
							justifyContent="space-between"
							alignItems="flex-start"
							spacing={1}
							sx={{ mb: 1.5 }}
						>
							<Typography variant="subtitle2" color="text.secondary">
								{translate("labels.transactionCode", {
									code: property._id.slice(-6).toUpperCase(),
								})}
							</Typography>
							<Chip label={statusLabel} color={statusColor(property.status)} size="small" />
						</Stack>
						<Typography variant="h6" fontWeight={700} sx={{ mb: 1, minHeight: 56 }}>
							{getText(property.title, lang)}
						</Typography>
						<Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
							<LocationOnIcon fontSize="small" color="action" />
							<Typography variant="body2" color="text.secondary">
								{getText(property.address, lang)}
							</Typography>
						</Stack>
						<Typography variant="h5" fontWeight={800} color="error" sx={{ mb: 2 }}>
							{formatCurrency(Number(property.price) || 0)}
						</Typography>
						<Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
							{categoryLabel && (
								<Chip label={categoryLabel} variant="outlined" color="primary" size="small" />
							)}
							{typeLabel && (
								<Chip label={typeLabel} variant="outlined" color="secondary" size="small" />
							)}
						</Stack>
						<Divider />
						<Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
							<Box>
								<Typography variant="caption" color="text.secondary">
									{translate("labels.createdAt")}
								</Typography>
								<Typography variant="body2" fontWeight={600}>
									{formatDate(property.createdAt)}
								</Typography>
							</Box>
							<Box textAlign="right">
								<Typography variant="caption" color="text.secondary">
									{translate("labels.updatedAt")}
								</Typography>
								<Typography variant="body2" fontWeight={600}>
									{formatDate(property.updatedAt)}
								</Typography>
							</Box>
						</Stack>
					</CardContent>
					<CardActions sx={{ px: 3, pb: 3 }}>
						<Button
							fullWidth
							variant="contained"
							size="large"
							onClick={() => navigate(`/property/detail/${property._id}`)}
							sx={{ textTransform: "none", fontWeight: 700 }}
						>
							{translate("cta.viewDetails")}
						</Button>
					</CardActions>
				</Card>
			);
		},
		[lang, navigate, translate]
	);

	return (
		<Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: { xs: 2, md: 4 } }}>
			<Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 5 }, pb: { xs: 2, md: 4 } }}>
				<Box
					sx={{
						display: "flex",
						flexDirection: { xs: "column", md: "row" },
						justifyContent: "space-between",
						alignItems: { xs: "flex-start", md: "center" },
						mb: 3,
						gap: 2,
					}}
				>
					<Box>
						<Typography variant="h4" fontWeight={800} color="primary" gutterBottom>
							{translate("title")}
						</Typography>
						<Typography color="text.secondary" sx={{ maxWidth: 640 }}>
							{translate("subtitle")}
						</Typography>
					</Box>
					<TextField
						placeholder={translate("searchPlaceholder")}
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						sx={{ width: { xs: "100%", md: 360 } }}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<SearchIcon color="primary" />
								</InputAdornment>
							),
						}}
					/>
				</Box>

				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
						gap: 2,
						mb: 4,
					}}
				>
					<Paper
						sx={{
							p: 3,
							borderRadius: 3,
							background: "linear-gradient(120deg, #667eea, #764ba2)",
							color: "white",
							height: "100%",
						}}
					>
						<Stack direction="row" alignItems="center" spacing={2}>
							<HomeWorkIcon sx={{ fontSize: 38 }} />
							<Box>
								<Typography variant="body2" sx={{ opacity: 0.8 }}>
									{translate("stats.totalProperties")}
								</Typography>
								<Typography variant="h4" fontWeight={800}>
									{properties.length}
								</Typography>
							</Box>
						</Stack>
					</Paper>
					<Paper
						sx={{
							p: 3,
							borderRadius: 3,
							background:
								"linear-gradient(120deg, rgba(86,171,47,0.9), rgba(168,224,99,0.9))",
							color: "white",
							height: "100%",
						}}
					>
						<Stack direction="row" alignItems="center" spacing={2}>
							<PriceChangeIcon sx={{ fontSize: 38 }} />
							<Box>
								<Typography variant="body2" sx={{ opacity: 0.8 }}>
									{translate("stats.totalValue")}
								</Typography>
								<Typography variant="h4" fontWeight={800}>
									{formatCurrency(totalSpent)}
								</Typography>
							</Box>
						</Stack>
					</Paper>
					<Paper
						sx={{
							p: 3,
							borderRadius: 3,
							background:
								"linear-gradient(120deg, rgba(15,12,41,0.9), rgba(48,43,99,0.9))",
							color: "white",
							height: "100%",
						}}
					>
						<Stack direction="row" alignItems="center" spacing={2}>
							<CalendarTodayIcon sx={{ fontSize: 34 }} />
							<Box>
								<Typography variant="body2" sx={{ opacity: 0.8 }}>
									{translate("stats.lastUpdate")}
								</Typography>
								<Typography variant="h6" fontWeight={700}>
									{lastUpdated ?? "—"}
								</Typography>
							</Box>
						</Stack>
					</Paper>
				</Box>

				{loading ? (
					<Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
						<CircularProgress size={64} />
					</Box>
				) : (error || errorKey) ? (
					<Alert severity="error" sx={{ mb: 3 }}>
						{error ?? (errorKey ? translate(errorKey) : "")}
					</Alert>
				) : filteredProperties.length === 0 ? (
					<Alert severity="info" sx={{ mb: 3 }}>
						{translate("alerts.empty")}
					</Alert>
				) : (
					<Box>
						{isMobile ? (
							<Box sx={{ position: "relative", pb: 5 }}>
								{filteredProperties.length > 1 && (
									<>
										<IconButton
											onClick={goPrev}
											sx={{
												position: "absolute",
												top: "45%",
												left: 0,
												backgroundColor: "rgba(255,255,255,0.9)",
												boxShadow: 2,
											}}
										>
											<ArrowBackIosNewIcon fontSize="small" />
										</IconButton>
										<IconButton
											onClick={goNext}
											sx={{
												position: "absolute",
												top: "45%",
												right: 0,
												backgroundColor: "rgba(255,255,255,0.9)",
												boxShadow: 2,
											}}
										>
											<ArrowForwardIosIcon fontSize="small" />
										</IconButton>
									</>
								)}
								{renderPropertyCard(filteredProperties[activeIndex])}
							</Box>
						) : (
							<Box
								sx={{
									display: "grid",
									gridTemplateColumns: {
										xs: "repeat(1, minmax(0, 1fr))",
										md: "repeat(2, minmax(0, 1fr))",
										lg: "repeat(3, minmax(0, 1fr))",
									},
									gap: 3,
								}}
							>
								{filteredProperties.map((property) => (
									<Box key={property._id}>{renderPropertyCard(property)}</Box>
								))}
							</Box>
						)}
					</Box>
				)}
			</Container>
		</Box>
	);
};

export default BuyerMyPropertiesPage;

