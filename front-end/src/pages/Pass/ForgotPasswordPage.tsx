import { useState } from "react";
import { Box, Card, Button, Typography, Stack, Zoom } from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import HomeIcon from "@mui/icons-material/Home";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import { toastSuccess, toastError } from "../../utils/toast";
import { ToastContainer } from "react-toastify";
import { forgotResetPasswordApi } from "../../api/forgotResetPasswordApi";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function ForgotPasswordPage() {
    const { t } = useTranslation("auth");
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async () => {
        if (!email.trim()) {
            setEmailError(t("forgot-password.emailEmptyError"));
            return;
        }
        setEmailError("");

        try {
            await forgotResetPasswordApi.forgotPassword(email);
            toastSuccess(t("forgot-password.successMessage"));
            setEmail("");
        } catch (err: any) {
            toastError(err.response?.data?.message || t("forgot-password.errorMessage"));
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
                    "0%, 100%": { transform: "scale(1)", opacity: 1 },
                    "50%": { transform: "scale(1.1)", opacity: 0.85 }
                }
            }}
        >
            <ToastContainer position="top-right" autoClose={2000} theme="colored" style={{ zIndex: 9999 }} />

            {/* Layout left - right */}
            <Box sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                width: "100%",
                height: "100%",
                zIndex: 1,
            }}>
                {/* LEFT */}
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


                {/* RIGHT */}
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
                        <Card
                            sx={{
                                width: "100%",
                                maxWidth: 480,
                                p: 6,
                                borderRadius: "24px",
                                boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                                background: "#fff",
                                mx: "auto",
                            }}
                        >
                            <Stack spacing={7}>
                                <Stack spacing={1}>
                                    <Typography variant="h4" fontWeight="800" textAlign="center"
                                        sx={{
                                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                            backgroundClip: "text",
                                            WebkitTextFillColor: "transparent"
                                        }}
                                    >
                                        {t("forgot-password.title")}
                                    </Typography>

                                    <Typography textAlign="center" sx={{ color: "gray", mb: 1 }}>
                                        {t("forgot-password.subtitle")}
                                    </Typography>
                                </Stack>

                                <TextField
                                    fullWidth
                                    label={t("forgot-password.emailLabel")}
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                                    error={Boolean(emailError)}
                                    helperText={emailError}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <EmailOutlinedIcon sx={{ color: "#667eea", fontSize: 22 }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            height: 50,
                                            borderRadius: 2,
                                        },
                                        '& .MuiInputLabel-root': {
                                            fontSize: 14,
                                        },
                                        '& input': {
                                            padding: '12px 14px',
                                        },
                                        mt: 2,
                                    }}
                                />

                                <Button
                                    variant="contained"
                                    fullWidth
                                    size="large"
                                    sx={{
                                        py: 1.5,
                                        borderRadius: 3,
                                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                        fontWeight: 700,
                                        boxShadow: "0 8px 24px rgba(102,126,234,0.4)",
                                        "&:hover": {
                                            boxShadow: "0 12px 30px rgba(102,126,234,0.5)",
                                        }
                                    }}
                                    onClick={handleSubmit}
                                >
                                    {t("forgot-password.sendButton")}
                                </Button>

                                <Button
                                    variant="text"
                                    fullWidth
                                    sx={{ mt: 1, color: "#667eea", fontWeight: 700 }}
                                    onClick={() => navigate("/login")}
                                >
                                    {t("forgot-password.backButton")}
                                </Button>
                            </Stack>
                        </Card>
                    </Box>
                </Zoom>
            </Box>
        </Box>
    );
}
