import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../utils/axiosConfig';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
        verifyUser();
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const verifyUser = async () => {
    try {
      const response = await axiosInstance.get('/auth/profile');
      if (response.data.success) {
        const userData = response.data.data.user;
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('User verification failed:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      const { user: userData, token: authToken } = response.data.data;
      
      setUser(userData);
      setIsAuthenticated(true);
      
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      toast.success(`Welcome back, ${userData.fullName}!`);
      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axiosInstance.post('/auth/register', userData);
      
      // Handle different response structures
      let newUser = null;
      let authToken = null;
      
      // Check if response has data property
      if (response.data.data) {
        newUser = response.data.data.user || response.data.data;
        authToken = response.data.data.token;
      } 
      // Check if response has user directly
      else if (response.data.user) {
        newUser = response.data.user;
        authToken = response.data.token;
      }
      // Check if response itself is the user object
      else if (response.data._id || response.data.id) {
        newUser = response.data;
        authToken = response.data.token;
      }
      
      // If we have user data, proceed with authentication
      if (newUser) {
        setUser(newUser);
        setIsAuthenticated(true);
        
        if (authToken) {
          localStorage.setItem('token', authToken);
        }
        localStorage.setItem('user', JSON.stringify(newUser));
        
        toast.success(`Welcome to FinPay, ${newUser.fullName || 'User'}!`);
        return { success: true, user: newUser };
      }
      
      // If registration was successful but no user data returned
      if (response.data.success === true) {
        toast.success('Registration successful!');
        return { success: true };
      }
      
      // If we reach here, the response format is unexpected
      console.error('Unexpected response format:', response.data);
      toast.error('Registration successful but unexpected response format');
      return { success: false, message: 'Unexpected response format' };
      
    } catch (error) {
      // Check if user already exists (409 Conflict)
      if (error.response?.status === 409) {
        toast.error('User already exists. Please log in instead.');
        return { 
          success: false, 
          message: 'User already exists',
          exists: true 
        };
      }
      
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    setUser,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    isAdmin: user?.isAdmin || false,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};