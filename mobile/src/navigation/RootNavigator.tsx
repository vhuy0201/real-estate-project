import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { RootStackParamList } from "../types/navigation";

import AuthNavigator from "./AuthNavigator";
import BuyerTabNavigator from "./BuyerTabNavigator";
import SellerAgentTabNavigator from "./SellerAgentTabNavigator";
import AdminTabNavigator from "./AdminTabNavigator";
import PropertyDetailScreen from "../screens/property/PropertyDetailScreen";
import CreateOfferScreen from "../screens/buyer/CreateOfferScreen";
import EditPropertyScreen from "../screens/seller/EditPropertyScreen";
import AgentListScreen from "../screens/seller/AgentListScreen";
import AgentDetailScreen from "../screens/seller/AgentDetailScreen";
import AssignmentListScreen from "../screens/common/AssignmentListScreen";
import PublicPropertyExploreScreen from "../screens/agent/PublicPropertyExploreScreen";
import EditProfileScreen from "../screens/common/EditProfileScreen";
import ChangePasswordScreen from "../screens/common/ChangePasswordScreen";
import BookAppointmentScreen from "../screens/buyer/BookAppointmentScreen";
import AgentAppointmentsScreen from "../screens/agent/AgentAppointmentsScreen";
import BuyerAppointmentDetailScreen from "../screens/buyer/BuyerAppointmentDetailScreen";
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth,
  );

  const getRoleNavigator = () => {
    if (user?.role === "admin") {
      return <Stack.Screen name="AdminMain" component={AdminTabNavigator} />;
    }
    if (user?.role === "seller" || user?.role === "agent") {
      return (
        <Stack.Screen
          name="SellerAgentMain"
          component={SellerAgentTabNavigator}
        />
      );
    }
    // Default to buyer
    return <Stack.Screen name="BuyerMain" component={BuyerTabNavigator} />;
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            {getRoleNavigator()}
            <Stack.Screen
              name="PropertyDetails"
              component={PropertyDetailScreen}
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="CreateOffer"
              component={CreateOfferScreen}
              options={{ animation: "slide_from_bottom" }}
            />
            <Stack.Screen
              name="EditProperty"
              component={EditPropertyScreen}
              options={{ animation: "slide_from_bottom" }}
            />
            <Stack.Screen
              name="AgentList"
              component={AgentListScreen}
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="AgentDetail"
              component={AgentDetailScreen}
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="AssignmentList"
              component={AssignmentListScreen}
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="PublicPropertyExplore"
              component={PublicPropertyExploreScreen}
              options={{ animation: "slide_from_bottom" }}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="ChangePassword"
              component={ChangePasswordScreen}
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="BookAppointment"
              component={BookAppointmentScreen}
              options={{ animation: "slide_from_bottom" }}
            />
            <Stack.Screen
              name="AgentAppointments"
              component={AgentAppointmentsScreen}
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="BuyerAppointmentDetail"
              component={BuyerAppointmentDetailScreen}
              options={{ animation: "slide_from_right" }}
            />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
