import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Offer, OfferStatus } from "../../types/offer";
import { formatCurrency } from "../../utils/formatCurrency";

interface OfferListForAgentProps {
  offers: Offer[];
  onForward: (offerId: string) => Promise<void>;
  isLoading?: boolean;
}

export const OfferListForAgent: React.FC<OfferListForAgentProps> = ({
  offers,
  onForward,
  isLoading = false,
}) => {
  const [expandedOfferId, setExpandedOfferId] = useState<string | null>(null);
  const [processingOfferId, setProcessingOfferId] = useState<string | null>(
    null,
  );

  const canForwardOffer = useCallback(
    (status: OfferStatus) => status === "pending",
    [],
  );

  const getPropertyTitle = (offer: Offer) => {
    const property =
      typeof offer.property_id === "object" ? (offer.property_id as any) : null;
    if (!property) return "Property";

    const title = property.title;
    if (typeof title === "object") return title.vi || title.en || "Property";
    return title || "Property";
  };

  const getStatusColor = (status: OfferStatus): string => {
    switch (status) {
      case "pending":
        return "#f59e0b";
      case "forwarded_to_seller":
        return "#3b82f6";
      case "seller_reviewing":
        return "#a855f7";
      case "accepted":
        return "#10b981";
      case "rejected":
        return "#ef4444";
      case "cancelled":
        return "#9ca3af";
      default:
        return "#6b7280";
    }
  };

  const getStatusLabel = (status: OfferStatus): string => {
    switch (status) {
      case "pending":
        return "Chờ xử lý";
      case "forwarded_to_seller":
        return "Đã chuyển cho seller";
      case "seller_reviewing":
        return "Seller xem xét";
      case "accepted":
        return "Đã chấp nhận";
      case "rejected":
        return "Đã từ chối";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const handleForward = useCallback(
    async (offerId: string) => {
      Alert.alert(
        "Chuyển offer cho seller",
        "Offer này sẽ được agent chuyển tiếp để seller xem xét.",
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "CHUYỂN TIẾP",
            style: "default",
            onPress: async () => {
              try {
                setProcessingOfferId(offerId);
                await onForward(offerId);
              } catch (e: any) {
                Alert.alert("Lỗi", e?.message || "Không thể forward offer");
              } finally {
                setProcessingOfferId(null);
              }
            },
          },
        ],
      );
    },
    [onForward],
  );



  const offersGrouped = useMemo(() => offers ?? [], [offers]);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.loadingText}>Đang tải offers...</Text>
      </View>
    );
  }

  if (offersGrouped.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="handshake-outline" size={48} color="#9ca3af" />
        <Text style={styles.emptyText}>Không có offer phù hợp</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {offersGrouped.map((offer) => {
        const property =
          typeof offer.property_id === "object"
            ? (offer.property_id as any)
            : null;
        const buyer =
          typeof offer.buyer_id === "object" ? (offer.buyer_id as any) : null;

        const isExpanded = expandedOfferId === offer._id;
        const statusColor = getStatusColor(offer.status);
        const canForward = canForwardOffer(offer.status);

        return (
          <Pressable
            key={offer._id}
            style={[styles.offerCard, { borderLeftColor: statusColor }]}
            onPress={() => setExpandedOfferId(isExpanded ? null : offer._id)}
          >
            <View style={styles.offerHeader}>
              <View style={styles.offerHeaderLeft}>
                <Text style={styles.propertyTitle}>
                  {getPropertyTitle(offer)}
                </Text>
                <Text style={styles.priceText}>
                  {formatCurrency(offer.amount)} ₫
                </Text>
                {property?.price != null && (
                  <Text style={styles.listedPriceText}>
                    Giá niêm yết: {formatCurrency(property.price)} ₫
                  </Text>
                )}
              </View>

              <View style={styles.statusChip}>
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {getStatusLabel(offer.status)}
                </Text>
              </View>
            </View>

            {isExpanded && (
              <View style={styles.offerDetails}>
                {buyer && (
                  <View style={styles.infoSection}>
                    <View style={styles.infoHeader}>
                      <Ionicons
                        name="person-circle"
                        size={16}
                        color="#1976d2"
                      />
                      <Text style={styles.infoTitle}>Người mua</Text>
                    </View>
                    <Text style={styles.infoText}>{buyer.fullName}</Text>
                    <Text style={styles.infoText}>{buyer.email}</Text>
                    {buyer.phone && (
                      <Text style={styles.infoText}>{buyer.phone}</Text>
                    )}
                  </View>
                )}

                {property && (
                  <View style={styles.infoSection}>
                    <View style={styles.infoHeader}>
                      <Ionicons name="home-outline" size={16} color="#0ea5e9" />
                      <Text style={styles.infoTitle}>Bất động sản</Text>
                    </View>
                    <Text style={styles.infoText}>
                      {property?.title?.vi || property?.title?.en || "Property"}
                    </Text>
                  </View>
                )}

                <View style={styles.actionsContainer}>
                  {canForward && (
                    <Pressable
                      style={[styles.actionButton, styles.forwardButton]}
                      disabled={processingOfferId === offer._id}
                      onPress={() => handleForward(offer._id)}
                    >
                      {processingOfferId === offer._id ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <>
                          <Ionicons name="send" size={18} color="white" />
                          <Text style={styles.actionButtonText}>Chuyển tiếp</Text>
                        </>
                      )}
                    </Pressable>
                  )}

                </View>
              </View>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: "#f9fafb",
  },
  loadingText: {
    marginTop: 12,
    color: "#6b7280",
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: "#f9fafb",
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: "#9ca3af",
    fontWeight: "500",
  },
  offerCard: {
    backgroundColor: "white",
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 12,
    borderLeftWidth: 4,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  offerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 16,
  },
  offerHeaderLeft: {
    flex: 1,
    marginRight: 12,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  priceText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#10b981",
    marginBottom: 4,
  },
  listedPriceText: {
    fontSize: 12,
    color: "#666",
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#f3f4f6",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  offerDetails: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  infoSection: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
  },
  infoText: {
    fontSize: 13,
    color: "#1f2937",
    marginBottom: 3,
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  forwardButton: {
    backgroundColor: "#1976d2",
  },
  rejectButton: {
    backgroundColor: "#ef4444",
  },
  actionButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});
