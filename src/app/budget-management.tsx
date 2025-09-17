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
        <View className="p-5 space-y-6">
          {/* Budget Summary */}
          <Card>
            <Text className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Monthly Budget Summary
            </Text>
            
            <View className="space-y-4">
              <View className="space-y-2">
                <View className="flex-row justify-between items-center">
                  <Text className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Total Budget</Text>
                  <Text className={`font-semibold text-lg text-blue-500`}>{formatCurrency(totalBudget)}</Text>
                </View>

                <View className="flex-row justify-between items-center">
                  <Text className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Total Spent</Text>
                  <Text className={`font-semibold text-lg text-red-500`}>{formatCurrency(totalSpent)}</Text>
                </View>
              </View>

              <View className={`border-t pt-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <View className="flex-row justify-between items-center">
                  <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Remaining</Text>
                  <Text className={`text-xl font-bold ${remainingBudget >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatCurrency(remainingBudget)}
                  </Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View className="space-y-2">
                <View className={`h-4 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <View
                    className={`h-4 rounded-full ${
                      totalSpent > totalBudget ? 'bg-red-500' :
                      (totalSpent / totalBudget) > 0.8 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }}
                  />
                </View>
                <Text className={`text-sm text-center font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {((totalSpent / totalBudget) * 100).toFixed(1)}% of total budget used
                </Text>
              </View>
            </View>
          </Card>

          {/* Add Category Button */}
          <TouchableOpacity
            onPress={handleAddCategory}
            className="flex-row items-center justify-center py-5 rounded-2xl border-2 border-dashed border-blue-500"
          >
            <Ionicons name="add-circle" size={24} color="#3b82f6" />
            <Text className="text-blue-500 font-semibold text-lg ml-3">Add Budget Category</Text>
          </TouchableOpacity>

          {/* Budget Categories */}
          <View>
            <Text className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Budget Categories
            </Text>

            <View className="space-y-4">
              {budgetCategories.map((budget) => {
                const spent = categorySpending[budget.name] || 0;
                const percentage = (spent / budget.limit) * 100;
                const isOverBudget = spent > budget.limit;
                const isEditing = editingCategory === budget.name;

                return (
                  <Card key={budget.name}>
                    {isEditing ? (
                      <View className="space-y-4">
                        <View className="flex-row items-center space-x-3">
                          <View className={`w-12 h-12 rounded-full items-center justify-center ${budget.color}`}>
                            <Ionicons name={budget.icon as any} size={24} color="white" />
                          </View>
                          <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {budget.name}
                          </Text>
                        </View>
                        <TextInput
                          value={editValue}
                          onChangeText={setEditValue}
                          keyboardType="numeric"
                          className={`p-4 rounded-2xl border text-lg ${
                            isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          placeholder="Enter new budget"
                          placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                        />
                        <View className="flex-row space-x-3">
                          <TouchableOpacity onPress={handleSaveBudget} className="flex-1 py-3 rounded-xl bg-green-500">
                            <Text className="text-white text-center font-semibold">Save</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={handleCancelEdit} className="flex-1 py-3 rounded-xl bg-gray-500">
                            <Text className="text-white text-center font-semibold">Cancel</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <View>
                        <View className="flex-row items-center justify-between mb-3">
                          <View className="flex-row items-center flex-1">
                            <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${budget.color}`}>
                              <Ionicons name={budget.icon as any} size={24} color="white" />
                            </View>
                            <View className="flex-1">
                              <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {budget.name}
                              </Text>
                              <Text className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {formatCurrency(spent)} / {formatCurrency(budget.limit)}
                              </Text>
                            </View>
                          </View>
                          <View className="flex-row items-center space-x-3">
                            <TouchableOpacity onPress={() => handleEditBudget(budget.name, budget.limit)}>
                              <Ionicons name="pencil-outline" size={22} color={isDark ? '#9ca3af' : '#6b7280'} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDeleteCategory(budget.name)}>
                              <Ionicons name="trash-outline" size={22} color="#ef4444" />
                            </TouchableOpacity>
                          </View>
                        </View>
                        <View className="space-y-2">
                          <View className={`h-3 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                            <View
                              className={`h-3 rounded-full ${
                                isOverBudget ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </View>
                          <View className="flex-row justify-between items-center">
                            <Text className={`text-sm font-medium ${
                              isOverBudget ? 'text-red-500' :
                              percentage > 80 ? 'text-yellow-500' : 'text-green-500'
                            }`}>
                              {percentage.toFixed(0)}% used
                            </Text>
                            <Text className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {formatCurrency(budget.limit - spent)} remaining
                            </Text>
                          </View>
                        </View>
                        {isOverBudget && (
                          <View className={`mt-3 p-3 rounded-xl ${isDark ? 'bg-red-900' : 'bg-red-100'}`}>
                            <Text className="text-red-500 text-sm font-semibold text-center">
                              Over budget by {formatCurrency(spent - budget.limit)}
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                  </Card>
                );
              })}
            </View>
          </View>
        </View>

        <View className="h-20" />
      </ScrollView>

      <BottomNavigation />
    </View>
  );
}