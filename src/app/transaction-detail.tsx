import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useTransactions } from '../contexts/TransactionContext';
import { Header } from '../components/Header';
import { BottomNavigation } from '../components/BottomNavigation';
import { Card } from '../components/Card';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../utils/formatCurrency';

export default function TransactionDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { top } = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { transactions, updateTransaction, deleteTransaction } = useTransactions();
  
  const transaction = transactions.find(t => t.id === id);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(transaction?.title || '');
  const [editedDescription, setEditedDescription] = useState(transaction?.description || '');

  if (!transaction) {
    return (
      <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`} style={{ paddingTop: top }}>
        <Header title="Transaction Not Found" showBackButton />
        <View className="flex-1 items-center justify-center">
          <Text className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Transaction not found
          </Text>
        </View>
        <BottomNavigation />
      </View>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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
      'Business': 'business',
      'Investment': 'trending-up',
      'Gift': 'gift',
      'Other': 'ellipsis-horizontal'
    };
    return icons[category] || 'ellipsis-horizontal';
  };

  const handleSaveEdit = () => {
    if (!editedTitle.trim()) {
      Alert.alert('Error', 'Title cannot be empty');
      return;
    }

    updateTransaction(transaction.id, {
      title: editedTitle.trim(),
      description: editedDescription.trim()
    });

    setIsEditing(false);
    Alert.alert('Success', 'Transaction updated successfully');
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteTransaction(transaction.id);
            router.back();
          }
        }
      ]
    );
  };

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`} style={{ paddingTop: top }}>
      <Header title="Transaction Details" showBackButton />
      
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Main Transaction Card */}
        <Card className="mx-4 mt-6 p-6">
          <View className="items-center mb-6">
            <View className={`w-16 h-16 rounded-full items-center justify-center mb-3 ${
              transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <Ionicons
                name={getCategoryIcon(transaction.category) as any}
                size={32}
                color={transaction.type === 'income' ? '#10b981' : '#ef4444'}
              />
            </View>
            
            <Text className={`text-3xl font-bold ${
              transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
            }`}>
              {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
            </Text>
            
            <View className={`px-3 py-1 rounded-full mt-2 ${
              transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <Text className={`text-sm font-medium ${
                transaction.type === 'income' ? 'text-green-700' : 'text-red-700'
              }`}>
                {transaction.type === 'income' ? 'Income' : 'Expense'}
              </Text>
            </View>
          </View>

          {/* Transaction Details */}
          <View>
            <View>
              <Text className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Title
              </Text>
              {isEditing ? (
                <TextInput
                  value={editedTitle}
                  onChangeText={setEditedTitle}
                  className={`p-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  placeholder="Enter title"
                  placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                />
              ) : (
                <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {transaction.title}
                </Text>
              )}
            </View>

            <View className="mt-4">
              <Text className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Category
              </Text>
              <Text className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {transaction.category}
              </Text>
            </View>

            <View className="mt-4">
              <Text className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Date
              </Text>
              <Text className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {formatDate(transaction.date)}
              </Text>
            </View>

            {(transaction.description || isEditing) && (
              <View className="mt-4">
                <Text className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Description
                </Text>
                {isEditing ? (
                  <TextInput
                    value={editedDescription}
                    onChangeText={setEditedDescription}
                    multiline
                    numberOfLines={3}
                    className={`p-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                    placeholder="Enter description (optional)"
                    placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                    textAlignVertical="top"
                  />
                ) : (
                  <Text className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {transaction.description || 'No description'}
                  </Text>
                )}
              </View>
            )}
          </View>
        </Card>

        {/* Action Buttons */}
        <View className="mx-4 mt-6">
          {isEditing ? (
            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={handleSaveEdit}
                className="flex-1 bg-blue-500 py-4 rounded-2xl"
              >
                <Text className="text-white text-center font-semibold text-lg">
                  Save Changes
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => {
                  setIsEditing(false);
                  setEditedTitle(transaction.title);
                  setEditedDescription(transaction.description || '');
                }}
                className={`flex-1 py-4 rounded-2xl border-2 ${isDark ? 'border-gray-600' : 'border-gray-300'}`}
              >
                <Text className={`text-center font-semibold text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setIsEditing(true)}
              className="bg-blue-500 py-4 rounded-2xl"
            >
              <Text className="text-white text-center font-semibold text-lg">
                Edit Transaction
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleDelete}
            className="bg-red-500 py-4 rounded-2xl mt-3"
          >
            <Text className="text-white text-center font-semibold text-lg">
              Delete Transaction
            </Text>
          </TouchableOpacity>
        </View>

        <View className="h-20" />
      </ScrollView>

      <BottomNavigation />
    </View>
  );
}