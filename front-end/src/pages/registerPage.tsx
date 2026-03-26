import { useState } from 'react';
import { Box, Button, TextField, Typography, CircularProgress, Stack, } from '@mui/material';
import Zoom from '@mui/material/Zoom';
import { register, verifyEmail, resendOtp } from '../services/auth';
import type { RegisterPayload } from '../services/auth';
import HomeIcon from "@mui/icons-material/Home";
import { useTranslation } from "react-i18next";

const initialForm: RegisterPayload & { confirmPassword: string } = {
	fullName: '',
	email: '',
	password: '',
	phone: 0,
	confirmPassword: '',
	role: 'buyer',
};

export default function RegisterPage() {
	const [form, setForm] = useState(initialForm);
	const [loading, setLoading] = useState(false);
	const [otpMode, setOtpMode] = useState(false);
	const [otp, setOtp] = useState('');
	const [userId, setUserId] = useState('');
	const [error, setError] = useState('');
	const { t } = useTranslation("auth");

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const validate = () => {
		if (!form.fullName.trim()) return t("validation.fullNameRequired");
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return t("validation.emailInvalid");
		if (form.password.length < 8) return t("validation.passwordTooShort");
		if (form.password !== form.confirmPassword) return t("validation.passwordNotMatch");
		return '';
	};

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const msg = validate();
		if (msg) return setError(msg);

		setLoading(true);
		try {
			const { data } = await register({
				fullName: form.fullName.trim(),
				email: form.email.trim(),
				password: form.password,
				phone: form.phone,
				role: form.role,
			});

			setUserId(data.userId);
			setOtpMode(true);
			setError(t("register.success"));
		} catch (err: any) {
			setError(err.response?.data?.message || t("error.registerFailed"));
		} finally {
			setLoading(false);
		}
	};

	const handleVerify = async () => {
		if (!otp.trim()) return setError(t("validation.otpRequired"));

		setLoading(true);
		try {
			await verifyEmail({ userId, otp });
			setError(t("register.emailVerified"));
			setOtpMode(false);
			setForm(initialForm);
			setOtp('');
		} catch (err: any) {
			setError(err.response?.data?.message || t("error.otpInvalid"));
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box
			sx={{
				minHeight: '100vh',
				display: 'flex',
				flexDirection: { xs: 'column', md: 'row' },
				background: '#0f0c29',
				backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
				overflow: 'hidden',
			}}
		>
			{/* LEFT SIDE - BRAND / IMAGE */}
			<Zoom in timeout={1000}>
				<Box
					sx={{
						flex: { xs: "1", md: "0 0 60%" },
						background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
						borderRadius: { xs: "0px 0px 0 0", md: "0" },
						p: { xs: 4, md: 6 },
						display: "flex",
						flexDirection: "column",
						justifyContent: "center",
						alignItems: "center",
						position: "relative",
						overflow: "hidden",
						boxShadow: { xs: "0 25px 50px rgba(0,0,0,0.3)", md: "none" },
						"&::before": {
							content: '""',
							position: "absolute",
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							background: "url(https://cdnmedia.baotintuc.vn/Upload/GBzr0rzEkBb6ua36h4mJ9w/files/2022/09/P3.jpg)",
						},
					}}
				>
					<Box
						sx={{
							position: "relative",
							zIndex: 1,
							textAlign: "center",
						}}
					>
						<Box
							sx={{
								width: 100,
								height: 100,
								borderRadius: "24px",
								background: "rgba(255,255,255,0.2)",
								backdropFilter: "blur(10px)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								mb: 3,
								mx: "auto",
								boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
								border: "2px solid rgba(255,255,255,0.3)",
							}}
						>
							<HomeIcon sx={{ fontSize: 50, color: "white" }} />
						</Box>
						<Typography
							variant="h3"
							sx={{
								fontWeight: 900,
								color: "white",
								mb: 2,
								letterSpacing: "-0.02em",
								textShadow: "0 4px 12px rgba(0,0,0,0.2)",
							}}
						>
							Dwello
						</Typography>
						<Typography
							sx={{
								color: "rgba(255,255,255,0.9)",
								fontSize: "1.1rem",
								fontWeight: 400,
								lineHeight: 1.6,
								maxWidth: 500,
								mx: "auto",
							}}
						>
							{t("imageleft.brandSubtitle")}
						</Typography>
						<Box
							sx={{
								mt: 4,
								display: "flex",
								gap: 2,
								justifyContent: "center",
								flexWrap: "wrap",
							}}
						>
							{[t("imageleft.brandTag1"), t("imageleft.brandTag2"), t("imageleft.brandTag3")].map((item, i) => (
								<Box
									key={i}
									sx={{
										px: 2,
										py: 1,
										borderRadius: 3,
										background: "rgba(255,255,255,0.15)",
										backdropFilter: "blur(10px)",
										border: "1px solid rgba(255,255,255,0.2)",
										fontSize: "0.85rem",
										fontWeight: 600,
										color: "white",
									}}
								>
									{item}
								</Box>
							))}
						</Box>
					</Box>
				</Box>
			</Zoom>

			{/* RIGHT SIDE - FORM */}
			<Zoom in timeout={1200}>
				<Box
					sx={{
						flex: { xs: '1', md: '0 0 40%' },
						p: { xs: 4, md: 6 },
						background: 'rgba(255,255,255,0.95)',
						backdropFilter: 'blur(12px)',
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center',
					}}
				>
					<Typography
						variant="h4"
						sx={{
							fontWeight: 800,
							mb: 2,
							background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
							backgroundClip: 'text',
							WebkitBackgroundClip: 'text',
							WebkitTextFillColor: 'transparent',
						}}
					>
						{otpMode ? t("register.otpTitle") : t("register.title")}
					</Typography>
					<Typography sx={{ mb: 3, color: 'rgba(0,0,0,0.6)' }}>
						{otpMode
							? t("register.otpSubtitle")
							: t("register.subtitle")}
					</Typography>

					{otpMode ? (
						<>
							<TextField
								fullWidth
								label="OTP"
								value={otp}
								onChange={(e) => setOtp(e.target.value)}
								margin="normal"
								required
							/>
							{error && (
								<Typography color="error" sx={{ mt: 2 }}>
									{error}
								</Typography>
							)}

							<Stack direction="row" spacing={2} sx={{ mt: 2 }}>
								<Button
									variant="outlined"
									fullWidth
									onClick={async () => {
										if (!userId) return;
										try {
											setLoading(true);
											await resendOtp({ userId, email: form.email });
											setError(t("register.otpResent"));
										} catch (err: any) {
											setError(err.response?.data?.message || t("error.resendFailed"));
										} finally {
											setLoading(false);
										}
									}}
								>
									{t("register.resendOtp")}
								</Button>
								<Button
									variant="contained"
									fullWidth
									onClick={handleVerify}
									disabled={loading}
									sx={{
										background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
										fontWeight: 700,
									}}
								>
									{loading ? t("register.verifying") : t("register.verifyEmail")}
								</Button>
							</Stack>
						</>
					) : (
						<Box component="form" onSubmit={onSubmit} noValidate>
							<TextField
								fullWidth
								label={t("register.fullName")}
								name="fullName"
								value={form.fullName}
								onChange={handleChange}
								margin="normal"
								required
							/>
							<TextField
								fullWidth
								label={t("register.email")}
								name="email"
								type="email"
								value={form.email}
								onChange={handleChange}
								margin="normal"
								required
							/>
							<TextField
								fullWidth
								label={t("register.phone")}
								name="phone"
								type="tel"
								value={form.phone || ''}
								onChange={handleChange}
								margin="normal"
								required
							/>
							<TextField
								fullWidth
								label={t("register.password")}
								name="password"
								type="password"
								value={form.password}
								onChange={handleChange}
								margin="normal"
								required
							/>
							<TextField
								fullWidth
								label={t("register.confirmPassword")}
								name="confirmPassword"
								type="password"
								value={form.confirmPassword}
								onChange={handleChange}
								margin="normal"
								required
							/>

							{error && (
								<Typography color="error" sx={{ mt: 2 }}>
									{error}
								</Typography>
							)}

							<Box sx={{ mt: 3, position: 'relative' }}>
								<Button
									type="submit"
									variant="contained"
									fullWidth
									disabled={loading}
									sx={{
										py: 1.8,
										fontWeight: 700,
										fontSize: '1rem',
										background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
									}}
								>
									{loading ? t("register.submitting") : t("register.submit")}
								</Button>
								{loading && (
									<CircularProgress
										size={24}
										sx={{
											position: 'absolute',
											top: '50%',
											left: '50%',
											mt: '-12px',
											ml: '-12px',
										}}
									/>
								)}
							</Box>
						</Box>
					)}
				</Box>
			</Zoom>
		</Box>
	);
}
