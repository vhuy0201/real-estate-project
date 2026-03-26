// e:\Ki6\Ass\Project\real-estate-project\mobile\src\components\common\NotificationItem.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Notification } from '../../types/notification';
import { formatTimeAgo } from '../../utils/formatDate';
import { useNotifications } from '../../hooks/useNotifications';

interface NotificationItemProps {
  notification: Notification;
  onPress?: (notification: Notification) => void;
}

const getIconConfig = (type: Notification['type']) => {
  switch (type) {
    case 'property':
      return { name: 'home-outline', color: '#3B82F6', bgColor: '#DBEAFE' };
    case 'appointment':
      return { name: 'calendar-clock', color: '#8B5CF6', bgColor: '#EDE9FE' };
    case 'offer':
      return { name: 'handshake-outline', color: '#10B981', bgColor: '#D1FAE5' };
    case 'deal':
    case 'contract':
      return { name: 'file-document-outline', color: '#F59E0B', bgColor: '#FEF3C7' };
    case 'chat':
      return { name: 'chat-processing-outline', color: '#EC4899', bgColor: '#FCE7F3' };
    case 'payment':
      return { name: 'credit-card-outline', color: '#06B6D4', bgColor: '#CFFAFE' };
    default:
      return { name: 'bell-outline', color: '#6B7280', bgColor: '#F3F4F6' };
  }
};

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onPress }) => {
  const iconConfig = getIconConfig(notification.type);
  const { markAsReadMutation } = useNotifications();

  const handlePress = () => {
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification._id);
    }
    onPress?.(notification);
  };

  return (
    <TouchableOpacity 
      onPress={handlePress}
      className={`flex-row p-4 mb-2 mx-4 rounded-2xl bg-white shadow-sm border-l-4 ${
        notification.is_read ? 'border-transparent opacity-80' : 'border-blue-500'
      }`}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
      }}
    >
      <View 
        className="w-12 h-12 rounded-full items-center justify-center"
        style={{ backgroundColor: iconConfig.bgColor }}
      >
        <MaterialCommunityIcons 
          name={iconConfig.name as any} 
          size={24} 
          color={iconConfig.color} 
        />
      </View>

      <View className="flex-1 ml-3">
        <View className="flex-row justify-between items-start">
          <Text 
            className={`flex-1 text-base ${notification.is_read ? 'font-medium text-gray-600' : 'font-bold text-gray-900'}`}
            numberOfLines={1}
          >
            {notification.title.vi}
          </Text>
          {!notification.is_read && (
            <View className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
          )}
        </View>
        
        <Text 
          className={`text-sm mt-1 ${notification.is_read ? 'text-gray-500' : 'text-gray-700'}`}
          numberOfLines={2}
        >
          {notification.message.vi}
        </Text>
        
        <Text className="text-xs text-gray-400 mt-2">
          {formatTimeAgo(notification.createdAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
