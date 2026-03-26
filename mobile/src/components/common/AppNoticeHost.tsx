import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppNoticePayload, setAppNoticeListener } from "../../utils/appNotice";

export function AppNoticeHost() {
  const [notice, setNotice] = useState<AppNoticePayload | null>(null);
  const translateY = useRef(new Animated.Value(-80)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setAppNoticeListener((payload) => {
      setNotice(payload);
    });
    return () => {
      setAppNoticeListener(null);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!notice) return;
    if (timerRef.current) clearTimeout(timerRef.current);

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();

    timerRef.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -80,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(() => setNotice(null));
    }, 2200);
  }, [notice, opacity, translateY]);

  if (!notice) return null;

  const theme =
    notice.type === "success"
      ? { bg: "#ecfdf5", border: "#86efac", color: "#166534", icon: "checkmark-circle" }
      : notice.type === "error"
        ? { bg: "#fef2f2", border: "#fca5a5", color: "#b91c1c", icon: "alert-circle" }
        : { bg: "#eff6ff", border: "#93c5fd", color: "#1d4ed8", icon: "information-circle" };

  return (
    <Animated.View
      style={[
        styles.wrap,
        {
          transform: [{ translateY }],
          opacity,
          backgroundColor: theme.bg,
          borderColor: theme.border,
        },
      ]}
      pointerEvents="none"
    >
      <Ionicons name={theme.icon as any} size={18} color={theme.color} />
      <View style={{ flex: 1 }}>
        {!!notice.title && <Text style={[styles.title, { color: theme.color }]}>{notice.title}</Text>}
        <Text style={[styles.message, { color: theme.color }]} numberOfLines={2}>
          {notice.message}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    top: 16,
    left: 12,
    right: 12,
    zIndex: 9999,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  title: { fontSize: 13, fontWeight: "800" },
  message: { fontSize: 12, fontWeight: "600", marginTop: 2 },
});

