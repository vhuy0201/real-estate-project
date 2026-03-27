import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import {
  useAgentAppointments,
  useAcceptAppointment,
  useRejectAppointment,
} from "../../hooks/useAgentAppointments";
import { useSellerAppointments } from "../../hooks/useAgentAppointments";

export default function AgentAppointmentsScreen() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<"pending" | "accepted">("pending");
  const { user } = useSelector((state: RootState) => state.auth);
  const isAgent = user?.role === "agent";

  const agentQuery = useAgentAppointments(
    isAgent ? { status: activeTab, limit: 50 } : undefined
  );
  const sellerQuery = useSellerAppointments(
    !isAgent ? { status: activeTab, limit: 50 } : undefined
  );

  const { data, isLoading, refetch, isRefetching } = isAgent ? agentQuery : sellerQuery;


  const appointments = data?.data || [];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1e293b" />
        </Pressable>
        <Text style={styles.headerTitle}>Quản lý Lịch hẹn</Text>
        <View style={{ width: 38 }} />
      </View>

      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tab, activeTab === "pending" && styles.tabActive]}
          onPress={() => setActiveTab("pending")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "pending" && styles.tabTextActive,
            ]}
          >
            Chờ duyệt
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "accepted" && styles.tabActive]}
          onPress={() => setActiveTab("accepted")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "accepted" && styles.tabTextActive,
            ]}
          >
            Đã chốt
          </Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0ea5e9" />
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
          renderItem={({ item }) => <AppointmentCard item={item} isAgent={isAgent} />}
        />
      )}
    </SafeAreaView>
  );
}

const AppointmentCard = ({ item, isAgent }: { item: any; isAgent: boolean }) => {
  const { property_id, buyer_id, times, final_time, status, location } = item;

  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const acceptMutation = useAcceptAppointment();

  // Reject Modal State
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const rejectMutation = useRejectAppointment();

  const handleAccept = () => {
    if (!selectedTime) {
      Alert.alert("Lỗi", "Vui lòng chọn 1 khung giờ để chốt lịch hẹn.");
      return;
    }
    acceptMutation.mutate({ id: item._id, selectedTime });
  };

  const handleReject = () => {
    rejectMutation.mutate(
      { id: item._id, reason: rejectReason },
      {
        onSuccess: () => {
          setRejectModalVisible(false);
          setRejectReason("");
        },
      }
    );
  };

  const formatTime = (timeStr: string) => {
    const d = new Date(timeStr);
    return `${d.getHours().toString().padStart(2, "0")}:${d
      .getMinutes()
      .toString()
      .padStart(2, "0")} - ${d.getDate().toString().padStart(2, "0")}/${(
      d.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${d.getFullYear()}`;
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.propertyTitle} numberOfLines={1}>
            {property_id?.title?.vi || "Bất động sản"}
          </Text>
          <Text style={styles.buyerName}>
            Người hẹn: {buyer_id?.fullName || "Khách hàng"}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            status === "accepted" && styles.badgeAccepted,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              status === "accepted" && styles.statusTextAccepted,
            ]}
          >
            {status === "pending" ? "Đang chờ" : "Đã chốt"}
          </Text>
        </View>
      </View>

      {location ? (
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color="#64748b" />
          <Text style={styles.infoText}>{location}</Text>
        </View>
      ) : null}

      <View style={styles.divider} />

      {status === "pending" ? (
        <>
          <Text style={styles.sectionTitle}>Khung giờ khách đề xuất:</Text>
          {times?.map((t: any, index: number) => {
             const timeIso = new Date(t.time).toISOString();
             return (
              <Pressable
                key={index}
                style={[
                  styles.timeOption,
                  selectedTime === timeIso && styles.timeOptionSelected,
                ]}
                onPress={() => setSelectedTime(timeIso)}
              >
                <View style={styles.timeOptionHeader}>
                  <Ionicons
                    name={
                      selectedTime === timeIso
                        ? "radio-button-on"
                        : "radio-button-off"
                    }
                    size={20}
                    color={selectedTime === timeIso ? "#0ea5e9" : "#94a3b8"}
                  />
                  <Text
                    style={[
                      styles.timeOptionText,
                      selectedTime === timeIso && styles.timeOptionTextSelected,
                    ]}
                  >
                    {formatTime(t.time)}
                  </Text>
                </View>
                {!!t.note && <Text style={styles.timeNote}>Ghi chú: {t.note}</Text>}
              </Pressable>
             );
          })}

          {isAgent && (
            <View style={styles.actionRow}>
              <Pressable
                style={styles.rejectBtn}
                onPress={() => setRejectModalVisible(true)}
                disabled={acceptMutation.isPending || rejectMutation.isPending}
              >
                <Text style={styles.rejectBtnText}>Từ chối</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.acceptBtn,
                  (!selectedTime || acceptMutation.isPending) &&
                    styles.btnDisabled,
                ]}
                onPress={handleAccept}
                disabled={!selectedTime || acceptMutation.isPending}
              >
                {acceptMutation.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.acceptBtnText}>Chấp nhận</Text>
                )}
              </Pressable>
            </View>
          )}
        </>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Giờ đã chốt:</Text>
          <View style={styles.finalTimeBox}>
            <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
            <Text style={styles.finalTimeText}>
              {final_time ? formatTime(final_time) : "Chưa rõ"}
            </Text>
          </View>
        </>
      )}

      {/* Reject Modal */}
      <Modal visible={rejectModalVisible} transparent animationType="fade">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Từ chối lịch hẹn</Text>
            <Text style={styles.modalSubTitle}>
              Vui lòng nhập lý do (không bắt buộc):
            </Text>
            <TextInput
              style={styles.reasonInput}
              placeholder="VD: Chủ nhà đi vắng..."
              placeholderTextColor="#94a3b8"
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
            />
            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalCancelBtn}
                onPress={() => setRejectModalVisible(false)}
                disabled={rejectMutation.isPending}
              >
                <Text style={styles.rejectBtnText}>Hủy</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.modalConfirmBtn,
                  rejectMutation.isPending && styles.btnDisabled,
                ]}
                onPress={handleReject}
                disabled={rejectMutation.isPending}
              >
                {rejectMutation.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.acceptBtnText}>Xác nhận từ chối</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e2e8f0",
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#0f172a" },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e2e8f0",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: "#0ea5e9",
  },
  tabText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#64748b",
  },
  tabTextActive: {
    color: "#0ea5e9",
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
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
    marginBottom: 12,
  },
  cardHeaderLeft: { flex: 1, paddingRight: 10 },
  propertyTitle: { fontSize: 16, fontWeight: "700", color: "#0f172a" },
  buyerName: { fontSize: 13, color: "#475569", marginTop: 4 },
  statusBadge: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeAccepted: { backgroundColor: "#dcfce3" },
  statusText: { fontSize: 12, fontWeight: "600", color: "#d97706" },
  statusTextAccepted: { color: "#16a34a" },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  infoText: { fontSize: 13, color: "#64748b" },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: "#e2e8f0", marginVertical: 12 },
  sectionTitle: { fontSize: 14, fontWeight: "600", color: "#1e293b", marginBottom: 10 },
  timeOption: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  timeOptionSelected: {
    backgroundColor: "#f0f9ff",
    borderColor: "#0ea5e9",
  },
  timeOptionHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  timeOptionText: { fontSize: 14, fontWeight: "500", color: "#475569" },
  timeOptionTextSelected: { color: "#0ea5e9", fontWeight: "600" },
  timeNote: { fontSize: 12, color: "#64748b", marginTop: 6, paddingLeft: 28, fontStyle: "italic" },
  actionRow: { flexDirection: "row", gap: 12, marginTop: 16 },
  rejectBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
  },
  rejectBtnText: { fontSize: 14, fontWeight: "600", color: "#475569" },
  acceptBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#0ea5e9",
    alignItems: "center",
  },
  acceptBtnText: { fontSize: 14, fontWeight: "700", color: "#fff" },
  btnDisabled: { opacity: 0.5 },
  finalTimeBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  finalTimeText: { fontSize: 15, fontWeight: "600", color: "#16a34a" },
  emptyBox: { alignItems: "center", marginTop: 60 },
  emptyText: { marginTop: 12, fontSize: 15, color: "#94a3b8" },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    elevation: 8,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#0f172a", marginBottom: 8 },
  modalSubTitle: { fontSize: 14, color: "#64748b", marginBottom: 16 },
  reasonInput: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: "top",
  },
  modalActions: { flexDirection: "row", gap: 12, marginTop: 24 },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
  },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#ef4444",
    alignItems: "center",
  },
});
