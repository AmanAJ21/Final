import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
}

export function Card({
  children,
  onPress,
  className = '',
}: CardProps) {
  const { isDark } = useTheme();

  const baseClasses = `rounded-2xl ${
    isDark ? 'bg-gray-800' : 'bg-white'
  } ${className}`;

  if (onPress) {
    return (
      <TouchableOpacity
        className={baseClasses}
        onPress={onPress}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View
      className={baseClasses}
    >
      {children}
    </View>
  );
}