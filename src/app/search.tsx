import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useTransactions } from '../contexts/TransactionContext';
import { Header } from '../components/Header';
import { BottomNavigation } from '../components/BottomNavigation';
import { AnimatedCard } from '../components/AnimatedCard';
import { Ionicons } from '@expo/vector-icons';

export default function SearchPage() {
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { transactions } = useTransactions();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'income' | 'expense'>('all');

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

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Filter by type
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(t => t.type === selectedFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query) ||
        t.amount.toString().includes(query)
      );
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchQuery, selectedFilter]);

  const totalAmount = filteredTransactions.reduce((sum, t) => {
    return sum + (t.type === 'income' ? t.amount : -t.amount);
  }, 0);

  const filters = [
    { key: 'all', label: 'All', count: transactions.length },
    { key: 'income', label: 'Income', count: transactions.filter(t => t.type === 'income').length },
    { key: 'expense', label: 'Expense', count: transactions.filter(t => t.type === 'expense').length }
  ];

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`} style={{ paddingTop: top }}>
      <Header title="Search Transactions" showBackButton />
      
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Search Input */}
        <View className="mx-4 mt-6 mb-6">
          <View className={`flex-row items-center px-4 py-3 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <Ionicons 
              name="search" 
              size={20} 
              color={isDark ? '#9ca3af' : '#6b7280'} 
            />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search transactions..."
              placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
              className={`flex-1 ml-3 text-base ${isDark ? 'text-white' : 'text-gray-900'}`}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons 
                  name="close-circle" 
                  size={20} 
                  color={isDark ? '#6b7280' : '#9ca3af'} 
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filter Tabs */}
        <View className="mx-4 mb-6">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row space-x-2">
              {filters.map((filter) => (
                <TouchableOpacity
                  key={filter.key}
                  onPress={() => setSelectedFilter(filter.key as any)}
                  className={`px-4 py-2 rounded-full ${
                    selectedFilter === filter.key
                      ? 'bg-blue-500'
                      : isDark ? 'bg-gray-800' : 'bg-white'
                  } shadow-sm`}
                >
                  <Text className={`font-medium ${
                    selectedFilter === filter.key
                      ? 'text-white'
                      : isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {filter.label} ({filter.count})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Search Results Summary */}
        {(searchQuery.trim() || selectedFilter !== 'all') && (
          <AnimatedCard className="mx-4 mb-6 p-4">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Found {filteredTransactions.length} transactions
                </Text>
                <Text className={`text-lg font-bold ${
                  totalAmount >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  Net: {formatCurrency(totalAmount)}
                </Text>
              </View>
              
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  setSelectedFilter('all');
                }}
                className={`px-3 py-1 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
              >
                <Text className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Clear
                </Text>
              </TouchableOpacity>
            </View>
          </AnimatedCard>
        )}

        {/* Search Results */}
        <View className="mx-4">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction, index) => (
              <AnimatedCard
                key={transaction.id}
                className={`p-4 ${index > 0 ? 'mt-3' : ''}`}
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
                      {transaction.description && (
                        <Text className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} numberOfLines={1}>
                          {transaction.description}
                        </Text>
                      )}
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
              </AnimatedCard>
            ))
          ) : (
            <AnimatedCard className="p-8 items-center">
              <Ionicons
                name="search-outline"
                size={48}
                color={isDark ? '#6b7280' : '#9ca3af'}
              />
              <Text className={`mt-2 text-center font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {searchQuery.trim() ? 'No transactions found' : 'Start typing to search'}
              </Text>
              <Text className={`text-sm text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {searchQuery.trim() 
                  ? 'Try different keywords or filters'
                  : 'Search by title, category, amount, or description'
                }
              </Text>
            </AnimatedCard>
          )}
        </View>

        <View className="h-20" />
      </ScrollView>

      <BottomNavigation />
    </View>
  );
}