import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/XTOXClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState({ id: 'local', public_settings: {} });

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const me = await base44.auth.me();
        if (me) {
          setUser(me);
          setIsAuthenticated(true);
        } else {
          const [demoUser] = await base44.entities.User.list();
          setUser(demoUser || { email: 'guest@xtox.app', full_name: 'Guest User' });
          setIsAuthenticated(true);
        }
      } catch {
        const [demoUser] = await base44.entities.User.list();
        setUser(demoUser || { email: 'guest@xtox.app', full_name: 'Guest User' });
        setIsAuthenticated(true);
      } finally {
        setIsLoadingAuth(false);
      }
    };
    bootstrap();
  }, []);

  const login = async (email, password) => {
    const { user: loggedIn } = await base44.auth.login(email, password);
    setUser(loggedIn || { email: 'demo@xtox.app', full_name: 'Demo User' });
    setIsAuthenticated(true);
    setAuthError(null);
  };

  const logout = () => {
    base44.auth.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const navigateToLogin = () => login('demo@xtox.app', 'demo');

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      login,
      logout,
      navigateToLogin,
      checkAppState: () => {},
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

