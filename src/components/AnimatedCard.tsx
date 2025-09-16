import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface AnimatedCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
  gradient?: boolean;
  shadow?: boolean;
}

export function AnimatedCard({ 
  children, 
  onPress, 
  className = '', 
  gradient = false,
  shadow = true 
}: AnimatedCardProps) {
  const { isDark } = useTheme();

  const baseClasses = `rounded-2xl ${shadow ? 'shadow-lg' : ''} ${
    gradient 
      ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
      : isDark ? 'bg-gray-800' : 'bg-white'
  } ${className}`;

  if (onPress) {
    return (
      <TouchableOpacity 
        className={baseClasses}
        onPress={onPress}
        activeOpacity={0.95}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View 
      className={baseClasses}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.3 : 0.1,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      {children}
    </View>
  );
}