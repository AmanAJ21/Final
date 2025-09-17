import React, { useState } from 'react';
import { View, ScrollView, Alert, Share, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useTransactions } from '../contexts/TransactionContext';
import { Header } from '../components/Header';
import { BottomNavigation } from '../components/BottomNavigation';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import Papa from 'papaparse';
import { StatisticsCard } from '../components/export-import/StatisticsCard';
import { ActionCard } from '../components/export-import/ActionCard';
import { BackupInfoCard } from '../components/export-import/BackupInfoCard';

export default function ExportImportPage() {
  const { top } = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { transactions, addMultipleTransactions } = useTransactions();
  const [, setIsExporting] = useState(false);

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

      if (Platform.OS === 'web') {
        await Share.share({
          message: content,
          title: `Export Transactions (${format.toUpperCase()})`,
        });
      } else {
        const fileUri = FileSystem.documentDirectory + fileName;
        await FileSystem.writeAsStringAsync(fileUri, content, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        Alert.alert(
          'Export Successful',
          `Your transactions have been saved to your documents folder as ${fileName}`
        );
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert(
        'Export Error',
        'An error occurred while exporting your data. Please try again.'
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (format: 'csv' | 'json') => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: format === 'csv' ? 'text/csv' : 'application/json',
      });

      if (result.canceled) {
        return;
      }

      const fileUri = result.assets[0].uri;
      const fileContent = await fetch(fileUri).then(res => res.text());

      if (format === 'json') {
        const newTransactions = JSON.parse(fileContent);
        addMultipleTransactions(newTransactions);
        Alert.alert('Success', `Transactions imported successfully from JSON!`);
      } else if (format === 'csv') {
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
      Alert.alert('Error', `Failed to import transactions. Please try again.`);
    }
  };

  const exportOptions = [
    {
      id: 'csv',
      title: 'Export as CSV',
      subtitle: 'Spreadsheet compatible format',
      icon: 'document-text' as const,
      color: 'bg-green-500',
      onPress: () => handleExport('csv')
    },
    {
      id: 'json',
      title: 'Export as JSON',
      subtitle: 'Developer-friendly format',
      icon: 'code-slash' as const,
      color: 'bg-blue-500',
      onPress: () => handleExport('json')
    }
  ];

  const importOptions = [
    {
      id: 'csv-import',
      title: 'Import from CSV',
      subtitle: 'Import from spreadsheet file',
      icon: 'cloud-upload' as const,
      color: 'bg-purple-500',
      onPress: () => handleImport('csv')
    },
    {
      id: 'json-import',
      title: 'Import from JSON',
      subtitle: 'Import from backup file',
      icon: 'download' as const,
      color: 'bg-orange-500',
      onPress: () => handleImport('json')
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
        <View className="p-5 space-y-6">
          <StatisticsCard stats={stats} formatCurrency={formatCurrency} />
          <ActionCard title="Export Data" options={exportOptions} />
          <ActionCard title="Import Data" options={importOptions} />
          <BackupInfoCard />
        </View>
        <View className="h-20" />
      </ScrollView>

      <BottomNavigation />
    </View>
  );
}