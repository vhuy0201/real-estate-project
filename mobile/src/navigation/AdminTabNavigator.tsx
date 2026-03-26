import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { AdminTabParamList } from "../types/navigation";
import AdminUsersScreen from "../screens/admin/AdminUsersScreen";
import AdminCategoriesScreen from "../screens/admin/AdminCategoriesScreen";
import AdminPropertyModerationScreen from "../screens/admin/AdminPropertyModerationScreen";
import ProfileScreen from "../screens/common/ProfileScreen";
import { NotificationScreen } from "../screens/common/NotificationScreen";
import { useNotifications } from "../hooks/useNotifications";

const Tab = createBottomTabNavigator<AdminTabParamList>();

export default function AdminTabNavigator() {
  const { unreadCountQuery } = useNotifications();
  const unreadCount = unreadCountQuery.data || 0;

  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: "#1e3a8a" }}>
      <Tab.Screen
        name="AdminUsers"
        component={AdminUsersScreen}
        options={{
          tabBarLabel: "Người dùng",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      
      <Tab.Screen
        name="AdminCategories"
        component={AdminCategoriesScreen}
        options={{
          tabBarLabel: "Danh mục",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="AdminPropertyModeration"
        component={AdminPropertyModerationScreen}
        options={{
          tabBarLabel: "Kiểm duyệt",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="shield-checkmark-outline" size={size} color={color} />
          ),
        }}
      />
        
      <Tab.Screen
        name="Notifications"
        component={NotificationScreen}
        options={{
          tabBarLabel: "Thông báo",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications" size={size} color={color} />
          ),
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: "#EF4444",
            color: "white",
            fontSize: 10,
          },
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Hồ sơ",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
