import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AdminTabParamList } from "../types/navigation";
import AdminUsersScreen from "../screens/admin/AdminUsersScreen";
import AdminCategoriesScreen from "../screens/admin/AdminCategoriesScreen";
import AdminPropertyModerationScreen from "../screens/admin/AdminPropertyModerationScreen";
import ProfileScreen from "../screens/common/ProfileScreen";
import AdminPerformanceDashboardScreen from "../screens/admin/AdminPerformanceDashboardScreen";
import { StyleSheet } from "react-native";

const Tab = createBottomTabNavigator<AdminTabParamList>();

export default function AdminTabNavigator() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#1e3a8a",
          tabBarInactiveTintColor: "#9ca3af",
          tabBarStyle: {
            height: 64,
            borderTopColor: "#e5e7eb",
            borderTopWidth: 1,
            paddingBottom: 6,
            paddingTop: 6,
            backgroundColor: "#ffffff",
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "700",
          },
        }}
      >
        <Tab.Screen
          name="AdminDashboard"
          component={AdminPerformanceDashboardScreen}
          options={{
            tabBarLabel: "Tổng quan",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="analytics" size={size} color={color} />
            ),
          }}
        />
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
    </SafeAreaView>
  );
}

