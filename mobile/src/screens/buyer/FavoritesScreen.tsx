import React from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import PropertyCard from "../../components/property/PropertyCard";
import { useMyFavorites } from "../../hooks/useFavorites";

export default function FavoritesScreen() {
  const navigation = useNavigation<any>();
  const { data, isLoading, error, refetch } = useMyFavorites();

  const favorites = data?.properties ?? [];
  const total = typeof data?.total === "number" ? data.total : favorites.length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="heart" size={20} color="#0ea5e9" />
          <Text style={styles.title}>Yêu thích</Text>
        </View>
        <Text style={styles.subtitle}>{total} bất động sản</Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text style={styles.loadingText}>Đang tải yêu thích...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color="#ef4444"
          />
          <Text style={styles.errorText}>Không thể tải danh sách yêu thích</Text>
          <Pressable style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryText}>Thử lại</Text>
          </Pressable>
        </View>
      ) : favorites.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="heart-outline" size={54} color="#94a3b8" />
          <Text style={styles.emptyText}>Chưa có bất động sản trong yêu thích</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.favorite_id ?? item.id ?? String(item)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <PropertyCard
              property={item}
              onPress={() =>
                navigation.navigate("PropertyDetails", {
                  propertyId: item.id ?? item.property_id ?? "",
                })
              }
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    gap: 6,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0ea5e9",
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 10,
  },
  loadingText: {
    color: "#64748b",
    fontSize: 14,
    fontWeight: "600",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 8,
    backgroundColor: "#0ea5e9",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
  emptyText: {
    marginTop: 8,
    color: "#94a3b8",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
});

