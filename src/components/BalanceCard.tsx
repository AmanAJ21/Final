import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { useTransactions } from '../contexts/TransactionContext';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../utils/formatCurrency';
import { LinearGradient } from 'expo-linear-gradient';

export function BalanceCard() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { balance, totalIncome, totalExpense } = useTransactions();

  const lightColors = ['#4c669f', '#3b5998', '#192f6a'];
  const darkColors = ['#0f172a', '#1e293b', '#334155'];

  return (
    <View className="rounded-4xl shadow-lg overflow-hidden">
      <LinearGradient
        colors={isDark ? darkColors : lightColors}
        className="p-8"
      >
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-white/80 text-sm font-medium">
            Total Balance
          </Text>
          <TouchableOpacity onPress={() => router.push('/statistics')}>
            <Ionicons name="stats-chart-outline" size={24} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        </View>
        
        <Text className={`text-4xl font-bold text-white mb-8`}>
          {formatCurrency(balance)}
        </Text>
        
        <View className="flex-row justify-between">
          <View className="flex-1 space-y-2">
            <View className="flex-row items-center space-x-2">
              <Ionicons name="arrow-down-outline" size={18} color="#10B981" />
              <Text className="text-white/70 text-sm font-medium">Income</Text>
            </View>
            <Text className="text-white font-semibold text-lg">
              {formatCurrency(totalIncome)}
            </Text>
          </View>
          
          <View className="flex-1 items-end space-y-2">
            <View className="flex-row items-center space-x-2">
              <Ionicons name="arrow-up-outline" size={18} color="#F59E0B" />
              <Text className="text-white/70 text-sm font-medium">Expenses</Text>
            </View>
            <Text className="text-white font-semibold text-lg">
              {formatCurrency(totalExpense)}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}