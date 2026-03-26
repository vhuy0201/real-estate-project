import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from 'react-native';

interface CustomButtonProps extends TouchableOpacityProps {
  title: string;
  outline?: boolean;
  loading?: boolean;
}

export default function CustomButton({
  title,
  outline = false,
  loading = false,
  className = '',
  ...rest
}: CustomButtonProps) {
  const baseStyle = "w-full py-4 rounded-xl flex-row justify-center items-center my-2";
  const primaryStyle = "bg-primary";
  const outlineStyle = "bg-transparent border-2 border-primary";
  const disabledStyle = "opacity-50";

  const textBase = "font-bold text-lg";
  const textPrimary = "text-white";
  const textOutline = "text-primary";

  return (
    <TouchableOpacity
      className={`${baseStyle} ${outline ? outlineStyle : primaryStyle} ${rest.disabled || loading ? disabledStyle : ''} ${className}`}
      disabled={rest.disabled || loading}
      activeOpacity={0.8}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={outline ? '#1d4ed8' : '#fff'} />
      ) : (
        <Text className={`${textBase} ${outline ? textOutline : textPrimary}`}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
