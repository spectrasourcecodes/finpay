import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, Eye, EyeOff } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import walletService from '../services/walletService';
import transactionService from '../services/transactionService';

const Dashboard = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [walletRes, summaryRes] = await Promise.all([
        walletService.getBalance(),
        transactionService.getTransactionSummary()
      ]);
      setWallet(walletRes.data.wallet);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { 
      label: 'Total Balance', 
      value: wallet?.nairaBalance || 0, 
      icon: Wallet, 
      change: '+12.5%', 
      color: 'from-blue-500 to-blue-600',
      isCurrency: true
    },
    { 
      label: 'Monthly Spending', 
      value: summary?.totalWithdrawals || 0, 
      icon: TrendingUp, 
      change: '+8.2%', 
      color: 'from-orange-500 to-orange-600',
      isCurrency: true
    },
    { 
      label: 'Total Deposits', 
      value: summary?.totalDeposits || 0, 
      icon: ArrowUpRight, 
      change: '+23.1%', 
      color: 'from-green-500 to-green-600',
      isCurrency: true
    },
    { 
      label: 'Total Transfers', 
      value: summary?.totalTransfers || 0, 
      icon: ArrowDownRight, 
      change: '-5.4%', 
      color: 'from-red-500 to-red-600',
      isCurrency: true
    },
  ];

  const chartData = [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 5000 },
    { name: 'Apr', value: 4500 },
    { name: 'May', value: 6000 },
    { name: 'Jun', value: 5500 },
  ];

  const formatValue = (value, isCurrency = true) => {
    if (!showBalance) return '••••••';
    return isCurrency ? `₦${value?.toLocaleString() || 0}` : value?.toLocaleString() || 0;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Welcome back! 👋</h1>
            <h1 className="text-2xl font-semibold text-gray-300 mt-1">{user?.fullName}</h1>
            <p className="text-gray-400 mt-1">Here's what's happening with your account today.</p>
          </div>
          
          {/* Global Hide/Show Button */}
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-800 rounded-xl hover:bg-gray-700 transition-all"
          >
            {showBalance ? (
              <>
                <EyeOff className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">Hide Balance</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-blue-400">Show Balance</span>
              </>
            )}
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-5 hover:shadow-xl hover:shadow-blue-500/10 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 bg-gradient-to-br ${stat.color} rounded-lg`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  stat.change.startsWith('+') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-gray-400 text-sm">{stat.label}</p>
              <p className="text-2xl font-bold text-white mt-1">
                {formatValue(stat.value, stat.isCurrency)}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Chart Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Balance Overview</h3>
            <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
              View Details →
            </button>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ background: '#1F2937', border: '1px solid #3B82F6', borderRadius: '8px' }}
                  formatter={(value) => showBalance ? [`₦${value}`, 'Balance'] : ['••••••', 'Balance']}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3B82F6" 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Crypto Balances Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Naira Balance Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 hover:border-blue-500/30 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <span className="text-blue-400 text-xl">₦</span>
              </div>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="p-1 rounded-lg text-gray-400 hover:text-blue-400 transition-colors"
              >
                {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-gray-400 text-sm">Naira Balance</p>
            <p className="text-2xl font-bold text-white mt-1">
              {showBalance ? `₦${wallet?.nairaBalance?.toLocaleString() || 0}` : '••••••'}
            </p>
          </motion.div>

          {/* BTC Balance Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 hover:border-orange-500/30 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <span className="text-orange-400 text-xl">₿</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm">BTC Balance</p>
            <p className="text-2xl font-bold text-white mt-1">
              {showBalance ? `${wallet?.btcBalance || 0} BTC` : '••••••'}
            </p>
            {showBalance && (
              <p className="text-sm text-green-400 mt-2">
                ≈ ₦{((wallet?.btcBalance || 0) * 35000000).toLocaleString()}
              </p>
            )}
          </motion.div>

          {/* ETH Balance Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 hover:border-purple-500/30 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <span className="text-purple-400 text-xl">Ξ</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm">ETH Balance</p>
            <p className="text-2xl font-bold text-white mt-1">
              {showBalance ? `${wallet?.ethBalance || 0} ETH` : '••••••'}
            </p>
            {showBalance && (
              <p className="text-sm text-green-400 mt-2">
                ≈ ₦{((wallet?.ethBalance || 0) * 1800000).toLocaleString()}
              </p>
            )}
          </motion.div>
        </div>

        {/* Quick Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-5">
            <h3 className="font-semibold text-white mb-3">Transaction Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                <span className="text-gray-400">Total Deposits</span>
                <span className="font-semibold text-green-400">
                  {showBalance ? `₦${summary?.totalDeposits?.toLocaleString() || 0}` : '••••••'}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                <span className="text-gray-400">Total Withdrawals</span>
                <span className="font-semibold text-red-400">
                  {showBalance ? `₦${summary?.totalWithdrawals?.toLocaleString() || 0}` : '••••••'}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                <span className="text-gray-400">Total Transfers</span>
                <span className="font-semibold text-blue-400">
                  {showBalance ? `₦${summary?.totalTransfers?.toLocaleString() || 0}` : '••••••'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-5">
            <h3 className="font-semibold text-white mb-3">Account Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                <span className="text-gray-400">Account Type</span>
                <span className="font-semibold text-blue-400">Premium</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                <span className="text-gray-400">KYC Status</span>
                <span className="font-semibold text-yellow-400">Verified</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                <span className="text-gray-400">Member Since</span>
                <span className="font-semibold text-gray-300">
                  {new Date(user?.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;