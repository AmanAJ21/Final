import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useTransactions } from '../contexts/TransactionContext';
import { Header } from '../components/Header';
import { BottomNavigation } from '../components/BottomNavigation';
import { DatePicker } from '../components/DatePicker';
import { Ionicons } from '@expo/vector-icons';

const CATEGORIES = {
  income: ['Work', 'Business', 'Investment', 'Gift', 'Other'],
  expense: ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Education', 'Other']
};

export default function AddTransactionPage() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type?: 'income' | 'expense' }>();
  const { top } = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { addTransaction } = useTransactions();

  const [transactionType, setTransactionType] = useState<'income' | 'expense'>(type || 'expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleSubmit = () => {
    if (!title.trim() || !amount.trim() || !category) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    addTransaction({
      title: title.trim(),
      amount: numAmount,
      type: transactionType,
      category,
      date: selectedDate.toISOString().split('T')[0],
      description: description.trim()
    });

    Alert.alert('Success', 'Transaction added successfully!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  return (
    <View 
      className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}
      style={{ paddingTop: top }}
    >
      <Header title="Add Transaction" showBackButton />
      
      <ScrollView 
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Transaction Type Toggle */}
        <View className="mt-6 mb-6">
          <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Transaction Type
          </Text>
          <View className={`flex-row rounded-xl p-1 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <TouchableOpacity
              onPress={() => setTransactionType('expense')}
              className={`flex-1 py-3 rounded-lg ${
                transactionType === 'expense' 
                  ? 'bg-red-500' 
                  : isDark ? 'bg-transparent' : 'bg-transparent'
              }`}
            >
              <Text className={`text-center font-medium ${
                transactionType === 'expense' 
                  ? 'text-white' 
                  : isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Expense
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setTransactionType('income')}
              className={`flex-1 py-3 rounded-lg ${
                transactionType === 'income' 
                  ? 'bg-green-500' 
                  : isDark ? 'bg-transparent' : 'bg-transparent'
              }`}
            >
              <Text className={`text-center font-medium ${
                transactionType === 'income' 
                  ? 'text-white' 
                  : isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Income
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Title Input */}
        <View className="mb-4">
          <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Title *
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Enter transaction title"
            placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
            className={`p-4 rounded-xl ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
          />
        </View>

        {/* Amount Input */}
        <View className="mb-4">
          <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Amount *
          </Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="numeric"
            placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
            className={`p-4 rounded-xl ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
          />
        </View>

        {/* Category Selection */}
        <View className="mb-4">
          <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Category *
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
            <View className="flex-row space-x-2">
              {CATEGORIES[transactionType].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-full border ${
                    category === cat
                      ? transactionType === 'income' 
                        ? 'bg-green-500 border-green-500' 
                        : 'bg-red-500 border-red-500'
                      : isDark 
                        ? 'bg-gray-800 border-gray-700' 
                        : 'bg-white border-gray-200'
                  }`}
                >
                  <Text className={`${
                    category === cat 
                      ? 'text-white' 
                      : isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Date Input */}
        <View className="mb-4">
          <DatePicker
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            label="Date"
          />
        </View>

        {/* Description Input */}
        <View className="mb-6">
          <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Description (Optional)
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Add a note..."
            multiline
            numberOfLines={3}
            placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
            className={`p-4 rounded-xl ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          className={`py-4 rounded-xl ${
            transactionType === 'income' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          <Text className="text-white text-center font-semibold text-lg">
            Add {transactionType === 'income' ? 'Income' : 'Expense'}
          </Text>
        </TouchableOpacity>
        
        <View className="h-20" />
      </ScrollView>

      <BottomNavigation />
    </View>
  );
}