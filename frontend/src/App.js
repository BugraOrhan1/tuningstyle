import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Toaster } from './components/ui/toaster';
import { Loader2 } from 'lucide-react';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import UploadFile from './pages/UploadFile';
import MyFiles from './pages/MyFiles';
import FileDetail from './pages/FileDetail';
import Credits from './pages/Credits';
import TuningSpecs from './pages/TuningSpecs';
import Account from './pages/Account';
import Support from './pages/Support';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminFiles from './pages/admin/AdminFiles';
import AdminFileDetail from './pages/admin/AdminFileDetail';
import AdminUsers from './pages/admin/AdminUsers';
import './App.css';

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#EEF1F4]">
    <Loader2 className="w-8 h-8 animate-spin text-fct-orange" />
  </div>
);

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user, loadingAuth } = useApp();
  if (loadingAuth) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !user.is_admin) return <Navigate to="/dashboard" replace />;
  if (!adminOnly && user.is_admin) {
    // Admin shouldn't access user-only routes (upload, credits, tuning-specs, files)
    const path = window.location.pathname;
    const adminBlockedPaths = ['/upload', '/credits', '/tuning-specs', '/files', '/dashboard'];
    if (adminBlockedPaths.some(p => path.startsWith(p))) {
      return <Navigate to="/admin" replace />;
    }
  }
  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { user, loadingAuth } = useApp();
  if (loadingAuth) return <LoadingScreen />;
  if (user) return <Navigate to={user.is_admin ? '/admin' : '/dashboard'} replace />;
  return children;
};

const RootRedirect = () => {
  const { user, loadingAuth } = useApp();
  if (loadingAuth) return <LoadingScreen />;
  if (user) return <Navigate to={user.is_admin ? '/admin' : '/dashboard'} replace />;
  return <Navigate to="/login" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
      <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/upload" element={<PrivateRoute><UploadFile /></PrivateRoute>} />
      <Route path="/files" element={<PrivateRoute><MyFiles /></PrivateRoute>} />
      <Route path="/files/:id" element={<PrivateRoute><FileDetail /></PrivateRoute>} />
      <Route path="/credits" element={<PrivateRoute><Credits /></PrivateRoute>} />
      <Route path="/tuning-specs" element={<PrivateRoute><TuningSpecs /></PrivateRoute>} />
      <Route path="/account" element={<PrivateRoute><Account /></PrivateRoute>} />
      <Route path="/support" element={<PrivateRoute><Support /></PrivateRoute>} />
      <Route path="/admin" element={<PrivateRoute adminOnly><AdminDashboard /></PrivateRoute>} />
      <Route path="/admin/files" element={<PrivateRoute adminOnly><AdminFiles /></PrivateRoute>} />
      <Route path="/admin/files/:id" element={<PrivateRoute adminOnly><AdminFileDetail /></PrivateRoute>} />
      <Route path="/admin/users" element={<PrivateRoute adminOnly><AdminUsers /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AppProvider>
          <AppRoutes />
          <Toaster />
        </AppProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
