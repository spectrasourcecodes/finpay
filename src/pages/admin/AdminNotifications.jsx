import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/AdminLayout';
import { 
  Bell, Send, Users, Mail, TrendingUp, Shield, 
  UserCheck, Info, CheckCircle, XCircle, AlertCircle,
  Eye, Trash2, Filter, Calendar, RefreshCw
} from 'lucide-react';
import axiosInstance from '../../utils/axiosConfig';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'system',
    category: 'info',
  });
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/admin/notifications');
      setNotifications(response.data.data.notifications);
    } catch (error) {
      console.error('Fetch notifications error:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const sendBulkNotification = async () => {
    if (!formData.title || !formData.message) {
      toast.error('Please fill in all fields');
      return;
    }

    setSending(true);
    try {
      await axiosInstance.post('/admin/notifications/bulk', formData);
      toast.success('Notification sent to all users');
      setShowSendModal(false);
      setFormData({ title: '', message: '', type: 'system', category: 'info' });
      fetchNotifications();
    } catch (error) {
      console.error('Send notification error:', error);
      toast.error('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'credit': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'debit': return <TrendingUp className="w-4 h-4 text-red-400" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-400" />;
      default: return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === filter);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Notifications</h1>
            <p className="text-gray-400 mt-1">Manage system notifications</p>
          </div>
          <button
            onClick={() => setShowSendModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Send to All Users</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-5">
            <div className="flex items-center justify-between">
              <Bell className="w-6 h-6 text-purple-400" />
              <span className="text-2xl font-bold text-white">{notifications.length}</span>
            </div>
            <p className="text-gray-400 text-sm mt-2">Total Notifications</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-5">
            <div className="flex items-center justify-between">
              <Users className="w-6 h-6 text-blue-400" />
              <span className="text-2xl font-bold text-white">
                {notifications.filter(n => !n.isRead).length}
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-2">Unread Notifications</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-5">
            <div className="flex items-center justify-between">
              <Mail className="w-6 h-6 text-green-400" />
              <span className="text-2xl font-bold text-white">
                {notifications.filter(n => n.emailSent).length}
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-2">Emails Sent</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all', label: 'All', icon: Bell },
            { value: 'transaction', label: 'Transactions', icon: TrendingUp },
            { value: 'security', label: 'Security', icon: Shield },
            { value: 'kyc', label: 'KYC', icon: UserCheck },
            { value: 'system', label: 'System', icon: Info },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                filter === tab.value
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800 border-b border-gray-700">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">User</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Title</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredNotifications.map((notification) => (
                  <tr key={notification._id} className="border-b border-gray-700 hover:bg-gray-700/30">
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm font-medium text-white">{notification.user?.fullName || 'N/A'}</p>
                        <p className="text-xs text-gray-400">{notification.user?.email || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                        notification.type === 'transaction' ? 'bg-blue-500/20 text-blue-400' :
                        notification.type === 'security' ? 'bg-yellow-500/20 text-yellow-400' :
                        notification.type === 'kyc' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {getCategoryIcon(notification.category)}
                        <span>{notification.type}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm text-white">{notification.title}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[200px]">{notification.message}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center space-x-1 text-xs ${
                          notification.isRead ? 'text-green-400' : 'text-yellow-400'
                        }`}>
                          {notification.isRead ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          <span>{notification.isRead ? 'Read' : 'Unread'}</span>
                        </span>
                        {notification.emailSent && (
                          <span className="inline-flex items-center space-x-1 text-xs text-blue-400 ml-2">
                            <Mail className="w-3 h-3" />
                            <span>Email sent</span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-400">
                      {format(new Date(notification.createdAt), 'MMM dd, HH:mm')}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Send Notification Modal */}
        {showSendModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowSendModal(false)} />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Send className="w-6 h-6 text-white" />
                    <h2 className="text-xl font-bold text-white">Send Notification</h2>
                  </div>
                  <button
                    onClick={() => setShowSendModal(false)}
                    className="p-1 rounded-lg text-white/80 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter notification title"
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Enter notification message"
                    rows="4"
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="system">System</option>
                    <option value="transaction">Transaction</option>
                    <option value="security">Security</option>
                    <option value="kyc">KYC</option>
                    <option value="promotion">Promotion</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="credit">Credit</option>
                    <option value="debit">Debit</option>
                  </select>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                  <p className="text-xs text-yellow-400">
                    This notification will be sent to all registered users via email and in-app notification.
                  </p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowSendModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={sendBulkNotification}
                    disabled={sending}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {sending ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>{sending ? 'Sending...' : 'Send Notification'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminNotifications;