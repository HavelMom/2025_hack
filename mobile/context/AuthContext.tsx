import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { router } from 'expo-router';
import { API_URL } from '../utils/api';

// Define types
type User = {
  id: string;
  email: string;
  fullName: string;
  role: 'patient' | 'provider';
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setIsAuthenticated: (auth: boolean) => void;
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from secure storage
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('token');
        const storedUser = await SecureStore.getItemAsync('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
      } catch (error) {
        console.error('Error loading auth from storage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });

      const { token: newToken, user: userData } = response.data;

      await SecureStore.setItemAsync('token', newToken);
      await SecureStore.setItemAsync('user', JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      if (userData.role === 'patient') {
        router.replace('/(patient)/');
      } else if (userData.role === 'provider') {
        router.replace('/(provider)/');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: any) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/auth/register`, userData);

      const { token: newToken, user: newUser } = response.data;

      await SecureStore.setItemAsync('token', newToken);
      await SecureStore.setItemAsync('user', JSON.stringify(newUser));

      setToken(newToken);
      setUser(newUser);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      if (newUser.role === 'patient') {
        router.replace('/(patient)/');
      } else if (newUser.role === 'provider') {
        router.replace('/(provider)/');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('user');
      setToken(null);
      setUser(null);
      delete axios.defaults.headers.common['Authorization'];
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const setIsAuthenticated = (auth: boolean) => {
    if (!auth) {
      setToken(null);
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!token,
    setUser,
    setIsAuthenticated
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
