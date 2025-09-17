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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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
        {/* Type Toggle */}
        <View className="mx-4 mt-6 mb-6">
          <View className={`flex-row rounded-2xl p-1 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <TouchableOpacity
              onPress={() => setSelectedType('expense')}
              className={`flex-1 py-3 rounded-xl ${selectedType === 'expense'
                ? 'bg-red-500'
                : 'bg-transparent'
                }`}
            >
              <Text className={`text-center font-semibold ${selectedType === 'expense'
                ? 'text-white'
                : isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                Expense Categories
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedType('income')}
              className={`flex-1 py-3 rounded-xl ${selectedType === 'income'
                ? 'bg-green-500'
                : 'bg-transparent'
                }`}
            >
              <Text className={`text-center font-semibold ${selectedType === 'income'
                ? 'text-white'
                : isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                Income Categories
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Add Category Button */}
        <View className="mx-4 mb-4">
          <TouchableOpacity
            onPress={() => setShowAddCategory(!showAddCategory)}
            className={`flex-row items-center justify-center py-4 rounded-2xl border-2 border-dashed ${isDark ? 'border-gray-600' : 'border-gray-300'
              }`}
          >
            <Ionicons
              name="add"
              size={20}
              color={isDark ? '#9ca3af' : '#6b7280'}
            />
            <Text className={`ml-2 font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Add New Category
            </Text>
          </TouchableOpacity>
        </View>

        {/* Add Category Form */}
        {showAddCategory && (
          <Card className="mx-4 mb-4">
            <Text className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Add New {selectedType === 'income' ? 'Income' : 'Expense'} Category
            </Text>

            <TextInput
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              placeholder="Enter category name"
              placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
              className={`p-3 rounded-lg border mb-4 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
            />

            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={handleAddCategory}
                className={`flex-1 py-3 rounded-lg ${selectedType === 'income' ? 'bg-green-500' : 'bg-red-500'}`}
              >
                <Text className="text-white text-center font-semibold">Add Category</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setShowAddCategory(false);
                  setNewCategoryName('');
                }}
                className={`flex-1 py-3 rounded-lg border ${isDark ? 'border-gray-600' : 'border-gray-300'}`}
              >
                <Text className={`text-center font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Categories List */}
        <View className="mx-4">
          {currentCategories.map((category, index) => {
            const stats = getCategoryStats(category.name, selectedType);

            return (
              <Card key={category.id} className={`${index > 0 ? 'mt-3' : ''}`}>
                <View className="flex-row items-center">
                  <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${selectedType === 'income' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                    <Ionicons
                      name={getCategoryIcon(category.name) as any}
                      size={24}
                      color={selectedType === 'income' ? '#10b981' : '#ef4444'}
                    />
                  </View>

                  <View className="flex-1">
                    <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {category.name}
                    </Text>
                    <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {stats.count} transactions
                    </Text>
                  </View>

                  <View className="items-end">
                    <Text className={`text-lg font-bold ${selectedType === 'income' ? 'text-green-500' : 'text-red-500'
                      }`}>
                      {formatCurrency(stats.total)}
                    </Text>
                    <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {formatCurrency(stats.thisMonthTotal)} this month
                    </Text>
                  </View>
                </View>

                {/* Usage Bar */}
                {stats.total > 0 && (
                  <View className="mt-3">
                    <View className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <View
                        className={`h-2 rounded-full ${selectedType === 'income' ? 'bg-green-500' : 'bg-red-500'
                          }`}
                        style={{
                          width: `${Math.min((stats.thisMonthTotal / stats.total) * 100, 100)}%`
                        }}
                      />
                    </View>
                    <Text className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {((stats.thisMonthTotal / stats.total) * 100).toFixed(0)}% of total this month
                    </Text>
                  </View>
                )}
              </Card>
            );
          })}
        </View>

        <View className="h-20" />
      </ScrollView>

      <BottomNavigation />
    </View>
  );
}