import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useToken } from './useToken';

type AuthContextType = {
  loggedIn: boolean;
  changeAuthStatus: (value: boolean) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { loggedIn: tokenLoggedIn } = useToken();
  const [loggedIn, setLoggedIn] = useState<boolean>(tokenLoggedIn());

  const changeAuthStatus = useCallback((value: boolean) => setLoggedIn(value), []);

  return (
    <AuthContext.Provider value={{ loggedIn, changeAuthStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
