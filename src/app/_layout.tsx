import "../global.css";
import { Slot } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '../contexts/ThemeContext';
import { TransactionProvider } from '../contexts/TransactionContext';
import { CategoryProvider } from '../contexts/CategoryContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function Layout() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <CategoryProvider>
          <TransactionProvider>
            <StatusBar style="auto" />
            <Slot />
          </TransactionProvider>
        </CategoryProvider>
      </SafeAreaProvider>
    </ThemeProvider >
  );
}
