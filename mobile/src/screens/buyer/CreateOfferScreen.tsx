import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import {
  useNavigation,
  useRoute,
  RouteProp,
  useFocusEffect,
} from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootStackParamList, RootState } from "../../types/navigation";
import { usePropertyDetails } from "../../hooks/useProperties";
import { useCreateOffer } from "../../hooks/useOffer";
import { OfferForm } from "../../components/offer/OfferForm";

type CreateOfferScreenRouteProp = RouteProp<RootStackParamList, "CreateOffer">;

export default function CreateOfferScreen() {
  const navigation = useNavigation();
  const route = useRoute<CreateOfferScreenRouteProp>();
  const { propertyId } = route.params;

  // Auth check
  const { user, token } = useSelector((state: any) => state.auth);
  const [authError, setAuthError] = useState<string | null>(null);

  // Load property
  const {
    data: property,
    isLoading: isLoadingProperty,
    error: propertyError,
    refetch,
  } = usePropertyDetails(propertyId);

  // Create offer mutation
  const { mutateAsync: createOffer, isPending: isCreatingOffer } =
    useCreateOffer();

  // Refetch property when screen comes into focus (for updated agent_id after assignment accepted)
  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch]),
  );

  // Check authorization
  useEffect(() => {
    if (!user || !token) {
      setAuthError("Vui lòng đăng nhập để tạo offer");
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
      return;
    }

    if (user.role?.toLowerCase() !== "buyer") {
      setAuthError("Chỉ người mua mới có thể tạo offer");
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
      return;
    }
  }, [user, token, navigation]);

  const handleSubmitOffer = async (data: any) => {
    try {
      await createOffer(data);
      Alert.alert("Thành công", "Offer của bạn đã được gửi thành công!", [
        {
          text: "OK",
          onPress: () => {
            navigation.navigate("BuyerMain", {
              screen: "Home",
            });
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Lỗi",
        error?.message || "Không thể tạo offer. Vui lòng thử lại.",
      );
    }
  };

  if (authError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={40} color="#ef4444" />
          <Text style={styles.errorText}>{authError}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoadingProperty) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#1976d2" />
        </View>
      </SafeAreaView>
    );
  }

  if (propertyError || !property) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle" size={40} color="#ef4444" />
          <Text style={styles.errorText}>
            {propertyError?.message || "Không tìm thấy bất động sản"}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Normalize response shape:
  // BE returns: { data: { ...property, fullAddress } }
  const normalizedProperty: any = (property as any)?.data || property;

  // Check if property has agent
  const hasAgent =
    normalizedProperty.agent_id !== null &&
    normalizedProperty.agent_id !== undefined;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#1976d2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tạo Offer</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* No Agent Alert */}
      {!hasAgent && (
        <View style={styles.warningAlert}>
          <Ionicons name="warning" size={18} color="#ef4444" />
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>⚠️ Không thể tạo offer</Text>
            <Text style={styles.warningText}>
              Bất động sản này chưa có agent phụ trách. Vui lòng liên hệ hoặc
              chọn bất động sản khác.
            </Text>
          </View>
        </View>
      )}

      {/* Offer Form */}
      {hasAgent && (
        <OfferForm
          property={normalizedProperty}
          onSubmit={handleSubmitOffer}
          isLoading={isCreatingOffer}
        />
      )}

      {!hasAgent && (
        <View style={styles.disabledFormContainer}>
          <Text style={styles.disabledText}>
            Vui lòng lựa chọn bất động sản khác để tạo offer
          </Text>
          <TouchableOpacity
            style={styles.backToHomeButton}
            onPress={() => {
              navigation.navigate("BuyerMain", {
                screen: "Home",
              });
            }}
          >
            <Text style={styles.backToHomeButtonText}>Về trang chủ</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "white",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },
  headerSpacer: {
    width: 40,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 16,
    color: "#ef4444",
    marginTop: 12,
    textAlign: "center",
  },
  warningAlert: {
    flexDirection: "row",
    backgroundColor: "#ffebee",
    borderLeftWidth: 4,
    borderLeftColor: "#ef4444",
    padding: 12,
    gap: 12,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#c62828",
    marginBottom: 4,
  },
  warningText: {
    fontSize: 13,
    color: "#c62828",
    lineHeight: 18,
  },
  disabledFormContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  disabledText: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 24,
    textAlign: "center",
  },
  backToHomeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1976d2",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backToHomeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
