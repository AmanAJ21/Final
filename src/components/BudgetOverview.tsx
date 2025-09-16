import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { useTransactions } from '../contexts/TransactionContext';
import { Card } from './Card';
import { Ionicons } from '@expo/vector-icons';

export function BudgetOverview() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { transactions } = useTransactions();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Simple budget categories with limits
  const budgetCategories = [
    { name: 'Food', limit: 500, icon: 'restaurant' },
    { name: 'Transport', limit: 200, icon: 'car' },
    { name: 'Entertainment', limit: 150, icon: 'game-controller' },
    { name: 'Shopping', limit: 300, icon: 'bag' }
  ];

  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();

  const thisMonthExpenses = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return t.type === 'expense' && 
           transactionDate.getMonth() === thisMonth && 
           transactionDate.getFullYear() === thisYear;
  });

  const categorySpending = thisMonthExpenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <View>
      <View className="flex-row justify-between items-center mb-4">
        <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Budget Overview
        </Text>
        <TouchableOpacity onPress={() => router.push('/budget-management')}>
          <Text className="text-blue-500 font-medium">Manage</Text>
        </TouchableOpacity>
      </View>

      <View className="space-y-3">
        {budgetCategories.map((budget, index) => {
          const spent = categorySpending[budget.name] || 0;
          const percentage = (spent / budget.limit) * 100;
          const isOverBudget = spent > budget.limit;

          return (
            <Card
              key={budget.name}
              className="p-4"
            >
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center">
                  <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                    isOverBudget ? 'bg-red-100' : 'bg-blue-100'
                  }`}>
                    <Ionicons
                      name={budget.icon as any}
                      size={16}
                      color={isOverBudget ? '#ef4444' : '#3b82f6'}
                    />
                  </View>
                  <Text className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {budget.name}
                  </Text>
                </View>
                <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {formatCurrency(spent)} / {formatCurrency(budget.limit)}
                </Text>
              </View>

              <View className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} mb-1`}>
                <View 
                  className={`h-2 rounded-full ${
                    isOverBudget ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </View>

              <View className="flex-row justify-between items-center">
                <Text className={`text-xs ${
                  isOverBudget ? 'text-red-500' : 
                  percentage > 80 ? 'text-yellow-500' : 'text-green-500'
                }`}>
                  {percentage.toFixed(0)}% used
                </Text>
                {isOverBudget && (
                  <Text className="text-xs text-red-500 font-medium">
                    Over by {formatCurrency(spent - budget.limit)}
                  </Text>
                )}
              </View>
            </Card>
          );
        })}
      </View>
    </View>
  );
}