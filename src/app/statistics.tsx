import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useTransactions } from '../contexts/TransactionContext';
import { Header } from '../components/Header';
import { BottomNavigation } from '../components/BottomNavigation';
import { Card } from '../components/Card';
import { Ionicons } from '@expo/vector-icons';

export default function StatisticsPage() {
  const { top } = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { transactions } = useTransactions();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
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
        <View className="p-5 space-y-6">
          {/* Period Selector */}
          <View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-3">
                {periods.map((period) => (
                  <TouchableOpacity
                    key={period.key}
                    onPress={() => setSelectedPeriod(period.key as any)}
                    className={`px-5 py-3 rounded-full ${selectedPeriod === period.key
                      ? 'bg-blue-500'
                      : 'bg-white dark:bg-neutral-800'
                      } shadow-md`}
                  >
                    <Text className={`font-semibold text-base ${selectedPeriod === period.key
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
          <View className="flex-row flex-wrap -mx-2">
            <View className="w-1/2 px-2 mb-4">
              <Card className="p-4 items-center space-y-2">
                <View className={`w-14 h-14 rounded-full items-center justify-center ${isDark ? 'bg-green-900' : 'bg-green-100'}`}>
                  <Ionicons name="trending-up" size={28} color="#10b981" />
                </View>
                <View className="items-center">
                  <Text className="text-xl font-bold text-green-500">
                    {formatCurrency(periodIncome)}
                  </Text>
                  <Text className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Income
                  </Text>
                </View>
              </Card>
            </View>

            <View className="w-1/2 px-2 mb-4">
              <Card className="p-4 items-center space-y-2">
                <View className={`w-14 h-14 rounded-full items-center justify-center ${isDark ? 'bg-red-900' : 'bg-red-100'}`}>
                  <Ionicons name="trending-down" size={28} color="#ef4444" />
                </View>
                <View className="items-center">
                  <Text className="text-xl font-bold text-red-500">
                    {formatCurrency(periodExpenses)}
                  </Text>
                  <Text className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Expenses
                  </Text>
                </View>
              </Card>
            </View>

            <View className="w-1/2 px-2 mb-4">
              <Card className="p-4 items-center space-y-2">
                <View className={`w-14 h-14 rounded-full items-center justify-center ${periodNet >= 0 ? (isDark ? 'bg-green-900' : 'bg-green-100') : (isDark ? 'bg-red-900' : 'bg-red-100')}`}>
                  <Ionicons name={periodNet >= 0 ? 'checkmark-circle' : 'close-circle'} size={28} color={periodNet >= 0 ? '#10b981' : '#ef4444'} />
                </View>
                <View className="items-center">
                  <Text className={`text-xl font-bold ${periodNet >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatCurrency(periodNet)}
                  </Text>
                  <Text className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Net Income
                  </Text>
                </View>
              </Card>
            </View>

            <View className="w-1/2 px-2 mb-4">
              <Card className="p-4 items-center space-y-2">
                <View className={`w-14 h-14 rounded-full items-center justify-center ${isDark ? 'bg-blue-900' : 'bg-blue-100'}`}>
                  <Ionicons name="receipt" size={28} color="#3b82f6" />
                </View>
                <View className="items-center">
                  <Text className="text-xl font-bold text-blue-500">
                    {periodTransactions.length}
                  </Text>
                  <Text className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Transactions
                  </Text>
                </View>
              </Card>
            </View>
          </View>

          {/* Daily Spending Pattern */}
          <Card>
            <Text className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Daily Spending (Last 7 Days)
            </Text>

            <View className="flex-row items-end justify-between h-32 mb-2">
              {dailySpending.map((day, index) => {
                const height = maxDailySpending > 0 ? (day.amount / maxDailySpending) * 110 : 0;
                const isToday = day.date === new Date().toISOString().split('T')[0];

                return (
                  <View key={index} className="flex-1 items-center">
                    <View
                      className={`w-8 rounded-lg ${isToday
                        ? 'bg-blue-500'
                        : day.amount > 0
                          ? 'bg-red-400'
                          : 'bg-gray-300 dark:bg-gray-700'
                        }`}
                      style={{ height: Math.max(height, 4) }}
                    />
                  </View>
                );
              })}
            </View>

            <View className="flex-row justify-between border-t border-gray-200 dark:border-gray-700 pt-2">
              {dailySpending.map((day, index) => (
                <Text
                  key={index}
                  className={`text-sm font-medium flex-1 text-center ${day.date === new Date().toISOString().split('T')[0]
                    ? 'text-blue-500 font-bold'
                    : isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}
                >
                  {day.day}
                </Text>
              ))}
            </View>
          </Card>

          {/* Monthly Trend */}
          <Card>
            <Text className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              6-Month Trend
            </Text>
            <View className="space-y-4">
              {monthlyData.map((data, index) => (
                <View key={index} className={`flex-row items-center justify-between`}>
                  <Text className={`font-semibold text-base ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {data.month}
                  </Text>
                  <View className="flex-row space-x-4 items-baseline">
                    <Text className="text-green-500 text-base">
                      +{formatCurrency(data.income)}
                    </Text>
                    <Text className="text-red-500 text-base">
                      -{formatCurrency(data.expenses)}
                    </Text>
                    <Text className={`font-bold text-lg ${data.net >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatCurrency(data.net)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <Text className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Top Spending Categories
            </Text>
            <View className="space-y-4">
              {sortedCategories.length > 0 ? sortedCategories.map(([category, amount]) => {
                const percentage = periodExpenses > 0 ? (amount / periodExpenses) * 100 : 0;
                return (
                  <View key={category}>
                    <View className="flex-row justify-between items-center mb-1">
                      <Text className={`font-semibold text-base ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {category}
                      </Text>
                      <Text className={`font-bold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(amount)}
                      </Text>
                    </View>
                    <View className={`h-3 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <View
                        className="h-3 rounded-full bg-purple-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </View>
                    <Text className={`text-sm mt-1 font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {percentage.toFixed(1)}% of period expenses
                    </Text>
                  </View>
                );
              }) : (
                <View className="items-center py-8 space-y-3">
                  <Ionicons name="pie-chart-outline" size={56} color={isDark ? '#6b7280' : '#9ca3af'} />
                  <Text className={`text-lg font-semibold text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    No expense data for this period
                  </Text>
                  <Text className={`text-base text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Add some expense transactions to see category breakdown
                  </Text>
                </View>
              )}
            </View>
          </Card>

          {/* Quick Stats */}
          <View className="space-y-4">
            <Card className="p-4 flex-row items-center space-x-4">
              <View className={`w-14 h-14 rounded-full items-center justify-center ${isDark ? 'bg-blue-900' : 'bg-blue-100'}`}>
                <Ionicons name="receipt-outline" size={28} color="#3b82f6" />
              </View>
              <View className="flex-1">
                <Text className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Total Transactions
                </Text>
                <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {transactions.length}
                </Text>
              </View>
            </Card>

            <Card className="p-4 flex-row items-center space-x-4">
              <View className={`w-14 h-14 rounded-full items-center justify-center ${isDark ? 'bg-green-900' : 'bg-green-100'}`}>
                <Ionicons name="trending-up-outline" size={28} color="#10b981" />
              </View>
              <View className="flex-1">
                <Text className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Average Transaction
                </Text>
                <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {transactions.length > 0
                    ? formatCurrency(transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length)
                    : formatCurrency(0)
                  }
                </Text>
              </View>
            </Card>

            <Card className="p-4 flex-row items-center space-x-4">
              <View className={`w-14 h-14 rounded-full items-center justify-center ${isDark ? 'bg-purple-900' : 'bg-purple-100'}`}>
                <Ionicons name="calendar-outline" size={28} color="#8b5cf6" />
              </View>
              <View className="flex-1">
                <Text className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  This Month Transactions
                </Text>
                <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {selectedPeriod === 'month' ? periodTransactions.length :
                   transactions.filter(t => {
                     const transactionDate = new Date(t.date);
                     const now = new Date();
                     return transactionDate.getMonth() === now.getMonth() &&
                            transactionDate.getFullYear() === now.getFullYear();
                   }).length}
                </Text>
              </View>
            </Card>
          </View>
        </View>

        <View className="h-20" />
      </ScrollView>

      <BottomNavigation />
    </View>
  );
}