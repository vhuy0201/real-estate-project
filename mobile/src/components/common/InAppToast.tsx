import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type InAppToastProps = {
  type: "success" | "error" | "info";
  message: string;
};

export function InAppToast({ type, message }: InAppToastProps) {
  const icon =
    type === "success"
      ? "checkmark-circle"
      : type === "error"
        ? "alert-circle"
        : "information-circle";

  const bg =
    type === "success" ? "#ecfdf5" : type === "error" ? "#fef2f2" : "#eff6ff";
  const border =
    type === "success" ? "#86efac" : type === "error" ? "#fca5a5" : "#93c5fd";
  const color =
    type === "success" ? "#166534" : type === "error" ? "#b91c1c" : "#1d4ed8";

  return (
    <View style={[styles.wrap, { backgroundColor: bg, borderColor: border }]}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={[styles.text, { color }]} numberOfLines={2}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginHorizontal: 10,
    marginBottom: 8,
  },
  text: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
  },
});

