import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../utils/axiosConfig';
import toast from 'react-hot-toast';

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('adminToken');
    const storedAdmin = localStorage.getItem('adminUser');
    
    if (storedToken && storedAdmin) {
      try {
        setAdmin(JSON.parse(storedAdmin));
        setIsAuthenticated(true);
        verifyAdmin();
      } catch (error) {
        console.error('Failed to parse stored admin:', error);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const verifyAdmin = async () => {
    try {
      const response = await axiosInstance.get('/admin/verify');
      if (response.data.success) {
        const adminData = response.data.data.user;
        setAdmin(adminData);
        setIsAuthenticated(true);
        localStorage.setItem('adminUser', JSON.stringify(adminData));
      }
    } catch (error) {
      console.error('Admin verification failed:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        setAdmin(null);
        setIsAuthenticated(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const adminLogin = async (email, password) => {
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      const { user, token: authToken } = response.data.data;
      
      if (!user.isAdmin) {
        toast.error('Access denied. Admin privileges required.');
        return { success: false, message: 'Admin privileges required' };
      }
      
      localStorage.setItem('adminToken', authToken);
      localStorage.setItem('adminUser', JSON.stringify(user));
      
      setAdmin(user);
      setIsAuthenticated(true);
      
      toast.success('Welcome back, Admin!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setAdmin(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  };

  // Admin functions remain the same, just use axiosInstance instead of axios
  const freezeUser = async (userId) => {
    try {
      const response = await axiosInstance.put(`/admin/users/${userId}/freeze`);
      toast.success('User frozen successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to freeze user');
      throw error;
    }
  };

  const unfreezeUser = async (userId) => {
    try {
      const response = await axiosInstance.put(`/admin/users/${userId}/unfreeze`);
      toast.success('User unfrozen successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to unfreeze user');
      throw error;
    }
  };

  const approveKyc = async (kycId) => {
    try {
      const response = await axiosInstance.put(`/admin/kyc/${kycId}/approve`);
      toast.success('KYC approved successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve KYC');
      throw error;
    }
  };

  const rejectKyc = async (kycId, reason) => {
    try {
      const response = await axiosInstance.put(`/admin/kyc/${kycId}/reject`, { reason });
      toast.success('KYC rejected');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject KYC');
      throw error;
    }
  };

  const deleteUser = async (userId) => {
    try {
      const response = await axiosInstance.delete(`/admin/users/${userId}`);
      toast.success('User deleted successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
      throw error;
    }
  };

  const updateUser = async (userId, userData) => {
    try {
      const response = await axiosInstance.put(`/admin/users/${userId}`, userData);
      toast.success('User updated successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user');
      throw error;
    }
  };

  const getDashboardStats = async () => {
    try {
      const response = await axiosInstance.get('/admin/stats');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      throw error;
    }
  };

  const getAllUsers = async (page = 1, limit = 20, search = '', status = 'all') => {
    try {
      const response = await axiosInstance.get(`/admin/users?page=${page}&limit=${limit}&search=${search}&status=${status}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw error;
    }
  };

  const getAllTransactions = async (page = 1, limit = 20, type = 'all', status = 'all') => {
    try {
      const response = await axiosInstance.get(`/admin/transactions?page=${page}&limit=${limit}&type=${type}&status=${status}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      throw error;
    }
  };

  const getKycSubmissions = async (status = 'pending', page = 1, limit = 20) => {
    try {
      const response = await axiosInstance.get(`/admin/kyc?status=${status}&page=${page}&limit=${limit}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch KYC submissions:', error);
      throw error;
    }
  };

  const getSystemSettings = async () => {
    try {
      const response = await axiosInstance.get('/admin/settings');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch system settings:', error);
      throw error;
    }
  };

  const updateSystemSettings = async (settings) => {
    try {
      const response = await axiosInstance.put('/admin/settings', settings);
      toast.success('Settings updated successfully');
      return response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update settings');
      throw error;
    }
  };

  const getActivityLog = async () => {
    try {
      const response = await axiosInstance.get('/admin/activity-log');
      return response.data.data.activities;
    } catch (error) {
      console.error('Failed to fetch activity log:', error);
      throw error;
    }
  };

  const updateAdmin = (updatedAdmin) => {
    setAdmin(updatedAdmin);
    localStorage.setItem('adminUser', JSON.stringify(updatedAdmin));
  };

  const value = {
    admin,
    loading,
    isAuthenticated,
    adminLogin,
    logout: handleLogout,
    freezeUser,
    unfreezeUser,
    approveKyc,
    rejectKyc,
    deleteUser,
    updateUser,
    updateAdmin,
    getDashboardStats,
    getAllUsers,
    getAllTransactions,
    getKycSubmissions,
    getSystemSettings,
    updateSystemSettings,
    getActivityLog,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};