import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';

import { RootState } from '../../store';
import { useAssignments, useAssignmentMutations } from '../../hooks/useAssignments';

export default function AssignmentListScreen() {
  const navigation = useNavigation<any>();
  const { user } = useSelector((state: RootState) => state.auth);
  const role = (user?.role === 'agent' ? 'agent' : 'seller') as 'seller' | 'agent';
  
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');
  const { data, isLoading, refetch } = useAssignments(role, { 
    // Logic: 
    // Agent: incoming là req từ seller, outgoing là req mình gửi cho seller
    // Seller: incoming là req từ agent gửi mình, outgoing là req mình gửi cho agent
    status: 'pending' 
  });

  const { acceptRequest, rejectRequest, cancelRequest } = useAssignmentMutations();

  const handleAction = (id: string, action: 'accept' | 'reject' | 'cancel') => {
    Alert.alert(
      'Xác nhận',
      `Bạn có chắc chắn muốn ${action === 'accept' ? 'chấp nhận' : action === 'reject' ? 'từ chối' : 'hủy'} yêu cầu này?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Đồng ý', 
          onPress: () => {
            if (action === 'accept') acceptRequest.mutate({ id, role });
            else if (action === 'reject') rejectRequest.mutate({ id, role });
            else cancelRequest.mutate({ id, role });
          } 
        },
      ]
    );
  };

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return 'https://via.placeholder.com/150';
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = process.env.EXPO_PUBLIC_API_URL?.split('/api')[0] || 'http://192.168.1.4:3000';
    return `${baseUrl}/${imagePath.startsWith('/') ? imagePath.slice(1) : imagePath}`;
  };

  const renderItem = ({ item }: { item: any }) => {
    const currentUserId = user?.id || user?._id;
    if (!currentUserId) return null;

    const propImage = item.property_id?.images?.[0];

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Image 
            source={{ uri: getImageUrl(propImage) }} 
            style={styles.propImage} 
          />
          <View style={styles.headerInfo}>
            <Text style={styles.propTitle} numberOfLines={1}>{item.property_id?.title?.vi || 'BĐS chưa rõ'}</Text>
            <Text style={styles.address} numberOfLines={1}>{item.property_id?.fullAddress || 'Địa chỉ đang cập nhật'}</Text>
            <Text style={styles.price}>{item.property_id?.price?.toLocaleString()} VNĐ</Text>
          </View>
        </View>

        <View style={styles.userInfo}>
           <Image 
             source={role === 'seller' ? (item.agent_id?.avatar ? {uri: item.agent_id.avatar} : require('../../assets/default-avatar.png')) : (item.owner_id?.avatar ? {uri: item.owner_id.avatar} : require('../../assets/default-avatar.png'))} 
             style={styles.avatar} 
           />
           <View style={{flex: 1}}>
              <Text style={styles.userLabel}>{role === 'seller' ? 'Môi giới' : 'Chủ nhà'}</Text>
              <Text style={styles.userName}>{role === 'seller' ? item.agent_id?.fullName : item.owner_id?.fullName}</Text>
           </View>
           {item.note && (
             <View style={styles.noteBox}>
               <Text style={styles.noteText} numberOfLines={2}>"{item.note}"</Text>
             </View>
           )}
        </View>

        <View style={styles.actions}>
          {activeTab === 'incoming' ? (
            <>
              <Pressable style={[styles.btn, styles.rejectBtn]} onPress={() => handleAction(item._id, 'reject')}>
                <Text style={styles.rejectTxt}>Từ chối</Text>
              </Pressable>
              <Pressable style={[styles.btn, styles.acceptBtn]} onPress={() => handleAction(item._id, 'accept')}>
                <Text style={styles.acceptTxt}>Chấp nhận</Text>
              </Pressable>
            </>
          ) : (
            <Pressable style={[styles.btn, styles.cancelBtn]} onPress={() => handleAction(item._id, 'cancel')}>
              <Text style={styles.cancelTxt}>Hủy yêu cầu</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  const filteredData = (data || []).filter((item: any) => {
    const currentUserId = user?.id || user?._id;
    const createdById = item.createdBy?._id || item.createdBy;
    if (activeTab === 'incoming') {
      return String(createdById) !== String(currentUserId);
    } else {
      return String(createdById) === String(currentUserId);
    }
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </Pressable>
        <Text style={styles.title}>Quản lý yêu cầu</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <Pressable 
          style={[styles.tab, activeTab === 'incoming' && styles.activeTab]} 
          onPress={() => setActiveTab('incoming')}
        >
          <Text style={[styles.tabText, activeTab === 'incoming' && styles.activeTabText]}>Đã nhận</Text>
        </Pressable>
        <Pressable 
          style={[styles.tab, activeTab === 'outgoing' && styles.activeTab]} 
          onPress={() => setActiveTab('outgoing')}
        >
          <Text style={[styles.tabText, activeTab === 'outgoing' && styles.activeTabText]}>Đã gửi</Text>
        </Pressable>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0ea5e9" />
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="documents-outline" size={64} color="#e2e8f0" />
              <Text style={styles.emptyText}>
                {activeTab === 'incoming' ? 'Không có yêu cầu nào được gửi đến bạn' : 'Bạn chưa gửi yêu cầu nào'}
              </Text>
            </View>
          }
          onRefresh={refetch}
          refreshing={isLoading}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  backBtn: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginLeft: 12,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth:1,
    borderBottomColor: '#f1f5f9'
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#0ea5e9',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  activeTabText: {
    color: '#0ea5e9',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  propImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  propTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },
  address: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0ea5e9',
    marginTop: 4,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 12,
    marginBottom: 16,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  userLabel: {
    fontSize: 10,
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  userName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
  noteBox: {
    flex: 1,
    borderLeftWidth: 1,
    borderLeftColor: '#e2e8f0',
    paddingLeft: 10,
    marginLeft: 10,
  },
  noteText: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  btn: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptBtn: {
    backgroundColor: '#0ea5e9',
  },
  acceptTxt: {
    color: '#fff',
    fontWeight: '700',
  },
  rejectBtn: {
    backgroundColor: '#f1f5f9',
  },
  rejectTxt: {
    color: '#64748b',
    fontWeight: '700',
  },
  cancelBtn: {
    backgroundColor: '#fff1f2',
  },
  cancelTxt: {
    color: '#f43f5e',
    fontWeight: '700',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    color: '#94a3b8',
  },
});
