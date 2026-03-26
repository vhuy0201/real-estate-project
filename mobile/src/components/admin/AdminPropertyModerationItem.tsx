import React, { useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { AdminPropertyListRow, PropertyModerationStatus } from "../../types/adminProperty";

type AdminPropertyModerationItemProps = {
  item: AdminPropertyListRow;
  busy: boolean;
  onApprove: () => void;
  onReject: () => void;
  onHide: () => void;
  onRestore: () => void;
  onOpenDetail: () => void;
};

function statusLabel(s: PropertyModerationStatus | undefined): string {
  switch (s) {
    case "pending":
      return "Chờ duyệt";
    case "approved":
      return "Đã duyệt";
    case "rejected":
      return "Từ chối";
    case "available":
      return "Chờ duyệt";
    case "sold":
      return "Đã bán";
    case "rented":
      return "Cho thuê";
    default:
      return "—";
  }
}

function statusChipStyle(s: PropertyModerationStatus | undefined) {
  switch (s) {
    case "pending":
    case "available":
      return { bg: "#fef3c7", color: "#b45309", border: "#fcd34d" };
    case "approved":
      return { bg: "#dcfce7", color: "#166534", border: "#86efac" };
    case "rejected":
      return { bg: "#fee2e2", color: "#b91c1c", border: "#fecaca" };
    default:
      return { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" };
  }
}

export function AdminPropertyModerationItem({
  item,
  busy,
  onApprove,
  onReject,
  onHide,
  onRestore,
  onOpenDetail,
}: AdminPropertyModerationItemProps) {
  const id = String(item._id);
  const title =
    item.title?.vi?.trim() ||
    item.title?.en?.trim() ||
    "Không có tiêu đề";
  const address =
    item.address?.vi?.trim() || item.address?.en?.trim() || "";
  const owner = item.owner_id;
  const ownerName =
    owner && typeof owner === "object" && "fullName" in owner
      ? owner.fullName || owner.email || "—"
      : "—";
  const chip = statusChipStyle(item.status);
  const thumb = item.images?.[0] || "https://via.placeholder.com/640x360?text=No+Image";
  const isPending = item.status === "pending";
  const priceText = useMemo(() => {
    if (item.price == null || Number.isNaN(Number(item.price))) {
      return "—";
    }
    return `${Number(item.price).toLocaleString("vi-VN")} ₫`;
  }, [item.price]);

  return (
    <View style={styles.card}>
      <Pressable onPress={onOpenDetail} style={({ pressed }) => pressed && styles.cardPressed}>
        <ImageBackground
          source={{ uri: thumb }}
          style={styles.hero}
          imageStyle={styles.heroImage}
        >
          <View
            style={[
              styles.statusChip,
              { backgroundColor: chip.bg, borderColor: chip.border },
            ]}
          >
            <Text style={[styles.statusText, { color: chip.color }]}>
              {statusLabel(item.status)}
            </Text>
          </View>
        </ImageBackground>
        <View style={styles.main}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <View style={styles.metaList}>
            <View style={styles.metaRow}>
              <Ionicons name="person-outline" size={13} color="#64748b" />
              <Text style={styles.metaText} numberOfLines={1}>
                {ownerName}
              </Text>
            </View>
            {!!address && (
              <View style={styles.metaRow}>
                <Ionicons name="location-outline" size={13} color="#64748b" />
                <Text style={styles.metaText} numberOfLines={1}>
                  {address}
                </Text>
              </View>
            )}
            <View style={styles.metaRow}>
              <Ionicons name="cash-outline" size={13} color="#64748b" />
              <Text style={styles.metaText}>{priceText}</Text>
            </View>
          </View>
          <View style={styles.bottomRow}>
            <Text style={styles.idText}>#{id.slice(-6).toUpperCase()}</Text>
            <Pressable onPress={onOpenDetail} style={styles.detailsBtn}>
              <Text style={styles.detailsBtnText}>XEM CHI TIẾT</Text>
              <Ionicons name="chevron-forward" size={14} color="#fff" />
            </Pressable>
          </View>
          {!isPending ? (
            <Text style={styles.hint}>
              Bài đăng đã xử lý. Chạm XEM CHI TIẾT để xem thêm.
            </Text>
          ) : null}
        </View>
      </Pressable>
      {isPending ? (
        <View style={styles.actions}>
          <Pressable
            onPress={onApprove}
            disabled={busy}
            style={[styles.btn, styles.btnApprove, busy && styles.btnDisabled]}
          >
            {busy ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={18} color="#fff" />
                <Text style={styles.btnApproveText}>Phê duyệt</Text>
              </>
            )}
          </Pressable>
          <Pressable
            onPress={onReject}
            disabled={busy}
            style={[styles.btn, styles.btnReject, busy && styles.btnDisabled]}
          >
            <Ionicons name="close-circle-outline" size={18} color="#fff" />
            <Text style={styles.btnRejectText}>Từ chối</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.actions}>
          {item.status === "rejected" || (item as any).deleted ? (
            <Pressable
              onPress={onRestore}
              disabled={busy}
              style={[styles.btn, styles.btnApprove, busy && styles.btnDisabled]}
            >
              {busy ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="refresh-circle" size={18} color="#fff" />
                  <Text style={styles.btnApproveText}>Khôi phục</Text>
                </>
              )}
            </Pressable>
          ) : (
            <Pressable
              onPress={onHide}
              disabled={busy}
              style={[styles.btn, styles.btnReject, busy && styles.btnDisabled]}
            >
              <Ionicons name="eye-off-outline" size={18} color="#fff" />
              <Text style={styles.btnRejectText}>Ẩn bài đăng</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
  },
  cardPressed: { opacity: 0.92 },
  hero: {
    height: 124,
    justifyContent: "flex-start",
  },
  heroImage: {
    resizeMode: "cover",
  },
  main: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 12 },
  title: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
    lineHeight: 18,
  },
  metaList: { marginTop: 8, gap: 4 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { flex: 1, fontSize: 11, color: "#64748b", fontWeight: "600" },
  statusChip: {
    alignSelf: "flex-start",
    marginTop: 8,
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusText: { fontSize: 10, fontWeight: "800" },
  bottomRow: {
    marginTop: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  idText: { fontSize: 10, color: "#94a3b8", fontWeight: "700" },
  detailsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#1e3a8a",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  detailsBtnText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 2,
    paddingTop: 10,
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e2e8f0",
  },
  btn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
  },
  btnDisabled: { opacity: 0.55 },
  btnApprove: { backgroundColor: "#15803d" },
  btnApproveText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  btnReject: { backgroundColor: "#b91c1c" },
  btnRejectText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  hint: {
    marginTop: 8,
    fontSize: 10,
    color: "#94a3b8",
    textAlign: "left",
  },
});
