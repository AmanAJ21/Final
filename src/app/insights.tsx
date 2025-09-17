import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useTransactions } from '../contexts/TransactionContext';
import { Header } from '../components/Header';
import { BottomNavigation } from '../components/BottomNavigation';
import { Card } from '../components/Card';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function InsightsPage() {
  const { top } = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { transactions } = useTransactions();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

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
    .slice(0, 5);

  // Daily spending pattern
  const dailySpending = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayTransactions = periodTransactions.filter(t => 
      t.type === 'expense' && 
      new Date(t.date).toDateString() === date.toDateString()
    );
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      amount: dayTransactions.reduce((sum, t) => sum + t.amount, 0)
    };
  });

  const maxDailySpending = Math.max(...dailySpending.map(d => d.amount), 1);

  // Financial health score
  const getFinancialHealthScore = () => {
    if (income === 0) return 0;
    const savingsRate = ((income - expenses) / income) * 100;
    if (savingsRate >= 20) return 100;
    if (savingsRate >= 10) return 80;
    if (savingsRate >= 0) return 60;
    if (savingsRate >= -10) return 40;
    return 20;
  };

  const healthScore = getFinancialHealthScore();
  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const periods = [
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'year', label: 'This Year' }
  ];

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`} style={{ paddingTop: top }}>
      <Header title="Financial Insights" showBackButton />
      
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

        {/* Financial Health Score */}
        <Card className="mx-4 mb-6">
          <View className="items-center">
            <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Financial Health Score
            </Text>
            
            <View className="relative w-32 h-32 items-center justify-center mb-4">
              <View className={`absolute inset-0 rounded-full border-8 ${isDark ? 'border-gray-700' : 'border-gray-200'}`} />
              <View 
                className={`absolute inset-0 rounded-full border-8 ${
                  healthScore >= 80 ? 'border-green-500' : 
                  healthScore >= 60 ? 'border-yellow-500' : 'border-red-500'
                }`}
                style={{
                  transform: [{ rotate: '-90deg' }],
                  borderTopColor: 'transparent',
                  borderRightColor: 'transparent',
                  borderBottomColor: 'transparent',
                }}
              />
              <Text className={`text-2xl font-bold ${getHealthColor(healthScore)}`}>
                {healthScore}
              </Text>
            </View>
            
            <Text className={`text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {healthScore >= 80 ? 'Excellent! Great savings rate.' :
               healthScore >= 60 ? 'Good! Room for improvement.' :
               healthScore >= 40 ? 'Fair. Consider reducing expenses.' :
               'Poor. Review your spending habits.'}
            </Text>
          </View>
        </Card>

        {/* Income vs Expenses */}
        <Card className="mx-4 mb-6">
          <Text className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Income vs Expenses
          </Text>
          
          <View>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-4 h-4 rounded-full bg-green-500 mr-3" />
                <Text className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Income</Text>
              </View>
              <Text className="text-green-500 font-semibold">{formatCurrency(income)}</Text>
            </View>
            
            <View className="flex-row items-center justify-between mt-4">
              <View className="flex-row items-center">
                <View className="w-4 h-4 rounded-full bg-red-500 mr-3" />
                <Text className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Expenses</Text>
              </View>
              <Text className="text-red-500 font-semibold">{formatCurrency(expenses)}</Text>
            </View>
            
            <View className={`border-t pt-3 mt-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <View className="flex-row items-center justify-between">
                <Text className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Net</Text>
                <Text className={`font-bold ${net >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(net)}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Daily Spending Pattern */}
        <Card className="mx-4 mb-6">
          <Text className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Daily Spending Pattern
          </Text>
          
          <View className="flex-row items-end justify-between h-24 mb-2">
            {dailySpending.map((day, index) => {
              const height = maxDailySpending > 0 ? (day.amount / maxDailySpending) * 80 : 0;
              return (
                <View key={index} className="flex-1 items-center">
                  <View 
                    className="w-6 rounded-t-lg bg-blue-500"
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
                className={`text-xs flex-1 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
              >
                {day.day}
              </Text>
            ))}
          </View>
        </Card>

        {/* Top Categories */}
        <Card className="mx-4 mb-6">
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
                      className="h-2 rounded-full bg-red-500"
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
        </Card>

        {/* Quick Stats */}
        <View className="mx-4 mb-6">
          <View className="flex-row space-x-3">
            <Card className="flex-1 items-center">
              <Ionicons name="receipt" size={24} color="#3b82f6" />
              <Text className={`text-2xl font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {periodTransactions.length}
              </Text>
              <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Transactions
              </Text>
            </Card>
            
            <Card className="flex-1 items-center">
              <Ionicons name="calendar" size={24} color="#10b981" />
              <Text className={`text-2xl font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {Math.round(expenses / (selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 365))}
              </Text>
              <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Daily Avg
              </Text>
            </Card>
          </View>
        </View>

        <View className="h-20" />
      </ScrollView>

      <BottomNavigation />
    </View>
  );
}