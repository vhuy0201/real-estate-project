import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../types/navigation";
import { useCreateAppointment } from "../../hooks/useAppointments";

type BookRouteProp = RouteProp<RootStackParamList, "BookAppointment">;

interface TimeSlot {
  time: Date | null;
  note: string;
}

const MAX_SLOTS = 3;

export default function BookAppointmentScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<BookRouteProp>();
  const { propertyId } = route.params;

  const createMutation = useCreateAppointment();

  /* ── State ── */
  const [slots, setSlots] = useState<TimeSlot[]>([{ time: null, note: "" }]);
  const [location, setLocation] = useState("");

  /* ── Custom JS DatePicker State ── */
  const [pickerVisible, setPickerVisible] = useState(false);
  const [activeSlotIndex, setActiveSlotIndex] = useState(0);
  
  // Tạm lưu giá trị nhập bằng tay
  const currentNow = new Date();
  const [day, setDay] = useState(currentNow.getDate().toString());
  const [month, setMonth] = useState((currentNow.getMonth() + 1).toString());
  const [year, setYear] = useState(currentNow.getFullYear().toString());
  const [hour, setHour] = useState(currentNow.getHours().toString().padStart(2, "0"));
  const [minute, setMinute] = useState(currentNow.getMinutes().toString().padStart(2, "0"));

  /* ── Slot management ── */
  const addSlot = useCallback(() => {
    if (slots.length >= MAX_SLOTS) return;
    setSlots((prev) => [...prev, { time: null, note: "" }]);
  }, [slots.length]);

  const removeSlot = useCallback(
    (index: number) => {
      if (slots.length <= 1) return;
      setSlots((prev) => prev.filter((_, i) => i !== index));
    },
    [slots.length]
  );

  const updateNote = useCallback((index: number, text: string) => {
    setSlots((prev) =>
      prev.map((s, i) => (i === index ? { ...s, note: text } : s))
    );
  }, []);

  /* ── Date/Time picker ── */
  const openDatePicker = useCallback((index: number) => {
    setActiveSlotIndex(index);
    const existingTime = slots[index].time || new Date();
    setDay(existingTime.getDate().toString().padStart(2, "0"));
    setMonth((existingTime.getMonth() + 1).toString().padStart(2, "0"));
    setYear(existingTime.getFullYear().toString());
    setHour(existingTime.getHours().toString().padStart(2, "0"));
    setMinute(existingTime.getMinutes().toString().padStart(2, "0"));
    setPickerVisible(true);
  }, [slots]);

  const handleConfirmPicker = useCallback(() => {
    const d = parseInt(day, 10);
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    const h = parseInt(hour, 10);
    const min = parseInt(minute, 10);

    if (
      isNaN(d) || isNaN(m) || isNaN(y) || isNaN(h) || isNaN(min) ||
      d < 1 || d > 31 || m < 1 || m > 12 || y < 2024 ||
      h < 0 || h > 23 || min < 0 || min > 59
    ) {
      Alert.alert("Lỗi", "Vui lòng nhập ngày giờ hợp lệ.");
      return;
    }

    const finalDate = new Date(y, m - 1, d, h, min, 0, 0);
    
    setSlots((prev) =>
      prev.map((s, i) =>
        i === activeSlotIndex ? { ...s, time: finalDate } : s
      )
    );
    setPickerVisible(false);
  }, [day, month, year, hour, minute, activeSlotIndex]);

  /* ── Validation & Submit ── */
  const handleSubmit = useCallback(() => {
    const filledSlots = slots.filter((s) => s.time !== null);
    if (filledSlots.length === 0) {
      Alert.alert("Lỗi", "Vui lòng chọn ít nhất 1 khung giờ.");
      return;
    }

    if (filledSlots.length > MAX_SLOTS) {
      Alert.alert("Lỗi", `Chỉ được chọn tối đa ${MAX_SLOTS} khung giờ.`);
      return;
    }

    const now = new Date();
    for (const slot of filledSlots) {
      if (slot.time! <= now) {
        Alert.alert("Lỗi", "Thời gian lịch hẹn phải ở tương lai.");
        return;
      }
    }

    const timeSet = new Set<number>();
    for (const slot of filledSlots) {
      const val = slot.time!.getTime();
      if (timeSet.has(val)) {
        Alert.alert("Lỗi", "Khung giờ bị trùng. Vui lòng chọn thời gian khác nhau.");
        return;
      }
      timeSet.add(val);
    }

    const times = filledSlots.map((s) => ({
      time: s.time!.toISOString(),
      ...(s.note.trim() ? { note: s.note.trim() } : {}),
    }));

    const body: any = { propertyId, times };
    if (location.trim()) body.location = location.trim();

    createMutation.mutate(body, {
      onSuccess: () => navigation.goBack(),
    });
  }, [slots, location, propertyId, createMutation, navigation]);

  const isLoading = createMutation.isPending;

  /* ── Format helper ── */
  const formatDateTime = (date: Date | null) => {
    if (!date) return "Chọn ngày & giờ…";
    const d = date.getDate().toString().padStart(2, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const y = date.getFullYear();
    const h = date.getHours().toString().padStart(2, "0");
    const min = date.getMinutes().toString().padStart(2, "0");
    return `${h}:${min} - ${d}/${m}/${y}`;
  };

  /* ── Render ── */
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1e293b" />
        </Pressable>
        <Text style={styles.headerTitle}>Đặt lịch xem nhà</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={20} color="#0ea5e9" />
          <Text style={styles.infoText}>
            Chọn tối đa 3 khung giờ. Agent sẽ xác nhận 1 trong các khung giờ bạn đề xuất.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Khung giờ đề xuất *</Text>
        {slots.map((slot, index) => (
          <View key={index} style={styles.slotCard}>
            <View style={styles.slotHeader}>
              <Text style={styles.slotTitle}>Khung giờ {index + 1}</Text>
              {slots.length > 1 && (
                <Pressable onPress={() => removeSlot(index)} hitSlop={8}>
                  <Ionicons name="close-circle" size={22} color="#ef4444" />
                </Pressable>
              )}
            </View>

            <Pressable
              style={styles.datePickerBtn}
              onPress={() => openDatePicker(index)}
            >
              <Ionicons name="calendar-outline" size={18} color="#0ea5e9" />
              <Text style={[styles.datePickerText, !slot.time && styles.datePickerPlaceholder]}>
                {formatDateTime(slot.time)}
              </Text>
            </Pressable>

            <TextInput
              style={styles.noteInput}
              placeholder="Ghi chú (tuỳ chọn)…"
              placeholderTextColor="#94a3b8"
              value={slot.note}
              onChangeText={(text) => updateNote(index, text)}
            />
          </View>
        ))}

        {slots.length < MAX_SLOTS && (
          <Pressable style={styles.addSlotBtn} onPress={addSlot}>
            <Ionicons name="add-circle-outline" size={20} color="#0ea5e9" />
            <Text style={styles.addSlotText}>Thêm khung giờ</Text>
          </Pressable>
        )}

        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Địa điểm hẹn (tuỳ chọn)</Text>
        <TextInput
          style={styles.locationInput}
          placeholder="Nhập địa điểm cụ thể…"
          placeholderTextColor="#94a3b8"
          value={location}
          onChangeText={setLocation}
        />

        <Pressable
          style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="send" size={18} color="#fff" />
              <Text style={styles.submitBtnText}>Gửi yêu cầu đặt lịch</Text>
            </>
          )}
        </Pressable>
      </ScrollView>

      {/* Pure JS Date Picker Modal */}
      <Modal visible={pickerVisible} transparent animationType="fade">
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"} 
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nhập thời gian</Text>
            
            <Text style={styles.modalSubTitle}>Ngày / Tháng / Năm</Text>
            <View style={styles.row}>
              <TextInput style={styles.timeInput} value={day} onChangeText={setDay} keyboardType="number-pad" maxLength={2} placeholder="DD" />
              <Text style={styles.slash}>/</Text>
              <TextInput style={styles.timeInput} value={month} onChangeText={setMonth} keyboardType="number-pad" maxLength={2} placeholder="MM" />
              <Text style={styles.slash}>/</Text>
              <TextInput style={[styles.timeInput, { flex: 1.5 }]} value={year} onChangeText={setYear} keyboardType="number-pad" maxLength={4} placeholder="YYYY" />
            </View>

            <Text style={[styles.modalSubTitle, { marginTop: 16 }]}>Giờ : Phút (24h)</Text>
            <View style={styles.row}>
              <TextInput style={styles.timeInput} value={hour} onChangeText={setHour} keyboardType="number-pad" maxLength={2} placeholder="HH" />
              <Text style={styles.slash}>:</Text>
              <TextInput style={styles.timeInput} value={minute} onChangeText={setMinute} keyboardType="number-pad" maxLength={2} placeholder="MM" />
            </View>

            <View style={styles.modalActions}>
              <Pressable style={styles.cancelBtn} onPress={() => setPickerVisible(false)}>
                <Text style={styles.cancelBtnText}>Hủy</Text>
              </Pressable>
              <Pressable style={styles.confirmBtn} onPress={handleConfirmPicker}>
                <Text style={styles.confirmBtnText}>Xong</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}

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
  body: { flex: 1 },
  bodyContent: { padding: 20, paddingBottom: 40 },

  infoBanner: {
    flexDirection: "row",
    backgroundColor: "#e0f2fe",
    padding: 14,
    borderRadius: 12,
    gap: 10,
    marginBottom: 24,
    alignItems: "flex-start",
  },
  infoText: { flex: 1, fontSize: 13, color: "#0369a1", lineHeight: 20 },

  sectionLabel: { fontSize: 14, fontWeight: "700", color: "#1e293b", marginBottom: 12 },

  slotCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e2e8f0",
  },
  slotHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  slotTitle: { fontSize: 14, fontWeight: "600", color: "#475569" },

  datePickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 10,
    gap: 10,
    marginBottom: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#cbd5e1",
  },
  datePickerText: { fontSize: 14, color: "#0f172a", fontWeight: "500" },
  datePickerPlaceholder: { color: "#94a3b8", fontWeight: "400" },

  noteInput: {
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: "#0f172a",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e2e8f0",
  },

  addSlotBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#0ea5e9",
    borderStyle: "dashed",
  },
  addSlotText: { fontSize: 14, fontWeight: "600", color: "#0ea5e9" },

  locationInput: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: "#0f172a",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e2e8f0",
  },

  submitBtn: {
    flexDirection: "row",
    backgroundColor: "#0ea5e9",
    paddingVertical: 16,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginTop: 32,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },

  /* JS Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#0f172a", marginBottom: 16 },
  modalSubTitle: { fontSize: 14, fontWeight: "600", color: "#64748b", marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  timeInput: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    color: "#0f172a",
    borderWidth: 1,
    borderColor: "#e2e8f0"
  },
  slash: { fontSize: 18, color: "#94a3b8", fontWeight: "bold" },
  modalActions: { flexDirection: "row", gap: 12, marginTop: 24 },
  cancelBtn: { flex: 1, backgroundColor: "#f1f5f9", paddingVertical: 14, borderRadius: 10, alignItems: "center" },
  cancelBtnText: { fontSize: 15, fontWeight: "600", color: "#64748b" },
  confirmBtn: { flex: 1, backgroundColor: "#0ea5e9", paddingVertical: 14, borderRadius: 10, alignItems: "center" },
  confirmBtnText: { fontSize: 15, fontWeight: "700", color: "#fff" },
});
