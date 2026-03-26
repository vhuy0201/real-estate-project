import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItemButton,
  Avatar,
  Button,
  CircularProgress,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CheckIcon from "@mui/icons-material/Check";
import {
  markAsRead,
  markAllAsRead,
  getAllNotifications,
} from "../../../services/notificationService";
import type { NotificationType } from "../../../types/Notification";
import { useNavigate } from "react-router-dom";
import { getLanguage, type Lang } from "../../../utils/storage";
import { useTranslation } from "react-i18next";
import { socket } from "../../../socket/socket";

const NotificationsPage = () => {
  const [allNotifications, setAllNotifications] = useState<NotificationType[]>(
    []
  );
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const navigate = useNavigate();
  const currentLanguage: Lang = getLanguage();
  const { t } = useTranslation("notification");

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const res = await getAllNotifications();
        setAllNotifications(res.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();

    const handleNewNotification = (notification: NotificationType) => {
      setAllNotifications((prev) => {
        if (prev.some((n) => n._id === notification._id)) return prev;
        return [notification, ...prev];
      });
    };

    const handleUnreadCountUpdate = (data: { unreadCount: number }) => {
      console.log("[NotificationsPage] Unread count updated:", data);
    };

    socket.on("new_notification", handleNewNotification);
    socket.on("unread_count_update", handleUnreadCountUpdate);

    return () => {
      socket.off("new_notification", handleNewNotification);
      socket.off("unread_count_update", handleUnreadCountUpdate);
    };
  }, []);

  useEffect(() => {
    if (filter === "all") {
      setNotifications(allNotifications);
    } else {
      setNotifications(allNotifications.filter((n) => !n.is_read));
    }
  }, [filter, allNotifications]);

  const handleMarkAsRead = async (id: string) => {
    socket.emit("notification_read", { notificationId: id });

    setAllNotifications((prev) =>
      prev.map((noti) => (noti._id === id ? { ...noti, is_read: true } : noti))
    );
    setNotifications((prev) =>
      prev.map((noti) => (noti._id === id ? { ...noti, is_read: true } : noti))
    );

    try {
      await markAsRead(id);
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    socket.emit("mark_all_notifications_read");

    setAllNotifications((prev) =>
      prev.map((noti) => (noti.is_read ? noti : { ...noti, is_read: true }))
    );
    setNotifications((prev) =>
      prev.map((noti) => (noti.is_read ? noti : { ...noti, is_read: true }))
    );

    try {
      await markAllAsRead();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleShowAll = () => {
    setFilter("all");
  };

  const handleShowUnread = () => {
    setFilter("unread");
  };

  const hasUnread = notifications.some((n) => !n.is_read);

  return (
    <Box
      mt={2}
      maxWidth={700}
      mx="auto"
      pb={4}
      px={0}
      bgcolor="#fff"
      borderRadius={3}
      boxShadow={4}
    >
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: "1px solid #eee",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: 1,
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          {t("notification")}
        </Typography>
        <Box display="flex" gap={1}>
          <Button
            variant={filter === "all" ? "contained" : "outlined"}
            size="small"
            onClick={handleShowAll}
          >
            {t("all")}
          </Button>
          <Button
            variant={filter === "unread" ? "contained" : "outlined"}
            size="small"
            onClick={handleShowUnread}
          >
            {t("un_read")}
          </Button>
          {(filter === "all" || filter === "unread") && hasUnread && (
            <Button
              variant="contained"
              size="small"
              color="success"
              startIcon={<CheckIcon />}
              onClick={handleMarkAllAsRead}
              sx={{ textTransform: "none", borderRadius: 2, minWidth: 0 }}
            >
              {t("read_all")}
            </Button>
          )}
        </Box>
      </Box>

      <List sx={{ bgcolor: "#fff", borderRadius: 2, px: 0, py: 0 }}>
        {notifications.length === 0 && !loading && (
          <Box p={8} textAlign="center" color="text.secondary">
            <NotificationsIcon color="disabled" sx={{ fontSize: 50, mb: 2 }} />
            <Typography>{t("no_new_notification")}</Typography>
          </Box>
        )}

        {notifications.map((n) => (
          <ListItemButton
            key={n._id}
            onClick={() => {
              if (!n.is_read) handleMarkAsRead(n._id);
              if (n.action_url) navigate(`${n.action_url}`);
            }}
            sx={{
              background: n.is_read
                ? "#fff"
                : "linear-gradient(90deg, #e8f0fe 0%, #ffffff 100%)",
              borderLeft: n.is_read
                ? "4px solid transparent"
                : "4px solid #1976d2",
              mb: 0.5,
              borderRadius: 2,
              transition: "background 0.2s",
              "&:hover": {
                background: n.is_read ? "#f3f6f9" : "#dbeafe",
              },
              display: "flex",
              alignItems: "flex-start",
              px: 3,
              py: 2,
            }}
          >
            <Avatar
              sx={{
                bgcolor: n.is_read ? "grey.300" : "primary.main",
                width: 38,
                height: 38,
                mr: 2,
                mt: 0.5,
              }}
            >
              <NotificationsIcon fontSize="small" />
            </Avatar>
            <Box flex={1} minWidth={0}>
              <Typography
                variant="subtitle2"
                fontWeight={n.is_read ? 400 : 700}
                sx={{ maxWidth: "100%" }}
              >
                {n.title?.[currentLanguage]}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  maxWidth: "100%",
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  mt: 0.3,
                  mb: 0.5,
                }}
              >
                {n.message?.[currentLanguage]}
              </Typography>
              <Typography variant="caption" color="text.disabled">
                {(() => {
                  const d = new Date(n.createdAt);
                  const now = new Date();
                  const diffMs = now.getTime() - d.getTime();
                  if (diffMs < 60000) return t("diffMs");
                  if (diffMs < 60 * 60000)
                    return `${Math.floor(diffMs / 60000)} ${t("diffMins")}`;
                  if (diffMs < 24 * 3600000)
                    return `${Math.floor(diffMs / 3600000)} ${t("diffHours")}`;
                  return d.toLocaleDateString("vi-VN");
                })()}
              </Typography>
            </Box>
          </ListItemButton>
        ))}

        {loading && (
          <Box py={3} display="flex" justifyContent="center">
            <CircularProgress size={24} />
          </Box>
        )}
      </List>
    </Box>
  );
};

export default NotificationsPage;
