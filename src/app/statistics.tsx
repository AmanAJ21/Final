import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useTransactions } from '../contexts/TransactionContext';
import { Header } from '../components/Header';
import { BottomNavigation } from '../components/BottomNavigation';
import { AnimatedCard } from '../components/AnimatedCard';
import { Ionicons } from '@expo/vector-icons';

export default function StatisticsPage() {
  const { top } = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { transactions } = useTransactions();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getPeriodData = () => {
    const now = new Date();
    let startDate: Date;

    switch (selectedPeriod) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        const quarterStart = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterStart, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    return transactions.filter(t => new Date(t.date) >= startDate);
  };

  const periodTransactions = getPeriodData();
  const periodIncome = periodTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const periodExpenses = periodTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const periodNet = periodIncome - periodExpenses;

  // Category analysis for the selected period
  const categoryStats = periodTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const sortedCategories = Object.entries(categoryStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  // Daily spending pattern for the last 7 days
  const dailySpending = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayTransactions = transactions.filter(t =>
      t.type === 'expense' &&
      new Date(t.date).toDateString() === date.toDateString()
    );
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      amount: dayTransactions.reduce((sum, t) => sum + t.amount, 0),
      date: date.toISOString().split('T')[0]
    };
  });

  const maxDailySpending = Math.max(...dailySpending.map(d => d.amount), 1);

  // Monthly comparison data
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const month = date.getMonth();
    const year = date.getFullYear();

    const monthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === month &&
        transactionDate.getFullYear() === year;
    });

    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      income,
      expenses,
      net: income - expenses
    };
  }).reverse();

  const periods = [
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'quarter', label: 'This Quarter' },
    { key: 'year', label: 'This Year' }
  ];

  return (
    <View
      className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}
      style={{ paddingTop: top }}
    >
      <Header title="Statistics" showBackButton />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Period Selector */}
        <View className="mx-4 mt-6 mb-6">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row space-x-2">
              {periods.map((period) => (
                <TouchableOpacity
                  key={period.key}
                  onPress={() => setSelectedPeriod(period.key as any)}
                  className={`px-4 py-2 rounded-full ${selectedPeriod === period.key
                    ? 'bg-blue-500'
                    : isDark ? 'bg-gray-800' : 'bg-white'
                    } shadow-sm`}
                >
                  <Text className={`font-medium ${selectedPeriod === period.key
                    ? 'text-white'
                    : isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                    {period.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Summary Cards */}
        <View className="mx-4 mb-6">
          <View className="flex-row flex-wrap -mx-2">
            <View className="w-1/2 px-2 mb-4">
              <AnimatedCard className="p-4 items-center">
                <View className="w-12 h-12 rounded-full items-center justify-center mb-3 bg-green-100">
                  <Ionicons name="trending-up" size={24} color="#10b981" />
                </View>
                <Text className="text-lg font-bold text-green-500">
                  {formatCurrency(periodIncome)}
                </Text>
                <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Income
                </Text>
              </AnimatedCard>
            </View>

            <View className="w-1/2 px-2 mb-4">
              <AnimatedCard className="p-4 items-center">
                <View className="w-12 h-12 rounded-full items-center justify-center mb-3 bg-red-100">
                  <Ionicons name="trending-down" size={24} color="#ef4444" />
                </View>
                <Text className="text-lg font-bold text-red-500">
                  {formatCurrency(periodExpenses)}
                </Text>
                <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Expenses
                </Text>
              </AnimatedCard>
            </View>

            <View className="w-1/2 px-2 mb-4">
              <AnimatedCard className="p-4 items-center">
                <View className={`w-12 h-12 rounded-full items-center justify-center mb-3 ${periodNet >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  <Ionicons name={periodNet >= 0 ? 'checkmark-circle' : 'close-circle'} size={24} color={periodNet >= 0 ? '#10b981' : '#ef4444'} />
                </View>
                <Text className={`text-lg font-bold ${periodNet >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(periodNet)}
                </Text>
                <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Net Income
                </Text>
              </AnimatedCard>
            </View>

            <View className="w-1/2 px-2 mb-4">
              <AnimatedCard className="p-4 items-center">
                <View className="w-12 h-12 rounded-full items-center justify-center mb-3 bg-blue-100">
                  <Ionicons name="receipt" size={24} color="#3b82f6" />
                </View>
                <Text className="text-lg font-bold text-blue-500">
                  {periodTransactions.length}
                </Text>
                <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Transactions
                </Text>
              </AnimatedCard>
            </View>
          </View>
        </View>

        {/* Daily Spending Pattern */}
        <AnimatedCard className="mx-4 mb-6 p-4">
          <Text className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Daily Spending (Last 7 Days)
          </Text>

          <View className="flex-row items-end justify-between h-24 mb-2">
            {dailySpending.map((day, index) => {
              const height = maxDailySpending > 0 ? (day.amount / maxDailySpending) * 80 : 0;
              const isToday = day.date === new Date().toISOString().split('T')[0];

              return (
                <View key={index} className="flex-1 items-center">
                  <View
                    className={`w-6 rounded-t-lg ${isToday
                      ? 'bg-blue-500'
                      : day.amount > 0
                        ? 'bg-red-400'
                        : 'bg-gray-300'
                      }`}
                    style={{ height: Math.max(height, 2) }}
                  />
                </View>
              );
            })}
          </View>

          <View className="flex-row justify-between">
            {dailySpending.map((day, index) => (
              <Text
                key={index}
                className={`text-xs flex-1 text-center ${day.date === new Date().toISOString().split('T')[0]
                  ? 'text-blue-500 font-medium'
                  : isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}
              >
                {day.day}
              </Text>
            ))}
          </View>
        </AnimatedCard>
        {/* Monthly Trend */}
        <AnimatedCard className="mx-4 mb-6 p-4">
          <Text className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            6-Month Trend
          </Text>
          <View>
            {monthlyData.map((data, index) => (
              <View key={index} className={`flex-row items-center justify-between ${index > 0 ? 'mt-3' : ''}`}>
                <Text className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {data.month}
                </Text>
                <View className="flex-row space-x-4">
                  <Text className="text-green-500 text-sm">
                    +{formatCurrency(data.income)}
                  </Text>
                  <Text className="text-red-500 text-sm">
                    -{formatCurrency(data.expenses)}
                  </Text>
                  <Text className={`font-semibold ${data.net >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatCurrency(data.net)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </AnimatedCard>

        {/* Category Breakdown */}
        <AnimatedCard className="mx-4 mb-6 p-4">
          <Text className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Top Spending Categories
          </Text>
          <View>
            {sortedCategories.length > 0 ? sortedCategories.map(([category, amount], index) => {
              const percentage = periodExpenses > 0 ? (amount / periodExpenses) * 100 : 0;
              return (
                <View key={category} className={`${index > 0 ? 'mt-3' : ''}`}>
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {category}
                    </Text>
                    <Text className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(amount)}
                    </Text>
                  </View>
                  <View className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <View
                      className="h-2 rounded-full bg-purple-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </View>
                  <Text className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {percentage.toFixed(1)}% of period expenses
                  </Text>
                </View>
              );
            }) : (
              <View className="items-center py-8">
                <Ionicons name="pie-chart-outline" size={48} color={isDark ? '#6b7280' : '#9ca3af'} />
                <Text className={`mt-2 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  No expense data for this period
                </Text>
                <Text className={`text-sm text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Add some expense transactions to see category breakdown
                </Text>
              </View>
            )}
          </View>
        </AnimatedCard>

        {/* Quick Stats */}
        <View className="mx-4 mt-6">
          <AnimatedCard className="p-4 flex-row items-center">
            <View className={`w-12 h-12 rounded-full items-center justify-center mr-3 ${isDark ? 'bg-blue-900' : 'bg-blue-100'}`}>
              <Ionicons name="receipt" size={20} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Total Transactions
              </Text>
              <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {transactions.length}
              </Text>
            </View>
          </AnimatedCard>

          <AnimatedCard className="mt-3 p-4 flex-row items-center">
            <View className={`w-12 h-12 rounded-full items-center justify-center mr-3 ${isDark ? 'bg-green-900' : 'bg-green-100'}`}>
              <Ionicons name="trending-up" size={20} color="#10b981" />
            </View>
            <View className="flex-1">
              <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Average Transaction
              </Text>
              <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {transactions.length > 0
                  ? formatCurrency(transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length)
                  : '$0.00'
                }
              </Text>
            </View>
          </AnimatedCard>

          <AnimatedCard className="mt-3 p-4 flex-row items-center">
            <View className={`w-12 h-12 rounded-full items-center justify-center mr-3 ${isDark ? 'bg-purple-900' : 'bg-purple-100'}`}>
              <Ionicons name="calendar" size={20} color="#8b5cf6" />
            </View>
            <View className="flex-1">
              <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                This Month Transactions
              </Text>
              <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {selectedPeriod === 'month' ? periodTransactions.length : 
                 transactions.filter(t => {
                   const transactionDate = new Date(t.date);
                   const now = new Date();
                   return transactionDate.getMonth() === now.getMonth() && 
                          transactionDate.getFullYear() === now.getFullYear();
                 }).length}
              </Text>
            </View>
          </AnimatedCard>
        </View>

        <View className="h-20" />
      </ScrollView>

      <BottomNavigation />
    </View>
  );
}