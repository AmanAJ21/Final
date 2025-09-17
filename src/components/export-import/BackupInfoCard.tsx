import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '../Card';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

export function BackupInfoCard() {
  const { isDark } = useTheme();

  return (
    <Card className="mx-4 mt-6">
      <View className="flex-row items-start">
        <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${isDark ? 'bg-blue-900' : 'bg-blue-100'}`}>
          <Ionicons name="information-circle" size={20} color="#3b82f6" />
        </View>

        <View className="flex-1">
          <Text className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Backup Recommendations
          </Text>
          <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            • Export your data regularly to prevent data loss{'\n'}
            • CSV format is compatible with Excel and Google Sheets{'\n'}
            • JSON format preserves all data structure{'\n'}
            • Keep backups in multiple locations for safety
          </Text>
        </View>
      </View>
    </Card>
  );
}
