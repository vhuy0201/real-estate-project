import React, { useState, useContext } from "react";
import { Typography, Box, TextField, Button, Checkbox, FormControlLabel, Divider, Stack, InputAdornment, IconButton, Fade, Zoom } from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import HomeIcon from "@mui/icons-material/Home";
import AuthContext from "../context/AuthContext";
import { loginRequest } from "../services/authService";
import { verifyEmail, resendOtp } from "../services/auth";
import { useNavigate } from "react-router-dom";
import GoogleLoginButton from "../components/auth/GoogleLoginButton";
import { useTranslation } from "react-i18next";

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { signIn } = useContext(AuthContext);
    const navigate = useNavigate();
    const [otpMode, setOtpMode] = useState(false);
    const [otp, setOtp] = useState("");
    const [userId, setUserId] = useState("");
    const [emailForOtp, setEmailForOtp] = useState("");
    const { t } = useTranslation("auth");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!email || !password) {
            setError(t("login.errorFillFields"));
            return;
        }
        try {
            setLoading(true);
            const { token, user } = await loginRequest({ email, password });
            signIn({ token, user });
            setLoading(false);
            if (user.role?.toLocaleLowerCase() === 'buyer' || user.role?.toLocaleLowerCase() === 'agent' || user.role?.toLocaleLowerCase() === 'seller') {
                navigate("/home");
            }
            else if (user.role === 'admin') {
                navigate("/admin/dashboard")
            } else {
                // OTP verify email
                await verifyEmail({ userId, otp });
                setOtpMode(false);
                setError("Email verified! You can login now.");
            }

        } catch (err: any) {
            setLoading(false);
            const data = err.response?.data;
            if (data?.requiresVerification || data?.message.includes("Vui lòng xác thực email trước khi đăng nhập")) {
                const id = data?.userId;
                if (!id) {
                    setError("Lỗi hệ thống: không nhận được userId");
                    return;
                }
                setUserId(id);
                setEmailForOtp(email);
                console.log("UserId:", id);
                console.log("Email:", email);
                setOtpMode(true);
                setError(t("login.enterOtp"));
                return;
            }

            setError(data?.message || "Đăng nhập thất bại");
        }
    };


    const handleVerifyOtp = async () => {
        if (!otp.trim() || !userId) {
            setError(t("login.enterOtp"));
            return;
        }

        try {
            setLoading(true);
            await verifyEmail({ userId, otp });

            setError(t("login.verifiedSuccess"));
            setOtpMode(false);

            // Tự động đăng nhập lại sau khi verify thành công
            const { token, user } = await loginRequest({ email, password });
            signIn({ token, user });

            // Chuyển hướng theo role
            if (user.role === "admin") {
                navigate("/admin/dashboard");
            } else {
                navigate("/home");
            }

        } catch (err: any) {
            setError(err?.response?.data?.message || t("login.errorInvalidOtp"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                height: { xs: "auto", md: "100vh" },
                background: "#0f0c29",
                backgroundImage: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                    content: '""',
                    position: "absolute",
                    width: "600px",
                    height: "600px",
                    background: "radial-gradient(circle, rgba(138,43,226,0.15) 0%, transparent 70%)",
                    top: "-200px",
                    right: "-200px",
                    borderRadius: "50%",
                    animation: "pulse 4s ease-in-out infinite",
                },
                "&::after": {
                    content: '""',
                    position: "absolute",
                    width: "500px",
                    height: "500px",
                    background: "radial-gradient(circle, rgba(0,191,255,0.12) 0%, transparent 70%)",
                    bottom: "-200px",
                    left: "-200px",
                    borderRadius: "50%",
                    animation: "pulse 6s ease-in-out infinite reverse",
                },
                "@keyframes pulse": {
                    "0%, 100%": {
                        transform: "scale(1) translateY(0)",
                        opacity: 1,
                    },
                    "50%": {
                        transform: "scale(1.1) translateY(-20px)",
                        opacity: 0.8,
                    },
                },
            }}
        >
            <Box sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                width: "100%",
                height: "100%",
                position: "relative",
                zIndex: 1,
            }}>
                {/* Left Side - Brand (60% width on desktop) */}
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

                {/* Right Side - Form (40% width on desktop) */}
                <Zoom in timeout={1200}>
                    <Box
                        sx={{
                            flex: { xs: "1", md: "0 0 40%" },
                            p: { xs: 4, sm: 5, md: 5 },
                            background: "rgba(255, 255, 255, 0.98)",
                            backdropFilter: "blur(20px)",
                            borderRadius: { xs: "0 0 24px 24px", md: "0" },
                            boxShadow: { xs: "0 25px 50px rgba(0,0,0,0.3)", md: "none" },
                            border: { xs: "1px solid rgba(255, 255, 255, 0.5)", md: "none" },
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            overflowY: "auto",
                        }}
                    >
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 800,
                                mb: 1,
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                backgroundClip: "text",
                                textFillColor: "transparent",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                letterSpacing: "-0.02em",
                            }}
                        >
                            {otpMode ? t("login.verifyEmailTitle") : t("login.welcomeBack")}
                        </Typography>
                        <Typography
                            sx={{
                                mb: 4,
                                fontSize: "0.95rem",
                                color: "rgba(0,0,0,0.5)",
                                fontWeight: 400,
                            }}
                        >
                            {otpMode ? t("login.verifyEmailSubtitle") : t("login.loginToAccess")}
                        </Typography>

                        <Box component="form" onSubmit={handleSubmit}>
                            {otpMode ? (
                                <>
                                    <TextField
                                        fullWidth
                                        placeholder={t("login.otpPlaceholder")}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        sx={{ mb: 2 }}
                                    />
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        onClick={handleVerifyOtp}
                                        disabled={loading || !otp.trim()}
                                        sx={{ mb: 2 }}
                                    >
                                        {loading ? t("login.verifying") : t("login.verifyButton")}
                                    </Button>
                                    <Button
                                        fullWidth
                                        variant="text"
                                        onClick={async () => {
                                            if (!userId || !email) {
                                                setError("Cannot resend OTP: missing user info.");
                                                return;
                                            }
                                            try {
                                                setLoading(true);
                                                await resendOtp({ userId, email: emailForOtp });
                                                setError(t("login.otpResent"));
                                            } catch (err: any) {
                                                setError(err?.response?.data?.message || err.message);
                                            } finally {
                                                setLoading(false);
                                            }
                                        }}
                                    >
                                        {t("login.resendOtp")}
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <TextField
                                        placeholder={t("login.email")}
                                        fullWidth
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        sx={{
                                            mb: 2.5,
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: 3,
                                                backgroundColor: "#f8f9fa",
                                                border: "2px solid transparent",
                                                transition: "all 0.3s ease",
                                                "& fieldset": {
                                                    border: "none",
                                                },
                                                "&:hover": {
                                                    backgroundColor: "#f1f3f5",
                                                    borderColor: "#e9ecef",
                                                },
                                                "&.Mui-focused": {
                                                    backgroundColor: "white",
                                                    borderColor: "#667eea",
                                                    boxShadow: "0 0 0 4px rgba(102,126,234,0.1)",
                                                },
                                            },
                                        }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <EmailOutlinedIcon sx={{ color: "#667eea", fontSize: 22 }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                        variant="outlined"
                                    />
                                    <TextField
                                        placeholder={t("login.password")}
                                        type={showPassword ? "text" : "password"}
                                        fullWidth
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        sx={{
                                            mb: 2,
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: 3,
                                                backgroundColor: "#f8f9fa",
                                                border: "2px solid transparent",
                                                transition: "all 0.3s ease",
                                                "& fieldset": {
                                                    border: "none",
                                                },
                                                "&:hover": {
                                                    backgroundColor: "#f1f3f5",
                                                    borderColor: "#e9ecef",
                                                },
                                                "&.Mui-focused": {
                                                    backgroundColor: "white",
                                                    borderColor: "#667eea",
                                                    boxShadow: "0 0 0 4px rgba(102,126,234,0.1)",
                                                },
                                            },
                                        }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LockOutlinedIcon sx={{ color: "#667eea", fontSize: 22 }} />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        edge="end"
                                                        sx={{
                                                            color: "#667eea",
                                                            "&:hover": {
                                                                backgroundColor: "rgba(102,126,234,0.1)",
                                                            },
                                                        }}
                                                    >
                                                        {showPassword ? (
                                                            <VisibilityOffOutlinedIcon />
                                                        ) : (
                                                            <VisibilityOutlinedIcon />
                                                        )}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                        variant="outlined"
                                    />

                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            mb: 3,
                                        }}
                                    >
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    sx={{
                                                        color: "#667eea",
                                                        "&.Mui-checked": {
                                                            color: "#667eea",
                                                        },
                                                    }}
                                                />
                                            }
                                            label={
                                                <Typography sx={{ fontSize: "0.9rem", color: "rgba(0,0,0,0.6)" }}>
                                                    {t("login.rememberMe")}
                                                </Typography>
                                            }
                                        />
                                        <Button
                                            size="small"
                                            sx={{
                                                textTransform: "none",
                                                color: "#667eea",
                                                fontWeight: 700,
                                                fontSize: "0.9rem",
                                                "&:hover": {
                                                    backgroundColor: "rgba(102,126,234,0.08)",
                                                },
                                            }}
                                            onClick={() => navigate("/forgot-password")}
                                        >
                                            {t("login.forgotPassword")}
                                        </Button>
                                    </Box>

                                    {error && (
                                        <Box
                                            sx={{
                                                mb: 2.5,
                                                p: 2,
                                                borderRadius: 3,
                                                background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)",
                                                color: "white",
                                                fontWeight: 500,
                                                fontSize: "0.9rem",
                                                boxShadow: "0 4px 12px rgba(238,90,111,0.3)",
                                            }}
                                        >
                                            {error}
                                        </Box>
                                    )}

                                    <Button
                                        type="submit"
                                        fullWidth
                                        disabled={loading}
                                        sx={{
                                            py: 2,
                                            borderRadius: 3,
                                            textTransform: "none",
                                            fontSize: "1.05rem",
                                            fontWeight: 700,
                                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                            color: "#fff",
                                            boxShadow: "0 10px 30px rgba(102,126,234,0.4)",
                                            position: "relative",
                                            overflow: "hidden",
                                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                            "&::before": {
                                                content: '""',
                                                position: "absolute",
                                                top: 0,
                                                left: "-100%",
                                                width: "100%",
                                                height: "100%",
                                                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                                                transition: "left 0.6s ease",
                                            },
                                            "&:hover": {
                                                boxShadow: "0 15px 40px rgba(102,126,234,0.5)",
                                                transform: "translateY(-3px)",
                                                "&::before": {
                                                    left: "100%",
                                                },
                                            },
                                            "&:active": {
                                                transform: "translateY(-1px)",
                                            },
                                            "&:disabled": {
                                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                                opacity: 0.6,
                                            },
                                        }}
                                    >
                                        {loading ? t("login.signingIn") : t("login.signIn")}
                                    </Button>

                                    <Divider
                                        sx={{
                                            my: 3.5,
                                            fontSize: "0.85rem",
                                            color: "rgba(0,0,0,0.4)",
                                            fontWeight: 500,
                                            "&::before, &::after": {
                                                borderColor: "rgba(0,0,0,0.1)",
                                            },
                                        }}
                                    >
                                        {t("login.or")}
                                    </Divider>

                                    <Stack sx={{ mb: 3.5 }}>
                                        <div>
                                            <GoogleLoginButton />
                                        </div>
                                    </Stack>

                                    <Box
                                        sx={{
                                            textAlign: "center",
                                            p: 2.5,
                                            borderRadius: 3,
                                            background: "linear-gradient(135deg, rgba(102,126,234,0.08) 0%, rgba(118,75,162,0.08) 100%)",
                                        }}
                                    >
                                        <Typography
                                            component="span"
                                            sx={{
                                                fontSize: "0.95rem",
                                                color: "rgba(0,0,0,0.6)",
                                                fontWeight: 500,
                                            }}
                                        >
                                            {t("login.dontHaveAccount")}{" "}
                                        </Typography>
                                        <Button
                                            variant="text"
                                            onClick={() => navigate("/register")}
                                            sx={{
                                                textTransform: "none",
                                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                                backgroundClip: "text",
                                                textFillColor: "transparent",
                                                WebkitBackgroundClip: "text",
                                                WebkitTextFillColor: "transparent",
                                                fontWeight: 800,
                                                fontSize: "0.95rem",
                                                p: 0,
                                                minWidth: "auto",
                                                "&:hover": {
                                                    backgroundColor: "transparent",
                                                    textDecoration: "underline",
                                                },
                                            }}
                                        >
                                            {t("login.signUpFree")}
                                        </Button>
                                    </Box>
                                </>
                            )}
                        </Box>
                    </Box>
                </Zoom>
            </Box>
        </Box>
    );
};

export default LoginPage;