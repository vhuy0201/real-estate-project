import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Collapse,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  ExpandLess,
  ExpandMore,
  SupervisorAccount as SupervisorAccountIcon,
  ShoppingBag as ShoppingBagIcon,
  Hail as HailIcon,
  RealEstateAgent as RealEstateAgentIcon,
  CategoryOutlined as CategoryOutlinedIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import RealEstateAgentRoundedIcon from "@mui/icons-material/RealEstateAgentRounded";
import BackspaceRoundedIcon from "@mui/icons-material/BackspaceRounded";
import DoneRoundedIcon from "@mui/icons-material/DoneRounded";
import { useContext, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { getUser } from "../../utils/storage";
import ButtonLanguage from "../common/ButtonLanguage";
import AuthContext from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
const drawerWidth = 240;

export default function AdminDashboard() {
  const location = useLocation();
  const user = getUser();
  const { t } = useTranslation("dashboard");
  const isActive = (path: string) =>
    location.pathname + location.search === path;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [userListOpen, setUserListOpen] = useState(false);
  const [PropertyOpen, setUserPropertyOpen] = useState(false);
  const [contractOpen, setContractOpen] = useState(false);
  const [dealOpen, setDealOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { state, signOut } = useContext(AuthContext);

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };
  const naviage = useNavigate();
  const handleDrawerTransitionEnd = () => setIsClosing(false);
  const handleDrawerToggle = () => !isClosing && setMobileOpen(!mobileOpen);
  const handleUserListToggle = () => setUserListOpen(!userListOpen);
  const handlePropertyListToggle = () => setUserPropertyOpen(!PropertyOpen);
  const handleContractListToggle = () => setContractOpen(!contractOpen);
  const handleDealListToggle = () => setDealOpen(!dealOpen);
  const handlePaymentListToggle = () => setPaymentOpen(!paymentOpen);
  const handleLogout = () => {
    signOut();
    naviage("/login");
    setAnchorEl(null);
  };

  const menuItems = [
    { text: t("sidebar.menu.dashboard"), key: "Dashboard", icon: <DashboardIcon />, path: "/admin/dashboard" },
    { text: t("sidebar.menu.user"), key: "User", icon: <PersonIcon />, path: "/admin/users" },
    {
      text: t("sidebar.menu.properties"),
      key: "Properties",
      icon: <RealEstateAgentRoundedIcon />,
      path: "/admin/properties",
    },
    {
      text: t("sidebar.menu.contracts"),
      key: "Contracts",
      icon: <ArticleRoundedIcon />,
      path: "/admin/contracts",
    },
    { text: t("sidebar.menu.deals"), key: "Deals", icon: <LocalOfferIcon />, path: "/admin/deals" },
    { text: t("sidebar.menu.payments"), key: "Payments", icon: <LocalOfferIcon />, path: "/admin/payments" },
    { text: t("sidebar.menu.reviews"), key: "Reviews", icon: <HomeIcon />, path: "/admin/reviews" },
    {
      text: t("sidebar.menu.taxonomies"),
      key: "Taxonomies",
      icon: <CategoryOutlinedIcon />,
      path: "/admin/taxonomies",
    },
  ];

  const listUserItem = [
    {
      text: t("sidebar.userSubmenu.admin"),
      icon: <SupervisorAccountIcon />,
      path: "/admin/users?role=admin",
    },
    {
      text: t("sidebar.userSubmenu.buyer"),
      icon: <ShoppingBagIcon />,
      path: "/admin/users?role=buyer",
    },
    { text: t("sidebar.userSubmenu.seller"), icon: <HailIcon />, path: "/admin/users?role=seller" },
    {
      text: t("sidebar.userSubmenu.agent"),
      icon: <RealEstateAgentIcon />,
      path: "/admin/users?role=agent",
    },
  ];

  const listPropertyItem = [
    {
      text: t("sidebar.propertiesSubmenu.sold"),
      icon: <DoneRoundedIcon />,
      path: "/admin/properties?status=sold",
    },
    {
      text: t("sidebar.propertiesSubmenu.approved"),
      icon: <ShoppingBagIcon />,
      path: "/admin/properties?status=approved",
    },
    {
      text: t("sidebar.propertiesSubmenu.pending"),
      icon: <HailIcon />,
      path: "/admin/properties?status=pending",
    },
    {
      text: t("sidebar.propertiesSubmenu.rejected"),
      icon: <BackspaceRoundedIcon />,
      path: "/admin/properties?status=rejected",
    },
  ];

  const listContractItem = [
    {
      text: t("sidebar.contractsSubmenu.approved"),
      icon: <ShoppingBagIcon />,
      path: "/admin/contracts?status=approved",
    },
    {
      text: t("sidebar.contractsSubmenu.superseded"),
      icon: <HailIcon />,
      path: "/admin/contracts?status=superseded",
    },
    {
      text: t("sidebar.contractsSubmenu.rejected"),
      icon: <BackspaceRoundedIcon />,
      path: "/admin/contracts?status=rejected",
    },
  ];

  const listDealsItem = [
    {
      text: t("sidebar.dealsSubmenu.awaiting"),
      icon: <ShoppingBagIcon />,
      path: "/admin/deals?status=awaiting_contract",
    },
    {
      text: t("sidebar.dealsSubmenu.underReview"),
      icon: <HailIcon />,
      path: "/admin/deals?status=contract_under_review",
    },
    {
      text: t("sidebar.dealsSubmenu.escrowPayment"),
      icon: <BackspaceRoundedIcon />,
      path: "/admin/deals?status=awaiting_escrow_payment",
    },
    {
      text: t("sidebar.dealsSubmenu.escrowFunded"),
      icon: <ShoppingBagIcon />,
      path: "/admin/deals?status=escrow_funded",
    },
    {
      text: t("sidebar.dealsSubmenu.completed"),
      icon: <HailIcon />,
      path: "/admin/deals?status=completed",
    },
    {
      text: t("sidebar.dealsSubmenu.cancelled"),
      icon: <BackspaceRoundedIcon />,
      path: "/admin/deals?status=cancelled",
    },
  ];

  const listPaymentItem = [
    {
      text: t("sidebar.paymentsSubmenu.completed"),
      icon: <ShoppingBagIcon />,
      path: "/admin/payments?status=completed",
    },
    {
      text: t("sidebar.paymentsSubmenu.pending"),
      icon: <HailIcon />,
      path: "/admin/payments?status=pending",
    },
    {
      text: t("sidebar.paymentsSubmenu.canceled"),
      icon: <BackspaceRoundedIcon />,
      path: "/admin/payments?status=cancelled",
    },
  ];

  const bottomItems = [
    { text: t("sidebar.menu.logout"), icon: <LogoutIcon />, path: "/login" },
  ];

  const drawer = (
    <div>
      <Toolbar sx={{ bgcolor: "#f0f4ff" }}>
        <Typography
          variant="h5"
          sx={{
            fontFamily: "Akaya Telivigala, cursive",
            color: "#2563eb",
            fontWeight: "bold",
            width: "100%",
            textAlign: "center",
          }}
        >
          {t("sidebar.appName")}
        </Typography>
      </Toolbar>
      <Typography
        variant="subtitle1"
        sx={{
          textAlign: "center",
          color: "#64748b",
          fontStyle: "italic",
          mb: 1,
        }}
      >
        {t("sidebar.tagline")}
      </Typography>

      <Divider />
      <List>
        {menuItems.map((item) => (
          <Box key={item.key}>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
                onClick={
                  item.key === "User"
                    ? handleUserListToggle
                    : item.key === "Properties"
                      ? handlePropertyListToggle
                      : item.key === "Contracts"
                        ? handleContractListToggle
                        : item.key === "Deals"
                          ? handleDealListToggle
                          : item.key === "Payments"
                            ? handlePaymentListToggle
                            : undefined
                }
                sx={{
                  borderRadius: "12px",
                  mx: 1,
                  mt: 1,
                  color: "#1e293b",
                  bgcolor: isActive(item.path!) ? "#dbeafe" : "inherit",
                  "&:hover": {
                    bgcolor: "#bfdbfe",
                    transform: "scale(1.02)",
                    transition: "all 0.2s ease",
                  },
                }}
              >
                <ListItemIcon sx={{ color: "#2563eb" }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
                {item.key === "User" &&
                  (userListOpen ? <ExpandLess /> : <ExpandMore />)}
                {item.key === "Properties" &&
                  (PropertyOpen ? <ExpandLess /> : <ExpandMore />)}
                {item.key === "Contracts" &&
                  (contractOpen ? <ExpandLess /> : <ExpandMore />)}
                {item.key === "Deals" &&
                  (dealOpen ? <ExpandLess /> : <ExpandMore />)}
                {item.key === "Payments" &&
                  (paymentOpen ? <ExpandLess /> : <ExpandMore />)}
              </ListItemButton>
            </ListItem>

            {item.key === "User" && (
              <Collapse in={userListOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {listUserItem.map((sub) => (
                    <ListItemButton
                      key={sub.text}
                      component={Link}
                      to={sub.path}
                      sx={{
                        pl: 6,
                        borderRadius: "12px",
                        mx: 1,
                        mt: 0.5,
                        color: "#1e293b",
                        bgcolor: isActive(sub.path) ? "#e0f2fe" : "inherit",
                        "&:hover": {
                          bgcolor: "#bae6fd",
                          transform: "scale(1.02)",
                          transition: "all 0.2s ease",
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: "#0284c7" }}>
                        {sub.icon}
                      </ListItemIcon>
                      <ListItemText primary={sub.text} />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            )}
            {item.key === "Properties" && (
              <Collapse in={PropertyOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {listPropertyItem.map((sub) => (
                    <ListItemButton
                      key={sub.text}
                      component={Link}
                      to={sub.path}
                      sx={{
                        pl: 6,
                        borderRadius: "12px",
                        mx: 1,
                        mt: 0.5,
                        color: "#1e293b",
                        bgcolor: isActive(sub.path) ? "#e0f2fe" : "inherit",
                        "&:hover": {
                          bgcolor: "#bae6fd",
                          transform: "scale(1.02)",
                          transition: "all 0.2s ease",
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: "#0284c7" }}>
                        {sub.icon}
                      </ListItemIcon>
                      <ListItemText primary={sub.text} />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            )}
            {item.key === "Contracts" && (
              <Collapse in={contractOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {listContractItem.map((sub) => (
                    <ListItemButton
                      key={sub.text}
                      component={Link}
                      to={sub.path}
                      sx={{
                        pl: 6,
                        borderRadius: "12px",
                        mx: 1,
                        mt: 0.5,
                        color: "#1e293b",
                        bgcolor: isActive(sub.path) ? "#e0f2fe" : "inherit",
                        "&:hover": {
                          bgcolor: "#bae6fd",
                          transform: "scale(1.02)",
                          transition: "all 0.2s ease",
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: "#0284c7" }}>
                        {sub.icon}
                      </ListItemIcon>
                      <ListItemText primary={sub.text} />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            )}
            {item.key === "Deals" && (
              <Collapse in={dealOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {listDealsItem.map((sub) => (
                    <ListItemButton
                      key={sub.text}
                      component={Link}
                      to={sub.path}
                      sx={{
                        pl: 6,
                        borderRadius: "12px",
                        mx: 1,
                        mt: 0.5,
                        color: "#1e293b",
                        bgcolor: isActive(sub.path) ? "#e0f2fe" : "inherit",
                        "&:hover": {
                          bgcolor: "#bae6fd",
                          transform: "scale(1.02)",
                          transition: "all 0.2s ease",
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: "#0284c7" }}>
                        {sub.icon}
                      </ListItemIcon>
                      <ListItemText primary={sub.text} />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            )}
            {item.key === "Payments" && (
              <Collapse in={paymentOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {listPaymentItem.map((sub) => (
                    <ListItemButton
                      key={sub.text}
                      component={Link}
                      to={sub.path}
                      sx={{
                        pl: 6,
                        borderRadius: "12px",
                        mx: 1,
                        mt: 0.5,
                        color: "#1e293b",
                        bgcolor: isActive(sub.path) ? "#e0f2fe" : "inherit",
                        "&:hover": {
                          bgcolor: "#bae6fd",
                          transform: "scale(1.02)",
                          transition: "all 0.2s ease",
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: "#0284c7" }}>
                        {sub.icon}
                      </ListItemIcon>
                      <ListItemText primary={sub.text} />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            )}
          </Box>
        ))}
      </List>

      <Divider />
      <List sx={{ mt: 2 }}>
        {bottomItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              onClick={handleLogout}
              sx={{
                color: "#dc2626",
                borderRadius: "12px",
                mx: 1,
                "&:hover": { bgcolor: "#fee2e2" },
              }}
            >
              <ListItemIcon sx={{ color: "#dc2626" }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          background: "linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)",
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          boxShadow: 2,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {t("sidebar.hello")} <strong>{user.fullName}</strong>
          </Typography>
          <ButtonLanguage />
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              bgcolor: "#f8fafc",
              boxShadow: 3,
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Permanent Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              bgcolor: "#f8fafc",
              borderRight: "1px solid #e2e8f0",
              boxShadow: 2,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          bgcolor: "#f1f5f9",
          minHeight: "100vh",
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
