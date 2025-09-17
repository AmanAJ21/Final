import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '../Card';
import { useTheme } from '../../contexts/ThemeContext';

type StatisticsCardProps = {
  stats: {
    total: number;
    income: number;
    expense: number;
    totalAmount: number;
  };
  formatCurrency: (amount: number) => string;
};

export function StatisticsCard({ stats, formatCurrency }: StatisticsCardProps) {
  const { isDark } = useTheme();

  return (
    <Card className="mx-4 mt-6">
      <Text className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Data Overview
      </Text>

      <View className="flex-row justify-between items-center mb-3">
        <Text className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Total Transactions</Text>
        <Text className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total}</Text>
      </View>

      <View className="flex-row justify-between items-center mb-3">
        <Text className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Income Transactions</Text>
        <Text className="font-semibold text-green-500">{stats.income}</Text>
      </View>

      <View className="flex-row justify-between items-center mb-3">
        <Text className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Expense Transactions</Text>
        <Text className="font-semibold text-red-500">{stats.expense}</Text>
      </View>

      <View className={`border-t pt-3 mt-3 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <View className="flex-row justify-between items-center">
          <Text className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Net Total</Text>
          <Text className={`font-bold ${stats.totalAmount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {formatCurrency(stats.totalAmount)}
          </Text>
        </View>
      </View>
    </Card>
  );
}
