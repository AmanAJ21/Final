import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const ActionButton = ({ icon, label, screen, color, isDark }) => {
  const router = useRouter();
  return (
    <TouchableOpacity 
      onPress={() => router.push(screen)}
      className="flex-1 items-center space-y-2"
    >
      <View className={`w-16 h-16 rounded-full items-center justify-center ${isDark ? 'bg-neutral-700' : color}`}>
        <Ionicons name={icon} size={30} color="white" />
      </View>
      <Text className={`font-semibold text-xs ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>{label}</Text>
    </TouchableOpacity>
  );
}

export function QuickActions() {
  const { isDark } = useTheme();

  return (
    <View>
      <Text className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Quick Actions
      </Text>
      <View className="flex-row justify-around">
        <ActionButton icon="add-outline" label="Add" screen="/add-transaction" color="bg-secondary" isDark={isDark} />
        <ActionButton icon="stats-chart-outline" label="Reports" screen="/reports" color="bg-accent" isDark={isDark} />
        <ActionButton icon="wallet-outline" label="Budget" screen="/budget-management" color="bg-primary" isDark={isDark} />
        <ActionButton icon="settings-outline" label="Settings" screen="/settings" color="bg-neutral-500" isDark={isDark} />
      </View>
    </View>
  );
}