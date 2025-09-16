import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useTransactions } from '../contexts/TransactionContext';
import { Header } from '../components/Header';
import { BottomNavigation } from '../components/BottomNavigation';
import { DatePicker } from '../components/DatePicker';
import { Ionicons } from '@expo/vector-icons';

export default function CalendarPage() {
  const { top } = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { transactions } = useTransactions();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getTransactionsForDate = (day: number) => {
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return transactions.filter(t => t.date === dateStr);
  };

  const getDayTotal = (day: number) => {
    const dayTransactions = getTransactionsForDate(day);
    return dayTransactions.reduce((sum, t) => {
      return sum + (t.type === 'income' ? t.amount : -t.amount);
    }, 0);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  const days = getDaysInMonth(selectedDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthYear = selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`} style={{ paddingTop: top }}>
      <Header title="Calendar" />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Date Picker for Quick Navigation */}
        <View className="mx-4 mt-6 mb-4">
          <DatePicker
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            label="Jump to Date"
          />
        </View>

        {/* Month Navigation */}
        <View className={`mx-4 p-4 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity
              onPress={() => navigateMonth('prev')}
              className="p-2"
            >
              <Ionicons name="chevron-back" size={24} color={isDark ? '#fff' : '#000'} />
            </TouchableOpacity>
            
            <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {monthYear}
            </Text>
            
            <TouchableOpacity
              onPress={() => navigateMonth('next')}
              className="p-2"
            >
              <Ionicons name="chevron-forward" size={24} color={isDark ? '#fff' : '#000'} />
            </TouchableOpacity>
          </View>

          {/* Week Days Header */}
          <View className="flex-row mb-2">
            {weekDays.map((day) => (
              <View key={day} className="flex-1 items-center py-2">
                <Text className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {day}
                </Text>
              </View>
            ))}
          </View>

          {/* Calendar Grid */}
          <View className="flex-row flex-wrap">
            {days.map((day, index) => {
              if (day === null) {
                return <View key={index} className="w-[14.28%] h-12" />;
              }

              const dayTransactions = getTransactionsForDate(day);
              const dayTotal = getDayTotal(day);
              const hasTransactions = dayTransactions.length > 0;
              const isToday = new Date().getDate() === day && 
                             new Date().getMonth() === selectedDate.getMonth() &&
                             new Date().getFullYear() === selectedDate.getFullYear();

              return (
                <TouchableOpacity
                  key={day}
                  onPress={() => {
                    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const dayTransactions = getTransactionsForDate(day);
                    if (dayTransactions.length > 0) {
                      Alert.alert(
                        `Transactions for ${day}/${selectedDate.getMonth() + 1}`,
                        dayTransactions.map(t => `${t.title}: ${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}`).join('\n'),
                        [{ text: 'OK' }]
                      );
                    } else {
                      Alert.alert('No Transactions', `No transactions found for ${day}/${selectedDate.getMonth() + 1}/${selectedDate.getFullYear()}`);
                    }
                  }}
                  className={`w-[14.28%] h-12 items-center justify-center rounded-lg ${
                    isToday 
                      ? 'bg-blue-500' 
                      : hasTransactions 
                        ? (isDark ? 'bg-gray-700' : 'bg-gray-100')
                        : 'bg-transparent'
                  }`}
                >
                  <Text className={`text-sm font-medium ${
                    isToday 
                      ? 'text-white' 
                      : isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {day}
                  </Text>
                  {hasTransactions && (
                    <View className={`w-1 h-1 rounded-full mt-1 ${
                      dayTotal >= 0 ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Monthly Summary */}
        <View className={`mx-4 mt-6 p-4 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <Text className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Monthly Summary
          </Text>
          
          {(() => {
            const monthTransactions = transactions.filter(t => {
              const transactionDate = new Date(t.date);
              return transactionDate.getMonth() === selectedDate.getMonth() &&
                     transactionDate.getFullYear() === selectedDate.getFullYear();
            });
            
            const monthIncome = monthTransactions
              .filter(t => t.type === 'income')
              .reduce((sum, t) => sum + t.amount, 0);
            
            const monthExpenses = monthTransactions
              .filter(t => t.type === 'expense')
              .reduce((sum, t) => sum + t.amount, 0);
            
            const monthNet = monthIncome - monthExpenses;

            return (
              <View>
                <View className="flex-row justify-between items-center">
                  <Text className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Income</Text>
                  <Text className="text-green-500 font-semibold">{formatCurrency(monthIncome)}</Text>
                </View>
                <View className="flex-row justify-between items-center mt-3">
                  <Text className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Expenses</Text>
                  <Text className="text-red-500 font-semibold">{formatCurrency(monthExpenses)}</Text>
                </View>
                <View className={`border-t pt-3 mt-3 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <View className="flex-row justify-between items-center">
                    <Text className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Net</Text>
                    <Text className={`font-bold ${monthNet >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatCurrency(monthNet)}
                    </Text>
                  </View>
                </View>
                <View className="flex-row justify-between items-center mt-3">
                  <Text className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Transactions</Text>
                  <Text className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {monthTransactions.length}
                  </Text>
                </View>
              </View>
            );
          })()}
        </View>

        <View className="h-20" />
      </ScrollView>

      <BottomNavigation />
    </View>
  );
}