import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SellerAgentTabParamList } from "../types/navigation";
import DashboardScreen from "../screens/seller/DashboardScreen";
import HomeScreen from "../screens/buyer/HomeScreen";
import ProfileScreen from "../screens/common/ProfileScreen";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import type { RootState } from "../store";

import CreatePropertyScreen from "../screens/seller/CreatePropertyScreen";
import MyPropertiesScreen from "../screens/seller/MyPropertiesScreen";
import HandleAssignmentScreen from "../screens/seller/HandleAssignmentScreen";
import HandleOfferScreen from "../screens/seller/HandleOfferScreen";
import AgentOfferScreen from "../screens/agent/AgentOfferScreen";
import { NotificationScreen } from "../screens/common/NotificationScreen";
import { useNotifications } from "../hooks/useNotifications";

const Tab = createBottomTabNavigator<SellerAgentTabParamList>();

export default function SellerAgentTabNavigator() {
  const { unreadCountQuery } = useNotifications();
  const unreadCount = unreadCountQuery.data || 0;
  const { user } = useSelector((state: RootState) => state.auth);
  const role = user?.role?.toLowerCase();
  const offersTabComponent =
    role === "agent" ? AgentOfferScreen : HandleOfferScreen;

  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false, tabBarActiveTintColor: "#0ea5e9" }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Market",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="CreateProperty"
        component={CreatePropertyScreen}
        options={{
          tabBarLabel: "Đăng tin",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" size={size + 4} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MyProperties"
        component={MyPropertiesScreen}
        options={{
          tabBarLabel: "Listings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="pricetags" size={size} color={color} />
          ),
        }}
      />
      {user?.role === "seller" && (
        <Tab.Screen
          name="HandleAssignment"
          component={HandleAssignmentScreen}
          options={{
            tabBarLabel: "Requests",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-add" size={size} color={color} />
            ),
          }}
        />
      )}
      <Tab.Screen
        name="HandleOffer"
        component={offersTabComponent}
        options={{
          tabBarLabel: "Offers",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text" size={size} color={color} />
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
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
