import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { useTransactions } from '../contexts/TransactionContext';
import { Ionicons } from '@expo/vector-icons';

export function BalanceCard() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { balance, totalIncome, totalExpense } = useTransactions();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <View className={`rounded-3xl ${isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-500 to-purple-600'} shadow-lg`}>
      {/* Main Balance Section */}
      <View className="p-6">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-white/80 text-sm font-medium">
            Total Balance
          </Text>
          <TouchableOpacity onPress={() => router.push('/statistics')}>
            <Ionicons name="stats-chart" size={20} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        </View>
        
        <Text className={`text-4xl font-bold text-white mb-6`}>
          {formatCurrency(balance)}
        </Text>
        
        {/* Income/Expense Row */}
        <View className="flex-row justify-between">
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <View className="w-2 h-2 rounded-full bg-green-400 mr-2" />
              <Text className="text-white/70 text-xs font-medium">Income</Text>
            </View>
            <Text className="text-white font-semibold text-lg">
              {formatCurrency(totalIncome)}
            </Text>
          </View>
          
          <View className="flex-1 items-end">
            <View className="flex-row items-center mb-1">
              <View className="w-2 h-2 rounded-full bg-red-400 mr-2" />
              <Text className="text-white/70 text-xs font-medium">Expenses</Text>
            </View>
            <Text className="text-white font-semibold text-lg">
              {formatCurrency(totalExpense)}
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Action Buttons */}
      <View className={`flex-row ${isDark ? 'bg-gray-800/50' : 'bg-black/10'} rounded-b-3xl`}>
        <TouchableOpacity 
          onPress={() => router.push('/add-transaction?type=income')}
          className="flex-1 flex-row items-center justify-center py-4"
        >
          <Ionicons name="add-circle" size={18} color="rgba(255,255,255,0.9)" />
          <Text className="text-white/90 font-medium ml-2">Add Income</Text>
        </TouchableOpacity>
        
        <View className="w-px bg-white/20" />
        
        <TouchableOpacity 
          onPress={() => router.push('/add-transaction?type=expense')}
          className="flex-1 flex-row items-center justify-center py-4"
        >
          <Ionicons name="remove-circle" size={18} color="rgba(255,255,255,0.9)" />
          <Text className="text-white/90 font-medium ml-2">Add Expense</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}