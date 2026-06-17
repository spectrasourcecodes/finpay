import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../../components/AdminLayout';
import { Search, UserCheck, UserX, Eye, Mail, Phone, Calendar, MoreVertical, Shield, Ban, CheckCircle } from 'lucide-react';
import axiosInstance from '../../utils/axiosConfig';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get('/admin/users');
      setUsers(response.data.data.users);
    } catch (error) {
      console.error('Fetch users error:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFreeze = async (userId, isFrozen) => {
    const endpoint = isFrozen ? 'unfreeze' : 'freeze';
    try {
      await axiosInstance.put(`/admin/users/${userId}/${endpoint}`);
      toast.success(`User ${isFrozen ? 'unfrozen' : 'frozen'} successfully`);
      fetchUsers();
    } catch (error) {
      toast.error('Action failed');
    }
  };

  const filteredUsers = users.filter(user =>
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.includes(searchTerm)
  );

  const getStatusBadge = (user) => {
    if (user.isFrozen) {
      return { text: 'Frozen', color: 'bg-red-500/20 text-red-400', icon: Ban };
    }
    return { text: 'Active', color: 'bg-green-500/20 text-green-400', icon: CheckCircle };
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading users...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">User Management</h1>
            <p className="text-gray-400 mt-1">Manage all registered users</p>
          </div>
          <div className="text-sm text-gray-400">
            Total Users: <span className="font-semibold text-white">{users.length}</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800 border-b border-gray-700">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">User</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Contact</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Joined</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => {
                  const status = getStatusBadge(user);
                  const StatusIcon = status.icon;
                  
                  return (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-gray-700 hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">{user.fullName?.charAt(0) || 'U'}</span>
                          </div>
                          <div>
                            <p className="font-medium text-white">{user.fullName}</p>
                            <p className="text-xs text-gray-400">ID: {user._id?.slice(-8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <p className="text-sm text-gray-300 flex items-center space-x-1">
                            <Mail className="w-3 h-3" />
                            <span>{user.email}</span>
                          </p>
                          <p className="text-sm text-gray-400 flex items-center space-x-1">
                            <Phone className="w-3 h-3" />
                            <span>{user.phone}</span>
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center space-x-1 px-2 py-1 text-xs rounded-full ${status.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          <span>{status.text}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {user.isAdmin ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-400">
                            <Shield className="w-3 h-3" />
                            <span>Admin</span>
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">User</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleFreeze(user._id, user.isFrozen)}
                            className={`p-2 rounded-lg transition-colors ${
                              user.isFrozen 
                                ? 'text-green-400 hover:bg-green-500/10' 
                                : 'text-red-400 hover:bg-red-500/10'
                            }`}
                            title={user.isFrozen ? 'Unfreeze User' : 'Freeze User'}
                          >
                            {user.isFrozen ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="p-2 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800 rounded-xl max-w-md w-full p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">User Details</h2>
              <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-white text-2xl">×</button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 pb-3 border-b border-gray-700">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg font-medium">{selectedUser.fullName?.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-semibold text-white">{selectedUser.fullName}</p>
                  <p className="text-sm text-gray-400">{selectedUser.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Phone</span>
                  <span className="text-white">{selectedUser.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">User ID</span>
                  <span className="text-white font-mono text-sm">{selectedUser._id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Joined</span>
                  <span className="text-white">{new Date(selectedUser.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className={selectedUser.isFrozen ? 'text-red-400' : 'text-green-400'}>
                    {selectedUser.isFrozen ? 'Frozen' : 'Active'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Role</span>
                  <span className={selectedUser.isAdmin ? 'text-purple-400' : 'text-gray-300'}>
                    {selectedUser.isAdmin ? 'Administrator' : 'Regular User'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </Layout>
  );
};

export default AdminUsers;