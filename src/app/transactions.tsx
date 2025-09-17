import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useTransactions } from '../contexts/TransactionContext';
import { Header } from '../components/Header';
import { BottomNavigation } from '../components/BottomNavigation';
import { Card } from '../components/Card';
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
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
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
        <View className="space-y-6 p-5">
          {/* Summary Card */}
          <Card>
            <View className="flex-row items-center justify-between">
              <View className="space-y-1">
                <Text className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {isMultiSelectMode ? 'Selected Total' : 'Total Transactions'}
                </Text>
                <Text className={`text-3xl font-bold ${
                  (isMultiSelectMode ? selectedAmount : totalAmount) >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {formatCurrency(isMultiSelectMode ? selectedAmount : totalAmount)}
                </Text>
              </View>

              <View className="items-end space-y-2">
                <Text className={`text-base font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {isMultiSelectMode ? `${selectedTransactions.length} of ${filteredAndSortedTransactions.length}` : `${filteredAndSortedTransactions.length} transactions`}
                </Text>
                {isMultiSelectMode && (
                  <TouchableOpacity
                    onPress={exitMultiSelectMode}
                    className="px-4 py-2 rounded-full bg-gray-500"
                  >
                    <Text className="text-white text-sm font-semibold">Cancel</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </Card>

          {/* Filter and Sort Controls */}
          {!isMultiSelectMode && (
            <View>
              <View className="flex-row items-center justify-between mb-4">
                <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Filters & Sort
                </Text>
                <TouchableOpacity
                  onPress={() => router.push('/search')}
                  className="flex-row items-center space-x-2"
                >
                  <Ionicons name="search" size={18} color="#3b82f6" />
                  <Text className="text-blue-500 font-semibold text-base">Search</Text>
                </TouchableOpacity>
              </View>

              <View className="space-y-4">
                {/* Filter Tabs */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row gap-3">
                    {[
                      { key: 'all', label: 'All', count: transactions.length },
                      { key: 'income', label: 'Income', count: transactions.filter(t => t.type === 'income').length },
                      { key: 'expense', label: 'Expense', count: transactions.filter(t => t.type === 'expense').length }
                    ].map((filter) => (
                      <TouchableOpacity
                        key={filter.key}
                        onPress={() => setFilterBy(filter.key as any)}
                        className={`px-5 py-3 rounded-full ${
                          filterBy === filter.key
                            ? 'bg-blue-500'
                            : 'bg-white dark:bg-neutral-800'
                        } shadow-md`}
                      >
                        <Text className={`font-semibold ${
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
                  <View className="flex-row gap-3">
                    {[
                      { key: 'date', label: 'Date', icon: 'calendar-outline' },
                      { key: 'amount', label: 'Amount', icon: 'cash-outline' },
                      { key: 'category', label: 'Category', icon: 'grid-outline' }
                    ].map((sort) => (
                      <TouchableOpacity
                        key={sort.key}
                        onPress={() => setSortBy(sort.key as any)}
                        className={`flex-row items-center px-4 py-3 rounded-full ${
                          sortBy === sort.key
                            ? 'bg-purple-500'
                            : 'bg-white dark:bg-neutral-800'
                        } shadow-md`}
                      >
                        <Ionicons
                          name={sort.icon as any}
                          size={16}
                          color={sortBy === sort.key ? '#fff' : (isDark ? '#9ca3af' : '#6b7280')}
                        />
                        <Text className={`ml-2 text-base font-medium ${
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
            </View>
          )}

          {/* Multi-Select Actions */}
          {isMultiSelectMode && (
            <View className="flex-row space-x-4">
              <TouchableOpacity
                onPress={selectAllTransactions}
                className="flex-1 py-4 rounded-2xl bg-blue-500"
              >
                <Text className="text-white text-center font-bold text-lg">
                  {selectedTransactions.length === filteredAndSortedTransactions.length ? 'Deselect All' : 'Select All'}
                </Text>
              </TouchableOpacity>
              
              {selectedTransactions.length > 0 && (
                <TouchableOpacity
                  onPress={handleDeleteSelected}
                  className="flex-1 py-4 rounded-2xl bg-red-500"
                >
                  <Text className="text-white text-center font-bold text-lg">
                    Delete ({selectedTransactions.length})
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Transactions List */}
          <View>
            {filteredAndSortedTransactions.length > 0 ? (
              <View className="space-y-3">
                {filteredAndSortedTransactions.map((transaction) => {
                  const isSelected = selectedTransactions.includes(transaction.id);

                  return (
                    <Card
                      key={transaction.id}
                      className={`${isSelected ? 'border-2 border-blue-500' : ''}`}
                      onPress={() => handleTransactionPress(transaction.id)}
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center flex-1">
                          {isMultiSelectMode && (
                            <View className="mr-4">
                              <View className={`w-7 h-7 rounded-full border-2 items-center justify-center ${
                                isSelected
                                  ? 'bg-blue-500 border-blue-500'
                                  : isDark ? 'border-gray-600' : 'border-gray-300'
                              }`}>
                                {isSelected && (
                                  <Ionicons name="checkmark" size={18} color="white" />
                                )}
                              </View>
                            </View>
                          )}

                          <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
                            transaction.type === 'income'
                              ? (isDark ? 'bg-green-900' : 'bg-green-100')
                              : (isDark ? 'bg-red-900' : 'bg-red-100')
                          }`}>
                            <Ionicons
                              name={getCategoryIcon(transaction.category) as any}
                              size={24}
                              color={transaction.type === 'income' ? '#10b981' : '#ef4444'}
                            />
                          </View>

                          <View className="flex-1 space-y-1">
                            <Text className={`font-semibold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
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

                        <View className="items-end space-y-1">
                          <Text className={`font-bold text-base ${
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
                                size={20}
                                color={isDark ? '#6b7280' : '#9ca3af'}
                              />
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    </Card>
                  );
                })}
              </View>
            ) : (
              <Card className="items-center justify-center p-8 space-y-4">
                <Ionicons
                  name="receipt-outline"
                  size={56}
                  color={isDark ? '#6b7280' : '#9ca3af'}
                />
                <View className="space-y-2">
                  <Text className={`text-center font-semibold text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    No transactions found
                  </Text>
                  <Text className={`text-sm text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {filterBy !== 'all' ? 'Try changing the filter' : 'Add your first transaction to get started'}
                  </Text>
                </View>
              </Card>
            )}
          </View>
        </View>

        <View className="h-20" />
      </ScrollView>

      <BottomNavigation />
    </View>
  );
}