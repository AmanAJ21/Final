import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useTransactions } from '../contexts/TransactionContext';
import { Header } from '../components/Header';
import { BottomNavigation } from '../components/BottomNavigation';
import { Card } from '../components/Card';
import { Ionicons } from '@expo/vector-icons';
import { useCategories } from '../contexts/CategoryContext';

export default function CategoriesPage() {
  const { top } = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { transactions } = useTransactions();
  const { categories, addCategory, getCategoriesByType } = useCategories();
  const [selectedType, setSelectedType] = useState<'income' | 'expense'>('expense');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
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

  const getCategoryStats = (category: string, type: 'income' | 'expense') => {
    const categoryTransactions = transactions.filter(t =>
      t.category === category && t.type === type
    );

    const total = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
    const count = categoryTransactions.length;
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();

    const thisMonthTransactions = categoryTransactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === thisMonth &&
        transactionDate.getFullYear() === thisYear;
    });

    const thisMonthTotal = thisMonthTransactions.reduce((sum, t) => sum + t.amount, 0);

    return { total, count, thisMonthTotal };
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'Category name cannot be empty');
      return;
    }

    if (getCategoriesByType(selectedType).find(c => c.name.toLowerCase() === newCategoryName.trim().toLowerCase())) {
      Alert.alert('Error', 'Category already exists');
      return;
    }

    addCategory({
      name: newCategoryName.trim(),
      type: selectedType,
      icon: 'help-circle-outline', // default icon
      color: '#808080', // default color
      isDefault: false,
    });

    setNewCategoryName('');
    setShowAddCategory(false);
  };

  const currentCategories = getCategoriesByType(selectedType);

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`} style={{ paddingTop: top }}>
      <Header title="Categories" showBackButton />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
        <View className="p-5 space-y-6">
          {/* Type Toggle */}
          <View>
            <View className={`flex-row rounded-2xl p-2 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
              <TouchableOpacity
                onPress={() => setSelectedType('expense')}
                className={`flex-1 py-3 rounded-xl ${selectedType === 'expense' ? 'bg-red-500' : ''}`}
              >
                <Text className={`text-center font-semibold text-base ${selectedType === 'expense' ? 'text-white' : (isDark ? 'text-gray-400' : 'text-gray-600')}`}>
                  Expense Categories
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSelectedType('income')}
                className={`flex-1 py-3 rounded-xl ${selectedType === 'income' ? 'bg-green-500' : ''}`}
              >
                <Text className={`text-center font-semibold text-base ${selectedType === 'income' ? 'text-white' : (isDark ? 'text-gray-400' : 'text-gray-600')}`}>
                  Income Categories
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Add Category Button */}
          <TouchableOpacity
            onPress={() => setShowAddCategory(!showAddCategory)}
            className={`flex-row items-center justify-center py-4 rounded-2xl border-2 border-dashed ${isDark ? 'border-gray-600' : 'border-gray-300'}`}
          >
            <Ionicons name={showAddCategory ? "remove-circle-outline" : "add-circle-outline"} size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
            <Text className={`ml-3 font-semibold text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {showAddCategory ? 'Cancel' : 'Add New Category'}
            </Text>
          </TouchableOpacity>

          {/* Add Category Form */}
          {showAddCategory && (
            <Card>
              <Text className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Add New {selectedType === 'income' ? 'Income' : 'Expense'} Category
              </Text>

              <TextInput
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                placeholder="Enter category name"
                placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                className={`p-4 rounded-2xl border text-lg mb-4 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
              />

              <TouchableOpacity
                onPress={handleAddCategory}
                className={`py-4 rounded-2xl ${selectedType === 'income' ? 'bg-green-500' : 'bg-red-500'}`}
              >
                <Text className="text-white text-center font-bold text-lg">Add Category</Text>
              </TouchableOpacity>
            </Card>
          )}

          {/* Categories List */}
          <View className="space-y-4">
            {currentCategories.map((category) => {
              const stats = getCategoryStats(category.name, selectedType);
              return (
                <Card key={category.id}>
                  <View className="flex-row items-center">
                    <View className={`w-14 h-14 rounded-full items-center justify-center mr-4 ${selectedType === 'income' ? (isDark ? 'bg-green-900' : 'bg-green-100') : (isDark ? 'bg-red-900' : 'bg-red-100')}`}>
                      <Ionicons
                        name={getCategoryIcon(category.name) as any}
                        size={28}
                        color={selectedType === 'income' ? '#10b981' : '#ef4444'}
                      />
                    </View>

                    <View className="flex-1">
                      <Text className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {category.name}
                      </Text>
                      <Text className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {stats.count} transactions
                      </Text>
                    </View>

                    <View className="items-end">
                      <Text className={`text-xl font-bold ${selectedType === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                        {formatCurrency(stats.total)}
                      </Text>
                      <Text className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {formatCurrency(stats.thisMonthTotal)} this month
                      </Text>
                    </View>
                  </View>

                  {stats.total > 0 && (
                    <View className="mt-4 space-y-2">
                      <View className={`h-3 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <View
                          className={`h-3 rounded-full ${selectedType === 'income' ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.min((stats.thisMonthTotal / stats.total) * 100, 100)}%` }}
                        />
                      </View>
                      <Text className={`text-sm font-medium text-right ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {((stats.thisMonthTotal / stats.total) * 100).toFixed(0)}% of total this month
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