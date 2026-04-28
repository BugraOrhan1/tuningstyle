import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, filesApi, creditsApi, notificationsApi } from '../api/client';
import { translations } from '../data/translations';

const AppContext = createContext(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [files, setFiles] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [language, setLanguage] = useState(() => localStorage.getItem('fct_lang') || 'en');

  useEffect(() => {
    localStorage.setItem('fct_lang', language);
  }, [language]);

  // Bootstrap user from auth cookie
  useEffect(() => {
    let cancelled = false;

    authApi.me()
      .then(u => {
        if (cancelled) return;
        setUser(u);
        if (u.language) setLanguage(u.language);
      })
      .catch((error) => {
        if (!cancelled) setUser(null);
        console.warn('Auth bootstrap failed:', error);
      })
      .finally(() => {
        if (!cancelled) setLoadingAuth(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const refreshFiles = useCallback(async () => {
    if (!user) return;
    try {
      setFiles(await filesApi.list());
    } catch (error) {
      console.error('Failed to refresh files:', error);
    }
  }, [user]);

  const refreshTransactions = useCallback(async () => {
    if (!user) return;
    try {
      setTransactions(await creditsApi.transactions());
    } catch (error) {
      console.error('Failed to refresh transactions:', error);
    }
  }, [user]);

  const refreshNotifications = useCallback(async () => {
    if (!user) return;
    try {
      setNotifications(await notificationsApi.list());
    } catch (error) {
      console.error('Failed to refresh notifications:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user && !user.is_admin) {
      refreshFiles();
      refreshTransactions();
    }
    if (user) {
      refreshNotifications();
      const interval = setInterval(refreshNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user, refreshFiles, refreshTransactions, refreshNotifications]);

  const t = (key) => translations[language]?.[key] || translations.en[key] || key;

  const login = async (email, password) => {
    try {
      const data = await authApi.login({ email, password });
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (e) {
      return { success: false, error: e.response?.data?.detail || 'Login failed' };
    }
  };

  const register = async (data) => {
    try {
      const res = await authApi.register(data);
      setUser(res.user);
      return { success: true, user: res.user };
    } catch (e) {
      return { success: false, error: e.response?.data?.detail || 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.warn('Logout endpoint failed:', error);
    }
    setUser(null);
    setFiles([]);
    setTransactions([]);
    setNotifications([]);
  };

  const updateUser = async (updates) => {
    const updated = await authApi.updateProfile(updates);
    setUser(updated);
    return updated;
  };

  const refreshUser = async () => {
    const u = await authApi.me();
    setUser(u);
    return u;
  };

  const purchaseCredits = async (packageId) => {
    const res = await creditsApi.purchase(packageId);
    setUser(res.user);
    setTransactions(prev => [res.transaction, ...prev]);
    return res;
  };

  const submitFile = async (formData) => {
    const fd = new FormData();
    fd.append('file', formData.file);
    fd.append('vehicle', formData.vehicle);
    fd.append('ecu', formData.ecu);
    fd.append('tuningOptions', (formData.tuningOptions || []).join(','));
    fd.append('credits', formData.credits);
    fd.append('note', formData.note || '');
    // Extended fields
    const extra = ['brand', 'model', 'generation', 'engine', 'engineHp', 'engineKw', 'year',
      'gearbox', 'licensePlate', 'vin', 'octane', 'toolType', 'readMethod',
      'hardwareNumber', 'softwareNumber', 'tuningType', 'modifiedParts',
      'modifiedPartsDetails', 'timeFrame'];
    extra.forEach(k => fd.append(k, formData[k] || ''));
    try {
      const f = await filesApi.upload(fd);
      await refreshUser();
      await refreshFiles();
      await refreshTransactions();
      return { success: true, file: f };
    } catch (e) {
      return { success: false, error: e.response?.data?.detail || 'Upload failed' };
    }
  };

  return (
    <AppContext.Provider value={{
      user, loadingAuth, files, transactions, notifications, language,
      setLanguage, t, login, register, logout, updateUser, refreshUser,
      purchaseCredits, submitFile, refreshFiles, refreshNotifications,
    }}>
      {children}
    </AppContext.Provider>
  );
};
