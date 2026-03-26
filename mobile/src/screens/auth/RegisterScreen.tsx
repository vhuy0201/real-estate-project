import React from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Formik } from 'formik';
import * as Yup from 'yup';
import CustomButton from '../../components/common/CustomButton';
import CustomTextInput from '../../components/common/CustomTextInput';
import { useAuth } from '../../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';

const RegisterSchema = Yup.object().shape({
  fullName: Yup.string().required('Vui lòng nhập họ tên'),
  email: Yup.string()
    .email('Email không hợp lệ')
    .required('Vui lòng nhập email'),
  password: Yup.string()
    .min(8, 'Mật khẩu tối thiểu 8 ký tự (giống yêu cầu server)')
    .required('Vui lòng nhập mật khẩu'),
  role: Yup.string().oneOf(['buyer', 'agent', 'seller']).required('Vui lòng chọn vai trò'),
});

export default function RegisterScreen() {
  const { register, isRegistering } = useAuth();
  const navigation = useNavigation<any>();

  const handleRegister = async (values: any) => {
    try {
      const response = await register({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        role: values.role
      });
      
      // Backend (SuccessResponse): { success: true, data: { userId, email } }
      const userId = response?.data?.userId || response?.userId;

      if (!userId) {
        console.error('Registration Response:', response);
        throw new Error('Không lấy được mã người dùng từ hệ thống.');
      }

      navigation.navigate('VerifyEmail', {
        userId: userId,
        email: values.email
      });
    } catch (error) {
      // Lỗi sẽ được hiển thị qua Alert trong hook useAuth
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
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.wrapper}>

              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.brand}>Tạo Tài Khoản ✨</Text>
                <Text style={styles.subtitle}>Đăng ký để bắt đầu trải nghiệm</Text>
              </View>

              {/* Card */}
              <View style={styles.card}>
                <Formik
                  initialValues={{ fullName: '', email: '', password: '', role: 'buyer' }}
                  validationSchema={RegisterSchema}
                  onSubmit={handleRegister}
                >
                  {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                    <View>
                      <CustomTextInput
                        label="Họ và tên"
                        placeholder="Nhập họ tên của bạn"
                        autoCapitalize="words"
                        onChangeText={handleChange('fullName')}
                        onBlur={handleBlur('fullName')}
                        value={values.fullName}
                        error={errors.fullName}
                        touched={touched.fullName}
                      />

                      <CustomTextInput
                        label="Email"
                        placeholder="Nhập email của bạn"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        onChangeText={handleChange('email')}
                        onBlur={handleBlur('email')}
                        value={values.email}
                        error={errors.email}
                        touched={touched.email}
                      />

                      <CustomTextInput
                        label="Mật khẩu"
                        placeholder="Nhập mật khẩu"
                        isPassword
                        onChangeText={handleChange('password')}
                        onBlur={handleBlur('password')}
                        value={values.password}
                        error={errors.password}
                        touched={touched.password}
                      />

                      <View style={styles.roleContainer}>
                        <Text style={styles.label}>Bạn đăng ký với vai trò:</Text>
                        <View style={styles.roleOptions}>
                          <TouchableOpacity
                            onPress={() => handleChange('role')('buyer')}
                            style={[
                              styles.roleItem,
                              values.role === 'buyer' && styles.roleActive
                            ]}
                            activeOpacity={0.7}
                          >
                            <View style={[
                              styles.radio,
                              values.role === 'buyer' && styles.radioActive
                            ]}>
                              {values.role === 'buyer' && <View style={styles.radioInner} />}
                            </View>
                            <Text style={[
                              styles.roleText,
                              values.role === 'buyer' && styles.roleTextActive
                            ]}>Người mua</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => handleChange('role')('seller')}
                            style={[
                              styles.roleItem,
                              values.role === 'seller' && styles.roleActive
                            ]}
                            activeOpacity={0.7}
                          >
                            <View style={[
                              styles.radio,
                              values.role === 'seller' && styles.radioActive
                            ]}>
                              {values.role === 'seller' && <View style={styles.radioInner} />}
                            </View>
                            <Text style={[
                              styles.roleText,
                              values.role === 'seller' && styles.roleTextActive
                            ]}>Người bán</Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View style={{ marginTop: 10 }}>
                        <CustomButton
                          title="Đăng ký"
                          loading={isRegistering}
                          onPress={() => handleSubmit()}
                        />
                      </View>
                    </View>
                  )}
                </Formik>
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>Đã có tài khoản? </Text>
                <Text
                  style={styles.link}
                  onPress={() => navigation.goBack()}
                >
                  Đăng nhập
                </Text>
              </View>

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
    backgroundColor: '#ffffff',
  },
  scroll: {
    flexGrow: 1,
  },
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    marginBottom: 32,
  },
  brand: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e3a8a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  roleContainer: {
    marginBottom: 20,
    marginTop: 10,
  },
  roleOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  roleItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
  },
  roleActive: {
    borderColor: '#1e3a8a',
    backgroundColor: '#eff6ff',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioActive: {
    borderColor: '#1e3a8a',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1e3a8a',
  },
  roleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  roleTextActive: {
    color: '#1e3a8a',
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#6b7280',
  },
  link: {
    color: '#1e3a8a',
    fontWeight: '700',
    marginLeft: 4,
  },
});
