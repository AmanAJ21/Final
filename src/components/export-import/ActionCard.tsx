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
    <View className="mx-4 mt-6">
      <Text className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </Text>

      <View>
        {options.map((option, index) => (
          <Card
            key={option.id}
            className={`${index > 0 ? 'mt-3' : ''}`}
            onPress={option.onPress}
          >
            <View className="flex-row items-center">
              <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${option.color}`}>
                <Ionicons name={option.icon} size={24} color="white" />
              </View>

              <View className="flex-1">
                <Text className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {option.title}
                </Text>
                <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {option.subtitle}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color={isDark ? '#6b7280' : '#9ca3af'}
              />
            </View>
          </Card>
        ))}
      </View>
    </View>
  );
}
