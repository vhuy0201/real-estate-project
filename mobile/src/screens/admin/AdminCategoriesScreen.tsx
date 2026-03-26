import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  useTaxonomyList,
  useCreateTaxonomy,
  useUpdateTaxonomy,
  useDeleteTaxonomy,
} from "../../hooks/useAdminCategories";
import type { TaxonomyResource } from "../../services/adminCategoryService";

/* ── Tab config ── */
const TABS: { key: TaxonomyResource; label: string; nameKey: string }[] = [
  { key: "categories", label: "Danh mục", nameKey: "category_name" },
  { key: "types", label: "Loại BĐS", nameKey: "type_name" },
  { key: "features", label: "Tiện ích", nameKey: "feature_name" },
];

/* ── Main Screen ── */
export default function AdminCategoriesScreen() {
  const [activeTab, setActiveTab] = useState<TaxonomyResource>("categories");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [nameVi, setNameVi] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const tabConfig = useMemo(
    () => TABS.find((t) => t.key === activeTab)!,
    [activeTab]
  );

  /* ── Hooks ── */
  const { data, isLoading, refetch, isRefetching } = useTaxonomyList(activeTab);
  const createMutation = useCreateTaxonomy(activeTab);
  const updateMutation = useUpdateTaxonomy(activeTab);
  const deleteMutation = useDeleteTaxonomy(activeTab);

  const items = useMemo(() => {
    if (!data) return [];
    return Array.isArray(data) ? data : data.results ?? data.data ?? [];
  }, [data]);

  /* ── Modal helpers ── */
  const openAddModal = useCallback(() => {
    setEditingItem(null);
    setNameVi("");
    setModalVisible(true);
  }, []);

  const openEditModal = useCallback(
    (item: any) => {
      setEditingItem(item);
      const name = item[tabConfig.nameKey];
      setNameVi(typeof name === "object" ? name.vi ?? "" : name ?? "");
      setModalVisible(true);
    },
    [tabConfig.nameKey]
  );

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setEditingItem(null);
  }, []);

  /* ── Submit add/edit ── */
  const handleSubmit = useCallback(() => {
    const vi = nameVi.trim();
    if (!vi) {
      Alert.alert("Lỗi", "Tên tiếng Việt không được để trống.");
      return;
    }

    const body = { [tabConfig.nameKey]: vi };

    if (editingItem) {
      updateMutation.mutate(
        { id: editingItem._id, body },
        { onSuccess: closeModal }
      );
    } else {
      createMutation.mutate(body, { onSuccess: closeModal });
    }
  }, [nameVi, tabConfig.nameKey, editingItem, updateMutation, createMutation, closeModal]);

  /* ── Delete ── */
  const handleDelete = useCallback(
    (item: any) => {
      const name = item[tabConfig.nameKey];
      const displayName = typeof name === "object" ? name.vi : name;

      Alert.alert(
        "Xác nhận xóa",
        `Bạn có chắc chắn muốn xóa "${displayName}"?`,
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Xóa",
            style: "destructive",
            onPress: () => {
              setLoadingId(item._id);
              deleteMutation.mutate(item._id, {
                onSettled: () => setLoadingId(null),
              });
            },
          },
        ]
      );
    },
    [tabConfig.nameKey, deleteMutation]
  );

  /* ── Render item ── */
  const renderItem = useCallback(
    ({ item }: { item: any }) => {
      const name = item[tabConfig.nameKey];
      const displayVi = typeof name === "object" ? name.vi : name;
      const displayEn = typeof name === "object" ? name.en : "";
      const isItemLoading = loadingId === item._id;

      return (
        <View style={styles.itemRow}>
          <View style={styles.itemTextWrap}>
            <Text style={styles.itemName} numberOfLines={1}>
              {displayVi || "—"}
            </Text>
            {displayEn ? (
              <Text style={styles.itemSub} numberOfLines={1}>
                {displayEn}
              </Text>
            ) : null}
          </View>

          {isItemLoading ? (
            <ActivityIndicator size="small" color="#1e3a8a" style={styles.itemAction} />
          ) : (
            <View style={styles.itemActions}>
              <Pressable
                onPress={() => openEditModal(item)}
                style={styles.iconBtn}
                hitSlop={8}
              >
                <Ionicons name="create-outline" size={20} color="#3b82f6" />
              </Pressable>
              <Pressable
                onPress={() => handleDelete(item)}
                style={styles.iconBtn}
                hitSlop={8}
              >
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
              </Pressable>
            </View>
          )}
        </View>
      );
    },
    [tabConfig.nameKey, loadingId, openEditModal, handleDelete]
  );

  const keyExtractor = useCallback((item: any) => item._id ?? String(Math.random()), []);

  const isMutating = createMutation.isPending || updateMutation.isPending;

  /* ── UI ── */
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Quản lý Danh mục</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[styles.tab, active && styles.tabActive]}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* List */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1e3a8a" />
          <Text style={styles.muted}>Đang tải…</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={["#1e3a8a"]}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="folder-open-outline" size={48} color="#94a3b8" />
              <Text style={styles.emptyText}>Chưa có dữ liệu.</Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <Pressable style={styles.fab} onPress={openAddModal}>
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>

      {/* Add / Edit Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingItem ? "Chỉnh sửa" : "Thêm mới"}
            </Text>

            <Text style={styles.inputLabel}>Tên tiếng Việt *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập tên tiếng Việt…"
              value={nameVi}
              onChangeText={setNameVi}
              autoFocus
            />

            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelBtn}
                onPress={closeModal}
                disabled={isMutating}
              >
                <Text style={styles.cancelBtnText}>Hủy</Text>
              </Pressable>
              <Pressable
                style={[styles.submitBtn, isMutating && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={isMutating}
              >
                {isMutating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {editingItem ? "Cập nhật" : "Thêm"}
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

/* ── Styles ── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  muted: { marginTop: 8, color: "#64748b", fontSize: 14 },

  /* Header */
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  title: { fontSize: 24, fontWeight: "800", color: "#0f172a" },

  /* Tabs */
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
  },
  tabActive: { backgroundColor: "#1e3a8a" },
  tabText: { fontSize: 12, fontWeight: "600", color: "#475569" },
  tabTextActive: { color: "#fff" },

  /* List */
  listContent: { paddingHorizontal: 16, paddingBottom: 80 },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e2e8f0",
  },
  itemTextWrap: { flex: 1, marginRight: 8 },
  itemName: { fontSize: 15, fontWeight: "600", color: "#0f172a" },
  itemSub: { fontSize: 12, color: "#64748b", marginTop: 2 },
  itemActions: { flexDirection: "row", gap: 12 },
  itemAction: { marginRight: 4 },
  iconBtn: { padding: 4 },

  /* Empty */
  empty: { alignItems: "center", paddingVertical: 48 },
  emptyText: { marginTop: 8, color: "#64748b", fontSize: 15 },

  /* FAB */
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1e3a8a",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 36,
  },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#0f172a", marginBottom: 20 },
  inputLabel: { fontSize: 13, fontWeight: "600", color: "#475569", marginBottom: 6 },
  input: {
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#0f172a",
    marginBottom: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#cbd5e1",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
  },
  cancelBtnText: { fontSize: 15, fontWeight: "600", color: "#64748b" },
  submitBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#1e3a8a",
    alignItems: "center",
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { fontSize: 15, fontWeight: "600", color: "#fff" },
});
