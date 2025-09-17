import React, { createContext, useContext, useState } from 'react';

export interface RecurringTransaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextDate: string;
  isActive: boolean;
  description?: string;
  isDefault?: boolean;
}

interface RecurringTransactionContextType {
  recurringTransactions: RecurringTransaction[];
  addRecurringTransaction: (transaction: Omit<RecurringTransaction, 'id'>) => void;
  updateRecurringTransaction: (id: string, updates: Partial<RecurringTransaction>) => void;
  deleteRecurringTransaction: (id: string) => void;
  toggleRecurringTransaction: (id: string) => void;
  resetRecurringTransactions: () => void;
}

const RecurringTransactionContext = createContext<RecurringTransactionContextType | undefined>(undefined);

export function RecurringTransactionProvider({ children }: { children: React.ReactNode }) {
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([
    {
      id: '1',
      title: 'Monthly Salary',
      amount: 5000,
      type: 'income',
      category: 'Work',
      frequency: 'monthly',
      nextDate: '2024-02-01',
      isActive: true,
      description: 'Regular monthly salary',
      isDefault: true,
    },
    {
      id: '2',
      title: 'Rent Payment',
      amount: 1200,
      type: 'expense',
      category: 'Bills',
      frequency: 'monthly',
      nextDate: '2024-02-01',
      isActive: true,
      description: 'Monthly rent payment',
      isDefault: true,
    },
    {
      id: '3',
      title: 'Netflix Subscription',
      amount: 15.99,
      type: 'expense',
      category: 'Entertainment',
      frequency: 'monthly',
      nextDate: '2024-02-15',
      isActive: true,
      description: 'Monthly Netflix subscription',
      isDefault: true,
    },
    {
      id: '4',
      title: 'Weekly Groceries',
      amount: 150,
      type: 'expense',
      category: 'Food',
      frequency: 'weekly',
      nextDate: '2024-01-28',
      isActive: false,
      description: 'Weekly grocery shopping',
      isDefault: true,
    }
  ]);

  const addRecurringTransaction = (transaction: Omit<RecurringTransaction, 'id'>) => {
    const newTransaction: RecurringTransaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setRecurringTransactions(prev => [...prev, newTransaction]);
  };

  const updateRecurringTransaction = (id: string, updates: Partial<RecurringTransaction>) => {
    setRecurringTransactions(prev => 
      prev.map(t => t.id === id ? { ...t, ...updates } : t)
    );
  };

  const deleteRecurringTransaction = (id: string) => {
    setRecurringTransactions(prev => prev.filter(t => t.id !== id));
  };

  const toggleRecurringTransaction = (id: string) => {
    setRecurringTransactions(prev =>
      prev.map(t => t.id === id ? { ...t, isActive: !t.isActive } : t)
    );
  };

  const resetRecurringTransactions = () => {
    setRecurringTransactions(prev => prev.filter(t => t.isDefault));
  };

  return (
    <RecurringTransactionContext.Provider value={{
      recurringTransactions,
      addRecurringTransaction,
      updateRecurringTransaction,
      deleteRecurringTransaction,
      toggleRecurringTransaction,
      resetRecurringTransactions
    }}>
      {children}
    </RecurringTransactionContext.Provider>
  );
}

export function useRecurringTransactions() {
  const context = useContext(RecurringTransactionContext);
  if (context === undefined) {
    throw new Error('useRecurringTransactions must be used within a RecurringTransactionProvider');
  }
  return context;
}
