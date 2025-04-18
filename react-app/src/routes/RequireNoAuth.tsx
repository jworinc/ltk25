import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useToken } from '../services/useToken';

// Usage: <RequireNoAuth><LoginOrRegister /></RequireNoAuth>
export const RequireNoAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { loggedIn, removeToken } = useToken();
  const location = useLocation();
  const path = location.pathname.split('/')[1];
  if (loggedIn() && path !== 'entrance' && path !== 'demo') {
    return <Navigate to="/home" replace />;
  }
  // Clear token and auth state on public-only routes
  React.useEffect(() => {
    if (!loggedIn()) removeToken();
  }, [loggedIn, removeToken]);
  return <>{children}</>;
};
