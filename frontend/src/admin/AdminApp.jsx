import { useEffect } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { getToken } from './api.js';
import Layout from './Layout.jsx';
import Login from './pages/Login.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ListView from './pages/ListView.jsx';
import FormView from './pages/FormView.jsx';
import ChangePassword from './pages/ChangePassword.jsx';
import { ToastProvider } from './Toast.jsx';
import './admin.css';

function Protected() {
  return getToken() ? <Layout><Outlet /></Layout> : <Navigate to="/admin/login" replace />;
}

export default function AdminApp() {
  useEffect(() => {
    const previous = document.title;
    document.title = 'Leafnest | Admin Panel';
    return () => { document.title = previous; };
  }, []);

  return (
    <div className="adm">
      <ToastProvider>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password/:token" element={<ResetPassword />} />
        <Route element={<Protected />}>
          <Route index element={<Dashboard />} />
          <Route path="password-change" element={<ChangePassword />} />
          <Route path=":resource" element={<ListView />} />
          <Route path=":resource/add" element={<FormView />} />
          <Route path=":resource/:id" element={<FormView />} />
        </Route>
      </Routes>
      </ToastProvider>
    </div>
  );
}
