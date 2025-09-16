import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { AnimatedCard } from './AnimatedCard';
import { Ionicons } from '@expo/vector-icons';

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
  label?: string;
}

export function DateRangePicker({ startDate, endDate, onDateRangeChange, label }: DateRangePickerProps) {
  const { isDark } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);
  const [selectingStart, setSelectingStart] = useState(true);

  const formatDateShort = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateRange = () => {
    return `${formatDateShort(startDate)} - ${formatDateShort(endDate)}`;
  };

  const handleConfirm = () => {
    // Ensure start date is before end date
    if (tempStartDate > tempEndDate) {
      onDateRangeChange(tempEndDate, tempStartDate);
    } else {
      onDateRangeChange(tempStartDate, tempEndDate);
    }
    setIsVisible(false);
  };

  const handleCancel = () => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setSelectingStart(true);
    setIsVisible(false);
  };

  const handleQuickSelect = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setTempStartDate(start);
    setTempEndDate(end);
  };

  const quickRanges = [
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 90 days', days: 90 },
    { label: 'This Year', days: new Date().getDayOfYear() }
  ];

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
          {formatDateRange()}
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
          <View className={`${isDark ? 'bg-gray-900' : 'bg-white'} rounded-t-3xl max-h-[80%]`}>
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <TouchableOpacity onPress={handleCancel}>
                <Text className="text-red-500 font-medium">Cancel</Text>
              </TouchableOpacity>
              <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Select Date Range
              </Text>
              <TouchableOpacity onPress={handleConfirm}>
                <Text className="text-blue-500 font-medium">Done</Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View className="p-4">
                {/* Quick Range Buttons */}
                <Text className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Quick Select
                </Text>
                <View className="flex-row flex-wrap gap-2 mb-6">
                  {quickRanges.map((range) => (
                    <TouchableOpacity
                      key={range.label}
                      onPress={() => handleQuickSelect(range.days)}
                      className="px-3 py-2 rounded-lg bg-blue-500"
                    >
                      <Text className="text-white text-sm font-medium">
                        {range.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Date Selection Toggle */}
                <View className="flex-row mb-4">
                  <TouchableOpacity
                    onPress={() => setSelectingStart(true)}
                    className={`flex-1 py-3 rounded-l-xl border ${
                      selectingStart 
                        ? 'bg-blue-500 border-blue-500' 
                        : isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-300'
                    }`}
                  >
                    <Text className={`text-center font-medium ${
                      selectingStart ? 'text-white' : isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Start Date
                    </Text>
                    <Text className={`text-center text-sm ${
                      selectingStart ? 'text-white/80' : isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {formatDateShort(tempStartDate)}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => setSelectingStart(false)}
                    className={`flex-1 py-3 rounded-r-xl border ${
                      !selectingStart 
                        ? 'bg-blue-500 border-blue-500' 
                        : isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-300'
                    }`}
                  >
                    <Text className={`text-center font-medium ${
                      !selectingStart ? 'text-white' : isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      End Date
                    </Text>
                    <Text className={`text-center text-sm ${
                      !selectingStart ? 'text-white/80' : isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {formatDateShort(tempEndDate)}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Selected Range Display */}
                <View className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 mb-4">
                  <Text className={`text-center font-medium ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                    Selected Range
                  </Text>
                  <Text className={`text-center text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                    {formatDateShort(tempStartDate)} - {formatDateShort(tempEndDate)}
                  </Text>
                  <Text className={`text-center text-xs mt-1 ${isDark ? 'text-blue-500' : 'text-blue-500'}`}>
                    {Math.ceil((tempEndDate.getTime() - tempStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1} days
                  </Text>
                </View>

                {/* Instructions */}
                <View className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <Text className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    💡 Tip: Use the toggle buttons above to switch between selecting start and end dates, 
                    or use the quick select buttons for common date ranges.
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

// Helper extension for Date
declare global {
  interface Date {
    getDayOfYear(): number;
  }
}

Date.prototype.getDayOfYear = function() {
  const start = new Date(this.getFullYear(), 0, 0);
  const diff = this.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};