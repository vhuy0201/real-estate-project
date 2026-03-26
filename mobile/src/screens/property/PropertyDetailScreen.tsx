import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Pressable,
  StatusBar,
  FlatList,
  StyleSheet,
  Platform,
  Linking,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import {
  useRoute,
  useNavigation,
  RouteProp,
  useIsFocused,
} from "@react-navigation/native";
import { useSelector } from "react-redux";
import { RootStackParamList } from "../../types/navigation";
import { usePropertyDetails } from "../../hooks/useProperties";
import { useAssignmentMutations } from "../../hooks/useAssignments";
import { useFavoriteCheck, useFavoriteMutations } from "../../hooks/useFavorites";
import { RootState } from "../../store";
import { Property } from "../../types/property";
import { Alert } from "react-native";

type DetailRouteProp = RouteProp<RootStackParamList, "PropertyDetails">;
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IMAGE_HEIGHT = 300;

// --- Sub-components ---

function ImageCarousel({ images }: { images: string[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const displayImages =
    (images?.length ?? 0) > 0
      ? images
      : ["https://via.placeholder.com/800x600?text=Chưa+có+ảnh"];

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index ?? 0);
    }
  }, []);

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={displayImages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item }}
            style={styles.carouselImage}
            contentFit="cover"
            transition={300}
            placeholder={{ blurhash: "LKO2:N%2Tw=w]~RBVZRi};RPxuwH" }}
          />
        )}
      />
      {/* Image counter badge */}
      <View style={styles.imageCountBadge}>
        <Ionicons name="images-outline" size={14} color="#fff" />
        <Text style={styles.imageCountText}>
          {activeIndex + 1}/{displayImages.length}
        </Text>
      </View>
      {/* Dot Indicators */}
      {displayImages.length > 1 && (
        <View style={styles.dotContainer}>
          {displayImages.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === activeIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

function StatItem({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
}) {
  return (
    <View style={styles.statItem}>
      <View style={styles.statIconWrapper}>
        <Ionicons name={icon} size={20} color="#0ea5e9" />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string | number | null;
}) {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={18} color="#64748b" />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{String(value)}</Text>
    </View>
  );
}

// --- Main Screen ---

export default function PropertyDetailScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute<DetailRouteProp>();
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { propertyId } = route.params;
  const { user } = useSelector((state: RootState) => state.auth);
  const { data, isLoading, isError, refetch } = usePropertyDetails(propertyId);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const { removeAgent, agentRequest } = useAssignmentMutations();
  const { data: favoriteCheck, isLoading: isFavoriteChecking } =
    useFavoriteCheck(propertyId);
  const { addFavorite, removeFavorite } = useFavoriteMutations();

  const isFavorite = Boolean(favoriteCheck);
  const isFavoriteMutating = addFavorite.isPending || removeFavorite.isPending;

  const handleToggleFavorite = async () => {
    if (isFavoriteChecking || isFavoriteMutating) return;

    const wasFavorite = isFavorite;

    try {
      if (isFavorite) {
        await removeFavorite.mutateAsync(propertyId);
      } else {
        await addFavorite.mutateAsync(propertyId);
      }

      Alert.alert(
        "Thành công",
        wasFavorite ? "Đã xóa khỏi yêu thích" : "Đã thêm vào yêu thích",
      );
    } catch (err: any) {
      const apiMessage =
        err?.response?.data?.message ||
        err?.message;
      Alert.alert(
        "Lỗi",
        apiMessage || "Không thể cập nhật yêu thích. Vui lòng thử lại.",
      );
    }
  };

  // Refetch property data when screen comes into focus
  // This ensures agent_id is updated after accepting assignment
  useEffect(() => {
    if (isFocused) {
      refetch();
    }
  }, [isFocused, refetch]);

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#0ea5e9" />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={[styles.centerContainer, { paddingTop: insets.top }]}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>
          Không thể tải thông tin bất động sản
        </Text>
        <Pressable
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryText}>Quay lại</Text>
        </Pressable>
      </View>
    );
  }

  // Cấu trúc: data = { data: { ...fields } } sau khi service bóc 1 lớp (Axios wrapper)
  const property: Property = (data as any)?.data || data;
  const description =
    property.description?.vi || property.description?.en || "";

  return (
    <View style={styles.rootContainer}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Gallery */}
        <ImageCarousel images={property.images || []} />

        {/* Back Button (Floating) */}
        <Pressable
          style={[styles.backButton, { top: Math.max(insets.top, 16) + 10 }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color="#1e293b" />
        </Pressable>

        {/* Content */}
        <View style={styles.contentContainer}>
          {/* Price Header (Ẩn Status Badge theo yêu cầu) */}
          <View style={styles.headerRow}>
            <Text style={styles.price}>
              {property.price?.toLocaleString("vi-VN")} VNĐ
            </Text>
            <Pressable
              style={[
                styles.favoriteButton,
                isFavorite && styles.favoriteButtonActive,
              ]}
              onPress={handleToggleFavorite}
              disabled={isFavoriteChecking || isFavoriteMutating}
              accessibilityRole="button"
              accessibilityLabel="Toggle favorite"
            >
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={20}
                color={isFavorite ? "#ef4444" : "#0ea5e9"}
              />
            </Pressable>
          </View>

          {/* Title */}
          <Text style={styles.title}>
            {property.title?.vi || property.title?.en || "Chưa có tiêu đề"}
          </Text>

          {/* Address */}
          <View style={styles.addressRow}>
            <Ionicons name="location-sharp" size={16} color="#0ea5e9" />
            <Text style={styles.addressText}>
              {property.fullAddress ||
                property.address?.vi ||
                "Chưa cập nhật địa chỉ"}
            </Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Quick Stats */}
          <Text style={styles.sectionTitle}>Tổng Quan</Text>
          <View style={styles.statsGrid}>
            <StatItem
              icon="bed-outline"
              label="Phòng ngủ"
              value={property.bedrooms ?? 0}
            />
            <StatItem
              icon="water-outline"
              label="Phòng tắm"
              value={property.bathrooms ?? 0}
            />
            <StatItem
              icon="resize-outline"
              label="Diện tích"
              value={`${property.area ?? 0} ${property.unit || "m²"}`}
            />
            <StatItem
              icon="layers-outline"
              label="Số tầng"
              value={property.floors ?? 1}
            />
          </View>

          {/* Description */}
          {(description?.length ?? 0) > 0 && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Mô Tả</Text>
              <Text
                style={styles.descriptionText}
                numberOfLines={showFullDescription ? undefined : 4}
              >
                {description}
              </Text>
              {(description?.length ?? 0) > 150 && (
                <Pressable
                  onPress={() => setShowFullDescription(!showFullDescription)}
                >
                  <Text style={styles.readMoreText}>
                    {showFullDescription ? "Thu gọn" : "Xem thêm..."}
                  </Text>
                </Pressable>
              )}
            </>
          )}

          {/* Detail Info */}
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Chi Tiết</Text>
          <View style={styles.infoCard}>
            <InfoRow
              icon="calendar-outline"
              label="Năm xây dựng"
              value={property.yearBuilt}
            />
            <InfoRow
              icon="business-outline"
              label="Tòa nhà"
              value={property.building_block}
            />
            <InfoRow
              icon="navigate-outline"
              label="Tầng"
              value={property.floor_number}
            />
            <InfoRow
              icon="home-outline"
              label="Mã căn hộ"
              value={property.apartment_number}
            />
            <InfoRow
              icon="time-outline"
              label="Đăng ngày"
              value={
                property.createdAt
                  ? new Date(property.createdAt).toLocaleDateString("vi-VN")
                  : null
              }
            />
          </View>

          {/* Agent Info Section */}
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Môi giới quản lý</Text>
          {property.agent_id ? (
            <Pressable
              style={styles.agentCard}
              onPress={() =>
                navigation.navigate("AgentDetail" as any, {
                  agentId: (property.agent_id as any)._id || property.agent_id,
                })
              }
            >
              <Image
                source={
                  (property.agent_id as any).avatar
                    ? { uri: (property.agent_id as any).avatar }
                    : require("../../assets/default-avatar.png")
                }
                style={styles.agentAvatar}
              />
              <View style={styles.agentInfo}>
                <Text style={styles.agentName}>
                  {(property.agent_id as any).fullName}
                </Text>
                <Text style={styles.agentRole}>Chuyên viên Môi giới</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
            </Pressable>
          ) : (
            <View style={styles.noAgentBox}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color="#94a3b8"
              />
              <Text style={styles.noAgentText}>
                Bất động sản này chưa có môi giới quản lý.
              </Text>
            </View>
          )}

          {/* Owner Info Section */}
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Chủ sở hữu</Text>
          {property.owner_id ? (
            <View style={styles.agentCard}>
              <Image
                source={
                  (property.owner_id as any).avatar
                    ? { uri: (property.owner_id as any).avatar }
                    : require("../../assets/default-avatar.png")
                }
                style={styles.agentAvatar}
              />
              <View style={styles.agentInfo}>
                <Text style={styles.agentName}>
                  {(property.owner_id as any).fullName || "Người dùng hệ thống"}
                </Text>
                <Text style={styles.agentRole}>Chủ bất động sản</Text>
              </View>
              {(property.owner_id as any).phone && (
                <Pressable
                  onPress={() =>
                    Linking.openURL(`tel:${(property.owner_id as any).phone}`)
                  }
                >
                  <Ionicons name="call" size={24} color="#22c55e" />
                </Pressable>
              )}
            </View>
          ) : (
            <View style={styles.noAgentBox}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color="#94a3b8"
              />
              <Text style={styles.noAgentText}>
                Không có thông tin chủ sở hữu.
              </Text>
            </View>
          )}

          {/* Spacer for bottom action bar */}
          <View style={{ height: 120 + insets.bottom }} />
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        {renderActionButtons(
          property,
          user,
          navigation,
          removeAgent,
          agentRequest,
        )}
      </View>
    </View>
  );
}

// Helper function to render action buttons based on status & role
function renderActionButtons(
  property: any,
  user: any,
  navigation: any,
  removeAgent: any,
  agentRequest: any,
) {
  const userId = user?._id ?? user?.id;

  // Normalize populated-or-string foreign keys
  const ownerId =
    typeof property?.owner_id === "object"
      ? property?.owner_id?._id
      : property?.owner_id;
  const agentId =
    typeof property?.agent_id === "object"
      ? property?.agent_id?._id
      : property?.agent_id;

  const isOwner = ownerId && userId && ownerId === userId;
  const isAgent = agentId && userId && agentId === userId;
  const hasAgent = !!agentId;

  if (isOwner) {
    return (
      <>
        {hasAgent ? (
          <Pressable
            style={[styles.actionButton, styles.removeBtn]}
            onPress={() => {
              Alert.alert(
                "Xác nhận",
                "Bạn có chắc chắn muốn gỡ môi giới này khỏi BĐS?",
                [
                  { text: "Hủy", style: "cancel" },
                  {
                    text: "Gỡ",
                    style: "destructive",
                    onPress: () => removeAgent.mutate(property._id),
                  },
                ],
              );
            }}
          >
            <Ionicons name="person-remove-outline" size={20} color="#fff" />
            <Text style={styles.actionBtnText}>Gỡ Môi giới</Text>
          </Pressable>
        ) : (
          <Pressable
            style={[styles.actionButton, styles.primaryBtn]}
            onPress={() => navigation.navigate("AgentList")}
          >
            <Ionicons name="person-add-outline" size={20} color="#fff" />
            <Text style={styles.actionBtnText}>Giao quản lý</Text>
          </Pressable>
        )}
        <Pressable
          style={[styles.actionButton, styles.secondaryBtn]}
          onPress={() =>
            navigation.navigate("EditProperty", { propertyId: property._id })
          }
        >
          <Ionicons name="create-outline" size={20} color="#0ea5e9" />
          <Text style={[styles.actionBtnText, { color: "#0ea5e9" }]}>
            Chỉnh sửa
          </Text>
        </Pressable>
      </>
    );
  }

  if (user?.role === "agent" && !hasAgent) {
    return (
      <Pressable
        style={[styles.actionButton, styles.primaryBtn, { flex: 1 }]}
        onPress={() => {
          Alert.alert(
            "Yêu cầu quản lý",
            "Bạn muốn gửi yêu cầu quản lý BĐS này cho chủ nhà?",
            [
              { text: "Hủy", style: "cancel" },
              {
                text: "Gửi yêu cầu",
                onPress: () =>
                  agentRequest.mutate({
                    propertyId: property._id,
                    note: "Tôi muốn hợp tác quản lý BĐS này.",
                  }),
              },
            ],
          );
        }}
      >
        <Ionicons name="hand-right-outline" size={20} color="#fff" />
        <Text style={styles.actionBtnText}>Gửi yêu cầu quản lý</Text>
      </Pressable>
    );
  }

  // Default contact buttons for buyers/others
  const isBuyer = user?.role?.toLowerCase() === "buyer";
  return (
    <View style={styles.actionButtonsContainer}>
      <Pressable
        style={styles.contactButton}
        onPress={() => {
          const phone = property.agent_id?.phone || property.owner_id?.phone;
          if (phone) Linking.openURL(`tel:${phone}`);
        }}
      >
        <Ionicons name="call-outline" size={18} color="#fff" />
        <Text style={styles.contactButtonText}>Liên Hệ</Text>
      </Pressable>
      {isBuyer && (
        <Pressable
          style={styles.offerButton}
          onPress={() =>
            navigation.navigate("CreateOffer", { propertyId: property._id })
          }
        >
          <Ionicons name="pricetag-outline" size={18} color="#fff" />
          <Text style={styles.offerButtonText}>Offer</Text>
        </Pressable>
      )}
      <Pressable style={styles.appointmentButton} onPress={() => navigation.navigate('BookAppointment', { propertyId: property._id })}>
        <Ionicons name="calendar-outline" size={20} color="#0ea5e9" />
        <Text style={styles.appointmentButtonText}>Đặt Lịch Xem</Text>
      </Pressable>
    </View>
  );
}

// --- Styles ---

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: "#64748b",
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: "#ef4444",
    fontWeight: "600",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: "#0ea5e9",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  carouselImage: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
  },
  imageCountBadge: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "rgba(0,0,0,0.6)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  imageCountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  dotContainer: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: "#fff",
    width: 20,
  },
  dotInactive: {
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  backButton: {
    position: "absolute",
    left: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.92)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  price: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0ea5e9",
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(14,165,233,0.10)",
    borderWidth: 1,
    borderColor: "rgba(14,165,233,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  favoriteButtonActive: {
    backgroundColor: "rgba(239,68,68,0.10)",
    borderColor: "rgba(239,68,68,0.35)",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 10,
    lineHeight: 30,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: "#64748b",
    flex: 1,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingVertical: 14,
    marginHorizontal: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  statIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e0f2fe",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
  },
  statLabel: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 2,
  },
  descriptionText: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 22,
  },
  readMoreText: {
    fontSize: 14,
    color: "#0ea5e9",
    fontWeight: "600",
    marginTop: 6,
  },
  infoCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    gap: 10,
  },
  infoLabel: {
    flex: 1,
    fontSize: 14,
    color: "#64748b",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    gap: 10,
  },
  contactButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#0ea5e9",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    minHeight: 44,
  },
  contactButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  appointmentButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#e0f2fe",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    minHeight: 44,
  },
  appointmentButtonText: {
    color: "#0ea5e9",
    fontSize: 12,
    fontWeight: "600",
  },
  offerButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#10b981",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    minHeight: 44,
  },
  offerButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  agentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#f1f5f9",
    borderRadius: 16,
    padding: 12,
  },
  agentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f1f5f9",
  },
  agentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  agentName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
  },
  agentRole: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  noAgentBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  noAgentText: {
    fontSize: 13,
    color: "#64748b",
    fontStyle: "italic",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  primaryBtn: {
    backgroundColor: "#0ea5e9",
  },
  secondaryBtn: {
    backgroundColor: "#e0f2fe",
  },
  removeBtn: {
    backgroundColor: "#ef4444",
  },
  actionBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});
