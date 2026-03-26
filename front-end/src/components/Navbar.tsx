import React, { useContext, useState } from "react";
import { AppBar, Toolbar, Typography, Box, Button, IconButton, Avatar, Menu, MenuItem, Drawer, List, ListItem, ListItemButton, ListItemText, Divider, Fade, } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import HomeIcon from "@mui/icons-material/Home";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import AuthContext from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import ButtonLanguage from "./common/ButtonLanguage";
import Notification from "./common/notification/Notification";
import { useTranslation } from "react-i18next";

const Navbar: React.FC = () => {
  const { state, signOut } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const location = useLocation();
  const role = state.user?.role || 'guest';
  const isAdminRoute = location.pathname.startsWith('/admin');
  const { t } = useTranslation(["auth", "favorite"]);

  const roleMenus = {
    buyer: [
      { label: t("favorite:myProperties"), path: "/dwello/myProperties" },
      { label: t("favorite:myAppointments"), path: "/dwello/appointments" },
      { label: t("favorite:myOffer"), path: "/buyer/offer" },
      { label: t("favorite:dealsContract"), path: "/buyer/deals/list" },
      { label: t("favorite:listPayment"), path: "/buyer/listPayments" },
      { label: t("favorite:myFavorite"), path: "/favorites" },
    ],

    seller: [
      { label: t("favorite:myProperties"), path: "/seller/properties" },
      { label: t("favorite:manageListings"), path: "/seller/my-properties" },
      { label: t("favorite:myOffers"), path: "/seller/offers" },
      { label: t("favorite:dealsContract"), path: "/seller/deals/list" },
      { label: t("favorite:requestJoin"), path: "/seller/request-join" },
    ],

    agent: [
      { label: t("favorite:agentRequestPool"), path: "/agent/properties" },
      { label: t("favorite:manageListings"), path: "/agent/my-properties" },
      { label: t("favorite:assignments"), path: "/agent/assignments" },
      { label: t("favorite:myOffers"), path: "/agent/offers" },
      { label: t("favorite:dealsContract"), path: "/agent/deals/list" },
      { label: t("favorite:appointments"), path: "/agent/appointments" },
    ],
  };

  const handleLogout = () => {
    signOut();
    navigate("/login");
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { label: "Home", path: "/home" },
    { label: "Buy", path: "/buy" },
    { label: "Rent", path: "/rent" },
    { label: "Find Agent", path: "/agents" },
  ];

  const drawer = (
    <Box
      sx={{
        width: 280,
        height: "100%",
        background: "linear-gradient(180deg, #0f0c29 0%, #302b63 100%)",
        p: 3,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 900,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            backgroundClip: "text",
            textFillColor: "transparent",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Dwello
        </Typography>
        <IconButton onClick={handleDrawerToggle} sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", mb: 3 }} />

      {!isAdminRoute && (
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.label} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  handleDrawerToggle();
                }}
                sx={{
                  borderRadius: 2,
                  color: "white",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "rgba(102,126,234,0.2)",
                    transform: "translateX(8px)",
                  },
                }}
              >
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: 600,
                    fontSize: "1rem",
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}

      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", my: 3 }} />

      {state.token ? (
        <Box>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Button
            fullWidth
            onClick={() => {
              navigate("/login");
              handleDrawerToggle();
            }}
            sx={{
              py: 1.5,
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 3,
              color: "white",
              border: "2px solid rgba(255,255,255,0.2)",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.1)",
                borderColor: "rgba(255,255,255,0.4)",
              },
            }}
          >
            Sign In
          </Button>
          <Button
            fullWidth
            onClick={() => {
              navigate("/register");
              handleDrawerToggle();
            }}
            sx={{
              py: 1.5,
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 3,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              boxShadow: "0 8px 24px rgba(102,126,234,0.4)",
              "&:hover": {
                boxShadow: "0 12px 32px rgba(102,126,234,0.5)",
              },
            }}
          >
            Sign Up
          </Button>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(102,126,234,0.1)",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.05)",
          py: 1,
          px: { xs: 2, md: 6 },
          transition: "all 0.3s ease",
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            minHeight: { xs: 64, md: 70 },
          }}
        >
          {/* Mobile Menu Icon - Left Side */}
          {!isAdminRoute && (
            <IconButton
              onClick={handleDrawerToggle}
              sx={{
                display: { xs: "flex", md: "none" },
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                width: 42,
                height: 42,
                boxShadow: "0 4px 12px rgba(102,126,234,0.3)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "rotate(90deg)",
                  boxShadow: "0 6px 16px rgba(102,126,234,0.4)",
                },
              }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo - Center on Mobile, Left on Desktop */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              cursor: "pointer",
              transition: "transform 0.3s ease",
              position: { xs: "absolute", md: "static" },
              left: { xs: "50%", md: "auto" },
              transform: { xs: "translateX(-50%)", md: "none" },
              "&:hover": {
                transform: { xs: "translateX(-50%) scale(1.05)", md: "scale(1.05)" },
              },
            }}
            onClick={() => navigate("/")}
          >
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2.5,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(102,126,234,0.3)",
              }}
            >
              <HomeIcon sx={{ color: "white", fontSize: 24 }} />
            </Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 900,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                backgroundClip: "text",
                textFillColor: "transparent",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.02em",
              }}
            >
              Dwello
            </Typography>
          </Box>

          {/* Desktop Menu */}
          {!isAdminRoute && (
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                gap: 1,
                alignItems: "center",
              }}
            >
              {menuItems.map((item) => (
                <Button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  sx={{
                    color: "rgba(0,0,0,0.7)",
                    fontWeight: 600,
                    textTransform: "none",
                    px: 2.5,
                    py: 1,
                    borderRadius: 3,
                    fontSize: "0.95rem",
                    position: "relative",
                    transition: "all 0.3s ease",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      bottom: 8,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "0%",
                      height: "3px",
                      borderRadius: "3px",
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      transition: "width 0.3s ease",
                    },
                    "&:hover": {
                      color: "#667eea",
                      backgroundColor: "rgba(102,126,234,0.08)",
                      "&::before": {
                        width: "60%",
                      },
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {/* Right Side */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Notification />

            {!state.token ? (
              <>
                {/* Desktop Sign In/Up */}
                <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1.5 }}>
                  <Button
                    onClick={() => navigate("/login")}
                    startIcon={<PersonOutlineIcon />}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      px: 2.5,
                      py: 1,
                      borderRadius: 3,
                      color: "#667eea",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor: "rgba(102,126,234,0.1)",
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => navigate("/register")}
                    sx={{
                      textTransform: "none",
                      px: 3,
                      py: 1,
                      borderRadius: 3,
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      fontWeight: 700,
                      boxShadow: "0 6px 20px rgba(102,126,234,0.35)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        boxShadow: "0 8px 28px rgba(102,126,234,0.45)",
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    Sign up
                  </Button>
                </Box>
                {/* Mobile - Only Login Button */}
                <IconButton
                  onClick={() => navigate("/login")}
                  sx={{
                    display: { xs: "flex", md: "none" },
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    width: 40,
                    height: 40,
                    boxShadow: "0 4px 12px rgba(102,126,234,0.3)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 6px 16px rgba(102,126,234,0.4)",
                      transform: "scale(1.05)",
                    },
                  }}
                >
                  <PersonOutlineIcon fontSize="small" />
                </IconButton>
              </>
            ) : (
              <>
                {/* Desktop User Info */}
                <Box
                  sx={{
                    display: { xs: "none", md: "flex" },
                    alignItems: "center",
                    gap: 2,
                    px: 2,
                    py: 1,
                    borderRadius: 4,
                    background: "rgba(102,126,234,0.08)",
                    border: "1px solid rgba(102,126,234,0.15)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background: "rgba(102,126,234,0.12)",
                      boxShadow: "0 4px 16px rgba(102,126,234,0.15)",
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(102,126,234,0.3)",
                      width: 38,
                      height: 38,
                      fontSize: "1rem",
                      fontWeight: 700,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "scale(1.1)",
                      },
                    }}
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                  >
                    {state.user?.fullName?.[0] ?? "U"}
                  </Avatar>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: "#667eea",
                      fontSize: "0.95rem",
                    }}
                  >
                    {state.user?.fullName}
                  </Typography>
                  <IconButton
                    onClick={handleLogout}
                    sx={{
                      color: "#ff6b6b",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor: "rgba(255,107,107,0.1)",
                        transform: "rotate(15deg)",
                      },
                    }}
                  >
                    <LogoutIcon fontSize="small" />
                  </IconButton>
                </Box>
                {/* Mobile Avatar - Right Side */}
                <Avatar
                  sx={{
                    display: { xs: "flex", md: "none" },
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(102,126,234,0.3)",
                    width: 38,
                    height: 38,
                    fontSize: "1rem",
                    fontWeight: 700,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "scale(1.1)",
                    },
                  }}
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                >
                  {state.user?.fullName?.[0] ?? "U"}
                </Avatar>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 280,
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* User Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        TransitionComponent={Fade}
        sx={{
          "& .MuiPaper-root": {
            borderRadius: 3,
            mt: 1.5,
            minWidth: 240,
            boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
          },
        }}
      >
        <MenuItem
          onClick={() => {
            navigate("/profile");
            setAnchorEl(null);
          }}
          sx={{ py: 1.5, fontWeight: 600 }}
        >
          Profile
        </MenuItem>

        {
          roleMenus[role as keyof typeof roleMenus]?.map((item) => (
            <MenuItem
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setAnchorEl(null);
              }}
              sx={{ py: 1.5, fontWeight: 600 }}
            >
              {item.label}
            </MenuItem>
          ))
        }

        <Divider sx={{ my: 1 }} />

        <Box sx={{ px: 2, py: 1.5, display: "flex", justifyContent: "center" }}>
          <ButtonLanguage />
        </Box>

        <Divider sx={{ my: 1 }} />

        <MenuItem
          onClick={handleLogout}
          sx={{
            py: 1.5,
            fontWeight: 600,
            color: "#ff6b6b",
            "&:hover": {
              backgroundColor: "rgba(255,107,107,0.08)",
            },
          }}
        >
          Logout
        </MenuItem>
      </Menu>
    </>
  );
};

export default Navbar;