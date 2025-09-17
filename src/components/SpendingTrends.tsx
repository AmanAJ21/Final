import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { useTransactions } from '../contexts/TransactionContext';
import { Card } from './Card';
import { Ionicons } from '@expo/vector-icons';

export function SpendingTrends() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { transactions } = useTransactions();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  // Calculate last 7 days spending
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const dailySpending = last7Days.map(date => {
    const dayTransactions = transactions.filter(t => 
      t.date === date && t.type === 'expense'
    );
    return dayTransactions.reduce((sum, t) => sum + t.amount, 0);
  });

  const maxSpending = Math.max(...dailySpending, 1);
  const avgSpending = dailySpending.reduce((sum, amount) => sum + amount, 0) / 7;

  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getTrendDirection = () => {
    const recent3Days = dailySpending.slice(-3).reduce((sum, amount) => sum + amount, 0) / 3;
    const previous3Days = dailySpending.slice(-6, -3).reduce((sum, amount) => sum + amount, 0) / 3;
    
    if (recent3Days > previous3Days * 1.1) return 'up';
    if (recent3Days < previous3Days * 0.9) return 'down';
    return 'stable';
  };

  const trendDirection = getTrendDirection();
  const trendColor = trendDirection === 'up' ? 'text-red-500' : 
                    trendDirection === 'down' ? 'text-green-500' : 'text-gray-500';
  const trendIcon = trendDirection === 'up' ? 'trending-up' : 
                   trendDirection === 'down' ? 'trending-down' : 'remove';

  return (
    <View>
      <View className="flex-row items-center justify-between mb-4">
        <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Spending Trends
        </Text>
        <TouchableOpacity onPress={() => router.push('/statistics')}>
          <Text className="text-blue-500 font-medium">View All</Text>
        </TouchableOpacity>
      </View>

      <Card className="p-4">
        {/* Trend Summary */}
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              7-Day Average
            </Text>
            <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {formatCurrency(avgSpending)}
            </Text>
          </View>
          
          <View className="flex-row items-center">
            <Ionicons name={trendIcon as any} size={20} className={trendColor} />
            <Text className={`ml-1 font-medium ${trendColor}`}>
              {trendDirection === 'up' ? 'Rising' : 
               trendDirection === 'down' ? 'Falling' : 'Stable'}
            </Text>
          </View>
        </View>

        {/* Daily Bars */}
        <View className="flex-row items-end justify-between h-20 mb-2">
          {dailySpending.map((amount, index) => {
            const height = maxSpending > 0 ? (amount / maxSpending) * 60 : 0;
            const isToday = index === dailySpending.length - 1;
            
            return (
              <View key={index} className="flex-1 items-center">
                <View 
                  className={`w-6 rounded-t-lg ${
                    isToday 
                      ? 'bg-blue-500' 
                      : amount > avgSpending 
                        ? 'bg-red-400' 
                        : 'bg-green-400'
                  }`}
                  style={{ height: Math.max(height, 2) }}
                />
              </View>
            );
          })}
        </View>

        {/* Day Labels */}
        <View className="flex-row justify-between">
          {last7Days.map((date, index) => (
            <Text 
              key={date} 
              className={`text-xs flex-1 text-center ${
                index === last7Days.length - 1 
                  ? 'text-blue-500 font-medium' 
                  : isDark ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              {getDayName(date)}
            </Text>
          ))}
        </View>

        {/* Legend */}
        <View className="flex-row items-center justify-center mt-3 space-x-4">
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full bg-green-400 mr-1" />
            <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Below Avg
            </Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full bg-red-400 mr-1" />
            <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Above Avg
            </Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full bg-blue-500 mr-1" />
            <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Today
            </Text>
          </View>
        </View>
      </Card>
    </View>
  );
}