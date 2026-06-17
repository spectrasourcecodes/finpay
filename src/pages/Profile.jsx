import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { User, Mail, Phone, Edit2, Save, X, Shield, Calendar, Award, MapPin, Globe, CreditCard, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const handleSubmit = async () => {
    if (!fullName.trim()) {
      toast.error('Full name is required');
      return;
    }

    if (!phone.trim()) {
      toast.error('Phone number is required');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.updateProfile({
        fullName,
        phone,
      });

      console.log("Profile update response:", res);

      if (res.status == 200) {
        if (res.data?.user) {
          setUser(res.data.user);
        } else {
          setUser({
            ...user,
            fullName,
            phone,
          });
        }

        setIsEditing(false);
        toast.success(res.message || "Profile updated successfully");
      } else {
        throw new Error(res.message || "Update failed");
      }
    } catch (error) {
      console.error("Profile update error:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update profile";

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFullName(user?.fullName || '');
    setPhone(user?.phone || '');
    setIsEditing(false);
  };

  // Get initials for avatar
  const getInitials = () => {
    if (!user?.fullName) return 'U';
    return user.fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get member since formatted date
  const memberSince = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently';

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Profile</h1>
            <p className="text-gray-400 mt-1">Manage your personal information</p>
          </div>
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)} 
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="flex space-x-3">
              <button 
                onClick={handleCancel} 
                className="px-4 py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit} 
                disabled={loading} 
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Premium Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden"
        >
          {/* Cover Image / Gradient Header */}
          <div className="h-32 bg-gradient-to-r from-blue-600 relative">
            <div className="absolute -bottom-12 left-6">
              {/* Avatar */}
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 rounded-2xl flex items-center justify-center shadow-xl border-4 border-gray-800">
                <span className="text-3xl font-bold text-white">{getInitials()}</span>
              </div>
            </div>
          </div>

          {/* Profile Info Section */}
          <div className="pt-16 pb-6 px-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">{user?.fullName}</h2>
                <div className="flex items-center space-x-2 mt-1">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-400">Premium Member</span>
                  <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-400">Joined {memberSince}</span>
                </div>
              </div>
              
              {/* Verification Badge */}
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                <Award className="w-4 h-4 text-green-400" />
                <span className="text-xs text-green-400">Verified Account</span>
              </div>
            </div>
          </div>

          {/* Profile Details Grid */}
          <div className="border-t border-gray-700">
            {/* Full Name Field */}
            <div className="flex flex-col md:flex-row md:items-center justify-between py-4 px-6 border-b border-gray-700 hover:bg-gray-700/30 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/10 rounded-xl">
                  <User className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">FULL NAME</p>
                  <p className="text-sm text-gray-400">Your legal name</p>
                </div>
              </div>
              <div className="flex-1 md:text-right mt-3 md:mt-0">
                {isEditing ? (
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full md:w-80 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className="text-white font-medium">{user?.fullName || 'Not set'}</p>
                )}
              </div>
            </div>

            {/* Email Field (Read Only) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between py-4 px-6 border-b border-gray-700 hover:bg-gray-700/30 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-500/10 rounded-xl">
                  <Mail className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">EMAIL ADDRESS</p>
                  <p className="text-sm text-gray-400">Your login email</p>
                </div>
              </div>
              <div className="flex-1 md:text-right mt-3 md:mt-0">
                <div className="flex items-center justify-end space-x-2">
                  <p className="text-white font-medium">{user?.email || 'Not set'}</p>
                  {user?.email && (
                    <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full">Verified</span>
                  )}
                </div>
              </div>
            </div>

            {/* Phone Field */}
            <div className="flex flex-col md:flex-row md:items-center justify-between py-4 px-6 border-b border-gray-700 hover:bg-gray-700/30 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500/10 rounded-xl">
                  <Phone className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">PHONE NUMBER</p>
                  <p className="text-sm text-gray-400">Contact number</p>
                </div>
              </div>
              <div className="flex-1 md:text-right mt-3 md:mt-0">
                {isEditing ? (
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full md:w-80 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all"
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <p className="text-white font-medium">{user?.phone || 'Not set'}</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Account Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-500/10 rounded-xl">
                <Shield className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="font-semibold text-white">Account Security</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Password</span>
                <span className="text-gray-300 text-sm">••••••••</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Two-Factor Auth</span>
                <span className="text-xs px-2 py-0.5 bg-gray-600 text-gray-300 rounded-full">Disabled</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Last Login</span>
                <span className="text-gray-300 text-sm">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-purple-500/10 rounded-xl">
                <CreditCard className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="font-semibold text-white">Account Statistics</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Account Type</span>
                <span className="text-blue-400 text-sm font-medium">Premium</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">KYC Status</span>
                <span className="text-green-400 text-sm">Verified</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Member Since</span>
                <span className="text-gray-300 text-sm">{memberSince}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;