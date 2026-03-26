import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ScrollView,
  Pressable,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetSellerOffers,
  useAcceptOffer,
  useRejectOffer,
} from "../../hooks/useOffer";
import { OfferListForSeller } from "../../components/offer/OfferListForSeller";
import { OfferStatus } from "../../types/offer";

type StatusFilter = OfferStatus | "all";

export const HandleOfferScreen: React.FC = () => {
  const queryClient = useQueryClient();
  // Seller chỉ quản lý các offer đã được agent forward
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    "forwarded_to_seller",
  );
  const [refreshing, setRefreshing] = useState(false);

  // Fetch seller offers
  const {
    data: offersData,
    isLoading,
    error,
  } = useGetSellerOffers(
    {
      status:
        statusFilter !== "all" ? (statusFilter as OfferStatus) : undefined,
    },
    true,
  );

  const { mutateAsync: mutateAcceptOffer, isPending: isAccepting } =
    useAcceptOffer();
  const { mutateAsync: mutateRejectOffer, isPending: isRejecting } =
    useRejectOffer();

  const offers = useMemo(() => {
    if (!offersData) return [];
    return Array.isArray(offersData) ? offersData : offersData.data || [];
  }, [offersData]);

  const handleAccept = useCallback(
    async (offerId: string) => {
      try {
        await mutateAcceptOffer(offerId);
        Alert.alert(
          "Thành công",
          "Offer đã được chấp nhận. Deal được tạo tự động.",
        );
        queryClient.invalidateQueries({ queryKey: ["sellerOffers"] });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Lỗi khi chấp nhận offer";
        Alert.alert("Lỗi", message);
      }
    },
    [mutateAcceptOffer, queryClient],
  );

  const handleReject = useCallback(
    async (offerId: string, reason: string) => {
      try {
        await mutateRejectOffer({ offerId, reason });
        Alert.alert("Thành công", "Offer đã được từ chối.");
        queryClient.invalidateQueries({ queryKey: ["sellerOffers"] });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Lỗi khi từ chối offer";
        Alert.alert("Lỗi", message);
      }
    },
    [mutateRejectOffer, queryClient],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await queryClient.refetchQueries({ queryKey: ["sellerOffers"] });
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

  const statusOptions: { label: string; value: StatusFilter }[] = [
    { label: "Tất cả", value: "all" },
    { label: "Chờ xử lý", value: "pending" },
    { label: "Chuyển cho seller", value: "forwarded_to_seller" },
    { label: "Đã chấp nhận", value: "accepted" },
    { label: "Đã từ chối", value: "rejected" },
    { label: "Đã hủy", value: "cancelled" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý Offers</Text>
      </View>

      {/* Status Filter */}
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
                statusFilter === option.value && styles.filterButtonTextActive,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Error State */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
          <Text style={styles.errorText}>Không thể tải offers</Text>
          <Text style={styles.errorMessage}>
            {error instanceof Error
              ? error.message
              : "Có lỗi xảy ra, vui lòng thử lại"}
          </Text>
          <Pressable style={styles.retryButton} onPress={onRefresh}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </Pressable>
        </View>
      )}

      {/* Offers List */}
      {!error && (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <OfferListForSeller
            offers={offers}
            onAccept={handleAccept}
            onReject={handleReject}
            isLoading={isLoading && !refreshing}
          />

          {/* Loading More */}
          {(isAccepting || isRejecting) && (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="small" color="#1976d2" />
              <Text style={styles.processingText}>Đang xử lý...</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

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

export default HandleOfferScreen;
