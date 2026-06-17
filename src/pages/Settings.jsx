import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { Lock, Bell, Shield, Moon, Sun, Globe, Check, ChevronRight, AlertCircle } from 'lucide-react';
import authService from '../services/authService';
import toast from 'react-hot-toast';

const Settings = () => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!passwordData.currentPassword) {
      toast.error('Current password is required');
      return;
    }
    
    if (!passwordData.newPassword) {
      toast.error('New password is required');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordData.currentPassword === passwordData.newPassword) {
      toast.error('New password must be different from current password');
      return;
    }
    
    setLoading(true);
    try {
      const response = await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      // Handle successful response
      console.log('Password change response:', response);
      
      // Check response structure
      if (response && response.data) {
        if (response.data.success) {
          toast.success(response.data.message || 'Password changed successfully!');
          setShowPasswordModal(false);
          setPasswordData({ 
            currentPassword: '', 
            newPassword: '', 
            confirmPassword: '' 
          });
        } else {
          toast.error(response.data.message || 'Password change failed');
        }
      } else {
        toast.success('Password changed successfully!');
        setShowPasswordModal(false);
        setPasswordData({ 
          currentPassword: '', 
          newPassword: '', 
          confirmPassword: '' 
        });
      }
    } catch (error) {
      console.error('Password change error:', error);
      
      // Handle different error scenarios
      if (error.response) {
        // Server responded with error
        const { status, data } = error.response;
        
        switch (status) {
          case 401:
            toast.error('Current password is incorrect');
            break;
          case 400:
            toast.error(data.message || 'Invalid password format');
            break;
          case 403:
            toast.error('Account is frozen. Please contact support');
            break;
          default:
            toast.error(data.message || 'Password change failed. Please try again.');
        }
      } else if (error.request) {
        // Request made but no response
        toast.error('Network error. Please check your connection.');
      } else {
        // Something else happened
        toast.error(error.message || 'An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const settingsSections = [
    {
      title: 'Preferences',
      icon: Bell,
      settings: [
        { name: 'Email Notifications', type: 'toggle', enabled: true, description: 'Receive email updates about your account' },
        { name: 'Push Notifications', type: 'toggle', enabled: true, description: 'Get instant alerts on your device' },
        { name: 'Transaction Alerts', type: 'toggle', enabled: true, description: 'Notify me for every transaction' },
      ]
    },
    {
      title: 'Security',
      icon: Shield,
      settings: [
        { name: 'Two-Factor Authentication', type: 'toggle', enabled: false, description: 'Add an extra layer of security' },
        { name: 'Device Management', type: 'link', action: 'Manage Devices', description: 'View and manage active devices' },
        { name: 'Login History', type: 'link', action: 'View History', description: 'See your recent login activity' },
      ]
    },
    {
      title: 'Appearance',
      icon: Sun,
      settings: [
        { name: 'Dark Mode', type: 'toggle', enabled: true, description: 'Switch between light and dark theme' },
        { name: 'Compact View', type: 'toggle', enabled: false, description: 'Reduce spacing for more content' },
      ]
    }
  ];

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-gray-400">Manage your account preferences</p>
        </div>

        {/* Change Password Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 gradient-bg rounded-xl">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">Security</h3>
              <p className="text-sm text-gray-400">Change your password regularly</p>
              <p className="text-xs text-gray-500 mt-1">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <button onClick={() => setShowPasswordModal(true)} className="btn-outline">
            Update Password
          </button>
        </motion.div>

        {/* Settings Sections */}
        {settingsSections.map((section, idx) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center space-x-3 mb-6 pb-3 border-b border-white/10">
              <section.icon className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-lg">{section.title}</h3>
            </div>
            <div className="space-y-4">
              {section.settings.map((setting) => (
                <div key={setting.name} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="flex-1">
                    <p className="text-gray-300 font-medium">{setting.name}</p>
                    {setting.description && (
                      <p className="text-xs text-gray-500 mt-0.5">{setting.description}</p>
                    )}
                  </div>
                  {setting.type === 'toggle' && (
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        defaultChecked={setting.enabled}
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  )}
                  {setting.type === 'link' && (
                    <button className="text-blue-400 hover:text-blue-300 flex items-center space-x-1 transition-colors">
                      <span className="text-sm">{setting.action}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 border-red-500/20"
        >
          <div className="flex items-center space-x-3 mb-4">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h3 className="font-semibold text-red-400">Danger Zone</h3>
          </div>
          <p className="text-sm text-gray-400 mb-4">Once you delete your account, there is no going back. This action is permanent.</p>
          <button className="px-4 py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all">
            Delete Account
          </button>
        </motion.div>

        {/* Password Change Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass-card p-6 md:p-8 max-w-md w-full"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Change Password</h2>
                  <p className="text-sm text-gray-400 mt-1">Secure your account with a new password</p>
                </div>
                <button 
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }} 
                  className="text-gray-400 hover:text-white text-2xl transition-colors"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handlePasswordChange} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Enter current password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="input-premium pl-12 pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showCurrentPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Enter new password (min. 6 characters)"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="input-premium pl-12 pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showNewPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Password must be at least 6 characters long
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="input-premium pl-12 pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                  {passwordData.newPassword && passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                  )}
                  {passwordData.newPassword && passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword && (
                    <p className="text-xs text-green-500 mt-1">✓ Passwords match</p>
                  )}
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                  <p className="text-xs text-blue-400 flex items-center gap-2">
                    <Shield className="w-3 h-3" />
                    <span>For security, you'll be logged out from all devices after password change</span>
                  </p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    }} 
                    className="flex-1 btn-outline"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="flex-1 btn-gradient flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Changing...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Change Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Settings;