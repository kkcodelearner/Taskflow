import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [demoAccounts, setDemoAccounts] = useState([]);

  // Fetch current session or auto-login with default admin if clean session
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('taskflow_token');
        const storedUser = localStorage.getItem('taskflow_user');

        // Fetch demo accounts for easy switching
        try {
          const demoRes = await api.getDemoAccounts();
          if (demoRes.success) {
            setDemoAccounts(demoRes.users);
          }
        } catch (e) {
          console.warn('Failed to load demo accounts', e);
        }

        if (storedToken && storedUser) {
          try {
            setUser(JSON.parse(storedUser));
            const meRes = await api.getMe();
            if (meRes.success) {
              setUser(meRes.user);
              localStorage.setItem('taskflow_user', JSON.stringify(meRes.user));
            } else {
              localStorage.removeItem('taskflow_token');
              localStorage.removeItem('taskflow_user');
              setUser(null);
            }
          } catch (e) {
            localStorage.removeItem('taskflow_token');
            localStorage.removeItem('taskflow_user');
            setUser(null);
          }
        } else {
          setUser(null);
        }

      } catch (err) {
        console.error('[Auth Init Error]', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const handleUnauthorized = () => {
      setUser(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    if (res.success) {
      localStorage.setItem('taskflow_token', res.token);
      localStorage.setItem('taskflow_user', JSON.stringify(res.user));
      setUser(res.user);
    }
    return res;
  };

  const quickSwitch = async (email) => {
    setLoading(true);
    try {
      const res = await api.login(email, 'Password123!');
      if (res.success) {
        localStorage.setItem('taskflow_token', res.token);
        localStorage.setItem('taskflow_user', JSON.stringify(res.user));
        setUser(res.user);
      }
    } catch (err) {
      console.error('Quick switch failed', err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('taskflow_token');
    localStorage.removeItem('taskflow_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        quickSwitch,
        demoAccounts,
        isAdmin: user?.role === 'admin',
        isEmployee: user?.role === 'employee',
      }}
    >
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
