import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

export function Header({ title, showBackButton = false, onBackPress }: HeaderProps) {
  const router = useRouter();
  const { theme, setTheme, isDark } = useTheme();

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getThemeIcon = () => {
    if (theme === 'light') return 'sunny-outline';
    if (theme === 'dark') return 'moon-outline';
    return 'phone-portrait-outline';
  };

  return (
    <View className={`flex-row items-center justify-between px-4 py-3`}>
      <View className="flex-row items-center flex-1">
        {showBackButton && (
          <TouchableOpacity
            onPress={onBackPress || (() => router.back())}
            className="mr-3 p-2"
          >
                        <Ionicons 
              name="arrow-back-outline" 
              size={24} 
              color={isDark ? '#fff' : '#000'} 
            />
          </TouchableOpacity>
        )}
        <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </Text>
      </View>
      
      <View className="flex-row items-center">
        {title === 'Dashboard' && (
          <TouchableOpacity
            onPress={() => router.push('/search')}
            className="p-2 mr-2"
          >
            <Ionicons 
              name="search-outline" 
              size={24} 
              color={isDark ? '#fff' : '#000'} 
            />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          onPress={toggleTheme}
          className="p-2"
        >
          <Ionicons 
            name={getThemeIcon()} 
            size={24} 
            color={isDark ? '#fff' : '#000'} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}