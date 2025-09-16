import React, { createContext, useContext, useState } from 'react';

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  isDefault: boolean;
}

interface CategoryContextType {
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  getCategoriesByType: (type: 'income' | 'expense') => Category[];
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([
    // Default Income Categories
    { id: '1', name: 'Work', type: 'income', icon: 'briefcase', color: '#10b981', isDefault: true },
    { id: '2', name: 'Business', type: 'income', icon: 'business', color: '#059669', isDefault: true },
    { id: '3', name: 'Investment', type: 'income', icon: 'trending-up', color: '#047857', isDefault: true },
    { id: '4', name: 'Gift', type: 'income', icon: 'gift', color: '#065f46', isDefault: true },
    { id: '5', name: 'Other', type: 'income', icon: 'ellipsis-horizontal', color: '#064e3b', isDefault: true },
    
    // Default Expense Categories
    { id: '6', name: 'Food', type: 'expense', icon: 'restaurant', color: '#ef4444', isDefault: true },
    { id: '7', name: 'Transport', type: 'expense', icon: 'car', color: '#dc2626', isDefault: true },
    { id: '8', name: 'Shopping', type: 'expense', icon: 'bag', color: '#b91c1c', isDefault: true },
    { id: '9', name: 'Entertainment', type: 'expense', icon: 'game-controller', color: '#991b1b', isDefault: true },
    { id: '10', name: 'Bills', type: 'expense', icon: 'receipt', color: '#7f1d1d', isDefault: true },
    { id: '11', name: 'Health', type: 'expense', icon: 'medical', color: '#6b1d1d', isDefault: true },
    { id: '12', name: 'Education', type: 'expense', icon: 'school', color: '#5b1d1d', isDefault: true },
    { id: '13', name: 'Other', type: 'expense', icon: 'ellipsis-horizontal', color: '#4b1d1d', isDefault: true },
  ]);

  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories(prev => 
      prev.map(category => 
        category.id === id ? { ...category, ...updates } : category
      )
    );
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(category => category.id !== id));
  };

  const getCategoriesByType = (type: 'income' | 'expense') => {
    return categories.filter(category => category.type === type);
  };

  return (
    <CategoryContext.Provider value={{
      categories,
      addCategory,
      updateCategory,
      deleteCategory,
      getCategoriesByType
    }}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
}