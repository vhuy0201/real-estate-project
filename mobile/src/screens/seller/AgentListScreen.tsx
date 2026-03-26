import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAgents } from '../../hooks/useAgents';
import { RootStackParamList } from '../../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function AgentListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [keyword, setKeyword] = useState('');
  const { data, isLoading, refetch } = useAgents({ keyword });

  const renderAgentItem = ({ item }: { item: any }) => (
    <Pressable
      style={styles.agentCard}
      onPress={() => navigation.navigate('AgentDetail', { agentId: item._id })}
    >
      <Image
        source={item.avatar ? { uri: item.avatar } : require('../../assets/default-avatar.png')}
        style={styles.avatar}
        contentFit="cover"
        transition={200}
      />
      <View style={{ flex: 1, marginLeft: 16 }}>
        <Text style={styles.agentName}>{item.fullName}</Text>
        <Text style={styles.agentEmail}>{item.email}</Text>
        <View style={styles.statsRow}>
          <Ionicons name="home-outline" size={14} color="#64748b" />
          <Text style={styles.statsText}>Đang quản lý: {item.managingCount || 0} BĐS</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </Pressable>
        <Text style={styles.headerTitle}>Tìm kiếm Môi giới</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#94a3b8" />
          <TextInput
            placeholder="Tìm theo tên, email hoặc SĐT..."
            style={styles.searchInput}
            value={keyword}
            onChangeText={setKeyword}
            onSubmitEditing={() => refetch()}
          />
          {keyword.length > 0 && (
            <Pressable onPress={() => setKeyword('')}>
              <Ionicons name="close-circle" size={18} color="#94a3b8" />
            </Pressable>
          )}
        </View>
      </View>

      {/* List */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0ea5e9" />
        </View>
      ) : (
        <FlatList
          data={data?.data || []}
          keyExtractor={(item) => item._id}
          renderItem={renderAgentItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Ionicons name="people-outline" size={64} color="#e2e8f0" />
              <Text style={styles.emptyText}>Không tìm thấy môi giới nào</Text>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginLeft: 12,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#1e293b',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  agentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f1f5f9',
  },
  agentName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  agentEmail: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 6,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statsText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    color: '#94a3b8',
  },
});
