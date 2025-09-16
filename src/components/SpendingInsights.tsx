import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useTransactions } from '../contexts/TransactionContext';
import { Card } from './Card';
import { Ionicons } from '@expo/vector-icons';

export function SpendingInsights() {
  const { isDark } = useTheme();
  const { transactions } = useTransactions();

  // Calculate insights
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  
  const thisMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === thisMonth && 
           transactionDate.getFullYear() === thisYear;
  });

  const thisMonthExpenses = thisMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const categorySpending = thisMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const topCategory = Object.entries(categorySpending)
    .sort(([,a], [,b]) => b - a)[0];

  const avgDailySpending = thisMonthExpenses / new Date().getDate();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const insights = [
    {
      icon: 'trending-down',
      title: 'This Month Spending',
      value: formatCurrency(thisMonthExpenses),
      color: 'text-red-500'
    },
    {
      icon: 'calendar',
      title: 'Daily Average',
      value: formatCurrency(avgDailySpending),
      color: 'text-blue-500'
    },
    {
      icon: 'pie-chart',
      title: 'Top Category',
      value: topCategory ? `${topCategory[0]} (${formatCurrency(topCategory[1])})` : 'No data',
      color: 'text-purple-500'
    }
  ];

  return (
    <View className="mx-4 mb-4">
      <Text className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Spending Insights
      </Text>
      
      <View>
        {insights.map((insight, index) => (
          <Card
            key={index}
            className={`p-4 ${index > 0 ? 'mt-3' : ''}`}
          >
            <View className="flex-row items-center">
            <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
              isDark ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <Ionicons
                name={insight.icon as any}
                size={20}
                color={insight.color.includes('red') ? '#ef4444' : 
                       insight.color.includes('blue') ? '#3b82f6' : '#8b5cf6'}
              />
            </View>
            
            <View className="flex-1">
              <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {insight.title}
              </Text>
              <Text className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {insight.value}
              </Text>
            </View>
            </View>
          </Card>
        ))}
      </View>
    </View>
  );
}