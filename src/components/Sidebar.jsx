import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  Send,
  History,
  Shield,
  User,
  Settings,
  LogOut,
  X,
  Bell,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [iconError, setIconError] = useState(false);

  // Only user navigation items - NO admin items here
  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/wallet', icon: Wallet, label: 'Wallet' },
    { path: '/transfer', icon: Send, label: 'Transfer' },
    { path: '/transactions', icon: History, label: 'Transactions' },
    { path: '/kyc', icon: Shield, label: 'Verification' },
    { path: '/profile', icon: User, label: 'Profile' },
    { path: '/settings', icon: Settings, label: 'Settings' },
    { path: '/notifications', icon: Bell, label: 'Notifications' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Try different icon sizes based on screen width
  const getAppIcon = () => {
    if (iconError) return null;
    
    // For high DPI screens, use larger icon
    if (window.devicePixelRatio >= 2) {
      return '/icons/icon-192x192.png';
    }
    return '/icons/icon-96x96.png';
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-72 z-50 bg-gray-900 shadow-2xl transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section with App Icon */}
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* App Icon from icons folder */}
                {getAppIcon() && (
                  <img 
                    src={getAppIcon()}
                    alt="FinPay Logo"
                    className="w-10 h-10 md:w-12 md:h-12 rounded-xl shadow-lg object-cover"
                    loading="lazy"
                    onError={(e) => {
                      console.error('Failed to load app icon');
                      setIconError(true);
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                {/* Fallback icon if image fails */}
                {iconError && (
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl font-bold">F</span>
                  </div>
                )}
                <div>
                  <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
                    FinPay
                  </h1>
                  <p className="text-xs text-gray-500 hidden md:block">Premium Banking</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation - User links */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0" strokeWidth={1.75} />
                <span className="font-medium text-sm md:text-base">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* User Info Section with App Icon */}
          <div className="px-4 py-3 border-t border-gray-800">
            <div className="flex items-center space-x-3 p-2 rounded-lg bg-gray-800/50">
              {getAppIcon() && (
                <img 
                  src={getAppIcon()}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">My Account</p>
                <p className="text-xs text-gray-400 truncate">Premium Member</p>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-800">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg w-full text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" strokeWidth={1.75} />
              <span className="text-sm md:text-base">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;