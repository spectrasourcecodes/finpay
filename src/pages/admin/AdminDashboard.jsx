import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/AdminLayout';
import { 
  Users, Wallet, TrendingUp, UserCheck, AlertCircle, 
  Activity, ArrowUp, ArrowDown, Clock, Server, Zap
} from 'lucide-react';
import axiosInstance from '../../utils/axiosConfig';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, transactionsRes, usersRes] = await Promise.all([
        axiosInstance.get('/admin/stats'),
        axiosInstance.get('/admin/transactions?page=1&limit=5'),
        axiosInstance.get('/admin/users?page=1&limit=5')
      ]);
      setStats(statsRes.data.data);
      setRecentTransactions(transactionsRes.data.data.transactions);
      setRecentUsers(usersRes.data.data.users);
    } catch (error) {
      console.error('Fetch dashboard error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'from-blue-500 to-blue-600', change: '+12%' },
    { title: 'Total Transactions', value: stats?.totalTransactions || 0, icon: Activity, color: 'from-green-500 to-green-600', change: '+8%' },
    { title: 'Total Deposits', value: `₦${stats?.totalDeposits?.toLocaleString() || 0}`, icon: TrendingUp, color: 'from-purple-500 to-purple-600', change: '+15%' },
    { title: 'System Balance', value: `₦${stats?.totalSystemBalance?.toLocaleString() || 0}`, icon: Wallet, color: 'from-emerald-500 to-emerald-600', change: '+5%' },
    { title: 'Pending KYC', value: stats?.pendingKyc || 0, icon: UserCheck, color: 'from-yellow-500 to-yellow-600', change: 'Pending' },
    { title: 'Frozen Accounts', value: stats?.frozenUsers || 0, icon: AlertCircle, color: 'from-red-500 to-red-600', change: '-2%' },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back, {stats?.totalUsers} users active</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {statCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-5 hover:shadow-xl hover:shadow-purple-500/10 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 bg-gradient-to-br ${card.color} rounded-lg`}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  card.change.startsWith('+') ? 'bg-green-500/20 text-green-400' :
                  card.change.startsWith('-') ? 'bg-red-500/20 text-red-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {card.change}
                </span>
              </div>
              <p className="text-gray-400 text-sm">{card.title}</p>
              <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Recent Transactions</h3>
              <button className="text-xs text-purple-400 hover:text-purple-300">View All →</button>
            </div>
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div key={transaction._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      transaction.type === 'deposit' ? 'bg-green-500/20' :
                      transaction.type === 'withdrawal' ? 'bg-red-500/20' :
                      'bg-blue-500/20'
                    }`}>
                      {transaction.type === 'deposit' ? <ArrowUp className="w-4 h-4 text-green-400" /> :
                       transaction.type === 'withdrawal' ? <ArrowDown className="w-4 h-4 text-red-400" /> :
                       <Activity className="w-4 h-4 text-blue-400" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white capitalize">{transaction.type}</p>
                      <p className="text-xs text-gray-400">{transaction.user?.fullName || 'Unknown'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${
                      transaction.type === 'deposit' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {transaction.type === 'deposit' ? '+' : '-'} ₦{transaction.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">{new Date(transaction.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Users */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Recent Users</h3>
              <button className="text-xs text-purple-400 hover:text-purple-300">View All →</button>
            </div>
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div key={user._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">{user.fullName?.charAt(0) || 'U'}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{user.fullName}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      user.isFrozen ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                    }`}>
                      {user.isFrozen ? 'Frozen' : 'Active'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-5">
          <h3 className="font-semibold text-white mb-4">System Health</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-700/30 rounded-lg">
              <Server className="w-5 h-5 text-green-400 mx-auto mb-2" />
              <p className="text-xs text-gray-400">API Status</p>
              <p className="text-sm font-semibold text-green-400">Operational</p>
            </div>
            <div className="text-center p-3 bg-gray-700/30 rounded-lg">
              <Server className="w-5 h-5 text-green-400 mx-auto mb-2" />
              <p className="text-xs text-gray-400">Database</p>
              <p className="text-sm font-semibold text-green-400">Connected</p>
            </div>
            <div className="text-center p-3 bg-gray-700/30 rounded-lg">
              <Clock className="w-5 h-5 text-blue-400 mx-auto mb-2" />
              <p className="text-xs text-gray-400">Uptime</p>
              <p className="text-sm font-semibold text-blue-400">99.9%</p>
            </div>
            <div className="text-center p-3 bg-gray-700/30 rounded-lg">
              <Zap className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
              <p className="text-xs text-gray-400">Response Time</p>
              <p className="text-sm font-semibold text-yellow-400">245ms</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;