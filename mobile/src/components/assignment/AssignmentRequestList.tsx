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
import { Assignment } from "../../services/assignmentService";
import { formatCurrency } from "../../utils/formatCurrency";

interface AssignmentRequestListProps {
  assignments: Assignment[];
  onAccept: (assignmentId: string) => Promise<void>;
  onReject: (assignmentId: string, reason: string) => Promise<void>;
  isLoading?: boolean;
}

export const AssignmentRequestList: React.FC<AssignmentRequestListProps> = ({
  assignments,
  onAccept,
  onReject,
  isLoading = false,
}) => {
  const [expandedAssignmentId, setExpandedAssignmentId] = useState<
    string | null
  >(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<
    string | null
  >(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleRejectClick = (assignmentId: string) => {
    setSelectedAssignmentId(assignmentId);
    setRejectionReason("");
    setRejectDialogOpen(true);
  };

  const handleAcceptClick = async (assignmentId: string) => {
    Alert.alert(
      "Xác nhận chấp nhận",
      "Bạn có chắc chắn muốn chấp nhận yêu cầu này? Agent sẽ được phép quản lý property.",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Chấp nhận",
          onPress: async () => {
            try {
              setProcessing(true);
              await onAccept(assignmentId);
            } finally {
              setProcessing(false);
            }
          },
        },
      ],
    );
  };

  const handleRejectConfirm = async () => {
    if (selectedAssignmentId) {
      try {
        setProcessing(true);
        await onReject(selectedAssignmentId, rejectionReason);
        setRejectDialogOpen(false);
        setSelectedAssignmentId(null);
        setRejectionReason("");
      } finally {
        setProcessing(false);
      }
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.loadingText}>Đang tải yêu cầu...</Text>
      </View>
    );
  }

  if (assignments.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="briefcase-outline" size={48} color="#9ca3af" />
        <Text style={styles.emptyText}>Không có yêu cầu nào</Text>
        <Text style={styles.emptySubtext}>
          Agent sẽ gửi yêu cầu khi họ muốn quản lý property của bạn
        </Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {assignments.map((assignment) => {
          const property =
            typeof assignment.property_id === "object"
              ? assignment.property_id
              : null;
          const agent =
            typeof assignment.agent_id === "object"
              ? assignment.agent_id
              : null;

          const propertyTitle =
            property && typeof property === "object"
              ? typeof property.title === "object"
                ? property.title.vi || property.title.en
                : property.title
              : "Property";

          const isExpanded = expandedAssignmentId === assignment._id;
          const canAccept = assignment.status === "pending";
          const canReject = assignment.status === "pending";

          const statusColor = getStatusColor(assignment.status);

          return (
            <Pressable
              key={assignment._id}
              style={[styles.assignmentCard, { borderLeftColor: statusColor }]}
              onPress={() =>
                setExpandedAssignmentId(isExpanded ? null : assignment._id)
              }
            >
              <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                  <Text style={styles.propertyTitle}>{propertyTitle}</Text>
                  {property && (
                    <Text style={styles.addressText}>
                      {typeof property.address === "object"
                        ? property.address.vi || property.address.en
                        : property.address || "N/A"}
                    </Text>
                  )}
                  {property && (
                    <Text style={styles.priceText}>
                      {formatCurrency(property.price)} ₫
                    </Text>
                  )}
                </View>
                <View style={styles.statusChip}>
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {getStatusLabel(assignment.status)}
                  </Text>
                </View>
              </View>

              {isExpanded && (
                <View style={styles.cardDetails}>
                  {/* Agent Info */}
                  {agent && typeof agent === "object" && (
                    <View style={styles.agentSection}>
                      <View style={styles.sectionHeader}>
                        <Ionicons
                          name="person-circle"
                          size={16}
                          color="#1976d2"
                        />
                        <Text style={styles.sectionTitle}>
                          Thông tin agent yêu cầu
                        </Text>
                      </View>
                      <Text style={styles.agentName}>{agent.fullName}</Text>
                      <Text style={styles.agentInfo}>{agent.email}</Text>
                      {agent.phone && (
                        <Text style={styles.agentInfo}>{agent.phone}</Text>
                      )}
                    </View>
                  )}

                  {/* Request Note */}
                  {assignment.note && (
                    <View style={styles.noteSection}>
                      <Text style={styles.noteLabel}>Ghi chú</Text>
                      <Text style={styles.noteText}>{assignment.note}</Text>
                    </View>
                  )}

                  {/* Timeline */}
                  <View style={styles.timelineSection}>
                    <View style={styles.timelineItem}>
                      <Ionicons name="calendar" size={14} color="#666" />
                      <View style={styles.timelineInfo}>
                        <Text style={styles.timelineLabel}>Gửi lúc</Text>
                        <Text style={styles.timelineValue}>
                          {new Date(assignment.createdAt).toLocaleDateString(
                            "vi-VN",
                          )}{" "}
                          {new Date(assignment.createdAt).toLocaleTimeString(
                            "vi-VN",
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                        </Text>
                      </View>
                    </View>
                  </View>

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
                          onPress={() => handleAcceptClick(assignment._id)}
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
                          onPress={() => handleRejectClick(assignment._id)}
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
            <Text style={styles.modalTitle}>Lý do từ chối (tuỳ chọn)</Text>

            <TextInput
              style={styles.reasonInput}
              placeholder="Nhập lý do từ chối (nếu muốn)..."
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
                  <Text style={styles.confirmButtonText}>Xác nhận từ chối</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

function getStatusColor(status: string): string {
  switch (status) {
    case "pending":
      return "#f59e0b";
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

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: "Chờ xử lý",
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
    fontWeight: "600",
    color: "#1f2937",
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 13,
    color: "#9ca3af",
    textAlign: "center",
  },
  assignmentCard: {
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 16,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 6,
  },
  addressText: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 6,
  },
  priceText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#10b981",
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
  cardDetails: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  agentSection: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
  },
  agentName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  agentInfo: {
    fontSize: 13,
    color: "#4b5563",
    marginBottom: 2,
  },
  noteSection: {
    backgroundColor: "#fffbeb",
    borderLeftWidth: 3,
    borderLeftColor: "#f59e0b",
    paddingLeft: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  noteLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#f59e0b",
    marginBottom: 6,
  },
  noteText: {
    fontSize: 13,
    color: "#92400e",
    lineHeight: 18,
  },
  timelineSection: {
    gap: 8,
    marginBottom: 12,
  },
  timelineItem: {
    flexDirection: "row",
    gap: 8,
  },
  timelineInfo: {
    flex: 1,
  },
  timelineLabel: {
    fontSize: 11,
    color: "#6b7280",
  },
  timelineValue: {
    fontSize: 13,
    fontWeight: "500",
    color: "#1f2937",
    marginTop: 2,
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
