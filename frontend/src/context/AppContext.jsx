import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockUser, mockFiles, mockTransactions } from '../mock';
import { translations } from '../data/translations';

const AppContext = createContext(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('fct_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [files, setFiles] = useState(() => {
    const stored = localStorage.getItem('fct_files');
    return stored ? JSON.parse(stored) : mockFiles;
  });
  const [transactions, setTransactions] = useState(() => {
    const stored = localStorage.getItem('fct_transactions');
    return stored ? JSON.parse(stored) : mockTransactions;
  });
  const [language, setLanguage] = useState(() => localStorage.getItem('fct_lang') || 'en');

  useEffect(() => {
    if (user) localStorage.setItem('fct_user', JSON.stringify(user));
    else localStorage.removeItem('fct_user');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('fct_files', JSON.stringify(files));
  }, [files]);

  useEffect(() => {
    localStorage.setItem('fct_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('fct_lang', language);
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  const login = (email, password) => {
    // Mock login - any credentials with valid format will work
    if (email && password.length >= 4) {
      const u = { ...mockUser, email };
      setUser(u);
      return { success: true };
    }
    return { success: false, error: 'Invalid credentials' };
  };

  const register = (data) => {
    const newUser = {
      ...mockUser,
      id: 'usr_' + Date.now(),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      company: data.company || '',
      phone: data.phone || '',
      country: data.country || '',
      vatNumber: data.vatNumber || '',
      credits: 0,
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);
    setFiles([]);
    setTransactions([]);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  const addCredits = (amount, price) => {
    setUser(prev => ({ ...prev, credits: prev.credits + amount }));
    setTransactions(prev => [
      { id: 'tx_' + Date.now(), type: 'purchase', amount, price, date: new Date().toISOString(), method: 'Multisafepay' },
      ...prev,
    ]);
  };

  const submitFile = (fileData) => {
    if (user.credits < fileData.credits) return { success: false, error: 'Not enough credits' };
    const newFile = {
      id: 'file_' + Date.now(),
      ...fileData,
      status: 'pending',
      uploadedAt: new Date().toISOString(),
      completedAt: null,
      tunedFile: null,
    };
    setFiles(prev => [newFile, ...prev]);
    setUser(prev => ({ ...prev, credits: prev.credits - fileData.credits }));
    setTransactions(prev => [
      { id: 'tx_' + Date.now(), type: 'usage', amount: -fileData.credits, fileId: newFile.id, date: new Date().toISOString() },
      ...prev,
    ]);
    return { success: true, file: newFile };
  };

  return (
    <AppContext.Provider value={{
      user, files, transactions, language,
      setLanguage, t, login, register, logout, updateUser,
      addCredits, submitFile,
    }}>
      {children}
    </AppContext.Provider>
  );
};
