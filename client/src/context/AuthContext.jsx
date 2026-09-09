import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Auth refresh failed', error);
      logout();
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.data.user);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Auth initialization failed', error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]); // token change triggers initAuth, but we also provide refreshUser for manual calls

  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    setIsAuthenticated(true);
    localStorage.setItem('token', jwtToken);
  };

  const register = (userData, jwtToken) => {
    login(userData, jwtToken); // Reusing login logic for setting state
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
