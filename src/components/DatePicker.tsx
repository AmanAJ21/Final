import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Card } from './Card';
import { Ionicons } from '@expo/vector-icons';

interface DatePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  placeholder?: string;
  label?: string;
}

export function DatePicker({ selectedDate, onDateChange, placeholder = 'Select Date', label }: DatePickerProps) {
  const { isDark } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [tempDate, setTempDate] = useState(selectedDate);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateShort = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(tempDate);
    newDate.setMonth(tempDate.getMonth() + (direction === 'next' ? 1 : -1));
    setTempDate(newDate);
  };

  const navigateYear = (direction: 'prev' | 'next') => {
    const newDate = new Date(tempDate);
    newDate.setFullYear(tempDate.getFullYear() + (direction === 'next' ? 1 : -1));
    setTempDate(newDate);
  };

  const selectDay = (day: number) => {
    const newDate = new Date(tempDate.getFullYear(), tempDate.getMonth(), day);
    setTempDate(newDate);
  };

  const handleConfirm = () => {
    onDateChange(tempDate);
    setIsVisible(false);
  };

  const handleCancel = () => {
    setTempDate(selectedDate);
    setIsVisible(false);
  };

  const handleToday = () => {
    const today = new Date();
    setTempDate(today);
  };

  const days = getDaysInMonth(tempDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthYear = tempDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && 
           tempDate.getMonth() === today.getMonth() && 
           tempDate.getFullYear() === today.getFullYear();
  };
  const isSelected = (day: number) => {
    return day === tempDate.getDate();
  };

  return (
    <View>
      {label && (
        <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {label}
        </Text>
      )}
      
      <TouchableOpacity
        onPress={() => setIsVisible(true)}
        className={`flex-row items-center justify-between p-4 rounded-xl border ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}
      >
        <Text className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
          {formatDateShort(selectedDate)}
        </Text>
        <Ionicons 
          name="calendar" 
          size={20} 
          color={isDark ? '#9ca3af' : '#6b7280'} 
        />
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className={`${isDark ? 'bg-gray-900' : 'bg-white'} rounded-t-3xl`}>
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <TouchableOpacity onPress={handleCancel}>
                <Text className="text-red-500 font-medium">Cancel</Text>
              </TouchableOpacity>
              <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Select Date
              </Text>
              <TouchableOpacity onPress={handleConfirm}>
                <Text className="text-blue-500 font-medium">Done</Text>
              </TouchableOpacity>
            </View>

            <ScrollView className="max-h-[600px]">
              <View className="p-4">
                {/* Month/Year Navigation */}
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center">
                    <TouchableOpacity
                      onPress={() => navigateMonth('prev')}
                      className="p-2 rounded-full"
                    >
                      <Ionicons name="chevron-back" size={20} color={isDark ? '#fff' : '#000'} />
                    </TouchableOpacity>
                    <Text className={`text-lg font-semibold mx-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {monthYear}
                    </Text>
                    <TouchableOpacity
                      onPress={() => navigateMonth('next')}
                      className="p-2 rounded-full"
                    >
                      <Ionicons name="chevron-forward" size={20} color={isDark ? '#fff' : '#000'} />
                    </TouchableOpacity>
                  </View>

                  <View className="flex-row items-center">
                    <TouchableOpacity
                      onPress={() => navigateYear('prev')}
                      className="p-1"
                    >
                      <Ionicons name="chevron-up" size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => navigateYear('next')}
                      className="p-1"
                    >
                      <Ionicons name="chevron-down" size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Today Button */}
                <TouchableOpacity
                  onPress={handleToday}
                  className="mb-4 py-2 px-4 rounded-lg bg-blue-500 self-center"
                >
                  <Text className="text-white font-medium">Today</Text>
                </TouchableOpacity>

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

                    const todayCheck = isToday(day);
                    const selectedCheck = isSelected(day);

                    return (
                      <TouchableOpacity
                        key={day}
                        onPress={() => selectDay(day)}
                        className={`w-[14.28%] h-12 items-center justify-center rounded-lg ${
                          selectedCheck
                            ? 'bg-blue-500'
                            : todayCheck
                              ? isDark ? 'bg-gray-700' : 'bg-gray-200'
                              : 'bg-transparent'
                        }`}
                      >
                        <Text className={`text-sm font-medium ${
                          selectedCheck
                            ? 'text-white'
                            : todayCheck
                              ? 'text-blue-500'
                              : isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {day}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Selected Date Display */}
                <View className="mt-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                  <Text className={`text-center ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                    Selected: {formatDate(tempDate)}
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}