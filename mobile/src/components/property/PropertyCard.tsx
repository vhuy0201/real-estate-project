import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Property } from '../../types/property';

interface Props {
  property: Property;
  onPress: () => void;
  isFavorite?: boolean;
  isFavoriteLoading?: boolean;
  onToggleFavorite?: () => void;
}

export default function PropertyCard({
  property,
  onPress,
  isFavorite = false,
  isFavoriteLoading = false,
  onToggleFavorite,
}: Props) {
  const imageUrl = property.images && property.images.length > 0
    ? property.images[0]
    : 'https://via.placeholder.com/400x300?text=No+Image';

  const imageCount = property.images?.length || 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      {/* Image with overlay badge */}
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={200}
          placeholder={{ blurhash: 'LKO2:N%2Tw=w]~RBVZRi};RPxuwH' }}
        />
        {/* Image count */}
        {imageCount > 1 && (
          <View style={styles.imageCountBadge}>
            <Ionicons name="images-outline" size={12} color="#fff" />
            <Text style={styles.imageCountText}>{imageCount}</Text>
          </View>
        )}

        {onToggleFavorite && (
          <Pressable
            style={[
              styles.favoriteButton,
              isFavorite && styles.favoriteButtonActive,
            ]}
            onPress={(event) => {
              event.stopPropagation();
              if (!isFavoriteLoading) onToggleFavorite();
            }}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="toggle-favorite"
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={18}
              color={isFavorite ? '#ef4444' : '#0ea5e9'}
            />
          </Pressable>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title & Price */}
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {property.title?.vi || 'Chưa có tiêu đề'}
          </Text>
          <Text style={styles.price}>
            {property.price?.toLocaleString('vi-VN')} ₫
          </Text>
        </View>

        {/* Address */}
        <View style={styles.addressRow}>
          <Ionicons name="location-sharp" size={14} color="#0ea5e9" />
          <Text style={styles.address} numberOfLines={1}>
            {property.address?.vi || 'Chưa cập nhật'}
          </Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statChip}>
            <Ionicons name="bed-outline" size={14} color="#64748b" />
            <Text style={styles.statText}>{property.bedrooms || 0} PN</Text>
          </View>
          <View style={styles.statChip}>
            <Ionicons name="water-outline" size={14} color="#64748b" />
            <Text style={styles.statText}>{property.bathrooms || 0} PT</Text>
          </View>
          <View style={styles.statChip}>
            <Ionicons name="resize-outline" size={14} color="#64748b" />
            <Text style={styles.statText}>{property.area || 0} {property.unit || 'm²'}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 190,
  },
  statusOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(239,68,68,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusOverlayText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  imageCountBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  imageCountText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(14,165,233,0.25)',
  },
  favoriteButtonActive: {
    borderColor: 'rgba(239,68,68,0.40)',
    backgroundColor: 'rgba(255,245,245,0.97)',
  },
  content: {
    padding: 14,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
    marginRight: 10,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0ea5e9',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  address: {
    fontSize: 13,
    color: '#64748b',
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
});
