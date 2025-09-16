import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useTransactions } from '../contexts/TransactionContext';
import { Header } from '../components/Header';
import { BottomNavigation } from '../components/BottomNavigation';
import { AnimatedCard } from '../components/AnimatedCard';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function ReportsPage() {
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
  const income = periodTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expenses = periodTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const net = income - expenses;

  // Category analysis
  const categoryData = periodTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const sortedCategories = Object.entries(categoryData)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8);

  // Monthly comparison
  const getMonthlyComparison = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.getMonth();
      const year = date.getFullYear();
      
      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === month && 
               transactionDate.getFullYear() === year;
      });

      const monthIncome = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const monthExpenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        income: monthIncome,
        expenses: monthExpenses,
        net: monthIncome - monthExpenses
      });
    }
    return months;
  };

  const monthlyData = getMonthlyComparison();
  const maxAmount = Math.max(...monthlyData.flatMap(m => [m.income, m.expenses]), 1);

  // Financial ratios
  const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
  const expenseRatio = income > 0 ? (expenses / income) * 100 : 0;

  const periods = [
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'quarter', label: 'This Quarter' },
    { key: 'year', label: 'This Year' }
  ];

  const reportCards = [
    {
      title: 'Income',
      value: formatCurrency(income),
      icon: 'trending-up',
      color: 'text-green-500',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Expenses',
      value: formatCurrency(expenses),
      icon: 'trending-down',
      color: 'text-red-500',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Net Income',
      value: formatCurrency(net),
      icon: net >= 0 ? 'checkmark-circle' : 'close-circle',
      color: net >= 0 ? 'text-green-500' : 'text-red-500',
      bgColor: net >= 0 ? 'bg-green-100' : 'bg-red-100'
    },
    {
      title: 'Transactions',
      value: periodTransactions.length.toString(),
      icon: 'receipt',
      color: 'text-blue-500',
      bgColor: 'bg-blue-100'
    }
  ];

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`} style={{ paddingTop: top }}>
      <Header title="Financial Reports" showBackButton />
      
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Period Selector */}
        <View className="mx-4 mt-6 mb-6">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row space-x-2">
              {periods.map((period) => (
                <TouchableOpacity
                  key={period.key}
                  onPress={() => setSelectedPeriod(period.key as any)}
                  className={`px-4 py-2 rounded-full ${
                    selectedPeriod === period.key
                      ? 'bg-blue-500'
                      : isDark ? 'bg-gray-800' : 'bg-white'
                  } shadow-sm`}
                >
                  <Text className={`font-medium ${
                    selectedPeriod === period.key
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
            {reportCards.map((card, index) => (
              <View key={index} className="w-1/2 px-2 mb-4">
                <AnimatedCard className="p-4 items-center">
                  <View className={`w-12 h-12 rounded-full items-center justify-center mb-3 ${card.bgColor}`}>
                    <Ionicons name={card.icon as any} size={24} color={card.color.includes('green') ? '#10b981' : card.color.includes('red') ? '#ef4444' : '#3b82f6'} />
                  </View>
                  <Text className={`text-lg font-bold ${card.color}`}>
                    {card.value}
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {card.title}
                  </Text>
                </AnimatedCard>
              </View>
            ))}
          </View>
        </View>

        {/* Financial Health */}
        <AnimatedCard className="mx-4 mb-6 p-4">
          <Text className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Financial Health
          </Text>
          
          <View className="space-y-4">
            <View>
              <View className="flex-row justify-between items-center mb-2">
                <Text className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Savings Rate</Text>
                <Text className={`font-semibold ${savingsRate >= 20 ? 'text-green-500' : savingsRate >= 10 ? 'text-yellow-500' : 'text-red-500'}`}>
                  {savingsRate.toFixed(1)}%
                </Text>
              </View>
              <View className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <View 
                  className={`h-2 rounded-full ${savingsRate >= 20 ? 'bg-green-500' : savingsRate >= 10 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(Math.abs(savingsRate), 100)}%` }}
                />
              </View>
            </View>

            <View>
              <View className="flex-row justify-between items-center mb-2">
                <Text className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Expense Ratio</Text>
                <Text className={`font-semibold ${expenseRatio <= 80 ? 'text-green-500' : expenseRatio <= 90 ? 'text-yellow-500' : 'text-red-500'}`}>
                  {expenseRatio.toFixed(1)}%
                </Text>
              </View>
              <View className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <View 
                  className={`h-2 rounded-full ${expenseRatio <= 80 ? 'bg-green-500' : expenseRatio <= 90 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(expenseRatio, 100)}%` }}
                />
              </View>
            </View>
          </View>
        </AnimatedCard>

        {/* Monthly Trend */}
        <AnimatedCard className="mx-4 mb-6 p-4">
          <Text className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            6-Month Trend
          </Text>
          
          <View className="flex-row items-end justify-between h-32 mb-4">
            {monthlyData.map((month, index) => (
              <View key={index} className="flex-1 items-center">
                <View className="flex-1 justify-end items-center space-y-1">
                  <View 
                    className="w-4 rounded-t-sm bg-green-500"
                    style={{ height: Math.max((month.income / maxAmount) * 100, 2) }}
                  />
                  <View 
                    className="w-4 rounded-t-sm bg-red-500"
                    style={{ height: Math.max((month.expenses / maxAmount) * 100, 2) }}
                  />
                </View>
              </View>
            ))}
          </View>
          
          <View className="flex-row justify-between">
            {monthlyData.map((month, index) => (
              <Text 
                key={index} 
                className={`text-xs flex-1 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
              >
                {month.month}
              </Text>
            ))}
          </View>

          <View className="flex-row items-center justify-center mt-4 space-x-4">
            <View className="flex-row items-center">
              <View className="w-3 h-3 rounded bg-green-500 mr-2" />
              <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Income</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-3 h-3 rounded bg-red-500 mr-2" />
              <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Expenses</Text>
            </View>
          </View>
        </AnimatedCard>

        {/* Top Categories */}
        <AnimatedCard className="mx-4 mb-6 p-4">
          <Text className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Top Spending Categories
          </Text>
          
          <View>
            {sortedCategories.map(([category, amount], index) => {
              const percentage = expenses > 0 ? (amount / expenses) * 100 : 0;
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
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </View>
                  <Text className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {percentage.toFixed(1)}% of total expenses
                  </Text>
                </View>
              );
            })}
          </View>
        </AnimatedCard>

        <View className="h-20" />
      </ScrollView>

      <BottomNavigation />
    </View>
  );
}