import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useTransactions } from '../contexts/TransactionContext';
import { Header } from '../components/Header';
import { BottomNavigation } from '../components/BottomNavigation';
import { Card } from '../components/Card';
import { Ionicons } from '@expo/vector-icons';

interface BudgetCategory {
  name: string;
  limit: number;
  icon: string;
  color: string;
}

export default function BudgetManagementPage() {
  const { top } = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { transactions } = useTransactions();
  
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([
    { name: 'Food', limit: 500, icon: 'restaurant', color: 'bg-orange-500' },
    { name: 'Transport', limit: 200, icon: 'car', color: 'bg-blue-500' },
    { name: 'Entertainment', limit: 150, icon: 'game-controller', color: 'bg-purple-500' },
    { name: 'Shopping', limit: 300, icon: 'bag', color: 'bg-pink-500' },
    { name: 'Bills', limit: 800, icon: 'receipt', color: 'bg-red-500' },
    { name: 'Health', limit: 200, icon: 'medical', color: 'bg-green-500' }
  ]);

  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

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

  const handleEditBudget = (categoryName: string, currentLimit: number) => {
    setEditingCategory(categoryName);
    setEditValue(currentLimit.toString());
  };

  const handleSaveBudget = () => {
    if (!editingCategory) return;
    
    const newLimit = parseFloat(editValue);
    if (isNaN(newLimit) || newLimit <= 0) {
      Alert.alert('Error', 'Please enter a valid budget amount');
      return;
    }

    setBudgetCategories(prev => 
      prev.map(cat => 
        cat.name === editingCategory 
          ? { ...cat, limit: newLimit }
          : cat
      )
    );

    setEditingCategory(null);
    setEditValue('');
    Alert.alert('Success', 'Budget updated successfully!');
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditValue('');
  };

  const handleAddCategory = () => {
    Alert.alert(
      'Add Budget Category',
      'This feature will be available in a future update. You will be able to add custom budget categories.',
      [{ text: 'OK' }]
    );
  };

  const handleDeleteCategory = (categoryName: string) => {
    Alert.alert(
      'Delete Budget Category',
      `Are you sure you want to remove the budget for ${categoryName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setBudgetCategories(prev => prev.filter(cat => cat.name !== categoryName));
            Alert.alert('Success', 'Budget category removed successfully!');
          }
        }
      ]
    );
  };

  const totalBudget = budgetCategories.reduce((sum, cat) => sum + cat.limit, 0);
  const totalSpent = budgetCategories.reduce((sum, cat) => sum + (categorySpending[cat.name] || 0), 0);
  const remainingBudget = totalBudget - totalSpent;

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`} style={{ paddingTop: top }}>
      <Header title="Budget Management" showBackButton />
      
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Budget Summary */}
        <Card className="mx-4 mt-6">
          <Text className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Monthly Budget Summary
          </Text>
          
          <View className="space-y-3">
            <View className="flex-row justify-between items-center">
              <Text className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Total Budget</Text>
              <Text className={`font-semibold text-blue-500`}>{formatCurrency(totalBudget)}</Text>
            </View>
            
            <View className="flex-row justify-between items-center">
              <Text className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Total Spent</Text>
              <Text className={`font-semibold text-red-500`}>{formatCurrency(totalSpent)}</Text>
            </View>
            
            <View className={`border-t pt-3 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <View className="flex-row justify-between items-center">
                <Text className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Remaining</Text>
                <Text className={`font-bold ${remainingBudget >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(remainingBudget)}
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View className="mt-3">
              <View className={`h-3 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <View 
                  className={`h-3 rounded-full ${
                    totalSpent > totalBudget ? 'bg-red-500' : 
                    (totalSpent / totalBudget) > 0.8 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }}
                />
              </View>
              <Text className={`text-xs mt-1 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {((totalSpent / totalBudget) * 100).toFixed(1)}% of total budget used
              </Text>
            </View>
          </View>
        </Card>

        {/* Add Category Button */}
        <View className="mx-4 mt-6">
          <TouchableOpacity
            onPress={handleAddCategory}
            className="flex-row items-center justify-center py-4 rounded-2xl border-2 border-dashed border-blue-500"
          >
            <Ionicons name="add-circle" size={20} color="#3b82f6" />
            <Text className="text-blue-500 font-semibold ml-2">Add Budget Category</Text>
          </TouchableOpacity>
        </View>

        {/* Budget Categories */}
        <View className="mx-4 mt-6">
          <Text className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Budget Categories
          </Text>
          
          <View>
            {budgetCategories.map((budget, index) => {
              const spent = categorySpending[budget.name] || 0;
              const percentage = (spent / budget.limit) * 100;
              const isOverBudget = spent > budget.limit;
              const isEditing = editingCategory === budget.name;

              return (
                <Card
                  key={budget.name}
                  className={`${index > 0 ? 'mt-3' : ''}`}
                >
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center flex-1">
                      <View className={`w-12 h-12 rounded-full items-center justify-center mr-3 ${budget.color}`}>
                        <Ionicons name={budget.icon as any} size={20} color="white" />
                      </View>
                      
                      <View className="flex-1">
                        <Text className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {budget.name}
                        </Text>
                        <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {formatCurrency(spent)} spent
                        </Text>
                      </View>
                    </View>

                    <View className="items-end">
                      {isEditing ? (
                        <View className="flex-row items-center space-x-2">
                          <TextInput
                            value={editValue}
                            onChangeText={setEditValue}
                            keyboardType="numeric"
                            className={`w-20 p-2 rounded border text-center ${
                              isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                            }`}
                            placeholder="0"
                            placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                          />
                          <TouchableOpacity onPress={handleSaveBudget}>
                            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={handleCancelEdit}>
                            <Ionicons name="close-circle" size={24} color="#ef4444" />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View className="flex-row items-center space-x-2">
                          <Text className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {formatCurrency(budget.limit)}
                          </Text>
                          <TouchableOpacity onPress={() => handleEditBudget(budget.name, budget.limit)}>
                            <Ionicons name="pencil" size={16} color={isDark ? '#6b7280' : '#9ca3af'} />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => handleDeleteCategory(budget.name)}>
                            <Ionicons name="trash" size={16} color="#ef4444" />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <View className="mb-2">
                    <View className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <View 
                        className={`h-2 rounded-full ${
                          isOverBudget ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </View>
                  </View>

                  <View className="flex-row justify-between items-center">
                    <Text className={`text-xs ${
                      isOverBudget ? 'text-red-500' : 
                      percentage > 80 ? 'text-yellow-500' : 'text-green-500'
                    }`}>
                      {percentage.toFixed(0)}% used
                    </Text>
                    <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formatCurrency(budget.limit - spent)} remaining
                    </Text>
                  </View>

                  {isOverBudget && (
                    <View className="mt-2 p-2 rounded bg-red-100 dark:bg-red-900/20">
                      <Text className="text-red-500 text-xs font-medium text-center">
                        Over budget by {formatCurrency(spent - budget.limit)}
                      </Text>
                    </View>
                  )}
                </Card>
              );
            })}
          </View>
        </View>

        <View className="h-20" />
      </ScrollView>

      <BottomNavigation />
    </View>
  );
}