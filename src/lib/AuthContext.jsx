import { createContext, useState, useContext, useEffect } from 'react';
import { auth } from '@/api/base44Client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    if (auth.isAuthenticated()) {
      setUser(auth.getUser());
      setIsAuthenticated(true);
    }
    setIsLoadingAuth(false);
  }, []);

  const login = (userData) => {
    auth.setSession(userData);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    auth.clearSession();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoadingAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
