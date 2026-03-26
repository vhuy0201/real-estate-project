import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BuyerTabParamList } from '../types/navigation';
import HomeScreen from '../screens/buyer/HomeScreen';
import ProfileScreen from '../screens/common/ProfileScreen';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NotificationScreen } from '../screens/common/NotificationScreen';
import { useNotifications } from '../hooks/useNotifications';
import { useMyFavorites } from '../hooks/useFavorites';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import FavoritesScreen from '../screens/buyer/FavoritesScreen';
import BuyerAppointmentListScreen from '../screens/buyer/BuyerAppointmentListScreen';

const Tab = createBottomTabNavigator<BuyerTabParamList>();

export default function BuyerTabNavigator() {
  const { unreadCountQuery } = useNotifications();
  const unreadCount = unreadCountQuery.data || 0;
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const { data: favoritesData } = useMyFavorites(isAuthenticated);
  const favoritesTotal = favoritesData?.total ?? 0;

  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: '#3B82F6' }}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} /> }} />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="heart" size={size} color={color} />,
          tabBarLabel: ({ focused }: any) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: focused ? '#3B82F6' : '#64748b' }}>
                Favorites
              </Text>
              {favoritesTotal > 0 ? (
                <Text style={{ fontSize: 10, fontWeight: '900', color: '#ef4444', marginTop: 2 }}>
                  {favoritesTotal}
                </Text>
              ) : null}
            </View>
          ),
        }}
      />
      <Tab.Screen name="Appointments" component={BuyerAppointmentListScreen} options={{ tabBarLabel: 'Lịch hẹn', tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} /> }} />
      <Tab.Screen 
        name="Notifications" 
        component={NotificationScreen} 
        options={{ 
          tabBarLabel: 'Thông báo',
          tabBarIcon: ({ color, size }) => <Ionicons name="notifications" size={size} color={color} />,
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: { backgroundColor: '#EF4444', color: 'white', fontSize: 10 }
        }} 
      />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} /> }} />
    </Tab.Navigator>
  );
}
