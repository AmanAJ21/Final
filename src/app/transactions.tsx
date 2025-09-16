import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useTransactions } from '../contexts/TransactionContext';
import { Header } from '../components/Header';
import { BottomNavigation } from '../components/BottomNavigation';
import { AnimatedCard } from '../components/AnimatedCard';
import { Ionicons } from '@expo/vector-icons';

export default function TransactionsPage() {
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { transactions, deleteTransaction } = useTransactions();
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category'>('date');
  const [filterBy, setFilterBy] = useState<'all' | 'income' | 'expense'>('all');

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

  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions;

    // Filter by type
    if (filterBy !== 'all') {
      filtered = filtered.filter(t => t.type === filterBy);
    }

    // Sort transactions
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'amount':
          return b.amount - a.amount;
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    return sorted;
  }, [transactions, sortBy, filterBy]);

  const toggleTransactionSelection = (transactionId: string) => {
    if (!isMultiSelectMode) {
      setIsMultiSelectMode(true);
      setSelectedTransactions([transactionId]);
    } else {
      setSelectedTransactions(prev => 
        prev.includes(transactionId)
          ? prev.filter(id => id !== transactionId)
          : [...prev, transactionId]
      );
    }
  };

  const selectAllTransactions = () => {
    if (selectedTransactions.length === filteredAndSortedTransactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(filteredAndSortedTransactions.map(t => t.id));
    }
  };

  const exitMultiSelectMode = () => {
    setIsMultiSelectMode(false);
    setSelectedTransactions([]);
  };

  const handleDeleteSelected = () => {
    Alert.alert(
      'Delete Transactions',
      `Are you sure you want to delete ${selectedTransactions.length} transaction(s)? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            selectedTransactions.forEach(id => deleteTransaction(id));
            exitMultiSelectMode();
            Alert.alert('Success', `${selectedTransactions.length} transaction(s) deleted successfully.`);
          }
        }
      ]
    );
  };

  const handleTransactionPress = (transactionId: string) => {
    if (isMultiSelectMode) {
      toggleTransactionSelection(transactionId);
    } else {
      router.push(`/transaction-detail?id=${transactionId}`);
    }
  };

  const totalAmount = filteredAndSortedTransactions.reduce((sum, t) => {
    return sum + (t.type === 'income' ? t.amount : -t.amount);
  }, 0);

  const selectedAmount = selectedTransactions.reduce((sum, id) => {
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
      return sum + (transaction.type === 'income' ? transaction.amount : -transaction.amount);
    }
    return sum;
  }, 0);

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`} style={{ paddingTop: top }}>
      <Header 
        title={isMultiSelectMode ? `${selectedTransactions.length} Selected` : 'All Transactions'} 
        showBackButton={isMultiSelectMode}
        onBackPress={isMultiSelectMode ? exitMultiSelectMode : undefined}
      />
      
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Summary Card */}
        <AnimatedCard className="mx-4 mt-6 p-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {isMultiSelectMode ? 'Selected Total' : 'Total Transactions'}
              </Text>
              <Text className={`text-2xl font-bold ${
                (isMultiSelectMode ? selectedAmount : totalAmount) >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {formatCurrency(isMultiSelectMode ? selectedAmount : totalAmount)}
              </Text>
            </View>
            
            <View className="items-end">
              <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {isMultiSelectMode ? `${selectedTransactions.length} of ${filteredAndSortedTransactions.length}` : `${filteredAndSortedTransactions.length} transactions`}
              </Text>
              {isMultiSelectMode && (
                <TouchableOpacity
                  onPress={exitMultiSelectMode}
                  className="mt-2 px-3 py-1 rounded-full bg-gray-500"
                >
                  <Text className="text-white text-xs font-medium">Cancel</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </AnimatedCard>

        {/* Filter and Sort Controls */}
        {!isMultiSelectMode && (
          <View className="mx-4 mt-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Filters & Sort
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/search')}
                className="flex-row items-center"
              >
                <Ionicons name="search" size={16} color="#3b82f6" />
                <Text className="text-blue-500 font-medium ml-1">Search</Text>
              </TouchableOpacity>
            </View>

            {/* Filter Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              <View className="flex-row space-x-2">
                {[
                  { key: 'all', label: 'All', count: transactions.length },
                  { key: 'income', label: 'Income', count: transactions.filter(t => t.type === 'income').length },
                  { key: 'expense', label: 'Expense', count: transactions.filter(t => t.type === 'expense').length }
                ].map((filter) => (
                  <TouchableOpacity
                    key={filter.key}
                    onPress={() => setFilterBy(filter.key as any)}
                    className={`px-4 py-2 rounded-full ${
                      filterBy === filter.key
                        ? 'bg-blue-500'
                        : isDark ? 'bg-gray-800' : 'bg-white'
                    } shadow-sm`}
                  >
                    <Text className={`font-medium ${
                      filterBy === filter.key
                        ? 'text-white'
                        : isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {filter.label} ({filter.count})
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Sort Options */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row space-x-2">
                {[
                  { key: 'date', label: 'Date', icon: 'calendar' },
                  { key: 'amount', label: 'Amount', icon: 'cash' },
                  { key: 'category', label: 'Category', icon: 'grid' }
                ].map((sort) => (
                  <TouchableOpacity
                    key={sort.key}
                    onPress={() => setSortBy(sort.key as any)}
                    className={`flex-row items-center px-3 py-2 rounded-full ${
                      sortBy === sort.key
                        ? 'bg-purple-500'
                        : isDark ? 'bg-gray-800' : 'bg-white'
                    } shadow-sm`}
                  >
                    <Ionicons 
                      name={sort.icon as any} 
                      size={14} 
                      color={sortBy === sort.key ? '#fff' : (isDark ? '#9ca3af' : '#6b7280')} 
                    />
                    <Text className={`ml-1 text-sm font-medium ${
                      sortBy === sort.key
                        ? 'text-white'
                        : isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {sort.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Multi-Select Actions */}
        {isMultiSelectMode && (
          <View className="mx-4 mt-6">
            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={selectAllTransactions}
                className="flex-1 py-3 rounded-2xl bg-blue-500"
              >
                <Text className="text-white text-center font-semibold">
                  {selectedTransactions.length === filteredAndSortedTransactions.length ? 'Deselect All' : 'Select All'}
                </Text>
              </TouchableOpacity>
              
              {selectedTransactions.length > 0 && (
                <TouchableOpacity
                  onPress={handleDeleteSelected}
                  className="flex-1 py-3 rounded-2xl bg-red-500"
                >
                  <Text className="text-white text-center font-semibold">
                    Delete ({selectedTransactions.length})
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Transactions List */}
        <View className="mx-4 mt-6">
          {filteredAndSortedTransactions.length > 0 ? (
            filteredAndSortedTransactions.map((transaction, index) => {
              const isSelected = selectedTransactions.includes(transaction.id);
              
              return (
                <AnimatedCard
                  key={transaction.id}
                  className={`p-4 ${index > 0 ? 'mt-3' : ''} ${
                    isSelected ? 'border-2 border-blue-500' : ''
                  }`}
                  onPress={() => handleTransactionPress(transaction.id)}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      {isMultiSelectMode && (
                        <View className="mr-3">
                          <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                            isSelected 
                              ? 'bg-blue-500 border-blue-500' 
                              : isDark ? 'border-gray-600' : 'border-gray-300'
                          }`}>
                            {isSelected && (
                              <Ionicons name="checkmark" size={14} color="white" />
                            )}
                          </View>
                        </View>
                      )}
                      
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
                      {!isMultiSelectMode && (
                        <TouchableOpacity
                          onPress={() => toggleTransactionSelection(transaction.id)}
                          className="mt-1 p-1"
                        >
                          <Ionicons
                            name="ellipsis-horizontal"
                            size={16}
                            color={isDark ? '#6b7280' : '#9ca3af'}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </AnimatedCard>
              );
            })
          ) : (
            <AnimatedCard className="p-8 items-center">
              <Ionicons
                name="receipt-outline"
                size={48}
                color={isDark ? '#6b7280' : '#9ca3af'}
              />
              <Text className={`mt-2 text-center font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                No transactions found
              </Text>
              <Text className={`text-sm text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {filterBy !== 'all' ? 'Try changing the filter' : 'Add your first transaction to get started'}
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