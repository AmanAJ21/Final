import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export function ComingSoon() {
  const { isDark } = useTheme();

  return (
    <View className="flex-1 items-center justify-center">
      <Ionicons name="construct-outline" size={64} color={isDark ? '#9CA3AF' : '#6B7280'} />
      <Text className={`text-2xl font-bold mt-4 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
        Coming Soon!
      </Text>
      <Text className={`text-lg mt-2 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
        This feature is under construction.
      </Text>
    </View>
  );
}
