import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { useTransactions } from '../contexts/TransactionContext';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../utils/formatCurrency';

export function BalanceCard() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { balance, totalIncome, totalExpense } = useTransactions();

  return (
    <View className={`rounded-3xl shadow-lg ${isDark ? 'bg-neutral-800' : 'bg-primary'}`}>
      <View className="p-6">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-white/80 text-sm font-medium">
            Total Balance
          </Text>
          <TouchableOpacity onPress={() => router.push('/statistics')}>
            <Ionicons name="stats-chart-outline" size={20} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        </View>
        
        <Text className={`text-4xl font-bold text-white mb-6`}>
          {formatCurrency(balance)}
        </Text>
        
        <View className="flex-row justify-between">
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <Ionicons name="arrow-down-outline" size={16} color="#10B981" />
              <Text className="text-white/70 text-xs font-medium ml-1">Income</Text>
            </View>
            <Text className="text-white font-semibold text-lg">
              {formatCurrency(totalIncome)}
            </Text>
          </View>
          
          <View className="flex-1 items-end">
            <View className="flex-row items-center mb-1">
              <Ionicons name="arrow-up-outline" size={16} color="#F59E0B" />
              <Text className="text-white/70 text-xs font-medium ml-1">Expenses</Text>
            </View>
            <Text className="text-white font-semibold text-lg">
              {formatCurrency(totalExpense)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}