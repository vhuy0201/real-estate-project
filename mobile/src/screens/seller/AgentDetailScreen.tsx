import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Alert,
  Modal,
  FlatList,
  Pressable,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useAgentDetail } from '../../hooks/useAgents';
import { useProperties, useMyProperties } from '../../hooks/useProperties';
import { useAssignmentMutations } from '../../hooks/useAssignments';
import { RootState } from '../../store';
import { RootStackParamList } from '../../types/navigation';
import CustomButton from '../../components/common/CustomButton';

type DetailRouteProp = RouteProp<RootStackParamList, 'AgentDetail'>;

export default function AgentDetailScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute<DetailRouteProp>();
  const navigation = useNavigation<any>();
  const { agentId } = route.params;
  const { user } = useSelector((state: RootState) => state.auth);
  
  const { data: agentResponse, isLoading, isError } = useAgentDetail(agentId);
  const [showPropertyPicker, setShowPropertyPicker] = useState(false);

  // Lấy danh sách BĐS của seller để gán
  const { data: myProperties } = useMyProperties();
  const { createRequest } = useAssignmentMutations();

  const agent = agentResponse?.data || agentResponse;

  const handleAssign = (propertyId: string) => {
    setShowPropertyPicker(false);
    createRequest.mutate(
      { propertyId, agentId, note: 'Tôi muốn bạn quản lý BĐS này.' },
      {
        onSuccess: () => {
          Alert.alert('Thành công', 'Đã gửi yêu cầu gán môi giới tới agent.');
        },
        onError: (error: any) => {
          Alert.alert('Lỗi', error.message || 'Không thể gửi yêu cầu.');
        }
      }
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  if (isError || !agent) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>Không thể tải thông tin môi giới</Text>
        <CustomButton title="Quay lại" onPress={() => navigation.goBack()} style={{ marginTop: 20 }} />
      </View>
    );
  }

  const handleCall = () => {
    if (agent.phone) {
      Linking.openURL(`tel:${agent.phone}`);
    } else {
      Alert.alert('Thông báo', 'Môi giới chưa cập nhật số điện thoại.');
    }
  };

  const handleEmail = () => {
    if (agent.email) {
      Linking.openURL(`mailto:${agent.email}`);
    } else {
      Alert.alert('Thông báo', 'Môi giới chưa cập nhật email.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Background */}
        <View style={[styles.headerBg, { paddingTop: insets.top + 10 }]}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Image
            source={agent.avatar ? { uri: agent.avatar } : require('../../assets/default-avatar.png')}
            style={styles.avatar}
          />
          <Text style={styles.name}>{agent.fullName || 'Chưa cập nhật tên'}</Text>
          <Text style={styles.role}>Chuyên viên Môi giới</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{agent.managingCount || 0}</Text>
              <Text style={styles.statLabel}>Đang quản lý</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>4.8</Text>
              <Text style={styles.statLabel}>Đánh giá</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>3+</Text>
              <Text style={styles.statLabel}>Năm KN</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <Pressable style={styles.actionBtn} onPress={handleCall}>
            <View style={[styles.actionIcon, { backgroundColor: '#f0fdf4' }]}>
              <Ionicons name="call" size={20} color="#22c55e" />
            </View>
            <Text style={styles.actionText}>Gọi điện</Text>
          </Pressable>
          <Pressable style={styles.actionBtn} onPress={handleEmail}>
            <View style={[styles.actionIcon, { backgroundColor: '#eff6ff' }]}>
              <Ionicons name="mail" size={20} color="#3b82f6" />
            </View>
            <Text style={styles.actionText}>Gửi Email</Text>
          </Pressable>
          <Pressable style={styles.actionBtn}>
            <View style={[styles.actionIcon, { backgroundColor: '#fff7ed' }]}>
              <Ionicons name="chatbubble-ellipses" size={20} color="#f97316" />
            </View>
            <Text style={styles.actionText}>Nhắn tin</Text>
          </Pressable>
        </View>

        {/* Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Giới thiệu</Text>
          <Text style={styles.bioText}>
            {agent.bio || 'Chào mừng bạn! Tôi là một chuyên viên môi giới bất động sản chuyên nghiệp với nhiều năm kinh nghiệm trong lĩnh vực căn hộ và nhà phố cao cấp. Tôi luôn sẵn sàng hỗ trợ bạn tìm kiếm và quản lý bất động sản một cách hiệu quả nhất.'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
          <View style={styles.contactItem}>
            <Ionicons name="mail-outline" size={20} color="#64748b" />
            <Text style={styles.contactText}>{agent.email}</Text>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="phone-portrait-outline" size={20} color="#64748b" />
            <Text style={styles.contactText}>{agent.phone || 'Chưa cập nhật số điện thoại'}</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Property Picker Modal */}
      <Modal visible={showPropertyPicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn BĐS để gán</Text>
              <Pressable onPress={() => setShowPropertyPicker(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </Pressable>
            </View>
            <FlatList
              data={(myProperties?.data || myProperties || [])?.filter((p: any) => !p.agent_id)}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <Pressable style={styles.propItem} onPress={() => handleAssign(item._id)}>
                   <Image source={{uri: item.images?.[0] || 'https://via.placeholder.com/150'}} style={styles.miniPropImg} />
                   <View style={{flex:1, marginLeft: 10}}>
                      <Text style={styles.propItemTitle} numberOfLines={1}>{item.title?.vi}</Text>
                      <Text style={styles.propItemAddr} numberOfLines={2}>{item.fullAddress}</Text>
                   </View>
                   <Ionicons name="chevron-forward" size={20} color="#e2e8f0" />
                </Pressable>
              )}
              ListEmptyComponent={
                <View style={styles.modalEmpty}>
                   <Ionicons name="business-outline" size={48} color="#e2e8f0" />
                   <Text style={{color: '#94a3b8', marginTop: 12, textAlign: 'center'}}>Bạn không có BĐS nào đang trống môi giới.</Text>
                </View>
              }
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          </View>
        </View>
      </Modal>

      {/* Bottom Fixed Action Button (Better UI than having it inside stats) */}
      <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <CustomButton 
          title="Giao quản lý Bất động sản" 
          onPress={() => {
            if (user?.role !== 'seller') {
              return Alert.alert('Thông báo', 'Tính năng này chỉ dành cho chủ nhà.');
            }
            setShowPropertyPicker(true);
          }} 
          loading={createRequest.isPending}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerBg: {
    height: 160,
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 24,
    marginTop: -60,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#fff',
    backgroundColor: '#f1f5f9',
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
    marginTop: 12,
  },
  role: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 24,
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: '#e2e8f0',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  actionBtn: {
    alignItems: 'center',
    gap: 8,
  },
  actionIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  bioText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  contactText: {
    fontSize: 15,
    color: '#1e293b',
    fontWeight: '500',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth:1,
    borderBottomColor: '#f1f5f9'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
  },
  propItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  miniPropImg: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  propItemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },
  propItemAddr: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    lineHeight: 18,
  },
  modalEmpty: {
    padding: 60,
    alignItems: 'center',
  }
});
