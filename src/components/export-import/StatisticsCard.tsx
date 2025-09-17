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
    <Card>
      <Text className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Data Overview
      </Text>

      <View className="space-y-3">
        <View className="flex-row justify-between items-center">
          <Text className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Total Transactions</Text>
          <Text className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total}</Text>
        </View>

        <View className="flex-row justify-between items-center">
          <Text className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Income Transactions</Text>
          <Text className="font-semibold text-lg text-green-500">{stats.income}</Text>
        </View>

        <View className="flex-row justify-between items-center">
          <Text className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Expense Transactions</Text>
          <Text className="font-semibold text-lg text-red-500">{stats.expense}</Text>
        </View>
      </View>

      <View className={`border-t pt-4 mt-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <View className="flex-row justify-between items-center">
          <Text className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Net Total</Text>
          <Text className={`font-bold text-xl ${stats.totalAmount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {formatCurrency(stats.totalAmount)}
          </Text>
        </View>
      </View>
    </Card>
  );
}
