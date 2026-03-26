import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useMyAppointments, useCancelAppointment } from "../../hooks/useAppointments";

type TabKey = "all" | "pending" | "accepted" | "rejected" | "cancelled";

export default function BuyerAppointmentsScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  const queryParams =
    activeTab === "all" ? { limit: 50 } : { status: activeTab, limit: 50 };

  const { data, isLoading, refetch, isRefetching } =
    useMyAppointments(queryParams);

  const appointments = data?.data || [];

  const tabs: { key: TabKey; label: string }[] = [
    { key: "all", label: "Tất cả" },
    { key: "pending", label: "Chờ duyệt" },
    { key: "accepted", label: "Đã chốt" },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lịch hẹn xem nhà</Text>
      </View>

      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <Pressable
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshing={isRefetching}
          onRefresh={refetch}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="calendar-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>Chưa có lịch hẹn nào</Text>
            </View>
          }
          renderItem={({ item }) => <AppointmentCard item={item} />}
        />
      )}
    </SafeAreaView>
  );
}

/* ── Card ── */
const AppointmentCard = ({ item }: { item: any }) => {
  const { property_id, times, final_time, status, location } = item;
  const cancelMutation = useCancelAppointment();

  const statusMap: Record<string, { label: string; bg: string; color: string }> = {
    pending: { label: "Chờ duyệt", bg: "#fef3c7", color: "#d97706" },
    accepted: { label: "Đã chốt", bg: "#dcfce7", color: "#16a34a" },
    rejected: { label: "Bị từ chối", bg: "#fee2e2", color: "#dc2626" },
    cancelled: { label: "Đã hủy", bg: "#f1f5f9", color: "#64748b" },
    completed: { label: "Hoàn tất", bg: "#e0f2fe", color: "#0284c7" },
  };

  const badge = statusMap[status] || statusMap.pending;

  const formatTime = (str: string) => {
    const d = new Date(str);
    const hh = d.getHours().toString().padStart(2, "0");
    const mm = d.getMinutes().toString().padStart(2, "0");
    const dd = d.getDate().toString().padStart(2, "0");
    const mo = (d.getMonth() + 1).toString().padStart(2, "0");
    return `${hh}:${mm} - ${dd}/${mo}/${d.getFullYear()}`;
  };

  const handleCancel = () => {
    Alert.alert("Xác nhận", "Bạn có chắc muốn hủy lịch hẹn này?", [
      { text: "Không", style: "cancel" },
      { text: "Hủy lịch", style: "destructive", onPress: () => cancelMutation.mutate(item._id) },
    ]);
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.propertyTitle} numberOfLines={1}>
          {property_id?.title?.vi || "Bất động sản"}
        </Text>
        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
        </View>
      </View>

      {location ? (
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={15} color="#64748b" />
          <Text style={styles.infoText}>{location}</Text>
        </View>
      ) : null}

      <View style={styles.divider} />

      {status === "accepted" && final_time ? (
        <View style={styles.finalBox}>
          <Ionicons name="checkmark-circle" size={18} color="#16a34a" />
          <Text style={styles.finalText}>{formatTime(final_time)}</Text>
        </View>
      ) : (
        <>
          <Text style={styles.sectionLabel}>Khung giờ đề xuất:</Text>
          {times?.map((t: any, idx: number) => (
            <View key={idx} style={styles.timeRow}>
              <Ionicons name="time-outline" size={16} color="#64748b" />
              <Text style={styles.timeText}>{formatTime(t.time)}</Text>
              {!!t.note && (
                <Text style={styles.timeNote}> — {t.note}</Text>
              )}
            </View>
          ))}
        </>
      )}

      {status === "pending" && (
        <Pressable
          style={[styles.cancelBtn, cancelMutation.isPending && styles.btnDisabled]}
          onPress={handleCancel}
          disabled={cancelMutation.isPending}
        >
          {cancelMutation.isPending ? (
            <ActivityIndicator size="small" color="#ef4444" />
          ) : (
            <Text style={styles.cancelBtnText}>Hủy lịch hẹn</Text>
          )}
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e2e8f0",
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#0f172a" },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e2e8f0",
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: { borderBottomColor: "#3b82f6" },
  tabText: { fontSize: 14, fontWeight: "600", color: "#94a3b8" },
  tabTextActive: { color: "#3b82f6" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: { padding: 16, paddingBottom: 40 },
  emptyBox: { alignItems: "center", marginTop: 60 },
  emptyText: { marginTop: 12, fontSize: 15, color: "#94a3b8" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  propertyTitle: { flex: 1, fontSize: 16, fontWeight: "700", color: "#0f172a", paddingRight: 10 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: "600" },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  infoText: { fontSize: 13, color: "#64748b" },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: "#e2e8f0", marginVertical: 12 },
  sectionLabel: { fontSize: 13, fontWeight: "600", color: "#475569", marginBottom: 8 },
  timeRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  timeText: { fontSize: 14, fontWeight: "500", color: "#1e293b" },
  timeNote: { fontSize: 12, color: "#94a3b8", fontStyle: "italic" },
  finalBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  finalText: { fontSize: 15, fontWeight: "600", color: "#16a34a" },
  cancelBtn: {
    marginTop: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fef2f2",
    alignItems: "center",
  },
  cancelBtnText: { fontSize: 14, fontWeight: "600", color: "#ef4444" },
  btnDisabled: { opacity: 0.5 },
});
