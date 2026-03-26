import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import * as ImagePicker from 'expo-image-picker';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import CustomTextInput from '../../components/common/CustomTextInput';
import CustomButton from '../../components/common/CustomButton';
import { useProfile } from '../../hooks/useProfile';
import { useNavigation } from '@react-navigation/native';

const EditProfileSchema = Yup.object().shape({
  fullName: Yup.string()
    .min(2, 'Họ tên ít nhất 2 ký tự')
    .required('Vui lòng nhập họ tên'),
  phone: Yup.string()
    .matches(/^(0[3|5|7|8|9])+([0-9]{8})$/, 'Số điện thoại không hợp lệ (Phải là số Việt Nam 10 chữ số)')
    .nullable(),
});

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { user } = useSelector((state: RootState) => state.auth);
  const { profile, isLoadingProfile, updateProfile, isUpdatingProfile } = useProfile();
  const [avatarUri, setAvatarUri] = useState<string | undefined>(undefined);

  const currentData = profile || user;
  const firstLetter = currentData?.fullName ? currentData.fullName.charAt(0).toUpperCase() : '?';
  const displayAvatar = avatarUri || currentData?.avatar;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleSave = async (values: any) => {
    try {
      await updateProfile({
        data: {
          fullName: values.fullName,
          phone: values.phone || undefined,
        },
        avatarUri,
      });
      navigation.goBack();
    } catch {
      // Error handled in hook
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* ── Header ── */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={24} color="#1E293B" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Chỉnh sửa hồ sơ</Text>
              <View style={{ width: 40 }} />
            </View>

            {/* ── Avatar picker ── */}
            <View style={styles.avatarContainer}>
              <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
                <View style={styles.avatarWrapper}>
                  {displayAvatar ? (
                    <Image source={{ uri: displayAvatar }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarLetter}>{firstLetter}</Text>
                    </View>
                  )}
                  <View style={styles.cameraOverlay}>
                    <Ionicons name="camera" size={18} color="#FFF" />
                  </View>
                </View>
              </TouchableOpacity>
              <Text style={styles.changePhotoText}>Nhấn để thay đổi ảnh đại diện</Text>
            </View>

            {/* ── Form ── */}
            <View style={styles.formCard}>
              <Formik
                enableReinitialize
                initialValues={{
                  fullName: currentData?.fullName || '',
                  phone: currentData?.phone || '',
                }}
                validationSchema={EditProfileSchema}
                onSubmit={handleSave}
              >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                  <View>
                    <CustomTextInput
                      label="Họ và tên"
                      placeholder="Nhập họ tên"
                      onChangeText={handleChange('fullName')}
                      onBlur={handleBlur('fullName')}
                      value={values.fullName}
                      error={errors.fullName}
                      touched={touched.fullName}
                    />

                    <CustomTextInput
                      label="Số điện thoại"
                      placeholder="VD: 0901234567"
                      keyboardType="phone-pad"
                      onChangeText={handleChange('phone')}
                      onBlur={handleBlur('phone')}
                      value={values.phone}
                      error={errors.phone}
                      touched={touched.phone}
                    />

                    {/* Email (read-only) */}
                    <View style={styles.readOnlyField}>
                      <Text style={styles.readOnlyLabel}>Email</Text>
                      <View style={styles.readOnlyBox}>
                        <Ionicons name="lock-closed" size={16} color="#94A3B8" />
                        <Text style={styles.readOnlyValue}>{currentData?.email}</Text>
                      </View>
                      <Text style={styles.readOnlyHint}>Email không thể thay đổi</Text>
                    </View>

                    <CustomButton
                      title="Lưu thay đổi"
                      onPress={() => handleSubmit()}
                      loading={isUpdatingProfile}
                    />
                  </View>
                )}
              </Formik>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 40,
  },

  /* ── Header ── */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },

  /* ── Avatar ── */
  avatarContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  avatarWrapper: {
    width: 110,
    height: 110,
    borderRadius: 55,
    position: 'relative',
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarLetter: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#1e3a8a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#F8FAFC',
  },
  changePhotoText: {
    marginTop: 10,
    fontSize: 13,
    color: '#64748B',
  },

  /* ── Form card ── */
  formCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },

  /* ── Read-only field ── */
  readOnlyField: {
    marginBottom: 16,
    width: '100%',
  },
  readOnlyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  readOnlyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    height: 52,
  },
  readOnlyValue: {
    flex: 1,
    fontSize: 16,
    color: '#94A3B8',
    marginLeft: 8,
  },
  readOnlyHint: {
    marginTop: 4,
    fontSize: 12,
    color: '#CBD5E1',
  },
});
