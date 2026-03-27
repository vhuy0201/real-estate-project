import React from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Formik } from 'formik';
import * as Yup from 'yup';
import CustomButton from '../../components/common/CustomButton';
import CustomTextInput from '../../components/common/CustomTextInput';
import { useAuth } from '../../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';

type AuthNavProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Email không hợp lệ')
    .required('Vui lòng nhập email'),
  password: Yup.string()
    .min(6, 'Mật khẩu tối thiểu 6 ký tự')
    .required('Vui lòng nhập mật khẩu'),
});

export default function LoginScreen() {
  const { login, isLoggingIn } = useAuth();
  const navigation = useNavigation<AuthNavProp>();

  const handleLogin = async (values: any) => {
    try {
      await login({ email: values.email, password: values.password });
    } catch (error: any) {
      const errorData = error?.response?.data;

      // Nếu tài khoản chưa xác thực email (Backend trả về 403 và requiresVerification)
      if (error?.response?.status === 403 && errorData?.requiresVerification) {
        navigation.navigate('VerifyEmail', {
          userId: errorData.userId,
          email: values.email,
        });
      }
      // Các lỗi khác đã được handle bởi Alert trong hook useAuth
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
          >
            <View style={styles.wrapper}>

              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.brand}>RealEstate Pro</Text>
                <Text style={styles.subtitle}>
                  Nền tảng mua bán & quản lý bất động sản
                </Text>
              </View>

              {/* Card */}
              <View style={styles.card}>
                <Text style={styles.title}>Đăng nhập</Text>

                <Formik
                  initialValues={{ email: '', password: '' }}
                  validationSchema={LoginSchema}
                  onSubmit={handleLogin}
                >
                  {({
                    handleChange,
                    handleBlur,
                    handleSubmit,
                    values,
                    errors,
                    touched
                  }) => (
                    <View>

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

                      {/* <Text style={styles.forgot}>
                        Quên mật khẩu?
                      </Text> */}

                      <CustomButton
                        title="Đăng nhập"
                        loading={isLoggingIn}
                        onPress={() => handleSubmit()}
                      />
                    </View>
                  )}
                </Formik>
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  Chưa có tài khoản?
                </Text>
                <Text
                  style={styles.link}
                  onPress={() => navigation.navigate('Register')}
                >
                  Đăng ký
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
    marginBottom: 40,
  },
  brand: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1e3a8a', // xanh đậm
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
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    color: '#111827',
  },
  forgot: {
    textAlign: 'right',
    fontSize: 13,
    color: '#2563eb',
    marginTop: 8,
    marginBottom: 16,
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