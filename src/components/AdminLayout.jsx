import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAdminAuth } from '../context/AdminAuthContext';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  CheckCircle, 
  Settings, 
  LogOut,
  Shield,
  Menu,
  X,
  Bell,
  User,
  Wallet,
  TrendingUp,
  Search,
  ChevronDown
} from 'lucide-react';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/admin-login');
  };

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/users', icon: Users, label: 'User Management' },
    { path: '/admin/wallets', icon: Wallet, label: 'Wallet Management' },
    { path: '/admin/transactions', icon: FileText, label: 'Transactions' },
    { path: '/admin/kyc', icon: CheckCircle, label: 'KYC Verification' },
    { path: '/admin/profile', icon: User, label: 'Profile' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
    { path: '/admin/notifications', icon: Bell, label: 'Notifications' },
  ];

  const notifications = [
    { id: 1, title: 'New user registered', time: '5 min ago', type: 'user' },
    { id: 2, title: 'KYC submission pending', time: '15 min ago', type: 'kyc' },
    { id: 3, title: 'Large withdrawal request', time: '1 hour ago', type: 'transaction' },
    { id: 4, title: 'System update completed', time: '3 hours ago', type: 'system' },
  ];

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'user': return <Users className="w-4 h-4 text-blue-400" />;
      case 'kyc': return <CheckCircle className="w-4 h-4 text-yellow-400" />;
      case 'transaction': return <TrendingUp className="w-4 h-4 text-green-400" />;
      default: return <Bell className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                  FinPay Admin
                </h1>
                <p className="text-xs text-gray-500 mt-1">Administration Portal</p>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Admin Info */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{admin?.fullName || 'Admin User'}</p>
                <p className="text-xs text-gray-400">{admin?.email || 'admin@finpay.com'}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-800">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg w-full text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Navbar */}
        <nav className="sticky top-0 z-30 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Left section - Menu button & Page title */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors lg:hidden"
                >
                  <Menu className="w-6 h-6" />
                </button>
                
                {/* Page Title - Desktop */}
                <div className="hidden lg:block">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                    {navItems.find(item => item.path === location.pathname)?.label || 'Admin Panel'}
                  </h1>
                </div>
              </div>

              {/* Search Bar - Desktop */}
              <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users, transactions..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Right section */}
              <div className="flex items-center space-x-3">
                {/* Notifications Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  </button>
                  
                  {notificationsOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setNotificationsOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-xl shadow-xl border border-gray-700 z-50">
                        <div className="p-3 border-b border-gray-700">
                          <h3 className="text-sm font-semibold text-white">Notifications</h3>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className="p-3 hover:bg-gray-700/50 transition-colors cursor-pointer border-b border-gray-700/50"
                            >
                              <div className="flex items-start space-x-3">
                                <div className="p-1.5 bg-gray-700 rounded-lg">
                                  {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm text-white">{notification.title}</p>
                                  <p className="text-xs text-gray-400 mt-0.5">{notification.time}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="p-3 border-t border-gray-700">
                          <button className="text-xs text-purple-400 hover:text-purple-300 w-full text-center">
                            View all notifications
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center space-x-3 pl-3 border-l border-gray-700"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-medium text-white">{admin?.fullName?.split(' ')[0] || 'Admin'}</p>
                      <p className="text-xs text-gray-400">Administrator</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400 hidden lg:block" />
                  </button>
                  
                  {profileOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setProfileOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-xl shadow-xl border border-gray-700 z-50">
                        <div className="p-4 border-b border-gray-700">
                          <p className="text-sm font-semibold text-white">{admin?.fullName}</p>
                          <p className="text-xs text-gray-400 mt-1">{admin?.email}</p>
                        </div>
                        <div className="py-2">
                          <Link
                            to="/admin/profile"
                            className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                            onClick={() => setProfileOpen(false)}
                          >
                            <User className="w-4 h-4" />
                            <span>Profile Settings</span>
                          </Link>
                          <Link
                            to="/admin/settings"
                            className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                            onClick={() => setProfileOpen(false)}
                          >
                            <Settings className="w-4 h-4" />
                            <span>System Settings</span>
                          </Link>
                          <div className="border-t border-gray-700 my-1"></div>
                          <button
                            onClick={() => {
                              setProfileOpen(false);
                              handleLogout();
                            }}
                            className="flex items-center space-x-3 px-4 py-2 text-sm text-red-400 hover:bg-gray-700 transition-colors w-full"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;