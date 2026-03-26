import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CustomTextInputProps extends TextInputProps {
  label: string;
  error?: string;
  touched?: boolean;
  isPassword?: boolean;
}

export default function CustomTextInput({
  label,
  error,
  touched,
  isPassword,
  ...rest
}: CustomTextInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [hidePassword, setHidePassword] = useState(isPassword);

  const hasError = error && touched;

  return (
    <View style={styles.container}>
      {/* Label */}
      <Text style={styles.label}>{label}</Text>

      {/* Input Box */}
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.focused,
          hasError && styles.errorBorder,
          rest.multiline && { height: undefined, minHeight: 100, alignItems: 'flex-start', paddingTop: 8 }
        ]}
      >
        <TextInput
          style={[
            styles.input,
            rest.multiline && { textAlignVertical: 'top' }
          ]}
          secureTextEntry={hidePassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor="#9ca3af"
          {...rest}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setHidePassword(!hidePassword)}
            style={styles.icon}
          >
            <Ionicons
              name={hidePassword ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color="#6b7280"
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Error */}
      {hasError && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',

    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,

    backgroundColor: '#f9fafb',

    paddingHorizontal: 12,

    height: 52, // ✅ FIX QUAN TRỌNG (không bị cắt)
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',

    height: '100%', // ✅ đảm bảo full chiều cao
    paddingVertical: 0, // ✅ tránh bị lệch text
  },
  icon: {
    marginLeft: 8,
  },
  focused: {
    borderColor: '#1e3a8a', // xanh đậm (real estate vibe)
    backgroundColor: '#fff',
  },
  errorBorder: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  errorText: {
    marginTop: 4,
    color: '#ef4444',
    fontSize: 13,
  },
});