import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import {
  useAdminPropertiesPage,
  ADMIN_PROPERTIES_PAGE_SIZE,
  useAdminPropertyStatusMutation,
  useAdminHidePropertyMutation,
  useAdminRestorePropertyMutation,
} from "../../hooks/useAdminProperties";
import { AdminPropertyModerationItem } from "../../components/admin/AdminPropertyModerationItem";
import type { AdminPropertyListRow, AdminPropertyStatusFilter } from "../../types/adminProperty";
import type { AdminTabParamList, RootStackParamList } from "../../types/navigation";

const STATUS_OPTIONS: { key: AdminPropertyStatusFilter; label: string }[] = [
  { key: "pending", label: "PENDING" },
  { key: "all", label: "ALL" },
  { key: "approved", label: "APPROVED" },
  { key: "rejected", label: "REJECTED" },
];

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<AdminTabParamList, "AdminPropertyModeration">,
  NativeStackNavigationProp<RootStackParamList>
>;

export default function AdminPropertyModerationScreen() {
  const navigation = useNavigation<Nav>();
  const [statusFilter, setStatusFilter] =
    useState<AdminPropertyStatusFilter>("pending");
  const [currentPage, setCurrentPage] = useState(1);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const {
    data,
    isLoading,
    isFetching,
    isPlaceholderData,
    refetch,
    error,
  } = useAdminPropertiesPage(statusFilter, currentPage);

  const statusMutation = useAdminPropertyStatusMutation();
  const hideMutation = useAdminHidePropertyMutation();
  const restoreMutation = useAdminRestorePropertyMutation();

  const busyId =
    (statusMutation.isPending && statusMutation.variables
      ? statusMutation.variables.propertyId
      : null) ||
    (hideMutation.isPending && hideMutation.variables
      ? hideMutation.variables.propertyId
      : null) ||
    (restoreMutation.isPending && restoreMutation.variables
      ? restoreMutation.variables
      : null);

  const rows = useMemo(() => data?.data ?? [], [data]);
  const filteredRows = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((p) => {
      const title =
        p.title?.vi?.toLowerCase() || p.title?.en?.toLowerCase() || "";
      const address =
        p.address?.vi?.toLowerCase() || p.address?.en?.toLowerCase() || "";
      const owner =
        typeof p.owner_id === "object" && p.owner_id
          ? (p.owner_id.fullName || p.owner_id.email || "").toLowerCase()
          : "";
      return title.includes(q) || address.includes(q) || owner.includes(q);
    });
  }, [rows, keyword]);

  const pagination = data?.pagination;
  const total = pagination?.total;
  const totalPages = Math.max(1, pagination?.totalPages ?? 1);
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  const keyExtractor = useCallback(
    (item: AdminPropertyListRow) => String(item._id),
    []
  );

  const openDetail = useCallback(
    (item: AdminPropertyListRow) => {
      navigation.navigate("PropertyDetails", {
        propertyId: String(item._id),
      });
    },
    [navigation]
  );

  const confirmReject = useCallback(
    (item: AdminPropertyListRow) => {
      const id = String(item._id);
      Alert.alert(
        "Từ chối bài đăng",
        "Người đăng sẽ nhận thông báo. Tiếp tục?",
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Từ chối",
            style: "destructive",
            onPress: () =>
              statusMutation.mutate({ propertyId: id, status: "rejected" }),
          },
        ]
      );
    },
    [statusMutation]
  );

  const confirmHide = useCallback(
    (item: AdminPropertyListRow) => {
      const id = String(item._id);
      Alert.alert(
        "Ẩn bài đăng vi phạm",
        "Bài đăng này sẽ bị ẩn khỏi hệ thống và người đăng sẽ nhận được thông báo. Bạn có chắc chắn?",
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Ẩn",
            style: "destructive",
            onPress: () => hideMutation.mutate({ propertyId: id, note: "Vi phạm chính sách hệ thống" }),
          },
        ]
      );
    },
    [hideMutation]
  );

  const confirmRestore = useCallback(
    (item: AdminPropertyListRow) => {
      const id = String(item._id);
      Alert.alert(
        "Khôi phục bài đăng",
        "Bạn có chắc chắn muốn khôi phục bài đăng này không?",
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Khôi phục",
            onPress: () => restoreMutation.mutate(id),
          },
        ]
      );
    },
    [restoreMutation]
  );

  const renderItem = useCallback(
    ({ item }: { item: AdminPropertyListRow }) => (
      <AdminPropertyModerationItem
        item={item}
        busy={busyId === String(item._id)}
        onApprove={() =>
          statusMutation.mutate({
            propertyId: String(item._id),
            status: "approved",
          })
        }
        onReject={() => confirmReject(item)}
        onHide={() => confirmHide(item)}
        onRestore={() => confirmRestore(item)}
        onOpenDetail={() => openDetail(item)}
      />
    ),
    [busyId, statusMutation, confirmReject, confirmHide, confirmRestore, openDetail]
  );

  if (isLoading && !data) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <ActivityIndicator size="large" color="#1e3a8a" />
        <Text style={styles.muted}>Đang tải danh sách bài đăng…</Text>
      </SafeAreaView>
    );
  }

  const errMsg = (error as Error)?.message ?? "";
  const isForbidden =
    (error as { response?: { status?: number } })?.response?.status === 403;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Ionicons name="menu" size={16} color="#64748b" />
          <Text style={styles.brandText}>MODERATION LAB</Text>
          <Ionicons name="shield-checkmark" size={16} color="#1f2937" />
        </View>
        <Text style={styles.title}>Property Moderation</Text>

        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#94a3b8" />
          <TextInput
            value={keyword}
            onChangeText={setKeyword}
            placeholder="Search properties..."
            placeholderTextColor="#94a3b8"
            style={styles.searchInput}
            autoCapitalize="none"
          />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
        style={styles.filterBar}
      >
        {STATUS_OPTIONS.map((opt) => {
          const active = statusFilter === opt.key;
          return (
            <Pressable
              key={opt.key}
              onPress={() => setStatusFilter(opt.key)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {error ? (
        <View style={styles.errorBox}>
          <Ionicons name="warning-outline" size={40} color="#b45309" />
          <Text style={styles.errorTitle}>
            {isForbidden
              ? "Không có quyền truy cập"
              : "Không tải được dữ liệu"}
          </Text>
          <Text style={styles.errorText}>
            {isForbidden
              ? "Chỉ tài khoản quản trị mới dùng được màn hình này."
              : errMsg ||
                "Kiểm tra kết nối và EXPO_PUBLIC_API_URL trong mobile/.env."}
          </Text>
          <Pressable style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryText}>Thử lại</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <FlatList
            style={styles.listFlex}
            data={filteredRows}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={isFetching && !isLoading && !isPlaceholderData}
                onRefresh={refetch}
                colors={["#1e3a8a"]}
              />
            }
            ListEmptyComponent={
              !isFetching ? (
                <View style={styles.empty}>
                  <Ionicons name="folder-open-outline" size={48} color="#94a3b8" />
                  <Text style={styles.emptyText}>
                    {keyword.trim()
                      ? "No matches for your search."
                      : statusFilter === "pending"
                        ? "Không có bài nào chờ duyệt."
                        : "Không có bài đăng phù hợp bộ lọc."}
                  </Text>
                </View>
              ) : null
            }
          />
          <View style={styles.paginationBar}>
            <View style={styles.showingBlock}>
              <Text style={styles.showingLabel}>SHOWING</Text>
              <Text style={styles.showingValue}>
                {Math.min((currentPage - 1) * ADMIN_PROPERTIES_PAGE_SIZE + 1, total ?? 0)}-
                {Math.min(currentPage * ADMIN_PROPERTIES_PAGE_SIZE, total ?? 0)} OF {total ?? 0}
              </Text>
            </View>
            <Pressable
              onPress={() => canPrev && setCurrentPage((p) => p - 1)}
              style={[styles.pageBtn, !canPrev && styles.pageBtnDisabled]}
              disabled={!canPrev || isFetching}
            >
              <Ionicons name="chevron-back" size={18} color={canPrev ? "#334155" : "#94a3b8"} />
            </Pressable>
            <View style={styles.pageNumbersWrap}>
              {buildVisiblePages(currentPage, totalPages).map((p) => (
                <Pressable
                  key={p}
                  onPress={() => setCurrentPage(p)}
                  style={[styles.pageNumberBtn, p === currentPage && styles.pageNumberBtnActive]}
                  disabled={isFetching}
                >
                  <Text
                    style={[
                      styles.pageNumberText,
                      p === currentPage && styles.pageNumberTextActive,
                    ]}
                  >
                    {p}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Pressable
              onPress={() => canNext && setCurrentPage((p) => p + 1)}
              style={[styles.pageBtn, !canNext && styles.pageBtnDisabled]}
              disabled={!canNext || isFetching}
            >
              <Ionicons name="chevron-forward" size={18} color={canNext ? "#334155" : "#94a3b8"} />
            </Pressable>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

function buildVisiblePages(current: number, total: number): number[] {
  if (total <= 3) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 2) return [1, 2, 3];
  if (current >= total - 1) return [total - 2, total - 1, total];
  return [current - 1, current, current + 1];
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  muted: { marginTop: 8, color: "#64748b", fontSize: 14 },
  header: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    marginBottom: 8,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandText: {
    fontSize: 10,
    color: "#64748b",
    fontWeight: "800",
    letterSpacing: 1.1,
  },
  title: { marginTop: 8, fontSize: 30, fontWeight: "900", color: "#1e3a8a", letterSpacing: -0.5 },
  searchBar: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
    color: "#0f172a",
  },
  filterBar: { maxHeight: 40, marginBottom: 8 },
  filterScroll: {
    paddingHorizontal: 14,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: "#e5e7eb",
  },
  chipActive: { backgroundColor: "#1e3a8a" },
  chipText: { fontSize: 11, fontWeight: "800", color: "#475569" },
  chipTextActive: { color: "#fff" },
  listFlex: { flex: 1 },
  listContent: { paddingHorizontal: 14, paddingBottom: 6, flexGrow: 1 },
  paginationBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: 6,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: "#f3f4f6",
  },
  showingBlock: { marginRight: "auto" },
  showingLabel: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.9,
    color: "#9ca3af",
  },
  showingValue: {
    marginTop: 2,
    fontSize: 10,
    color: "#6b7280",
    fontWeight: "700",
  },
  pageBtn: {
    alignItems: "center",
    justifyContent: "center",
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#e5e7eb",
  },
  pageBtnDisabled: { backgroundColor: "#f1f5f9" },
  pageNumbersWrap: { flexDirection: "row", gap: 6, alignItems: "center" },
  pageNumberBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e5e7eb",
  },
  pageNumberBtnActive: {
    backgroundColor: "#1e3a8a",
  },
  pageNumberText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
  },
  pageNumberTextActive: {
    color: "#fff",
  },
  empty: { alignItems: "center", paddingVertical: 48 },
  emptyText: { marginTop: 8, color: "#64748b", fontSize: 15 },
  errorBox: {
    margin: 20,
    padding: 24,
    alignItems: "center",
    backgroundColor: "#fffbeb",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  errorTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "700",
    color: "#92400e",
  },
  errorText: {
    marginTop: 8,
    textAlign: "center",
    color: "#78350f",
    fontSize: 14,
    lineHeight: 20,
  },
  retryBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#1e3a8a",
    borderRadius: 8,
  },
  retryText: { color: "#fff", fontWeight: "600" },
});
