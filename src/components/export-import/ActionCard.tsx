import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '../Card';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

type ActionCardProps = {
  options: {
    id: string;
    title: string;
    subtitle: string;
    icon: any;
    color: string;
    onPress: () => void;
  }[];
  title: string;
};

export function ActionCard({ options, title }: ActionCardProps) {
  const { isDark } = useTheme();

  return (
    <View>
      <Text className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </Text>

      <Card className="p-0 overflow-hidden">
        {options.map((option, index) => (
          <TouchableOpacity
            key={option.id}
            onPress={option.onPress}
            className={`flex-row items-center p-5 ${index < options.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}
          >
            <View className={`w-14 h-14 rounded-full items-center justify-center mr-4 ${option.color}`}>
              <Ionicons name={option.icon} size={28} color="white" />
            </View>

            <View className="flex-1">
              <Text className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {option.title}
              </Text>
              <Text className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {option.subtitle}
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={24}
              color={isDark ? '#6b7280' : '#9ca3af'}
            />
          </TouchableOpacity>
        ))}
      </Card>
    </View>
  );
}
