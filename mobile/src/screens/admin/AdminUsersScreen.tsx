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
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAdminUsersPage, useUpdateUserStatus, ADMIN_USERS_PAGE_SIZE } from "../../hooks/useAdminUsers";
import type { AdminUserRow } from "../../types/adminUser";
import { Alert } from "react-native";

const ROLE_OPTIONS = [
  { key: "all" as const, label: "Tất cả" },
  { key: "buyer" as const, label: "Người mua" },
  { key: "seller" as const, label: "Chủ nhà" },
  { key: "agent" as const, label: "Môi giới" },
  { key: "admin" as const, label: "Quản trị" },
];

export default function AdminUsersScreen() {
  const [roleFilter, setRoleFilter] = useState<
    "all" | "buyer" | "seller" | "agent" | "admin"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter]);

  const {
    data,
    isLoading,
    isFetching,
    isPlaceholderData,
    refetch,
    error,
  } = useAdminUsersPage(roleFilter, currentPage);
  const updateStatusMutation = useUpdateUserStatus();

  const users = useMemo(() => data?.results ?? [], [data]);
  const filteredUsers = useMemo(() => {
    const kw = searchKeyword.trim().toLowerCase();
    if (!kw) return users;
    return users.filter((item) => {
      const idText = String(item.id || "").toLowerCase();
      return (
        (item.fullName || "").toLowerCase().includes(kw) ||
        (item.email || "").toLowerCase().includes(kw) ||
        idText.includes(kw)
      );
    });
  }, [users, searchKeyword]);
  const meta = data?.meta;
  const total = meta?.totalUsers;
  const totalPages = Math.max(1, meta?.totalPages ?? 1);
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  const renderItem = useCallback(
    ({ item }: { item: AdminUserRow }) => {
      return (
        <View style={styles.userRow}>
          <View style={styles.userInfoCol}>
            <Text style={styles.userName} numberOfLines={1}>
              {item.fullName || "N/A"}
            </Text>
            <Text style={styles.userEmail} numberOfLines={1}>
              {item.email || "-"}
            </Text>
          </View>
          <View style={styles.roleCol}>
            <Text style={[styles.rolePill, getRolePillStyle(item.role)]}>
              {(item.role || "").toUpperCase()}
            </Text>
            <Pressable
              style={[
                styles.lockBtn,
                item.isActive === false ? styles.unlockBtn : styles.lockDangerBtn,
              ]}
              onPress={() => {
                const currentActive = item.isActive !== false;
                const nextActive = !currentActive;
                Alert.alert(
                  nextActive ? "Mở khóa tài khoản" : "Khóa tài khoản",
                  `Bạn có chắc muốn ${nextActive ? "mở khóa" : "khóa"} tài khoản ${item.fullName || item.email}?`,
                  [
                    { text: "Hủy", style: "cancel" },
                    {
                      text: "Đồng ý",
                      style: nextActive ? "default" : "destructive",
                      onPress: () =>
                        updateStatusMutation.mutate({
                          id: item.id,
                          isActive: nextActive,
                        }),
                    },
                  ]
                );
              }}
              disabled={
                updateStatusMutation.isPending &&
                (updateStatusMutation.variables as { id?: string } | undefined)?.id === item.id
              }
            >
              {updateStatusMutation.isPending &&
              (updateStatusMutation.variables as { id?: string } | undefined)?.id === item.id ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.lockBtnText}>
                  {item.isActive === false ? "MỞ KHÓA" : "KHÓA"}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      );
    },
    [updateStatusMutation]
  );

  const keyExtractor = useCallback((item: AdminUserRow) => String(item.id), []);

  if (isLoading && !data) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <ActivityIndicator size="large" color="#1e3a8a" />
        <Text style={styles.muted}>Đang tải danh sách người dùng…</Text>
      </SafeAreaView>
    );
  }

  const errMsg = (error as Error)?.message ?? "";
  const isForbidden =
    (error as { response?: { status?: number } })?.response?.status === 403;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Ionicons name="menu" size={20} color="#1f3b8b" />
          <Text style={styles.title}>User Management</Text>
          <Ionicons name="search" size={18} color="#1f3b8b" />
        </View>
        <Text style={styles.subtitle}>
          {typeof total === "number"
            ? `Tổng ${total} tài khoản · ${ADMIN_USERS_PAGE_SIZE} mỗi trang`
            : "Lọc theo vai trò để xem chi tiết"}
        </Text>
      </View>

      <View style={styles.filterCard}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color="#94a3b8" />
          <TextInput
            value={searchKeyword}
            onChangeText={setSearchKeyword}
            placeholder="Search by name, email, or ID..."
            placeholderTextColor="#94a3b8"
            style={styles.searchInput}
          />
        </View>

        <Text style={styles.filterLabel}>FILTER BY ROLE:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
          style={styles.filterBar}
        >
          {ROLE_OPTIONS.map((opt) => {
            const active = roleFilter === opt.key;
            return (
              <Pressable
                key={opt.key}
                onPress={() => setRoleFilter(opt.key)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {opt.key === "all" ? "ALL" : opt.label.toUpperCase()}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

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
              ? "Chỉ tài khoản quản trị (admin) mới xem được danh sách này."
              : errMsg ||
                "Kiểm tra kết nối mạng và EXPO_PUBLIC_API_URL trong mobile/.env."}
          </Text>
          <Pressable style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryText}>Thử lại</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <FlatList
            style={styles.listFlex}
            data={filteredUsers}
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
                  <Ionicons name="people-outline" size={48} color="#94a3b8" />
                  <Text style={styles.emptyText}>Không có người dùng phù hợp.</Text>
                </View>
              ) : null
            }
            ListHeaderComponent={
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderLabel}>USER DETAILS</Text>
                <Text style={styles.tableHeaderLabel}>ROLE</Text>
              </View>
            }
          />
          <View style={styles.paginationBar}>
            <View style={styles.showingBlock}>
              <Text style={styles.showingLabel}>SHOWING</Text>
              <Text style={styles.showingValue}>
                {Math.min((currentPage - 1) * ADMIN_USERS_PAGE_SIZE + 1, total ?? 0)}-
                {Math.min(currentPage * ADMIN_USERS_PAGE_SIZE, total ?? 0)} OF {total ?? 0} USERS
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

function getRolePillStyle(role: string) {
  switch (role) {
    case "buyer":
      return { backgroundColor: "#e0e7ff", color: "#4f46e5" };
    case "agent":
      return { backgroundColor: "#ede9fe", color: "#6d28d9" };
    case "seller":
      return { backgroundColor: "#ffedd5", color: "#c2410c" };
    case "admin":
      return { backgroundColor: "#dbeafe", color: "#1d4ed8" };
    default:
      return { backgroundColor: "#e2e8f0", color: "#475569" };
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  muted: { marginTop: 8, color: "#64748b", fontSize: 14 },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  title: { flex: 1, textAlign: "center", fontSize: 22, fontWeight: "800", color: "#1f3b8b" },
  subtitle: { fontSize: 12, color: "#64748b", marginTop: 8, textAlign: "center" },
  filterCard: {
    marginHorizontal: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 12,
    marginBottom: 10,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: "#1e293b",
    fontSize: 14,
    fontWeight: "500",
    paddingVertical: 0,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: "#64748b",
    marginBottom: 8,
  },
  filterBar: { maxHeight: 40 },
  filterScroll: {
    paddingHorizontal: 0,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  chip: {
    minWidth: 58,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
  },
  chipActive: { backgroundColor: "#1e3a8a" },
  chipText: { fontSize: 11, fontWeight: "800", color: "#6b7280" },
  chipTextActive: { color: "#fff" },
  listFlex: { flex: 1 },
  listContent: { paddingHorizontal: 10, paddingBottom: 8, flexGrow: 1 },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 10,
  },
  tableHeaderLabel: {
    fontSize: 10,
    letterSpacing: 0.9,
    fontWeight: "800",
    color: "#9ca3af",
  },
  userRow: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userInfoCol: { flex: 1, paddingRight: 10 },
  userName: { fontSize: 16, fontWeight: "700", color: "#111827" },
  userEmail: { fontSize: 13, color: "#9ca3af", marginTop: 2 },
  roleCol: { alignItems: "flex-end" },
  rolePill: {
    fontSize: 10,
    fontWeight: "800",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: "hidden",
  },
  lockBtn: {
    marginTop: 8,
    minWidth: 68,
    height: 26,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  lockDangerBtn: {
    backgroundColor: "#b91c1c",
  },
  unlockBtn: {
    backgroundColor: "#0f766e",
  },
  lockBtnText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  paginationBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 14,
    backgroundColor: "#f1f5f9",
  },
  showingBlock: { marginRight: "auto" },
  showingLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: "#9ca3af",
  },
  showingValue: {
    marginTop: 2,
    fontSize: 11,
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
  pageBtnDisabled: { backgroundColor: "#f3f4f6" },
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
