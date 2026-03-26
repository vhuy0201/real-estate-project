import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image } from "expo-image";

import { useMyAppointments, useCancelAppointment } from "../../hooks/useAppointments";
import { RootStackParamList } from "../../types/navigation";

function getStatusText(status: string) {
  switch (status) {
    case "pending":
      return "Chờ xác nhận";
    case "accepted":
      return "Đã chốt lịch";
    case "rejected":
      return "Bị từ chối";
    case "cancelled":
      return "Đã hủy";
    case "completed":
      return "Hoàn tất";
    default:
      return status;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "pending":
      return "#eab308";
    case "accepted":
      return "#3b82f6";
    case "rejected":
    case "cancelled":
      return "#ef4444";
    case "completed":
      return "#22c55e";
    default:
      return "#6b7280";
  }
}

export default function BuyerAppointmentListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data, isLoading, refetch, isRefetching } = useMyAppointments({
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const { mutate: cancelAppt, isPending: isCanceling } = useCancelAppointment();

  const handleCancel = (id: string) => {
    Alert.alert("Xác nhận", "Bạn có chắc muốn hủy lịch hẹn này?", [
      { text: "Bỏ qua", style: "cancel" },
      { text: "Đồng ý", onPress: () => cancelAppt(id), style: "destructive" },
    ]);
  };

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "https://via.placeholder.com/150";
    if (imagePath.startsWith("http")) return imagePath;
    const baseUrl = process.env.EXPO_PUBLIC_API_URL?.split("/api")[0] || "http://192.168.1.4:3000";
    return `${baseUrl}/${imagePath.startsWith("/") ? imagePath.slice(1) : imagePath}`;
  };

  const renderItem = ({ item }: { item: any }) => {
    const propImage = item.property_id?.images?.[0];

    return (
      <Pressable 
        style={styles.card}
        onPress={() => navigation.navigate("BuyerAppointmentDetail", { appointmentId: item._id })}
      >
        <View style={styles.cardHeader}>
          <Image source={{ uri: getImageUrl(propImage) }} style={styles.image} />
          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={1}>
              {item.property_id?.title?.vi || "Bất động sản"}
            </Text>
            <Text style={styles.address} numberOfLines={1}>
              {item.property_id?.address?.vi || "Chưa cập nhật địa chỉ"}
            </Text>
            <View style={styles.statusBadge}>
              <Text style={{ color: getStatusColor(item.status), fontSize: 12, fontWeight: "600" }}>
                {getStatusText(item.status)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.details}>
          <View style={styles.agentRow}>
            <Image
              source={
                item.agent_id?.avatar
                  ? { uri: item.agent_id.avatar }
                  : require("../../assets/default-avatar.png")
              }
              style={styles.avatar}
            />
            <View>
              <Text style={styles.agentLabel}>Agent quản lý</Text>
              <Text style={styles.agentName}>{item.agent_id?.fullName || "Chưa rõ"}</Text>
            </View>
          </View>

          {item.status === "accepted" && item.final_time && (
            <View style={styles.timeBox}>
              <Ionicons name="time" size={16} color="#3b82f6" />
              <Text style={styles.timeText}>
                Lịch hẹn: {new Date(item.final_time).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}
              </Text>
            </View>
          )}

          {item.status === "pending" && (
            <Pressable
              style={styles.cancelBtn}
              onPress={() => handleCancel(item._id)}
              disabled={isCanceling}
            >
              <Text style={styles.cancelTxt}>Hủy lịch hẹn</Text>
            </Pressable>
          )}
        </View>
      </Pressable>
    );
  };

  const hasData = Array.isArray(data?.data) && data.data.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lịch hẹn xem nhà</Text>
      </View>

      <View style={styles.tabs}>
        {["all", "pending", "accepted"].map((tab) => (
          <Pressable
            key={tab}
            style={[styles.tab, statusFilter === tab && styles.activeTab]}
            onPress={() => setStatusFilter(tab)}
          >
            <Text style={[styles.tabText, statusFilter === tab && styles.activeTabText]}>
              {tab === "all" ? "Tất cả" : tab === "pending" ? "Đang chờ" : "Đã chốt"}
            </Text>
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : hasData ? (
        <FlatList
          data={data.data}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshing={isRefetching}
          onRefresh={refetch}
        />
      ) : (
        <View style={styles.center}>
          <Ionicons name="calendar-outline" size={64} color="#e5e7eb" />
          <Text style={styles.emptyText}>Bạn chưa có lịch hẹn nào</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { padding: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#1e293b" },
  tabs: { flexDirection: "row", backgroundColor: "#fff", paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center", borderBottomWidth: 2, borderBottomColor: "transparent" },
  activeTab: { borderBottomColor: "#3b82f6" },
  tabText: { fontSize: 14, fontWeight: "600", color: "#64748b" },
  activeTabText: { color: "#3b82f6" },
  listContent: { padding: 16 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 12, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  cardHeader: { flexDirection: "row", marginBottom: 12 },
  image: { width: 64, height: 64, borderRadius: 8, backgroundColor: "#f1f5f9" },
  info: { flex: 1, marginLeft: 12 },
  title: { fontSize: 15, fontWeight: "700", color: "#1e293b" },
  address: { fontSize: 12, color: "#64748b", marginTop: 2 },
  statusBadge: { alignSelf: "flex-start", marginTop: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, backgroundColor: "#f8fafc" },
  details: { borderTopWidth: 1, borderTopColor: "#f8fafc", paddingTop: 12 },
  agentRow: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 32, height: 32, borderRadius: 16, marginRight: 8 },
  agentLabel: { fontSize: 10, color: "#94a3b8" },
  agentName: { fontSize: 13, fontWeight: "600", color: "#1e293b" },
  timeBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#eff6ff", padding: 8, borderRadius: 8, marginTop: 12 },
  timeText: { marginLeft: 8, fontSize: 13, fontWeight: "600", color: "#3b82f6" },
  cancelBtn: { marginTop: 12, backgroundColor: "#fee2e2", paddingVertical: 8, borderRadius: 8, alignItems: "center" },
  cancelTxt: { color: "#ef4444", fontWeight: "600", fontSize: 13 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { marginTop: 12, fontSize: 15, color: "#94a3b8" },
});
