/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';
import { useClerk } from '@clerk/react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { signOut } = useClerk();
  
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('taxi_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('taxi_token'));
  const loading = false;

  const login = async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const res = await api.post('/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    const { access_token, role, email: userEmail } = res.data;
    const userData = { email: userEmail || email, role };
    setToken(access_token);
    setUser(userData);
    localStorage.setItem('taxi_token', access_token);
    localStorage.setItem('taxi_user', JSON.stringify(userData));
    return userData;
  };

  const registerUser = async (email, password) => {
    const res = await api.post('/register', { email, password });
    const { access_token, role, email: userEmail } = res.data;
    const userData = { email: userEmail || email, role };
    setToken(access_token);
    setUser(userData);
    localStorage.setItem('taxi_token', access_token);
    localStorage.setItem('taxi_user', JSON.stringify(userData));
    return userData;
  };

  const logout = async () => {
    try {
      await signOut({ redirectUrl: window.location.origin + '/login' });
    } catch (e) {
      console.error('Clerk sign out error', e);
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('taxi_token');
    localStorage.removeItem('taxi_user');
  };

  const setSocialUser = (userData, accessToken) => {
    setToken(accessToken);
    setUser(userData);
    localStorage.setItem('taxi_token', accessToken);
    localStorage.setItem('taxi_user', JSON.stringify(userData));
  };

  const isAuthenticated = !!token;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated, isAdmin, login, registerUser, logout, setSocialUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
