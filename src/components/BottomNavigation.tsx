import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { bottom } = useSafeAreaInsets();
  const { isDark } = useTheme();

  const tabs = [
    {
      id: 'home',
      title: 'Home',
      icon: 'home-outline',
      activeIcon: 'home',
      route: '/',
    },
    {
      id: 'transactions',
      title: 'Transactions',
      icon: 'list-outline',
      activeIcon: 'list',
      route: '/transactions',
    },
    {
      id: 'add',
      title: 'Add',
      icon: 'add-circle-outline',
      activeIcon: 'add-circle',
      route: '/add-transaction',
    },
    {
      id: 'calendar',
      title: 'Calendar',
      icon: 'calendar-outline',
      activeIcon: 'calendar',
      route: '/calendar',
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: 'settings-outline',
      activeIcon: 'settings',
      route: '/settings',
    },
  ];

  const isActive = (route: string) => {
    if (route === '/') return pathname === '/';
    return pathname.startsWith(route);
  };

  return (
    <View 
      className={`${isDark ? 'bg-gray-900' : 'bg-white'} border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
      style={{ paddingBottom: bottom }}
    >
      <View className="flex-row justify-around items-center py-2">
        {tabs.map((tab) => {
          const active = isActive(tab.route);
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => router.push(tab.route as any)}
              className="items-center justify-center py-2 px-3 min-w-[60px]"
            >
              <View className={`items-center justify-center w-8 h-8 rounded-full ${
                active ? (isDark ? 'bg-blue-600' : 'bg-blue-500') : 'bg-transparent'
              }`}>
                <Ionicons
                  name={(active ? tab.activeIcon : tab.icon) as any}
                  size={20}
                  color={
                    active 
                      ? '#ffffff'
                      : isDark 
                        ? '#9ca3af' 
                        : '#6b7280'
                  }
                />
              </View>
              <Text className={`text-xs mt-1 ${
                active 
                  ? (isDark ? 'text-blue-400' : 'text-blue-500')
                  : (isDark ? 'text-gray-400' : 'text-gray-600')
              }`}>
                {tab.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}