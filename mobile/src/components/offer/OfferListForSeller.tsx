import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Modal,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Offer, OfferStatus } from "../../types/offer";
import { formatCurrency } from "../../utils/formatCurrency";

interface OfferListForSellerProps {
  offers: Offer[];
  onAccept: (offerId: string) => Promise<void>;
  onReject: (offerId: string, reason: string) => Promise<void>;
  isLoading?: boolean;
}

export const OfferListForSeller: React.FC<OfferListForSellerProps> = ({
  offers,
  onAccept,
  onReject,
  isLoading = false,
}) => {
  const [expandedOfferId, setExpandedOfferId] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleRejectClick = (offerId: string) => {
    setSelectedOfferId(offerId);
    setRejectionReason("");
    setRejectDialogOpen(true);
  };

  const handleAcceptClick = async (offerId: string) => {
    Alert.alert(
      "Xác nhận chấp nhận",
      "Bạn có chắc chắn muốn chấp nhận offer này? Hệ thống sẽ tự động tạo Deal.",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Chấp nhận",
          onPress: async () => {
            try {
              setProcessing(true);
              await onAccept(offerId);
            } finally {
              setProcessing(false);
            }
          },
        },
      ],
    );
  };

  const handleRejectConfirm = async () => {
    if (!rejectionReason.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập lý do từ chối");
      return;
    }

    if (!selectedOfferId) return;

    try {
      setProcessing(true);
      await onReject(selectedOfferId, rejectionReason);
      setRejectDialogOpen(false);
      setSelectedOfferId(null);
      setRejectionReason("");
    } finally {
      setProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.loadingText}>Đang tải offers...</Text>
      </View>
    );
  }

  if (offers.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="briefcase-outline" size={48} color="#9ca3af" />
        <Text style={styles.emptyText}>Không có offer nào</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {offers.map((offer) => {
          const property =
            typeof offer.property_id === "object" ? offer.property_id : null;
          const buyer =
            typeof offer.buyer_id === "object" ? offer.buyer_id : null;
          const agent =
            typeof offer.agent_id === "object" ? offer.agent_id : null;

          const propertyTitle =
            property && typeof property === "object"
              ? typeof property.title === "object"
                ? property.title.vi || property.title.en
                : property.title
              : "Property";

          const isExpanded = expandedOfferId === offer._id;
          const canAccept =
            offer.status === "forwarded_to_seller" ||
            offer.status === "seller_reviewing";
          const canReject =
            offer.status === "forwarded_to_seller" ||
            offer.status === "seller_reviewing";

          const statusColor = getStatusColor(offer.status);

          return (
            <Pressable
              key={offer._id}
              style={[styles.offerCard, { borderLeftColor: statusColor }]}
              onPress={() => setExpandedOfferId(isExpanded ? null : offer._id)}
            >
              <View style={styles.offerHeader}>
                <View style={styles.offerHeaderLeft}>
                  <Text style={styles.propertyTitle}>{propertyTitle}</Text>
                  <Text style={styles.priceText}>
                    {formatCurrency(offer.amount)} ₫
                  </Text>
                  {property && typeof property === "object" && (
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
                  {/* Buyer Info */}
                  {buyer && typeof buyer === "object" && (
                    <View style={styles.infoSection}>
                      <View style={styles.infoHeader}>
                        <Ionicons
                          name="person-circle"
                          size={16}
                          color="#1976d2"
                        />
                        <Text style={styles.infoTitle}>
                          Thông tin người mua
                        </Text>
                      </View>
                      <Text style={styles.infoText}>{buyer.fullName}</Text>
                      <Text style={styles.infoText}>{buyer.email}</Text>
                      {buyer.phone && (
                        <Text style={styles.infoText}>{buyer.phone}</Text>
                      )}
                    </View>
                  )}

                  {/* Agent Info */}
                  {agent && typeof agent === "object" && (
                    <View style={styles.infoSection}>
                      <View style={styles.infoHeader}>
                        <Ionicons
                          name="people-circle"
                          size={16}
                          color="#10b981"
                        />
                        <Text style={styles.infoTitle}>Agent</Text>
                      </View>
                      <Text style={styles.infoText}>{agent.fullName}</Text>
                      <Text style={styles.infoText}>{agent.email}</Text>
                      {agent.phone && (
                        <Text style={styles.infoText}>{agent.phone}</Text>
                      )}
                    </View>
                  )}

                  {/* Dates */}
                  <View style={styles.datesSection}>
                    <View style={styles.dateItem}>
                      <Ionicons name="calendar" size={14} color="#666" />
                      <View>
                        <Text style={styles.dateLabel}>Tạo ngày</Text>
                        <Text style={styles.dateValue}>
                          {new Date(offer.createdAt).toLocaleDateString(
                            "vi-VN",
                          )}
                        </Text>
                      </View>
                    </View>
                    {offer.expires_at && (
                      <View style={styles.dateItem}>
                        <Ionicons name="time" size={14} color="#666" />
                        <View>
                          <Text style={styles.dateLabel}>Hết hạn</Text>
                          <Text style={styles.dateValue}>
                            {new Date(offer.expires_at).toLocaleDateString(
                              "vi-VN",
                            )}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>

                  {/* Offer Note */}
                  {offer.note && (
                    <View style={styles.noteSection}>
                      <Text style={styles.noteLabel}>Ghi chú từ người mua</Text>
                      <Text style={styles.noteText}>{offer.note}</Text>
                    </View>
                  )}

                  {/* Rejection Reason */}
                  {offer.rejection_reason && (
                    <View style={styles.rejectionReasonSection}>
                      <Text style={styles.rejectionReasonLabel}>
                        Lý do từ chối
                      </Text>
                      <Text style={styles.rejectionReasonText}>
                        {offer.rejection_reason}
                      </Text>
                    </View>
                  )}

                  {/* Action Buttons */}
                  {(canAccept || canReject) && (
                    <View style={styles.actionsContainer}>
                      {canAccept && (
                        <Pressable
                          style={[
                            styles.actionButton,
                            styles.acceptButton,
                            processing && styles.buttonDisabled,
                          ]}
                          onPress={() => handleAcceptClick(offer._id)}
                          disabled={processing}
                        >
                          {processing ? (
                            <ActivityIndicator size="small" color="white" />
                          ) : (
                            <>
                              <Ionicons
                                name="checkmark-circle"
                                size={18}
                                color="white"
                              />
                              <Text style={styles.actionButtonText}>
                                Chấp nhận
                              </Text>
                            </>
                          )}
                        </Pressable>
                      )}

                      {canReject && (
                        <Pressable
                          style={[
                            styles.actionButton,
                            styles.rejectButton,
                            processing && styles.buttonDisabled,
                          ]}
                          onPress={() => handleRejectClick(offer._id)}
                          disabled={processing}
                        >
                          {processing ? (
                            <ActivityIndicator size="small" color="white" />
                          ) : (
                            <>
                              <Ionicons
                                name="close-circle"
                                size={18}
                                color="white"
                              />
                              <Text style={styles.actionButtonText}>
                                Từ chối
                              </Text>
                            </>
                          )}
                        </Pressable>
                      )}
                    </View>
                  )}
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Rejection Reason Modal */}
      <Modal
        visible={rejectDialogOpen}
        transparent
        animationType="fade"
        onRequestClose={() => !processing && setRejectDialogOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nhập lý do từ chối</Text>

            <TextInput
              style={styles.reasonInput}
              placeholder="Vui lòng nhập lý do từ chối..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              maxLength={500}
              value={rejectionReason}
              onChangeText={setRejectionReason}
              editable={!processing}
            />

            <Text style={styles.charCount}>
              {rejectionReason.length}/500 ký tự
            </Text>

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setRejectDialogOpen(false)}
                disabled={processing}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </Pressable>

              <Pressable
                style={[
                  styles.modalButton,
                  styles.confirmButton,
                  processing && styles.buttonDisabled,
                ]}
                onPress={handleRejectConfirm}
                disabled={processing}
              >
                {processing ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.confirmButtonText}>Xác nhận</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

function getStatusColor(status: OfferStatus): string {
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
}

function getStatusLabel(status: OfferStatus): string {
  const labels: Record<OfferStatus, string> = {
    pending: "Chờ xử lý",
    forwarded_to_seller: "Chuyển cho seller",
    seller_reviewing: "Seller xem xét",
    accepted: "Đã chấp nhận",
    rejected: "Đã từ chối",
    cancelled: "Đã hủy",
  };
  return labels[status] || status;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  datesSection: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  dateItem: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
  },
  dateLabel: {
    fontSize: 11,
    color: "#6b7280",
  },
  dateValue: {
    fontSize: 13,
    fontWeight: "500",
    color: "#1f2937",
    marginTop: 2,
  },
  noteSection: {
    backgroundColor: "#fffbeb",
    borderLeftWidth: 3,
    borderLeftColor: "#f59e0b",
    paddingLeft: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  noteLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#f59e0b",
    marginBottom: 4,
  },
  noteText: {
    fontSize: 13,
    color: "#92400e",
    lineHeight: 18,
  },
  rejectionReasonSection: {
    backgroundColor: "#fee2e2",
    borderLeftWidth: 3,
    borderLeftColor: "#ef4444",
    paddingLeft: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  rejectionReasonLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ef4444",
    marginBottom: 4,
  },
  rejectionReasonText: {
    fontSize: 13,
    color: "#991b1b",
    lineHeight: 18,
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
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
  acceptButton: {
    backgroundColor: "#10b981",
  },
  rejectButton: {
    backgroundColor: "#ef4444",
  },
  actionButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 32,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 12,
  },
  reasonInput: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1f2937",
    textAlignVertical: "top",
    marginBottom: 8,
  },
  charCount: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
  },
  cancelButtonText: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "600",
  },
  confirmButton: {
    backgroundColor: "#ef4444",
  },
  confirmButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});
