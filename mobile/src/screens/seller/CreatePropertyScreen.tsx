import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTaxonomies, useCities, useDistricts, useWards } from '../../hooks/useTaxonomy';
import { useCreateProperty, useGenerateDescription } from '../../hooks/useProperties';
import { SellerAgentTabParamList } from '../../types/navigation';
import CustomButton from '../../components/common/CustomButton';
import CustomTextInput from '../../components/common/CustomTextInput';

type NavigationProp = NativeStackNavigationProp<SellerAgentTabParamList>;

// --- Sub-components for Form Sections ---

const SectionTitle = ({ title, required }: { title: string; required?: boolean }) => (
  <View style={styles.sectionTitleRow}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {required && <Text style={styles.requiredAsterisk}> *</Text>}
  </View>
);

export default function CreatePropertyScreen() {
  const navigation = useNavigation<NavigationProp>();
  const createPropertyMutation = useCreateProperty();
  const generateAIDescription = useGenerateDescription();

  // Queries
  const { data: taxonomies, isLoading: isLoadingTax } = useTaxonomies();
  const { data: cities } = useCities();

  // Form State
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');

  const [categoryId, setCategoryId] = useState('');
  const [typeId, setTypeId] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const [cityId, setCityId] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [wardId, setWardId] = useState('');

  // Dependent queries
  const { data: districts } = useDistricts(cityId);
  const { data: wards } = useWards(districtId);

  // Stats
  const [bedrooms, setBedrooms] = useState('0');
  const [bathrooms, setBathrooms] = useState('0');
  const [floors, setFloors] = useState('1');
  const [floorNumber, setFloorNumber] = useState('');
  const [apartmentNumber, setApartmentNumber] = useState('');
  const [buildingBlock, setBuildingBlock] = useState('');
  const [yearBuilt, setYearBuilt] = useState('');

  // Image Picker
  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newImages = [...images, ...result.assets].slice(0, 10);
      setImages(newImages);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const toggleFeature = (id: string) => {
    setSelectedFeatures(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const resetForm = () => {
    setImages([]);
    setTitle('');
    setDescription('');
    setPrice('');
    setArea('');
    setAddress('');
    setCategoryId('');
    setTypeId('');
    setSelectedFeatures([]);
    setCityId('');
    setDistrictId('');
    setWardId('');
    setBedrooms('0');
    setBathrooms('0');
    setFloors('1');
    setFloorNumber('');
    setApartmentNumber('');
    setBuildingBlock('');
    setYearBuilt('');
  };

  const handleSubmit = async () => {
    if (!title || !price || !area || !cityId || !districtId || !wardId || !categoryId || !typeId) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ các trường bắt buộc (*)');
      return;
    }

    if (images.length === 0) {
      Alert.alert('Thiếu hình ảnh', 'Vui lòng chọn ít nhất 1 hình ảnh');
      return;
    }

    const formData = new FormData();

    // Add images
    images.forEach((img, index) => {
      const uriParts = img.uri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      formData.append('images', {
        uri: Platform.OS === 'ios' ? img.uri.replace('file://', '') : img.uri,
        name: `photo_${index}.${fileType}`,
        type: `image/${fileType}`,
      } as any);
    });

    // Add other fields
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('area', area);
    formData.append('address', address);
    formData.append('city_id', cityId);
    formData.append('district_id', districtId);
    formData.append('ward_id', wardId);
    formData.append('category_id', categoryId);
    formData.append('type_id', typeId);
    formData.append('bedrooms', bedrooms);
    formData.append('bathrooms', bathrooms);
    formData.append('floors', floors);
    if (floorNumber) formData.append('floor_number', floorNumber);
    if (apartmentNumber) formData.append('apartment_number', apartmentNumber);
    if (buildingBlock) formData.append('building_block', buildingBlock);
    if (yearBuilt) formData.append('yearBuilt', yearBuilt);

    selectedFeatures.forEach(f => formData.append('features', f));

    try {
      await createPropertyMutation.mutateAsync(formData);
      
      // Clear form on success
      resetForm();

      Alert.alert('Thành công', 'Đã đăng tin bất động sản thành công. Tin của bạn đang chờ phê duyệt.', [
        { 
          text: 'OK', 
          onPress: () => navigation.navigate('MyProperties' as any) 
        }
      ]);
    } catch (err: any) {
      // Form data is kept on error
      Alert.alert('Lỗi', err.response?.data?.message || 'Có lỗi xảy ra khi đăng tin');
    }
  };

  const handleGenerateAI = async () => {
    if (!title || !price || !area || !categoryId || !typeId || !cityId || !districtId || !wardId) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tiêu đề, giá, diện tích và vị trí để AI có thể tạo mô tả chính xác nhất.');
      return;
    }

    // Resolve Names
    const category_name = taxonomies?.categories?.find((c: any) => c._id === categoryId)?.category_name?.vi || '';
    const type_name = taxonomies?.propertyTypes?.find((t: any) => t._id === typeId)?.type_name?.vi || '';
    const city_name = cities?.find((c: any) => c._id === cityId)?.city_name?.vi || '';
    const district_name = districts?.find((d: any) => d._id === districtId)?.district_name?.vi || '';
    const ward_name = wards?.find((w: any) => w._id === wardId)?.ward_name?.vi || '';
    const features_names = selectedFeatures.map(id => taxonomies?.features?.find((f: any) => f._id === id)?.feature_name?.vi).filter(Boolean);

    const data = {
      title,
      price,
      area,
      category_name,
      type_name,
      city_name,
      district_name,
      ward_name,
      address,
      bedrooms,
      bathrooms,
      features_names,
      floor_number: floorNumber,
      building_block: buildingBlock,
      apartment_number: apartmentNumber
    };

    try {
      const result = await generateAIDescription.mutateAsync(data);
      if (result?.data?.description) {
        setDescription(result.data.description);
      }
    } catch (error: any) {
      Alert.alert('Lỗi', 'Không thể tạo mô tả tự động. Vui lòng thử lại sau.');
    }
  };

  if (isLoadingTax) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0ea5e9" />
        <Text style={styles.loadingText}>Đang tải dữ liệu danh mục...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Đăng Tin Mới</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Images Section */}
          <SectionTitle title="Hình ảnh (Tối đa 10 ảnh)" required />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
            {images.map((img, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri: img.uri }} style={styles.pickedImage} />
                <Pressable onPress={() => removeImage(index)} style={styles.removeImageBtn}>
                  <Ionicons name="close" size={16} color="#fff" />
                </Pressable>
              </View>
            ))}
            {images.length < 10 && (
              <Pressable onPress={pickImages} style={styles.addImageBtn}>
                <Ionicons name="camera-outline" size={32} color="#94a3b8" />
                <Text style={styles.addImageText}>Thêm ảnh</Text>
              </Pressable>
            )}
          </ScrollView>

          {/* Basic Info Section */}
          <SectionTitle title="Thông tin cơ bản" required />
          <CustomTextInput
            label="Tiêu đề"
            placeholder="Ví dụ: Căn hộ cao cấp Vinhomes 2PN"
            value={title}
            onChangeText={setTitle}
            touched={true}
          />
          <View style={styles.aiHeader}>
            <Text style={styles.fieldLabel}>Mô tả</Text>
            <Pressable 
              onPress={handleGenerateAI} 
              style={({ pressed }) => [styles.aiBtn, pressed && styles.aiBtnPressed]}
              disabled={generateAIDescription.isPending}
            >
              {generateAIDescription.isPending ? (
                <ActivityIndicator size="small" color="#0ea5e9" />
              ) : (
                <>
                  <Ionicons name="sparkles" size={16} color="#0ea5e9" />
                  <Text style={styles.aiBtnText}>AI Gợi ý mô tả</Text>
                </>
              )}
            </Pressable>
          </View>
          <CustomTextInput
            label=""
            placeholder="Mô tả chi tiết về bất động sản.."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <CustomTextInput
                label="Giá (VNĐ)"
                placeholder="0"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                touched={true}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <CustomTextInput
                label="Diện tích (m²)"
                placeholder="0"
                value={area}
                onChangeText={setArea}
                keyboardType="numeric"
                touched={true}
              />
            </View>
          </View>

          {/* Taxonomy Section */}
          <SectionTitle title="Phân loại" required />
          
          <Text style={styles.fieldLabel}>Hình thức (Bán / Cho thuê)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.choiceScroll}>
            {taxonomies?.propertyTypes?.map((type: any) => (
              <Pressable
                key={type._id}
                onPress={() => setTypeId(type._id)}
                style={[styles.chip, typeId === type._id && styles.chipSelected]}
              >
                <Text style={[styles.chipText, typeId === type._id && styles.chipTextSelected]}>
                  {type.type_name?.vi || type.type_name?.en}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={styles.fieldLabel}>Danh mục bất động sản</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.choiceScroll}>
            {taxonomies?.categories?.map((cat: any) => (
              <Pressable
                key={cat._id}
                onPress={() => setCategoryId(cat._id)}
                style={[styles.chip, categoryId === cat._id && styles.chipSelected]}
              >
                <Text style={[styles.chipText, categoryId === cat._id && styles.chipTextSelected]}>
                  {cat.category_name?.vi || cat.category_name?.en}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Location Section */}
          <SectionTitle title="Vị trí" required />

          <Text style={styles.fieldLabel}>Tỉnh / Thành phố</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.choiceScroll}>
            {cities?.map((city: any) => (
              <Pressable
                key={city._id}
                onPress={() => {
                  setCityId(city._id);
                  setDistrictId('');
                  setWardId('');
                }}
                style={[styles.chip, cityId === city._id && styles.chipSelected]}
              >
                <Text style={[styles.chipText, cityId === city._id && styles.chipTextSelected]}>
                  {city.city_name?.vi || city.city_name?.en}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {cityId !== '' && (
            <>
              <Text style={styles.fieldLabel}>Quận / Huyện</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.choiceScroll}>
                {districts?.map((d: any) => (
                  <Pressable
                    key={d._id}
                    onPress={() => {
                      setDistrictId(d._id);
                      setWardId('');
                    }}
                    style={[styles.chip, districtId === d._id && styles.chipSelected]}
                  >
                    <Text style={[styles.chipText, districtId === d._id && styles.chipTextSelected]}>
                      {d.district_name?.vi || d.district_name?.en}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </>
          )}

          {districtId !== '' && (
            <>
              <Text style={styles.fieldLabel}>Phường / Xã</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.choiceScroll}>
                {wards?.map((w: any) => (
                  <Pressable
                    key={w._id}
                    onPress={() => setWardId(w._id)}
                    style={[styles.chip, wardId === w._id && styles.chipSelected]}
                  >
                    <Text style={[styles.chipText, wardId === w._id && styles.chipTextSelected]}>
                      {w.ward_name?.vi || w.ward_name?.en}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </>
          )}

          <CustomTextInput
            label="Địa chỉ chi tiết"
            placeholder="Số nhà, tên đường..."
            value={address}
            onChangeText={setAddress}
            touched={true}
          />

          {/* Stats Section */}
          <SectionTitle title="Thông số chi tiết" />
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <CustomTextInput
                label="Số phòng ngủ"
                value={bedrooms}
                onChangeText={setBedrooms}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <CustomTextInput
                label="Số phòng tắm"
                value={bathrooms}
                onChangeText={setBathrooms}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <CustomTextInput
                label="Số tầng"
                value={floors}
                onChangeText={setFloors}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <CustomTextInput
                label="Năm xây dựng"
                value={yearBuilt}
                onChangeText={setYearBuilt}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <CustomTextInput
                label="Tầng số"
                value={floorNumber}
                onChangeText={setFloorNumber}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <CustomTextInput
                label="Mã căn hộ"
                value={apartmentNumber}
                onChangeText={setApartmentNumber}
              />
            </View>
          </View>

          {/* Features Section */}
          <SectionTitle title="Tiện ích" />
          <View style={styles.featuresGrid}>
            {taxonomies?.features?.map((feat: any) => (
              <Pressable
                key={feat._id}
                onPress={() => toggleFeature(feat._id)}
                style={[
                  styles.featureItem,
                  selectedFeatures.includes(feat._id) && styles.featureItemSelected
                ]}
              >
                <Ionicons
                  name={selectedFeatures.includes(feat._id) ? "checkbox" : "square-outline"}
                  size={20}
                  color={selectedFeatures.includes(feat._id) ? "#0ea5e9" : "#94a3b8"}
                />
                <Text style={[
                  styles.featureText,
                  selectedFeatures.includes(feat._id) && styles.featureTextSelected
                ]}>
                  {feat.feature_name?.vi || feat.feature_name?.en}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={{ height: 40 }} />

          <CustomButton
            title="Đăng Tin Ngay"
            onPress={handleSubmit}
            loading={createPropertyMutation.isPending}
            disabled={createPropertyMutation.isPending}
            style={{ marginBottom: 40 }}
          />

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  loadingText: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 15,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  requiredAsterisk: {
    color: '#ef4444',
    fontSize: 18,
    fontWeight: '700',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  aiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  aiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  aiBtnPressed: {
    backgroundColor: '#e0f2fe',
  },
  aiBtnText: {
    fontSize: 12,
    color: '#0ea5e9',
    fontWeight: '700',
  },

  // Images
  imageScroll: {
    marginBottom: 20,
  },
  imageWrapper: {
    marginRight: 12,
    position: 'relative',
  },
  pickedImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  removeImageBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#ef4444',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  addImageBtn: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#f1f5f9',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  addImageText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    fontWeight: '600',
  },

  // Row
  row: {
    flexDirection: 'row',
  },

  // Choices (listing type, chips)
  listingTypeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  choiceBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  choiceBtnSelected: {
    borderColor: '#0ea5e9',
    backgroundColor: '#e0f2fe',
  },
  choiceText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
  },
  choiceTextSelected: {
    color: '#0369a1',
  },

  choiceScroll: {
    marginBottom: 18,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chipSelected: {
    backgroundColor: '#0ea5e9',
    borderColor: '#0ea5e9',
  },
  chipText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },

  // Features
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 10,
  },
  featureItemSelected: {
    borderColor: '#0ea5e9',
    backgroundColor: '#e0f2fe',
  },
  featureText: {
    fontSize: 13,
    color: '#475569',
    flex: 1,
  },
  featureTextSelected: {
    color: '#0369a1',
    fontWeight: '600',
  },
});
