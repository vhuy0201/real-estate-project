// e:\Ki6\Ass\Project\real-estate-project\mobile\src\screens\common\NotificationScreen.tsx
import React from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationItem } from '../../components/common/NotificationItem';
import { Notification } from '../../types/notification';

export const NotificationScreen: React.FC = () => {
  const { 
    notificationsQuery, 
    markAllAsReadMutation,
    unreadCountQuery 
  } = useNotifications();

  const {
    data,
    isLoading,
    isRefetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = notificationsQuery;

  // Gộp tất cả notifications từ các trang vào một mảng phẳng
  const notifications = data?.pages.flatMap((page) => page.data) || [];

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleNotificationPress = (notification: Notification) => {
    // Xử lý điều hướng dựa trên action_url hoặc related_id
    console.log('Pressed notification:', notification._id);
    // Ví dụ: navigation.navigate(notification.action_url)
  };

  if (isLoading && !isRefetching) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 py-4">
        <View>
          <Text className="text-2xl font-bold text-gray-900">Thông báo</Text>
          {unreadCountQuery.data ? (
            <Text className="text-sm text-blue-600 font-medium">
              Bạn có {unreadCountQuery.data} thông báo mới
            </Text>
          ) : null}
        </View>
        <TouchableOpacity 
          onPress={handleMarkAllAsRead}
          className="p-2"
        >
          <MaterialCommunityIcons name="check-all" size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <NotificationItem 
            notification={item} 
            onPress={handleNotificationPress} 
          />
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl 
            refreshing={isRefetching} 
            onRefresh={refetch} 
            colors={['#3B82F6']}
          />
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => (
          isFetchingNextPage ? (
            <View className="py-4">
              <ActivityIndicator size="small" color="#3B82F6" />
            </View>
          ) : null
        )}
        ListEmptyComponent={() => (
          <View className="flex-1 justify-center items-center mt-20 px-10">
            <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
              <MaterialCommunityIcons name="bell-off-outline" size={40} color="#9CA3AF" />
            </View>
            <Text className="text-lg font-bold text-gray-900 text-center">
              Chưa có thông báo nào
            </Text>
            <Text className="text-sm text-gray-500 text-center mt-2">
              Chúng tôi sẽ thông báo cho bạn khi có cập nhật mới về bất động sản hoặc giao dịch của bạn.
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};
