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
      icon: 'add-outline',
      activeIcon: 'add',
      route: '/add-transaction',
      isFab: true,
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
      className={`absolute bottom-0 left-0 right-0`}
      style={{ paddingBottom: bottom }}
    >
      <View className={`flex-row justify-around items-center mx-4 rounded-full ${isDark ? 'bg-neutral-800' : 'bg-white'} shadow-lg`}>
        {tabs.map((tab) => {
          const active = isActive(tab.route);
          if (tab.isFab) {
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => router.push(tab.route as any)}
                className="-mt-8 items-center justify-center w-16 h-16 rounded-full bg-primary shadow-lg"
              >
                <Ionicons name={tab.activeIcon as any} size={32} color="white" />
              </TouchableOpacity>
            )
          }
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => router.push(tab.route as any)}
              className="items-center justify-center py-4 px-3"
            >
              <Ionicons
                name={(active ? tab.activeIcon : tab.icon) as any}
                size={24}
                color={active ? (isDark ? '#10B981' : '#1E3A8A') : (isDark ? '#9ca3af' : '#6b7280')}
              />
              <Text className={`text-xs mt-1 ${active ? (isDark ? 'text-secondary' : 'text-primary') : (isDark ? 'text-gray-400' : 'text-gray-600')}`}>
                {tab.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}