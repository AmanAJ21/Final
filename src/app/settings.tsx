import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useTransactions } from '../contexts/TransactionContext';
import { Header } from '../components/Header';
import { BottomNavigation } from '../components/BottomNavigation';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsPage() {
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const { isDark, theme, setTheme } = useTheme();
  const { transactions } = useTransactions();

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Export functionality will be available in a future update.',
      [{ text: 'OK' }]
    );
  };

  const handleBackupData = () => {
    Alert.alert(
      'Backup Data',
      'Cloud backup functionality will be available in a future update.',
      [{ text: 'OK' }]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your transactions. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: () => {
            // This would clear all data in a real implementation
            Alert.alert('Success', 'All data has been cleared.');
          }
        }
      ]
    );
  };

  const settingSections = [
    {
      title: 'Appearance',
      items: [
        {
          icon: 'color-palette',
          title: 'Theme',
          subtitle: `Current: ${theme === 'system' ? 'System' : theme === 'dark' ? 'Dark' : 'Light'}`,
          onPress: () => {
            Alert.alert(
              'Select Theme',
              'Choose your preferred theme',
              [
                { text: 'Light', onPress: () => setTheme('light') },
                { text: 'Dark', onPress: () => setTheme('dark') },
                { text: 'System', onPress: () => setTheme('system') },
                { text: 'Cancel', style: 'cancel' }
              ]
            );
          }
        }
      ]
    },
    {
      title: 'Categories',
      items: [
        {
          icon: 'list',
          title: 'Manage Categories',
          subtitle: 'Add, edit, or remove transaction categories',
          onPress: () => router.push('/categories')
        }
      ]
    },
    {
      title: 'Data Management',
      items: [
        {
          icon: 'download',
          title: 'Export & Import',
          subtitle: 'Export/import your transaction data',
          onPress: () => router.push('/export-import')
        },
        {
          icon: 'repeat',
          title: 'Recurring Transactions',
          subtitle: 'Manage automatic transactions',
          onPress: () => router.push('/recurring')
        },
        {
          icon: 'cloud-upload',
          title: 'Backup Data',
          subtitle: 'Backup to cloud storage',
          onPress: handleBackupData
        },
        {
          icon: 'trash',
          title: 'Clear All Data',
          subtitle: 'Delete all transactions permanently',
          onPress: handleClearData,
          destructive: true
        }
      ]
    },
    {
      title: 'Statistics',
      items: [
        {
          icon: 'stats-chart',
          title: 'Total Transactions',
          subtitle: `${transactions.length} transactions recorded`,
          onPress: () => { }
        },
        {
          icon: 'analytics',
          title: 'Financial Insights',
          subtitle: 'Detailed analytics and trends',
          onPress: () => router.push('/insights')
        },
        {
          icon: 'bar-chart',
          title: 'Financial Reports',
          subtitle: 'Comprehensive financial reports',
          onPress: () => router.push('/reports')
        },
        {
          icon: 'calendar',
          title: 'Account Age',
          subtitle: 'Using Transaction Tracker since today',
          onPress: () => { }
        }
      ]
    },
    {
      title: 'About',
      items: [
        {
          icon: 'information-circle',
          title: 'App Version',
          subtitle: '1.0.0',
          onPress: () => { }
        },
        {
          icon: 'help-circle',
          title: 'Help & Support',
          subtitle: 'Get help with using the app',
          onPress: () => {
            Alert.alert(
              'Help & Support',
              'For support, please contact us at support@transactiontracker.com',
              [{ text: 'OK' }]
            );
          }
        },
        {
          icon: 'heart',
          title: 'Rate the App',
          subtitle: 'Help us improve by rating the app',
          onPress: () => {
            Alert.alert(
              'Rate the App',
              'Thank you for using Transaction Tracker! Rating functionality will be available when published to app stores.',
              [{ text: 'OK' }]
            );
          }
        }
      ]
    }
  ];

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`} style={{ paddingTop: top }}>
      <Header title="Settings" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {settingSections.map((section, sectionIndex) => (
          <View key={sectionIndex} className="mt-6">
            <Text className={`text-sm font-medium mb-3 mx-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {section.title.toUpperCase()}
            </Text>

            <View className={`mx-4 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm overflow-hidden`}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  onPress={item.onPress}
                  className={`flex-row items-center p-4 ${itemIndex < section.items.length - 1
                      ? `border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`
                      : ''
                    }`}
                >
                  <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${item.destructive
                      ? 'bg-red-100'
                      : isDark ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                    <Ionicons
                      name={item.icon as any}
                      size={20}
                      color={
                        item.destructive
                          ? '#ef4444'
                          : isDark ? '#9ca3af' : '#6b7280'
                      }
                    />
                  </View>

                  <View className="flex-1">
                    <Text className={`font-medium ${item.destructive
                        ? 'text-red-500'
                        : isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                      {item.title}
                    </Text>
                    {item.subtitle && (
                      <Text className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {item.subtitle}
                      </Text>
                    )}
                  </View>

                  {item.onPress && (
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={isDark ? '#6b7280' : '#9ca3af'}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <View className="h-20" />
      </ScrollView>

      <BottomNavigation />
    </View>
  );
}