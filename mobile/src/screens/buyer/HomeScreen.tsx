import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useProperties } from '../../hooks/useProperties';
import { useTaxonomies } from '../../hooks/useTaxonomy';
import PropertyCard from '../../components/property/PropertyCard';
import { Property } from '../../types/property';
import { RootStackParamList } from '../../types/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useMyFavorites, useFavoriteMutations } from '../../hooks/useFavorites';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

// --- Sub-component: Header (Tách ra để tránh re-render gây mất focus ô input) ---
interface HeaderProps {
  user: any;
  tempSearch: string;
  setTempSearch: (text: string) => void;
  handleSearch: () => void;
  selectedCat: string;
  setSelectedCat: (id: string) => void;
  categories: any[];
  navigation: any;
}

const HomeHeader = React.memo(({
  user,
  tempSearch,
  setTempSearch,
  handleSearch,
  selectedCat,
  setSelectedCat,
  categories,
  navigation
}: HeaderProps) => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>Chào mừng quay lại,</Text>
          <Text style={styles.userName}>{user?.fullName || 'Khách'}</Text>
        </View>
        <Pressable style={styles.avatarBtn} onPress={() => navigation.navigate('Profile')}>
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={20} color="#fff" />
          </View>
        </Pressable>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color="#94a3b8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm khu vực, dự án..."
          value={tempSearch}
          onChangeText={setTempSearch}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <Pressable onPress={handleSearch}>
          <Ionicons name="arrow-forward-circle" size={28} color="#0ea5e9" />
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
        <Pressable
          onPress={() => setSelectedCat('all')}
          style={[styles.catItem, selectedCat === 'all' && styles.catItemActive]}
        >
          <Ionicons
            name="grid-outline"
            size={18}
            color={selectedCat === 'all' ? '#fff' : '#64748b'}
          />
          <Text style={[styles.catText, selectedCat === 'all' && styles.catTextActive]}>
            Tất cả
          </Text>
        </Pressable>

        {categories.map((cat: any) => (
          <Pressable
            key={cat._id}
            onPress={() => setSelectedCat(cat._id)}
            style={[styles.catItem, selectedCat === cat._id && styles.catItemActive]}
          >
            <Ionicons
              name={cat.category_name.vi.includes('Căn hộ') ? 'business-outline' :
                cat.category_name.vi.includes('Biệt thự') ? 'home-outline' : 'map-outline'}
              size={18}
              color={selectedCat === cat._id ? '#fff' : '#64748b'}
            />
            <Text style={[styles.catText, selectedCat === cat._id && styles.catTextActive]}>
              {cat.category_name.vi}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Bất động sản nổi bật</Text>
        <Pressable><Text style={styles.seeAll}>Xem tất cả</Text></Pressable>
      </View>
    </View>
  );
});

export default function HomeScreen() {
  const navigation = useNavigation<NavProp>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: favoritesData } = useMyFavorites();
  const { addFavorite, removeFavorite } = useFavoriteMutations();

  // States
  const [selectedCat, setSelectedCat] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [tempSearch, setTempSearch] = useState('');

  // Taxonomies
  const { data: taxData } = useTaxonomies();
  const categories = (taxData as any)?.categories || [];

  // Properties với Infinite Scroll
  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useProperties({
    limit: 6,
    category: selectedCat === 'all' ? undefined : selectedCat,
    keyword: searchKeyword || undefined
  });

  // Xử lý dữ liệu phẳng từ các trang
  const properties = useMemo(() => {
    return data?.pages.flatMap(page => (page as any).data) as Property[] || [];
  }, [data]);

  const favoriteIdSet = useMemo(() => {
    const ids = (favoritesData?.properties ?? []).map((item) => item.id);
    return new Set(ids.filter(Boolean));
  }, [favoritesData]);

  const handlePropertyPress = useCallback((property: Property) => {
    navigation.navigate('PropertyDetails', {
      propertyId: property.id || property._id || '',
    });
  }, [navigation]);

  const handleSearch = useCallback(() => {
    setSearchKeyword(tempSearch);
    // useInfiniteQuery sẽ tự động refetch khi searchKeyword (dependency trong queryKey) thay đổi
  }, [tempSearch]);

  const handleToggleFavorite = useCallback(
    async (property: Property) => {
      const propertyId = property.id || property._id || '';
      if (!propertyId) return;

      const wasFavorite = favoriteIdSet.has(propertyId);

      try {
        if (addFavorite.isPending || removeFavorite.isPending) return;

        if (favoriteIdSet.has(propertyId)) {
          await removeFavorite.mutateAsync(propertyId);
        } else {
          await addFavorite.mutateAsync(propertyId);
        }

        Alert.alert(
          "Thành công",
          wasFavorite
            ? "Đã xóa khỏi yêu thích"
            : "Đã thêm vào yêu thích",
        );
      } catch (err: any) {
        Alert.alert(
          'Lỗi',
          err?.message || 'Không thể cập nhật yêu thích. Vui lòng thử lại.',
        );
      }
    },
    [addFavorite, removeFavorite, favoriteIdSet],
  );

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderFooter = () => (
    <View style={styles.footer}>
      {isFetchingNextPage ? (
        <ActivityIndicator size="small" color="#0ea5e9" style={{ marginBottom: 20 }} />
      ) : (properties?.length ?? 0) > 0 ? (
        <>
          <View style={styles.footerLine} />
          <Text style={styles.footerText}>© 2024 RealEstate Pro Interface</Text>
          <View style={styles.socialIcons}>
            <Ionicons name="logo-facebook" size={20} color="#94a3b8" style={{ marginRight: 15 }} />
            <Ionicons name="logo-instagram" size={20} color="#94a3b8" style={{ marginRight: 15 }} />
            <Ionicons name="logo-twitter" size={20} color="#94a3b8" />
          </View>
          <Text style={styles.footerSubtitle}>Nền tảng bất động sản hàng đầu Việt Nam</Text>
        </>
      ) : null}
    </View>
  );

  if (isLoading && !isRefetching) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={properties}
        keyExtractor={(item, index) => item.id || item._id || `prop-${index}`}
        renderItem={({ item }) => (
          <PropertyCard
            property={item}
            onPress={() => handlePropertyPress(item)}
            isFavorite={favoriteIdSet.has(item.id || item._id || '')}
            isFavoriteLoading={addFavorite.isPending || removeFavorite.isPending}
            onToggleFavorite={() => handleToggleFavorite(item)}
          />
        )}
        ListHeaderComponent={
          <HomeHeader
            user={user}
            tempSearch={tempSearch}
            setTempSearch={setTempSearch}
            handleSearch={handleSearch}
            selectedCat={selectedCat}
            setSelectedCat={setSelectedCat}
            categories={categories}
            navigation={navigation}
          />
        }
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#0ea5e9"
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="home-outline" size={60} color="#e2e8f0" />
            <Text style={styles.emptyText}>
              {isError ? 'Có lỗi xảy ra khi tải dữ liệu.' : 'Hiện chưa có bất động sản nào phù hợp.'}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  headerContainer: {
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: '#64748b',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
  },
  avatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#0ea5e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#1e293b',
    paddingVertical: 8,
  },
  catScroll: {
    paddingLeft: 20,
    marginBottom: 25,
  },
  catItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  catItemActive: {
    backgroundColor: '#0ea5e9',
    borderColor: '#0ea5e9',
  },
  catText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  catTextActive: {
    color: '#fff',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  seeAll: {
    fontSize: 14,
    color: '#0ea5e9',
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 40,
  },
  emptyContainer: {
    paddingVertical: 100,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    marginTop: 16,
    color: '#94a3b8',
    textAlign: 'center',
    fontSize: 15,
  },
  footer: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  footerLine: {
    width: '100%',
    height: 1,
    backgroundColor: '#f1f5f9',
    marginBottom: 20,
  },
  footerText: {
    color: '#94a3b8',
    fontSize: 13,
    marginBottom: 10,
  },
  footerSubtitle: {
    color: '#cbd5e1',
    fontSize: 11,
    marginTop: 10,
  },
  socialIcons: {
    flexDirection: 'row',
    marginTop: 5,
  },
});

