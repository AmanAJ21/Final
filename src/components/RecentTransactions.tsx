import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { useTransactions } from '../contexts/TransactionContext';
import { Card } from './Card';
import { Ionicons } from '@expo/vector-icons';

export function RecentTransactions() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { transactions } = useTransactions();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'Food': 'restaurant',
      'Transport': 'car',
      'Shopping': 'bag',
      'Entertainment': 'game-controller',
      'Work': 'briefcase',
      'Health': 'medical',
      'Education': 'school',
      'Bills': 'receipt',
      'Other': 'ellipsis-horizontal'
    };
    return icons[category] || 'ellipsis-horizontal';
  };

  const recentTransactions = transactions.slice(0, 5);

  return (
    <View>
      <View className="flex-row justify-between items-center mb-4">
        <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Recent Transactions
        </Text>
        <TouchableOpacity onPress={() => router.push('/transactions')}>
          <Text className="text-blue-500 font-medium">View All</Text>
        </TouchableOpacity>
      </View>

      <View className="space-y-3">
        {recentTransactions.map((transaction, index) => (
          <Card
            key={transaction.id}
            className="p-4"
            onPress={() => router.push(`/transaction-detail?id=${transaction.id}`)}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className={`w-12 h-12 rounded-full items-center justify-center mr-3 ${
                  transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <Ionicons
                    name={getCategoryIcon(transaction.category) as any}
                    size={20}
                    color={transaction.type === 'income' ? '#10b981' : '#ef4444'}
                  />
                </View>
                
                <View className="flex-1">
                  <Text className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {transaction.title}
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {transaction.category} • {formatDate(transaction.date)}
                  </Text>
                </View>
              </View>

              <View className="items-end">
                <Text className={`font-bold ${
                  transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </Text>
                <View className="mt-1">
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={isDark ? '#6b7280' : '#9ca3af'}
                  />
                </View>
              </View>
            </View>
          </Card>
        ))}
      </View>

      {recentTransactions.length === 0 && (
        <Card className="p-8 items-center">
          <Ionicons
            name="receipt-outline"
            size={48}
            color={isDark ? '#6b7280' : '#9ca3af'}
          />
          <Text className={`mt-2 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            No transactions yet
          </Text>
          <Text className={`text-sm text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Add your first transaction to get started
          </Text>
        </Card>
      )}
    </View>
  );
}