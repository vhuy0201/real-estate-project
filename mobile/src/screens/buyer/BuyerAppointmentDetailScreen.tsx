import React from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";

import { useAppointmentDetails, useCancelAppointment } from "../../hooks/useAppointments";

function getStatusText(status: string) {
  switch (status) {
    case "pending": return "Chờ xác nhận";
    case "accepted": return "Đã chốt lịch";
    case "rejected": return "Bị từ chối";
    case "cancelled": return "Đã hủy";
    case "completed": return "Hoàn tất";
    default: return status;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "pending": return "#eab308";
    case "accepted": return "#3b82f6";
    case "rejected":
    case "cancelled": return "#ef4444";
    case "completed": return "#22c55e";
    default: return "#6b7280";
  }
}

export default function BuyerAppointmentDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { appointmentId } = route.params;

  const { data: appt, isLoading } = useAppointmentDetails(appointmentId);
  const { mutate: cancelAppt, isPending: isCanceling } = useCancelAppointment();

  const handleCancel = () => {
    Alert.alert("Xác nhận", "Bạn có chắc muốn hủy lịch hẹn này?", [
      { text: "Bỏ qua", style: "cancel" },
      { 
        text: "Đồng ý hủy", 
        onPress: () => {
          cancelAppt(appointmentId, {
            onSuccess: () => navigation.goBack()
          });
        }, 
        style: "destructive" 
      },
    ]);
  };

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return "https://via.placeholder.com/400";
    if (imagePath.startsWith("http")) return imagePath;
    const baseUrl = process.env.EXPO_PUBLIC_API_URL?.split("/api")[0] || "http://192.168.1.4:3000";
    return `${baseUrl}/${imagePath.startsWith("/") ? imagePath.slice(1) : imagePath}`;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </SafeAreaView>
    );
  }

  if (!appt) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>Không tìm thấy lịch hẹn</Text>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backTxt}>Quay lại</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const prop = appt.property_id;
  const agent = appt.agent_id;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </Pressable>
        <Text style={styles.headerTitle}>Chi tiết lịch hẹn</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Status Area */}
        <View style={[styles.statusBox, { backgroundColor: getStatusColor(appt.status) + "15" }]}>
          <Ionicons 
            name={appt.status === "accepted" ? "checkmark-circle" : appt.status === "pending" ? "time" : "close-circle"} 
            size={24} 
            color={getStatusColor(appt.status)} 
          />
          <Text style={[styles.statusText, { color: getStatusColor(appt.status) }]}>
            Trạng thái: {getStatusText(appt.status)}
          </Text>
        </View>

        {/* Property Box */}
        <Text style={styles.sectionTitle}>Bất động sản</Text>
        <Pressable 
          style={styles.propCard}
          onPress={() => navigation.navigate("PropertyDetails", { propertyId: prop._id })}
        >
          <Image source={{ uri: getImageUrl(prop.images?.[0]) }} style={styles.propImage} />
          <View style={styles.propInfo}>
            <Text style={styles.propTitle} numberOfLines={2}>{prop.title?.vi || "Chưa cập nhật"}</Text>
            <Text style={styles.propPrice}>{prop.price?.toLocaleString()} VNĐ</Text>
            <Text style={styles.propAddress} numberOfLines={1}>{prop.address?.vi || ""}</Text>
          </View>
        </Pressable>

        {/* Time Slots */}
        {appt.status === "accepted" && appt.final_time ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thời gian đã chốt</Text>
            <View style={styles.timeCardFinal}>
              <Ionicons name="time" size={20} color="#3b82f6" />
              <Text style={styles.timeFinalTxt}>
                {new Date(appt.final_time).toLocaleString("vi-VN", { dateStyle: "full", timeStyle: "short" })}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Các thời gian mong muốn</Text>
            {appt.times?.map((t: any, idx: number) => (
              <View key={idx} style={styles.timeCard}>
                <View style={styles.timeRow}>
                  <Ionicons name="calendar-outline" size={18} color="#64748b" />
                  <Text style={styles.timeTxt}>
                    {new Date(t.time).toLocaleString("vi-VN", { dateStyle: "long", timeStyle: "short" })}
                  </Text>
                </View>
                {t.note && (
                  <Text style={styles.timeNote}>Ghi chú: {t.note}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Agent Info */}
        {agent && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin Agent</Text>
            <View style={styles.agentCard}>
              <Image 
                source={agent.avatar ? { uri: agent.avatar } : require("../../assets/default-avatar.png")} 
                style={styles.agentAvatar} 
              />
              <View style={styles.agentInfo}>
                <Text style={styles.agentName}>{agent.fullName}</Text>
                <Text style={styles.agentContact}>{agent.phone || agent.email}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Location if any */}
        {appt.location && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Địa điểm gặp mặt</Text>
            <View style={styles.locationCard}>
              <Ionicons name="location" size={20} color="#64748b" />
              <Text style={styles.locationTxt}>{appt.location}</Text>
            </View>
          </View>
        )}

      </ScrollView>

      {/* Footer Actions */}
      {appt.status === "pending" && (
        <View style={styles.footer}>
          <Pressable style={styles.actionBtnCancel} onPress={handleCancel} disabled={isCanceling}>
            {isCanceling ? <ActivityIndicator color="#ef4444" /> : <Text style={styles.actionTxtCancel}>Hủy Yêu Cầu</Text>}
          </Pressable>
        </View>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#1e293b" },
  iconBtn: { padding: 4 },
  content: { padding: 16 },
  statusBox: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 12, marginBottom: 20 },
  statusText: { marginLeft: 8, fontSize: 15, fontWeight: "700" },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#1e293b", marginBottom: 12 },
  propCard: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 12, padding: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, elevation: 1, marginBottom: 20 },
  propImage: { width: 80, height: 80, borderRadius: 8, backgroundColor: "#f1f5f9" },
  propInfo: { flex: 1, marginLeft: 12, justifyContent: "center" },
  propTitle: { fontSize: 15, fontWeight: "700", color: "#1e293b", marginBottom: 4 },
  propPrice: { fontSize: 14, fontWeight: "600", color: "#3b82f6", marginBottom: 4 },
  propAddress: { fontSize: 12, color: "#64748b" },
  timeCard: { backgroundColor: "#fff", padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: "#e2e8f0" },
  timeRow: { flexDirection: "row", alignItems: "center" },
  timeTxt: { marginLeft: 8, fontSize: 14, fontWeight: "500", color: "#1e293b" },
  timeNote: { marginTop: 8, fontSize: 13, color: "#64748b", fontStyle: "italic", paddingLeft: 26 },
  timeCardFinal: { flexDirection: "row", alignItems: "center", backgroundColor: "#eff6ff", padding: 16, borderRadius: 12, borderWidth: 1, borderColor: "#bfdbfe" },
  timeFinalTxt: { marginLeft: 12, fontSize: 15, fontWeight: "700", color: "#2563eb" },
  agentCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0" },
  agentAvatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  agentInfo: { flex: 1 },
  agentName: { fontSize: 15, fontWeight: "700", color: "#1e293b", marginBottom: 2 },
  agentContact: { fontSize: 13, color: "#64748b" },
  locationCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 16, borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0" },
  locationTxt: { marginLeft: 12, fontSize: 14, color: "#1e293b", flex: 1 },
  footer: { padding: 16, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#f1f5f9" },
  actionBtnCancel: { backgroundColor: "#fee2e2", paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  actionTxtCancel: { color: "#ef4444", fontSize: 16, fontWeight: "700" },
  errorText: { fontSize: 16, color: "#64748b", marginBottom: 16 },
  backBtn: { backgroundColor: "#3b82f6", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  backTxt: { color: "#fff", fontWeight: "600" }
});
