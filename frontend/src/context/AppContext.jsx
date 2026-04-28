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
  const [token, setToken] = useState(() => localStorage.getItem('fct_token'));
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [files, setFiles] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [language, setLanguage] = useState(() => localStorage.getItem('fct_lang') || 'en');

  useEffect(() => {
    localStorage.setItem('fct_lang', language);
  }, [language]);

  // Bootstrap user from token
  useEffect(() => {
    if (!token) {
      setLoadingAuth(false);
      return;
    }
    authApi.me()
      .then(u => { setUser(u); if (u.language) setLanguage(u.language); })
      .catch(() => {
        localStorage.removeItem('fct_token');
        setToken(null);
      })
      .finally(() => setLoadingAuth(false));
  }, [token]);

  const refreshFiles = useCallback(async () => {
    if (!user) return;
    try { setFiles(await filesApi.list()); } catch {}
  }, [user]);

  const refreshTransactions = useCallback(async () => {
    if (!user) return;
    try { setTransactions(await creditsApi.transactions()); } catch {}
  }, [user]);

  const refreshNotifications = useCallback(async () => {
    if (!user) return;
    try { setNotifications(await notificationsApi.list()); } catch {}
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
      localStorage.setItem('fct_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (e) {
      return { success: false, error: e.response?.data?.detail || 'Login failed' };
    }
  };

  const register = async (data) => {
    try {
      const res = await authApi.register(data);
      localStorage.setItem('fct_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return { success: true, user: res.user };
    } catch (e) {
      return { success: false, error: e.response?.data?.detail || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('fct_token');
    setToken(null);
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

  const submitFile = async ({ file, vehicle, ecu, tuningOptions, credits, note }) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('vehicle', vehicle);
    fd.append('ecu', ecu);
    fd.append('tuningOptions', tuningOptions.join(','));
    fd.append('credits', credits);
    fd.append('note', note || '');
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
      user, token, loadingAuth, files, transactions, notifications, language,
      setLanguage, t, login, register, logout, updateUser, refreshUser,
      purchaseCredits, submitFile, refreshFiles, refreshNotifications,
    }}>
      {children}
    </AppContext.Provider>
  );
};
