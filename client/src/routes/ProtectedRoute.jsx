import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ adminOnly = false }) => {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/auth/login" replace />;
  if (adminOnly && !isAdmin()) return <Navigate to="/" replace />;
  return <Outlet />;
};

export default ProtectedRoute;
