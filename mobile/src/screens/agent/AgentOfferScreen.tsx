import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";

import { useGetAgentOffers, useForwardOffer } from "../../hooks/useOffer";
import type { OfferStatus } from "../../types/offer";
import { OfferListForAgent } from "../../components/offer/OfferListForAgent";

type StatusFilter = OfferStatus | "all";

export default function AgentOfferScreen() {
  const queryClient = useQueryClient();
  // Agent cần xử lý các offer đang chờ forward trước.
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [refreshing, setRefreshing] = useState(false);

  const { data: offersData, isLoading, error } = useGetAgentOffers(
    {
      status: statusFilter !== "all" ? (statusFilter as OfferStatus) : undefined,
    },
    true,
  );

  const {
    mutateAsync: mutateForwardOffer,
    isPending: isForwarding,
  } = useForwardOffer();

  const offers = useMemo(() => {
    if (!offersData) return [];
    return Array.isArray(offersData) ? offersData : offersData.data || [];
  }, [offersData]);

  const handleForward = useCallback(
    async (offerId: string) => {
      try {
        await mutateForwardOffer(offerId);
        Alert.alert("Thành công", "Offer đã được forward cho seller.");
        queryClient.invalidateQueries({ queryKey: ["agentOffers"] });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Lỗi khi forward offer";
        Alert.alert("Lỗi", message);
      }
    },
    [mutateForwardOffer, queryClient],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await queryClient.refetchQueries({ queryKey: ["agentOffers"] });
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

  const statusOptions: { label: string; value: StatusFilter }[] = [
    { label: "Tất cả", value: "all" },
    { label: "Chờ xử lý", value: "pending" },
    { label: "Đã chuyển cho seller", value: "forwarded_to_seller" },
    { label: "Đã chấp nhận", value: "accepted" },
    { label: "Đã từ chối", value: "rejected" },
    { label: "Đã hủy", value: "cancelled" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý Offers</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContainer}
      >
        {statusOptions.map((option) => (
          <Pressable
            key={option.value}
            style={[
              styles.filterButton,
              statusFilter === option.value && styles.filterButtonActive,
            ]}
            onPress={() => setStatusFilter(option.value)}
          >
            <Text
              style={[
                styles.filterButtonText,
                statusFilter === option.value &&
                  styles.filterButtonTextActive,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
          <Text style={styles.errorText}>Không thể tải offers</Text>
          <Text style={styles.errorMessage}>
            {error instanceof Error ? error.message : "Có lỗi xảy ra, vui lòng thử lại"}
          </Text>
          <Pressable style={styles.retryButton} onPress={onRefresh}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </Pressable>
        </View>
      )}

      {!error && (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <OfferListForAgent
            offers={offers}
            onForward={handleForward}
            isLoading={isLoading && !refreshing}
          />

          {isForwarding && (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="small" color="#1976d2" />
              <Text style={styles.processingText}>Đang forward...</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "white",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
  },
  filterScroll: {
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    maxHeight: 50,
  },
  filterContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    alignItems: "center",
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  filterButtonActive: {
    backgroundColor: "#1976d2",
    borderColor: "#1976d2",
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6b7280",
  },
  filterButtonTextActive: {
    color: "white",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ef4444",
    marginTop: 12,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  processingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  processingText: {
    fontSize: 13,
    color: "#1976d2",
    fontWeight: "500",
  },
});

