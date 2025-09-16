import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export function QuickActions() {
  const router = useRouter();
  const { isDark } = useTheme();

  return (
    <View>
      <Text className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Quick Actions
      </Text>
      
      <TouchableOpacity
        onPress={() => router.push('/statistics')}
        className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg"
      >
        <View className="flex-row items-center justify-between mb-2">
          <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
            <Ionicons name="bar-chart" size={20} color="white" />
          </View>
          <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.7)" />
        </View>
        
        <Text className="text-white font-semibold text-base mb-1">
          Analytics & Reports
        </Text>
        <Text className="text-white/70 text-sm">
          View detailed spending insights and trends
        </Text>
      </TouchableOpacity>
    </View>
  );
}