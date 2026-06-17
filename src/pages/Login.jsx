import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, Sparkles, Shield, Zap, TrendingUp, Download, Smartphone } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if app is installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
    if (isInstalled) {
      setShowInstallBtn(false);
      return;
    }

    // Listen for beforeinstallprompt event
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('App installed successfully');
      setShowInstallBtn(false);
    }
    
    setDeferredPrompt(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    if (result.success) navigate('/dashboard');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-darker via-brand-dark to-brand-darker">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen">
          {/* Left Side - Brand */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden lg:block"
          >
            <div className="relative">
              <div className="absolute -top-20 -left-20 w-72 h-72 bg-brand-primary rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
              <div className="relative">
                <h1 className="text-7xl font-bold mb-6">
                  <span className="gradient-bg bg-clip-text text-transparent">FinPay</span>
                </h1>
                <p className="text-2xl text-gray-300 mb-8">The future of digital banking is here</p>
                
                <div className="space-y-4">
                  {[
                    { icon: Shield, text: 'Bank-grade security' },
                    { icon: Zap, text: 'Instant transactions' },
                    { icon: TrendingUp, text: 'Real-time analytics' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.2 }}
                      className="flex items-center space-x-3 text-gray-300"
                    >
                      <item.icon className="w-5 h-5 text-brand-primary" />
                      <span>{item.text}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-12 p-6 glass-card">
                  <div className="flex items-center space-x-4">
                    <div className="flex -space-x-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center border-2 border-brand-dark">
                          <span className="text-xs font-bold">U{i}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Join 10,000+ users</p>
                      <p className="text-xs text-gray-400">Trusted by thousands</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Form */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="glass-card p-8 md:p-12 max-w-md mx-auto w-full"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Welcome back</h2>
              <p className="text-gray-400">Sign in to your account</p>
            </div>

            {/* Install Button - Mobile Optimized */}
            {showInstallBtn && (
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleInstallClick}
                className="w-full mb-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:shadow-lg transition-all"
              >
                <Download className="w-5 h-5" />
                <span>Install FinPay App</span>
                <Smartphone className="w-5 h-5" />
              </motion.button>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-premium pl-12"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-premium pl-12"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-white/20 bg-brand-light" />
                  <span className="text-sm text-gray-400">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-brand-primary hover:text-brand-secondary">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-gradient w-full flex items-center justify-center space-x-2"
              >
                <span>{loading ? 'Signing in...' : 'Sign In'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>

            <p className="text-center text-gray-400 mt-8">
              Don't have an account?{' '}
              <Link to="/register" className="text-brand-primary hover:text-brand-secondary font-semibold">
                Create account
              </Link>
            </p>

            {/* PWA Features Note */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-center text-xs text-gray-500">
                <Smartphone className="w-3 h-3 inline mr-1" />
                Install our app for a faster, offline-capable experience
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;