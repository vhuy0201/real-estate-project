import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type PrettyConfirmModalProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary";
  onCancel: () => void;
  onConfirm: () => void;
};

export function PrettyConfirmModal({
  visible,
  title,
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  variant = "primary",
  onCancel,
  onConfirm,
}: PrettyConfirmModalProps) {
  const confirmBg = variant === "danger" ? "#b91c1c" : "#1e3a8a";
  const iconName = variant === "danger" ? "warning" : "help-circle";

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name={iconName} size={20} color={confirmBg} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <Pressable style={styles.cancelBtn} onPress={onCancel}>
              <Text style={styles.cancelText}>{cancelText}</Text>
            </Pressable>
            <Pressable style={[styles.confirmBtn, { backgroundColor: confirmBg }]} onPress={onConfirm}>
              <Text style={styles.confirmText}>{confirmText}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.38)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: { fontSize: 18, fontWeight: "800", color: "#0f172a" },
  message: { marginTop: 8, fontSize: 14, color: "#475569", lineHeight: 20 },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 14 },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: "#e2e8f0",
  },
  cancelText: { color: "#334155", fontSize: 13, fontWeight: "700" },
  confirmBtn: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 8 },
  confirmText: { color: "#fff", fontSize: 13, fontWeight: "700" },
});

