import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useToken } from '../services/useToken';

// Usage: <RequireAuth><ProtectedComponent /></RequireAuth>
export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { loggedIn } = useToken();
  const location = useLocation();
  if (!loggedIn()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};
