import React, { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { AlertButton } from "react-native";
import { setAlertListener, type AlertPayload } from "../../utils/alertBridge";

export function GlobalAlertHost() {
  const [payload, setPayload] = useState<AlertPayload | null>(null);

  useEffect(() => {
    setAlertListener((next) => setPayload(next));
    return () => setAlertListener(null);
  }, []);

  const buttons = useMemo(() => {
    const arr = payload?.buttons;
    if (!arr || arr.length === 0) return [{ text: "OK" } as AlertButton];
    return arr.slice(0, 3);
  }, [payload]);

  if (!payload) return null;

  const close = (button?: AlertButton) => {
    setPayload(null);
    button?.onPress?.();
  };

  return (
    <Modal transparent visible animationType="fade" onRequestClose={() => close()}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{payload.title}</Text>
          {!!payload.message && <Text style={styles.message}>{payload.message}</Text>}
          <View style={styles.actions}>
            {buttons.map((btn, index) => {
              const isDestructive = btn.style === "destructive";
              const isCancel = btn.style === "cancel";
              return (
                <Pressable
                  key={`${btn.text || "btn"}-${index}`}
                  style={[
                    styles.actionBtn,
                    isDestructive && styles.actionBtnDanger,
                    isCancel && styles.actionBtnCancel,
                  ]}
                  onPress={() => close(btn)}
                >
                  <Text
                    style={[
                      styles.actionText,
                      isDestructive && styles.actionTextDanger,
                      isCancel && styles.actionTextCancel,
                    ]}
                  >
                    {btn.text || "OK"}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.45)",
    justifyContent: "center",
    paddingHorizontal: 22,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  title: { fontSize: 29, fontWeight: "800", color: "#0f172a" },
  message: { marginTop: 8, fontSize: 15, color: "#475569", lineHeight: 22 },
  actions: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: 8,
  },
  actionBtn: {
    backgroundColor: "#1e3a8a",
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  actionBtnCancel: { backgroundColor: "#e2e8f0" },
  actionBtnDanger: { backgroundColor: "#b91c1c" },
  actionText: { color: "#fff", fontSize: 13, fontWeight: "800" },
  actionTextCancel: { color: "#334155" },
  actionTextDanger: { color: "#fff" },
});

