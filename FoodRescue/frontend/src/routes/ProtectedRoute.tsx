import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    const fallbackPath =
      currentUser.role === 'PROVIDER'
        ? '/provider/dashboard'
        : currentUser.role === 'NGO'
        ? '/ngo/dashboard'
        : '/admin/dashboard';
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}
