import React from "react";
import { View, ScrollView, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from '../contexts/ThemeContext';
import { Header } from '../components/Header';
import { BalanceCard } from '../components/BalanceCard';
import { QuickActions } from '../components/QuickActions';
import { SpendingTrends } from '../components/SpendingTrends';
import { RecentTransactions } from '../components/RecentTransactions';
import { BudgetOverview } from '../components/BudgetOverview';
import { BottomNavigation } from '../components/BottomNavigation';

export default function HomePage() {
  const { top } = useSafeAreaInsets();
  const { isDark } = useTheme();

  return (
    <View
      className={`flex-1 ${isDark ? 'bg-neutral-900' : 'bg-neutral-50'}`}
      style={{ paddingTop: top }}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <Header title="Dashboard" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 16 }}
      >
        <View className="space-y-12">
          <BalanceCard />
          <QuickActions />
          <SpendingTrends />
          <BudgetOverview />
          <RecentTransactions />
        </View>
        <View className="h-24" />
      </ScrollView>

      <BottomNavigation />
    </View>
  );
}
