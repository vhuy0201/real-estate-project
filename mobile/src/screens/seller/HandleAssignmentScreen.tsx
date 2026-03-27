import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useGetSellerAssignments, useGetAgentAssignments, useAcceptAssignment, useRejectAssignment } from '../../hooks/useAssignment';
import { AssignmentRequestList } from '../../components/assignment/AssignmentRequestList';
import { showAppNotice } from '../../utils/appNotice';
import { assignmentService } from '../../services/assignmentService';

type StatusFilter = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'all';

export const HandleAssignmentScreen: React.FC = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [refreshing, setRefreshing] = useState(false);
  // Agent có thêm tab: 'sent' (gửi đi) vs 'received' (nhận về)
  const [agentTab, setAgentTab] = useState<'received' | 'sent'>('received');

  const { user } = useSelector((state: RootState) => state.auth);
  const isAgent = user?.role === 'agent';

  // --- SELLER ---
  const { data: sellerData, isLoading: sellerLoading, error: sellerError } = useGetSellerAssignments(
    {
      status: statusFilter !== 'all' ? (statusFilter as any) : undefined,
    },
    !isAgent,
  );

  // --- AGENT ---
  const { data: agentData, isLoading: agentLoading, error: agentError } = useGetAgentAssignments(
    {
      status: statusFilter !== 'all' ? statusFilter : undefined,
    },
    isAgent,
  );

  const { mutateAsync: mutateAcceptAssignment, isPending: isAccepting } = useAcceptAssignment();
  const { mutateAsync: mutateRejectAssignment, isPending: isRejecting } = useRejectAssignment();

  // Lọc dữ liệu agent theo tab (gửi đi vs nhận về)
  // `createdBy` = người khởi tạo yêu cầu
  // Seller gửi đến Agent: createdBy !== agentId (seller tạo)
  // Agent gửi đến Seller: createdBy === agentId (agent tự tạo)
  const agentAllAssignments = agentData?.data || [];
  const agentId = user?.id || user?._id;
  const agentReceivedAssignments = agentAllAssignments.filter(
    (a: any) => String(a.createdBy?._id ?? a.createdBy) !== String(agentId),
  );
  const agentSentAssignments = agentAllAssignments.filter(
    (a: any) => String(a.createdBy?._id ?? a.createdBy) === String(agentId),
  );

  const assignments = isAgent
    ? (agentTab === 'received' ? agentReceivedAssignments : agentSentAssignments)
    : (sellerData?.data || []);

  const isLoading = isAgent ? agentLoading : sellerLoading;
  const error = isAgent ? agentError : sellerError;
  const queryKey = isAgent ? 'agentAssignments' : 'sellerAssignments';

  const handleAccept = useCallback(
    async (assignmentId: string) => {
      try {
        if (isAgent) {
          await assignmentService.agentAcceptRequest(assignmentId);
        } else {
          await mutateAcceptAssignment(assignmentId);
        }
        showAppNotice({ type: 'success', title: 'Thành công', message: 'Yêu cầu đã được chấp nhận.' });
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Lỗi khi chấp nhận yêu cầu';
        showAppNotice({ type: 'error', title: 'Lỗi', message });
      }
    },
    [isAgent, mutateAcceptAssignment, queryClient, queryKey],
  );

  const handleReject = useCallback(
    async (assignmentId: string, reason: string) => {
      try {
        if (isAgent) {
          await assignmentService.agentRejectRequest(assignmentId, reason);
        } else {
          await mutateRejectAssignment({ assignmentId, reason });
        }
        showAppNotice({ type: 'success', title: 'Thành công', message: 'Yêu cầu đã được từ chối.' });
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Lỗi khi từ chối yêu cầu';
        showAppNotice({ type: 'error', title: 'Lỗi', message });
      }
    },
    [isAgent, mutateRejectAssignment, queryClient, queryKey],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await queryClient.refetchQueries({ queryKey: [queryKey] });
    } finally {
      setRefreshing(false);
    }
  }, [queryClient, queryKey]);

  const statusOptions: { label: string; value: StatusFilter }[] = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Chờ xử lý', value: 'pending' },
    { label: 'Đã chấp nhận', value: 'accepted' },
    { label: 'Đã từ chối', value: 'rejected' },
    { label: 'Đã hủy', value: 'cancelled' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Yêu cầu quản lý</Text>
        <Text style={styles.headerSubtitle}>
          {isAgent ? 'Quản lý yêu cầu từ Seller và yêu cầu bạn đã gửi' : 'Quản lý yêu cầu từ các agent'}
        </Text>
      </View>

      {/* Agent tab: Nhận về / Gửi đi */}
      {isAgent && (
        <View style={styles.agentTabContainer}>
          <Pressable
            style={[styles.agentTab, agentTab === 'received' && styles.agentTabActive]}
            onPress={() => setAgentTab('received')}
          >
            <Text style={[styles.agentTabText, agentTab === 'received' && styles.agentTabTextActive]}>
              Seller gửi đến ({agentAllAssignments.length})
            </Text>
          </Pressable>
          <Pressable
            style={[styles.agentTab, agentTab === 'sent' && styles.agentTabActive]}
            onPress={() => setAgentTab('sent')}
          >
            <Text style={[styles.agentTabText, agentTab === 'sent' && styles.agentTabTextActive]}>
              Tôi đã gửi
            </Text>
          </Pressable>
        </View>
      )}

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
                statusFilter === option.value &&
                styles.filterButtonTextActive,
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
          <Text style={styles.errorText}>Không thể tải yêu cầu</Text>
          <Text style={styles.errorMessage}>
            {error instanceof Error ? error.message : 'Có lỗi xảy ra, vui lòng thử lại'}
          </Text>
          <Pressable style={styles.retryButton} onPress={onRefresh}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </Pressable>
        </View>
      )}

      {/* Assignments List */}
      {!error && (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <AssignmentRequestList
            assignments={assignments}
            onAccept={handleAccept}
            onReject={handleReject}
            isLoading={isLoading && !refreshing}
          />

          {/* Processing Indicator */}
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
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  agentTabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  agentTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  agentTabActive: {
    borderBottomColor: '#1976d2',
  },
  agentTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  agentTabTextActive: {
    color: '#1976d2',
  },
  filterScroll: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    maxHeight: 50,
  },
  filterContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    alignItems: 'center',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  filterButtonActive: {
    backgroundColor: '#1976d2',
    borderColor: '#1976d2',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
    marginTop: 12,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  processingText: {
    fontSize: 13,
    color: '#1976d2',
    fontWeight: '500',
  },
});

export default HandleAssignmentScreen;
