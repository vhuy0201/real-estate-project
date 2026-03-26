import React from "react";
import { View, Text, StyleSheet, Pressable, Switch, ActivityIndicator, Alert } from "react-native";
import { Image } from "expo-image";
import type { AdminUserRow } from "../../types/adminUser";

const ROLE_LABELS: Record<string, string> = {
  buyer: "Người mua",
  seller: "Chủ nhà",
  agent: "Môi giới",
  admin: "Quản trị",
};

type Props = {
  item: AdminUserRow;
  onPress?: (item: AdminUserRow) => void;
  /** Callback khi toggle trạng thái khóa/mở khóa */
  onToggleStatus?: (id: string, isActive: boolean) => void;
  /** Mutation đang pending cho chính user này */
  isPending?: boolean;
};

function AdminUserListItemInner({ item, onPress, onToggleStatus, isPending = false }: Props) {
  const roleLabel = ROLE_LABELS[item.role] ?? item.role;
  const active = item.isActive !== false;

  const handleToggle = (locked: boolean) => {
    const targetActive = !locked; // switch value = "bị khóa"
    Alert.alert(
      targetActive ? "Mở khóa tài khoản" : "Khóa tài khoản",
      `Bạn có chắc chắn muốn ${targetActive ? "mở khóa" : "khóa"} tài khoản của ${item.fullName || item.email}?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đồng ý",
          style: targetActive ? "default" : "destructive",
          onPress: () => onToggleStatus?.(item.id, targetActive),
        },
      ]
    );
  };

  const content = (
    <View style={[styles.row, !active && styles.rowInactive]}>
      <Image
        source={
          item.avatar
            ? { uri: item.avatar }
            : require("../../../assets/default-avatar.png")
        }
        style={[styles.avatar, !active && styles.dimmed]}
        contentFit="cover"
      />
      <View style={[styles.body, !active && styles.dimmed]}>
        <Text style={styles.name} numberOfLines={1}>
          {item.fullName}
        </Text>
        <Text style={styles.email} numberOfLines={1}>
          {item.email}
        </Text>
        <View style={styles.metaRow}>
          <View style={[styles.badge, styles.badgeRole]}>
            <Text style={styles.badgeText}>{roleLabel}</Text>
          </View>
          <View
            style={[
              styles.badge,
              active ? styles.badgeActive : styles.badgeInactive,
            ]}
          >
            <Text style={styles.badgeTextMuted}>
              {active ? "Hoạt động" : "Đã khóa"}
            </Text>
          </View>
        </View>
      </View>

      {/* Toggle khóa/mở khóa */}
      {onToggleStatus && (
        <View style={styles.toggleContainer}>
          {isPending ? (
            <ActivityIndicator size="small" color="#1e3a8a" />
          ) : (
            <Switch
              value={!active}
              onValueChange={handleToggle}
              disabled={isPending}
              trackColor={{ false: "#e2e8f0", true: "#fb7185" }}
              thumbColor={!active ? "#e11d48" : "#fff"}
            />
          )}
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={() => onPress(item)} style={({ pressed }) => [pressed && styles.pressed]}>
        {content}
      </Pressable>
    );
  }

  return content;
}

export const AdminUserListItem = React.memo(AdminUserListItemInner);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e2e8f0",
  },
  rowInactive: {
    backgroundColor: "#fef2f2",
  },
  pressed: { opacity: 0.85 },
  dimmed: { opacity: 0.55 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f1f5f9",
  },
  body: { flex: 1, marginLeft: 12, justifyContent: "center" },
  name: { fontSize: 16, fontWeight: "600", color: "#0f172a" },
  email: { fontSize: 13, color: "#64748b", marginTop: 2 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 6, gap: 6 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  badgeRole: { backgroundColor: "#dbeafe" },
  badgeActive: { backgroundColor: "#dcfce7" },
  badgeInactive: { backgroundColor: "#fee2e2" },
  badgeText: { fontSize: 11, fontWeight: "600", color: "#1e40af" },
  badgeTextMuted: { fontSize: 11, fontWeight: "600", color: "#334155" },
  toggleContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    paddingLeft: 12,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: "#e2e8f0",
  },
});
