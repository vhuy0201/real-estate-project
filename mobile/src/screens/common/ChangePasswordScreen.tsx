import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
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
import CustomTextInput from '../../components/common/CustomTextInput';
import CustomButton from '../../components/common/CustomButton';
import { useProfile } from '../../hooks/useProfile';
import { useNavigation } from '@react-navigation/native';

const ChangePasswordSchema = Yup.object().shape({
  oldPassword: Yup.string().required('Vui lòng nhập mật khẩu hiện tại'),
  newPassword: Yup.string()
    .min(8, 'Mật khẩu mới ít nhất 8 ký tự')
    .required('Vui lòng nhập mật khẩu mới'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Xác nhận mật khẩu không khớp')
    .required('Vui lòng xác nhận mật khẩu mới'),
});

export default function ChangePasswordScreen() {
  const navigation = useNavigation();
  const { changePassword, isChangingPassword } = useProfile();

  const handleChangePassword = async (values: any, { resetForm }: any) => {
    try {
      await changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      resetForm();
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
              <Text style={styles.headerTitle}>Đổi mật khẩu</Text>
              <View style={{ width: 40 }} />
            </View>

            {/* ── Illustration / hint ── */}
            <View style={styles.illustrationSection}>
              <View style={styles.iconCircle}>
                <Ionicons name="shield-checkmark" size={40} color="#1e3a8a" />
              </View>
              <Text style={styles.illustrationTitle}>Bảo mật tài khoản</Text>
              <Text style={styles.illustrationDesc}>
                Mật khẩu mới phải có ít nhất 8 ký tự. Không nên sử dụng mật khẩu cũ.
              </Text>
            </View>

            {/* ── Form ── */}
            <View style={styles.formCard}>
              <Formik
                initialValues={{
                  oldPassword: '',
                  newPassword: '',
                  confirmPassword: '',
                }}
                validationSchema={ChangePasswordSchema}
                onSubmit={handleChangePassword}
              >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                  <View>
                    <CustomTextInput
                      label="Mật khẩu hiện tại"
                      placeholder="Nhập mật khẩu hiện tại"
                      isPassword
                      onChangeText={handleChange('oldPassword')}
                      onBlur={handleBlur('oldPassword')}
                      value={values.oldPassword}
                      error={errors.oldPassword}
                      touched={touched.oldPassword}
                    />

                    <CustomTextInput
                      label="Mật khẩu mới"
                      placeholder="Nhập mật khẩu mới (≥ 8 ký tự)"
                      isPassword
                      onChangeText={handleChange('newPassword')}
                      onBlur={handleBlur('newPassword')}
                      value={values.newPassword}
                      error={errors.newPassword}
                      touched={touched.newPassword}
                    />

                    <CustomTextInput
                      label="Xác nhận mật khẩu mới"
                      placeholder="Nhập lại mật khẩu mới"
                      isPassword
                      onChangeText={handleChange('confirmPassword')}
                      onBlur={handleBlur('confirmPassword')}
                      value={values.confirmPassword}
                      error={errors.confirmPassword}
                      touched={touched.confirmPassword}
                    />

                    {/* ── Tips ── */}
                    <View style={styles.tipsBox}>
                      <Ionicons name="information-circle-outline" size={18} color="#3B82F6" />
                      <View style={styles.tipsContent}>
                        <Text style={styles.tipsTitle}>Mẹo tạo mật khẩu an toàn:</Text>
                        <Text style={styles.tipItem}>• Kết hợp chữ hoa, chữ thường, số</Text>
                        <Text style={styles.tipItem}>• Sử dụng ký tự đặc biệt (@, #, $...)</Text>
                        <Text style={styles.tipItem}>• Không dùng thông tin cá nhân</Text>
                      </View>
                    </View>

                    <CustomButton
                      title="Cập nhật mật khẩu"
                      onPress={() => handleSubmit()}
                      loading={isChangingPassword}
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

  /* ── Illustration ── */
  illustrationSection: {
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: 8,
    marginBottom: 28,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  illustrationTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  illustrationDesc: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
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

  /* ── Tips ── */
  tipsBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    marginTop: 4,
  },
  tipsContent: {
    marginLeft: 10,
    flex: 1,
  },
  tipsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 4,
  },
  tipItem: {
    fontSize: 12,
    color: '#3B82F6',
    lineHeight: 18,
  },
});
