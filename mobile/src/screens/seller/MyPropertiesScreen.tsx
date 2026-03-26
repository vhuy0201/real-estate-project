import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { useMyProperties, useDeleteProperty } from '../../hooks/useProperties';
import PropertyCard from '../../components/property/PropertyCard';
import { RootStackParamList } from '../../types/navigation';
import { Property } from '../../types/property';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const STATUS_TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'pending', label: 'Chờ duyệt' },
  { id: 'approved', label: 'Đã duyệt' },
  { id: 'rejected', label: 'Từ chối' },
];

export default function MyPropertiesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  const { 
    data, 
    isLoading, 
    refetch, 
    isRefetching 
  } = useMyProperties({ 
    status: selectedStatus === 'all' ? undefined : selectedStatus 
  });

  const deletePropertyMutation = useDeleteProperty();

  const handlePropertyPress = (propertyId: string) => {
    navigation.navigate('PropertyDetails', { propertyId });
  };

  const handleEdit = (propertyId: string) => {
    navigation.navigate('EditProperty', { propertyId });
  };

  const handleDelete = (propertyId: string) => {
    Alert.alert(
      'Xóa bất động sản',
      'Bạn có chắc chắn muốn xóa tin đăng này? Thao tác này không thể hoàn tác.',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePropertyMutation.mutateAsync(propertyId);
              Alert.alert('Thành công', 'Đã xóa tin đăng.');
              refetch();
            } catch (err) {
              Alert.alert('Lỗi', 'Không thể xóa tin đăng này.');
            }
          }
        }
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Bất Động Sản Của Tôi</Text>
      <View style={styles.tabContainer}>
        {STATUS_TABS.map((tab) => (
          <Pressable
            key={tab.id}
            onPress={() => setSelectedStatus(tab.id)}
            style={[
              styles.tab,
              selectedStatus === tab.id && styles.activeTab
            ]}
          >
            <Text style={[
              styles.tabText,
              selectedStatus === tab.id && styles.activeTabText
            ]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={64} color="#CBD5E1" />
      <Text style={styles.emptyText}>Bạn chưa có tin đăng nào ở trạng thái này</Text>
      <Pressable 
        style={styles.createBtn}
        onPress={() => navigation.navigate('SellerAgentMain' as any, { screen: 'CreateProperty' })}
      >
        <Text style={styles.createBtnText}>Đăng tin ngay</Text>
      </Pressable>
    </View>
  );

  if (isLoading && !isRefetching) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  const propertyList = (data as any)?.data || [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {renderHeader()}
      <FlatList
        data={propertyList}
        keyExtractor={(item) => item._id || item.id}
        renderItem={({ item }) => {
          const propertyId = item._id || item.id;
          return (
            <View style={styles.cardWrapper}>
              <PropertyCard 
                property={item} 
                onPress={() => handlePropertyPress(propertyId)} 
              />
              <View style={styles.actionRow}>
                <Pressable 
                  style={[styles.actionBtn, styles.editBtn]} 
                  onPress={() => handleEdit(propertyId)}
                >
                  <Ionicons name="create-outline" size={18} color="#0369a1" />
                  <Text style={styles.editBtnText}>Chỉnh sửa</Text>
                </Pressable>
                <Pressable 
                  style={[styles.actionBtn, styles.deleteBtn]} 
                  onPress={() => handleDelete(propertyId)}
                >
                  <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  <Text style={styles.deleteBtnText}>Xóa</Text>
                </Pressable>
              </View>
            </View>
          );
        }}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl 
            refreshing={isRefetching} 
            onRefresh={refetch} 
            tintColor="#0ea5e9"
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  activeTab: {
    backgroundColor: '#0ea5e9',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabText: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
    flexGrow: 1,
  },
  cardWrapper: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  actionRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    padding: 12,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  editBtn: {
    backgroundColor: '#e0f2fe',
  },
  editBtnText: {
    color: '#0369a1',
    fontWeight: '700',
    fontSize: 14,
  },
  deleteBtn: {
    backgroundColor: '#fef2f2',
  },
  deleteBtnText: {
    color: '#ef4444',
    fontWeight: '700',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  createBtn: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

