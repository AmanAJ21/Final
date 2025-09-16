import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  description?: string;
}

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      title: 'Salary',
      amount: 5000,
      type: 'income',
      category: 'Work',
      date: new Date().toISOString().split('T')[0],
      description: 'Monthly salary'
    },
    {
      id: '2',
      title: 'Groceries',
      amount: 150,
      type: 'expense',
      category: 'Food',
      date: new Date().toISOString().split('T')[0],
      description: 'Weekly grocery shopping'
    }
  ]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const updateTransaction = (id: string, updatedTransaction: Partial<Transaction>) => {
    setTransactions(prev => 
      prev.map(t => t.id === id ? { ...t, ...updatedTransaction } : t)
    );
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  return (
    <TransactionContext.Provider value={{
      transactions,
      addTransaction,
      deleteTransaction,
      updateTransaction,
      totalIncome,
      totalExpense,
      balance
    }}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
}