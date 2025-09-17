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

  const baseClasses = `rounded-3xl ${
    isDark ? 'bg-neutral-800' : 'bg-white'
  } ${className}`;

  const hasPadding = className.includes('p-') || className.includes('px-') || className.includes('py-');

  if (onPress) {
    return (
      <TouchableOpacity
        className={`${baseClasses} ${!hasPadding ? 'p-5' : ''}`}
        onPress={onPress}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View
      className={`${baseClasses} ${!hasPadding ? 'p-5' : ''}`}
    >
      {children}
    </View>
  );
}