import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { Header } from '../components/Header';
import { BottomNavigation } from '../components/BottomNavigation';
import { Card } from '../components/Card';
import { Ionicons } from '@expo/vector-icons';
import { useRecurringTransactions } from '../contexts/RecurringTransactionContext';

interface RecurringTransaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextDate: string;
  isActive: boolean;
  description?: string;
}

export default function RecurringPage() {
  const { top } = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { recurringTransactions, toggleRecurringTransaction } = useRecurringTransactions();
  
  

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
      day: 'numeric',
      year: 'numeric'
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
      'Business': 'business',
      'Investment': 'trending-up',
      'Gift': 'gift',
      'Other': 'ellipsis-horizontal'
    };
    return icons[category] || 'ellipsis-horizontal';
  };

  const getFrequencyIcon = (frequency: string) => {
    const icons: { [key: string]: string } = {
      'daily': 'today',
      'weekly': 'calendar',
      'monthly': 'calendar-outline',
      'yearly': 'calendar-clear'
    };
    return icons[frequency] || 'repeat';
  };

  const getFrequencyColor = (frequency: string) => {
    const colors: { [key: string]: string } = {
      'daily': 'text-green-500',
      'weekly': 'text-blue-500',
      'monthly': 'text-purple-500',
      'yearly': 'text-orange-500'
    };
    return colors[frequency] || 'text-gray-500';
  };

  const handleToggleActive = (id: string) => {
    toggleRecurringTransaction(id);
  };

  const handleAddRecurring = () => {
    // TODO: Implement UI for adding recurring transactions
    Alert.alert(
      'Add Recurring Transaction',
      'This feature is under development. You will be able to set up automatic recurring transactions in a future update.',
      [{ text: 'OK' }]
    );
  };

  const handleEditRecurring = (id: string) => {
    // TODO: Implement UI for editing recurring transactions
    Alert.alert(
      'Edit Recurring Transaction',
      'This feature is under development. You will be able to edit recurring transactions in a future update.',
      [{ text: 'OK' }]
    );
  };

  const activeTransactions = recurringTransactions.filter(t => t.isActive);
  const inactiveTransactions = recurringTransactions.filter(t => !t.isActive);

  const totalMonthlyIncome = activeTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => {
      const multiplier = t.frequency === 'weekly' ? 4.33 : t.frequency === 'daily' ? 30 : t.frequency === 'yearly' ? 1/12 : 1;
      return sum + (t.amount * multiplier);
    }, 0);

  const totalMonthlyExpenses = activeTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => {
      const multiplier = t.frequency === 'weekly' ? 4.33 : t.frequency === 'daily' ? 30 : t.frequency === 'yearly' ? 1/12 : 1;
      return sum + (t.amount * multiplier);
    }, 0);

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`} style={{ paddingTop: top }}>
      <Header title="Recurring Transactions" showBackButton />
      
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Summary Card */}
        <Card className="mx-4 mt-6">
          <Text className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Monthly Projection
          </Text>
          
          <View className="flex-row justify-between items-center mb-3">
            <Text className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Recurring Income</Text>
            <Text className="font-semibold text-green-500">{formatCurrency(totalMonthlyIncome)}</Text>
          </View>
          
          <View className="flex-row justify-between items-center mb-3">
            <Text className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Recurring Expenses</Text>
            <Text className="font-semibold text-red-500">{formatCurrency(totalMonthlyExpenses)}</Text>
          </View>
          
          <View className={`border-t pt-3 mt-3 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <View className="flex-row justify-between items-center">
              <Text className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Net Monthly</Text>
              <Text className={`font-bold ${(totalMonthlyIncome - totalMonthlyExpenses) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatCurrency(totalMonthlyIncome - totalMonthlyExpenses)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Add Recurring Button */}
        <View className="mx-4 mt-6">
          <TouchableOpacity
            onPress={handleAddRecurring}
            className="flex-row items-center justify-center py-4 rounded-2xl bg-blue-500"
          >
            <Ionicons name="add-circle" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">Add Recurring Transaction</Text>
          </TouchableOpacity>
        </View>

        {/* Active Recurring Transactions */}
        <View className="mx-4 mt-6">
          <Text className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Active Recurring ({activeTransactions.length})
          </Text>
          
          {activeTransactions.length > 0 ? (
            <View>
              {activeTransactions.map((transaction, index) => (
                <Card
                  key={transaction.id}
                  className={`${index > 0 ? 'mt-3' : ''}`}
                  onPress={() => handleEditRecurring(transaction.id)}
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
                        <View className="flex-row items-center mt-1">
                          <Ionicons
                            name={getFrequencyIcon(transaction.frequency) as any}
                            size={14}
                            color={getFrequencyColor(transaction.frequency).includes('green') ? '#10b981' : 
                                   getFrequencyColor(transaction.frequency).includes('blue') ? '#3b82f6' :
                                   getFrequencyColor(transaction.frequency).includes('purple') ? '#8b5cf6' : '#f97316'}
                          />
                          <Text className={`text-sm ml-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {transaction.frequency.charAt(0).toUpperCase() + transaction.frequency.slice(1)}
                          </Text>
                          <Text className={`text-sm ml-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Next: {formatDate(transaction.nextDate)}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View className="items-end">
                      <Text className={`font-bold ${
                        transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleToggleActive(transaction.id)}
                        className="mt-1"
                      >
                        <Ionicons
                          name="pause-circle"
                          size={16}
                          color={isDark ? '#6b7280' : '#9ca3af'}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          ) : (
            <Card className="items-center">
              <Ionicons
                name="repeat-outline"
                size={48}
                color={isDark ? '#6b7280' : '#9ca3af'}
              />
              <Text className={`mt-2 text-center font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                No active recurring transactions
              </Text>
              <Text className={`text-sm text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Add recurring transactions to automate your finances
              </Text>
            </Card>
          )}
        </View>

        {/* Inactive Recurring Transactions */}
        {inactiveTransactions.length > 0 && (
          <View className="mx-4 mt-6">
            <Text className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Paused Recurring ({inactiveTransactions.length})
            </Text>
            
            <View>
              {inactiveTransactions.map((transaction, index) => (
                <Card
                  key={transaction.id}
                  className={`${index > 0 ? 'mt-3' : ''} opacity-60`}
                  onPress={() => handleEditRecurring(transaction.id)}
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
                        <View className="flex-row items-center mt-1">
                          <Ionicons name="pause" size={14} color="#6b7280" />
                          <Text className={`text-sm ml-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Paused • {transaction.frequency}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View className="items-end">
                      <Text className={`font-bold ${
                        transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleToggleActive(transaction.id)}
                        className="mt-1"
                      >
                        <Ionicons
                          name="play-circle"
                          size={16}
                          color={isDark ? '#6b7280' : '#9ca3af'}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          </View>
        )}

        <View className="h-20" />
      </ScrollView>

      <BottomNavigation />
    </View>
  );
}