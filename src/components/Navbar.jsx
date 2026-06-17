import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MenuSquareIcon, Bell, Search, TrendingUp, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [iconError, setIconError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get responsive app icon size
  const getIconSize = () => {
    if (isMobile) return '/icons/icon-72x72.png';
    return '/icons/icon-96x96.png';
  };

  const getAppIcon = () => {
    if (iconError) return null;
    return getIconSize();
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-30 bg-brand-dark/80 backdrop-blur-xl border-b border-white/10"
    >
      <div className="px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Left section */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all lg:hidden"
            >
              <MenuSquareIcon className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
            
            {/* Mobile Logo - Clickable to navigate to dashboard */}
            <div 
              onClick={() => navigate('/dashboard')}
              className="lg:hidden flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
            >
              {getAppIcon() && (
                <img 
                  src={getAppIcon()}
                  alt="FinPay"
                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg object-cover"
                  loading="eager"
                  onError={(e) => {
                    console.error('Failed to load app icon');
                    setIconError(true);
                    e.target.style.display = 'none';
                  }}
                />
              )}
              {iconError && (
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs sm:text-sm font-bold">F</span>
                </div>
              )}
              <span className="text-white font-semibold text-sm sm:text-base">FinPay</span>
            </div>

            {/* Desktop Live Indicator */}
            <div className="hidden lg:flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-brand-primary" />
              <span className="text-sm text-gray-400">Live: Markets are up</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-4 lg:mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                className="w-full pl-10 pr-4 py-2 bg-brand-light/30 border border-white/10 rounded-xl text-sm text-white placeholder-gray-400 focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Notifications Button */}
            <button
              onClick={() => navigate('/notifications')}
              className="relative p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>
            
            {/* Profile Button */}
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center space-x-2 sm:space-x-3 pl-2 sm:pl-3 border-l border-white/10 hover:opacity-80 transition-opacity"
              aria-label="Profile"
            >
              {/* Profile Avatar */}
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full flex items-center justify-center">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              
              {/* User Info - Desktop only */}
              <div className="hidden lg:block text-left">
                <p className="text-sm font-semibold text-white">{user?.fullName?.split(' ')[0] || 'User'}</p>
                <p className="text-xs text-gray-400">Premium Account</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;