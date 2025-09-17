import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useTransactions } from '../contexts/TransactionContext';
import { Header } from '../components/Header';
import { BottomNavigation } from '../components/BottomNavigation';
import { Card } from '../components/Card';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import Papa from 'papaparse';

export default function ExportImportPage() {
  const { top } = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { transactions, addMultipleTransactions } = useTransactions();
  const [isExporting, setIsExporting] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const generateCSV = () => {
    const headers = ['Date', 'Title', 'Category', 'Type', 'Amount', 'Description'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(t => [
        t.date,
        `"${t.title}"`,
        t.category,
        t.type,
        t.amount,
        `"${t.description || ''}"`
      ].join(','))
    ].join('\n');
    
    return csvContent;
  };

  const generateJSON = () => {
    return JSON.stringify(transactions, null, 2);
  };

  const handleExport = async (format: 'csv' | 'json') => {
    setIsExporting(true);
    
    try {
      const content = format === 'csv' ? generateCSV() : generateJSON();
      const fileName = `transactions_${new Date().toISOString().split('T')[0]}.${format}`;
      
      // In a real app, you would use a file system library to save the file
      // For now, we'll use the Share API to share the content
      await Share.share({
        message: content,
        title: `Export Transactions (${format.toUpperCase()})`,
      });
      
      Alert.alert('Success', `Transactions exported as ${format.toUpperCase()} successfully!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to export transactions. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'application/json'],
      });

      if (result.canceled) {
        return;
      }

      const fileUri = result.assets[0].uri;
      const fileContent = await fetch(fileUri).then(res => res.text());

      if (result.assets[0].mimeType === 'application/json') {
        const newTransactions = JSON.parse(fileContent);
        addMultipleTransactions(newTransactions);
        Alert.alert('Success', 'Transactions imported successfully from JSON!');
      } else if (result.assets[0].mimeType === 'text/csv') {
        Papa.parse(fileContent, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const newTransactions = results.data.map((row: any) => ({
              title: row.Title,
              amount: parseFloat(row.Amount),
              type: row.Type as 'income' | 'expense',
              category: row.Category,
              date: row.Date,
              description: row.Description,
            }));
            addMultipleTransactions(newTransactions);
            Alert.alert('Success', 'Transactions imported successfully from CSV!');
          },
          error: (error) => {
            Alert.alert('Error', 'Failed to parse CSV file.');
          }
        });
      }

    } catch (error) {
      Alert.alert('Error', 'Failed to import transactions. Please try again.');
    }
  };

  const exportOptions = [
    {
      id: 'csv',
      title: 'Export as CSV',
      subtitle: 'Spreadsheet compatible format',
      icon: 'document-text',
      color: 'bg-green-500',
      onPress: () => handleExport('csv')
    },
    {
      id: 'json',
      title: 'Export as JSON',
      subtitle: 'Developer-friendly format',
      icon: 'code-slash',
      color: 'bg-blue-500',
      onPress: () => handleExport('json')
    }
  ];

  const importOptions = [
    {
      id: 'csv-import',
      title: 'Import from CSV',
      subtitle: 'Import from spreadsheet file',
      icon: 'cloud-upload',
      color: 'bg-purple-500',
      onPress: handleImport
    },
    {
      id: 'json-import',
      title: 'Import from JSON',
      subtitle: 'Import from backup file',
      icon: 'download',
      color: 'bg-orange-500',
      onPress: handleImport
    }
  ];

  const stats = {
    total: transactions.length,
    income: transactions.filter(t => t.type === 'income').length,
    expense: transactions.filter(t => t.type === 'expense').length,
    totalAmount: transactions.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0)
  };

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`} style={{ paddingTop: top }}>
      <Header title="Export & Import" showBackButton />
      
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Statistics Card */}
        <Card className="mx-4 mt-6">
          <Text className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Data Overview
          </Text>
          
          <View className="flex-row justify-between items-center mb-3">
            <Text className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Total Transactions</Text>
            <Text className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total}</Text>
          </View>
          
          <View className="flex-row justify-between items-center mb-3">
            <Text className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Income Transactions</Text>
            <Text className="font-semibold text-green-500">{stats.income}</Text>
          </View>
          
          <View className="flex-row justify-between items-center mb-3">
            <Text className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Expense Transactions</Text>
            <Text className="font-semibold text-red-500">{stats.expense}</Text>
          </View>
          
          <View className={`border-t pt-3 mt-3 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <View className="flex-row justify-between items-center">
              <Text className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Net Total</Text>
              <Text className={`font-bold ${stats.totalAmount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatCurrency(stats.totalAmount)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Export Section */}
        <View className="mx-4 mt-6">
          <Text className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Export Data
          </Text>
          
          <View>
            {exportOptions.map((option, index) => (
              <Card
                key={option.id}
                className={`${index > 0 ? 'mt-3' : ''}`}
                onPress={option.onPress}
              >
                <View className="flex-row items-center">
                  <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${option.color}`}>
                    <Ionicons name={option.icon as any} size={24} color="white" />
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

        {/* Import Section */}
        <View className="mx-4 mt-6">
          <Text className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Import Data
          </Text>
          
          <View>
            {importOptions.map((option, index) => (
              <Card
                key={option.id}
                className={`${index > 0 ? 'mt-3' : ''}`}
                onPress={option.onPress}
              >
                <View className="flex-row items-center">
                  <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${option.color}`}>
                    <Ionicons name={option.icon as any} size={24} color="white" />
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

        {/* Backup Info */}
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

        <View className="h-20" />
      </ScrollView>

      <BottomNavigation />
    </View>
  );
}