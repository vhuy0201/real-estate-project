import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useQuery } from '@tanstack/react-query';

import { propertyService } from '../../services/propertyService';

export default function PublicPropertyExploreScreen() {
  const navigation = useNavigation<any>();
  const [keyword, setKeyword] = useState('');

  // Lấy danh sách BĐS chưa có Agent
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['properties-no-agent', keyword],
    queryFn: async () => {
      const response = await propertyService.getPublicProperties({ keyword } as any);
      // Backend filter: agent_id: null
      // Do service hiện tại là getPublicProperties, ta có thể cần một API riêng hoặc filter ở FE 
      // Nhưng theo U008 backend có GET /agent/properties/no-agent
      // Tôi sẽ giả định có API này hoặc sử dụng filter tạm thời
     const propertiesList = Array.isArray(response.data) ? response.data : response.data?.data || [];
  const filteredProperties = propertiesList.filter((p: any) => 
!p.agent_id);
      return filteredProperties;
    }
  });

  const renderItem = ({ item }: { item: any }) => (
    <Pressable 
      style={styles.card}
      onPress={() => navigation.navigate('PropertyDetails', { propertyId: item._id })}
    >
      <Image 
        source={{ uri: item.images?.[0] || 'https://via.placeholder.com/300' }} 
        style={styles.image} 
        contentFit="cover"
      />
      <View style={styles.cardContent}>
        <Text style={styles.title} numberOfLines={1}>{item.title?.vi}</Text>
        <Text style={styles.address} numberOfLines={1}>{item.fullAddress}</Text>
        <View style={styles.footer}>
          <Text style={styles.price}>{item.price?.toLocaleString()} VNĐ</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Yêu cầu quản lý</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </Pressable>
        <Text style={styles.headerTitle}>BĐS chưa có Môi giới</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#94a3b8" />
          <TextInput
            placeholder="Tìm theo khu vực, dự án..."
            style={styles.searchInput}
            value={keyword}
            onChangeText={setKeyword}
          />
        </View>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0ea5e9" />
        </View>
      ) : (
        <FlatList
          data={data || []}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="business-outline" size={64} color="#e2e8f0" />
              <Text style={styles.emptyText}>Hiện không có BĐS nào cần môi giới</Text>
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
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 180,
  },
  cardContent: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  address: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0ea5e9',
  },
  badge: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16a34a',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#94a3b8',
  },
});
