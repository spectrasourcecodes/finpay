import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/AdminLayout';
import { 
  Wallet, Search, Users, DollarSign, Bitcoin, 
  Coins, TrendingUp, Eye, Edit2, Save, X,
  ArrowUp, ArrowDown, RefreshCw, AlertCircle,
  CheckCircle, Clock, User, Mail, Phone
} from 'lucide-react';
import axiosInstance from '../../utils/axiosConfig';
import { useAdminAuth } from '../../context/AdminAuthContext';
import toast from 'react-hot-toast';

const AdminWallets = () => {
  const { token } = useAdminAuth();
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [updateAmount, setUpdateAmount] = useState('');
  const [updateType, setUpdateType] = useState('add');
  const [updateAsset, setUpdateAsset] = useState('NGN');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/admin/wallets');
      setWallets(response.data.data.wallets);
    } catch (error) {
      console.error('Fetch wallets error:', error);
      toast.error('Failed to load wallets');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBalance = async () => {
    if (!updateAmount || parseFloat(updateAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setUpdating(true);
    try {
      const amount = parseFloat(updateAmount);
      const finalAmount = updateType === 'subtract' ? -amount : amount;
      
      await axiosInstance.put(`/admin/wallets/${selectedWallet.user._id}/balance`, {
        asset: updateAsset,
        amount: finalAmount,
        reason: `Admin ${updateType === 'add' ? 'added' : 'deducted'} ${updateAsset.toUpperCase()} balance`
      });
      
      toast.success(`Successfully ${updateType === 'add' ? 'added' : 'deducted'} ${updateAsset === 'NGN' ? '₦' : ''}${amount.toLocaleString()} ${updateAsset.toUpperCase()}`);
      fetchWallets();
      setSelectedWallet(null);
      setUpdateAmount('');
    } catch (error) {
      console.error('Update balance error:', error);
      toast.error(error.response?.data?.message || 'Failed to update balance');
    } finally {
      setUpdating(false);
    }
  };

  const getAssetIcon = (asset) => {
    switch(asset) {
      case 'NGN': return <DollarSign className="w-4 h-4" />;
      case 'btc': return <Bitcoin className="w-4 h-4" />;
      case 'eth': return <Coins className="w-4 h-4" />;
      case 'usdt': return <TrendingUp className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const filteredWallets = wallets.filter(wallet =>
    wallet.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wallet.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wallet.user?.phone?.includes(searchTerm)
  );

  const totalBalance = wallets.reduce((sum, wallet) => sum + (wallet.nairaBalance || 0), 0);
  const totalBTC = wallets.reduce((sum, wallet) => sum + (wallet.btcBalance || 0), 0);
  const totalETH = wallets.reduce((sum, wallet) => sum + (wallet.ethBalance || 0), 0);
  const totalUSDT = wallets.reduce((sum, wallet) => sum + (wallet.usdtBalance || 0), 0);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading wallets...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 pb-20">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Wallet Management</h1>
            <p className="text-gray-400 mt-1">Manage user wallets and balances</p>
          </div>
          <button
            onClick={fetchWallets}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Statistics Cards - Responsive Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-3 md:p-5">
            <div className="flex items-center justify-between">
              <DollarSign className="w-6 h-6 md:w-8 md:h-8 text-white/80" />
              <span className="text-[10px] md:text-xs text-white/80">Total NGN</span>
            </div>
            <p className="text-lg md:text-2xl font-bold text-white mt-1 md:mt-2">₦{totalBalance.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl p-3 md:p-5">
            <div className="flex items-center justify-between">
              <Bitcoin className="w-6 h-6 md:w-8 md:h-8 text-white/80" />
              <span className="text-[10px] md:text-xs text-white/80">Total BTC</span>
            </div>
            <p className="text-lg md:text-2xl font-bold text-white mt-1 md:mt-2">{totalBTC.toFixed(4)} BTC</p>
          </div>
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-3 md:p-5">
            <div className="flex items-center justify-between">
              <Coins className="w-6 h-6 md:w-8 md:h-8 text-white/80" />
              <span className="text-[10px] md:text-xs text-white/80">Total ETH</span>
            </div>
            <p className="text-lg md:text-2xl font-bold text-white mt-1 md:mt-2">{totalETH.toFixed(4)} ETH</p>
          </div>
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-3 md:p-5">
            <div className="flex items-center justify-between">
              <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-white/80" />
              <span className="text-[10px] md:text-xs text-white/80">Total USDT</span>
            </div>
            <p className="text-lg md:text-2xl font-bold text-white mt-1 md:mt-2">{totalUSDT.toFixed(2)} USDT</p>
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
              className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Wallets Table - Scrollable on mobile */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto overflow-y-auto max-h-[400px] md:max-h-[500px]">
            <table className="w-full min-w-[800px] md:min-w-full">
              <thead className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">User</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">NGN</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">BTC</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">ETH</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">USDT</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWallets.map((wallet, index) => (
                  <motion.tr
                    key={wallet._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-700 hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 md:w-5 md:h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-white text-sm md:text-base truncate max-w-[120px] md:max-w-none">
                            {wallet.user?.fullName || 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-400 truncate max-w-[120px] md:max-w-none">
                            {wallet.user?.email || 'No email'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-green-400 text-sm md:text-base">₦{wallet.nairaBalance?.toLocaleString() || 0}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-orange-400 text-sm md:text-base">{wallet.btcBalance || 0} BTC</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-purple-400 text-sm md:text-base">{wallet.ethBalance || 0} ETH</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-blue-400 text-sm md:text-base">{wallet.usdtBalance || 0} USDT</p>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setSelectedWallet(wallet)}
                        className="px-2 md:px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs md:text-sm"
                      >
                        Manage
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* No Results */}
        {filteredWallets.length === 0 && (
          <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700">
            <Wallet className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">No wallets found</p>
          </div>
        )}
      </div>

      {/* Update Balance Modal - Scrollable on mobile */}
      {selectedWallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedWallet(null)} />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-full max-w-[95%] md:max-w-md bg-gray-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] md:max-h-[85vh]"
          >
            {/* Modal Header - Sticky */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Wallet className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  <h2 className="text-lg md:text-xl font-bold text-white">Manage Wallet</h2>
                </div>
                <button
                  onClick={() => setSelectedWallet(null)}
                  className="p-1 rounded-lg text-white/80 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto max-h-[calc(90vh-70px)]">
              {/* User Info */}
              <div className="bg-gray-700/30 rounded-lg p-3 md:p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm md:text-base truncate">{selectedWallet.user?.fullName}</p>
                    <p className="text-xs md:text-sm text-gray-400 truncate">{selectedWallet.user?.email}</p>
                    <p className="text-xs text-gray-500 truncate">{selectedWallet.user?.phone}</p>
                  </div>
                </div>
              </div>

              {/* Current Balances */}
              <div>
                <h3 className="text-xs md:text-sm font-medium text-gray-400 mb-2 md:mb-3">Current Balances</h3>
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  <div className="bg-gray-700/30 rounded-lg p-2 md:p-3">
                    <p className="text-[10px] md:text-xs text-gray-400">NGN</p>
                    <p className="text-sm md:text-lg font-bold text-green-400 truncate">₦{selectedWallet.nairaBalance?.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-700/30 rounded-lg p-2 md:p-3">
                    <p className="text-[10px] md:text-xs text-gray-400">BTC</p>
                    <p className="text-sm md:text-lg font-bold text-orange-400 truncate">{selectedWallet.btcBalance} BTC</p>
                  </div>
                  <div className="bg-gray-700/30 rounded-lg p-2 md:p-3">
                    <p className="text-[10px] md:text-xs text-gray-400">ETH</p>
                    <p className="text-sm md:text-lg font-bold text-purple-400 truncate">{selectedWallet.ethBalance} ETH</p>
                  </div>
                  <div className="bg-gray-700/30 rounded-lg p-2 md:p-3">
                    <p className="text-[10px] md:text-xs text-gray-400">USDT</p>
                    <p className="text-sm md:text-lg font-bold text-blue-400 truncate">{selectedWallet.usdtBalance} USDT</p>
                  </div>
                </div>
              </div>

              {/* Update Form */}
              <div>
                <h3 className="text-xs md:text-sm font-medium text-gray-400 mb-2 md:mb-3">Update Balance</h3>
                
                {/* Asset Selection */}
                <div className="mb-3 md:mb-4">
                  <label className="block text-xs md:text-sm font-medium mb-1 md:mb-2">Select Asset</label>
                  <div className="grid grid-cols-4 gap-1 md:gap-2">
                    {[
                      { value: 'NGN', label: 'NGN', icon: DollarSign, color: 'green' },
                      { value: 'btc', label: 'BTC', icon: Bitcoin, color: 'orange' },
                      { value: 'eth', label: 'ETH', icon: Coins, color: 'purple' },
                      { value: 'usdt', label: 'USDT', icon: TrendingUp, color: 'blue' }
                    ].map((asset) => (
                      <button
                        key={asset.value}
                        onClick={() => setUpdateAsset(asset.value)}
                        className={`p-2 md:p-3 rounded-lg border transition-all ${
                          updateAsset === asset.value
                            ? `border-${asset.color}-500 bg-${asset.color}-500/20 text-${asset.color}-400`
                            : 'border-gray-600 text-gray-400 hover:border-gray-500'
                        }`}
                      >
                        <asset.icon className="w-4 h-4 md:w-5 md:h-5 mx-auto mb-1" />
                        <span className="text-[10px] md:text-xs">{asset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Type */}
                <div className="mb-3 md:mb-4">
                  <label className="block text-xs md:text-sm font-medium mb-1 md:mb-2">Action</label>
                  <div className="flex gap-2 md:gap-3">
                    <button
                      onClick={() => setUpdateType('add')}
                      className={`flex-1 py-1.5 md:py-2 rounded-lg flex items-center justify-center space-x-1 md:space-x-2 transition-all text-sm md:text-base ${
                        updateType === 'add'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                      }`}
                    >
                      <ArrowUp className="w-3 h-3 md:w-4 md:h-4" />
                      <span>Add</span>
                    </button>
                    <button
                      onClick={() => setUpdateType('subtract')}
                      className={`flex-1 py-1.5 md:py-2 rounded-lg flex items-center justify-center space-x-1 md:space-x-2 transition-all text-sm md:text-base ${
                        updateType === 'subtract'
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                      }`}
                    >
                      <ArrowDown className="w-3 h-3 md:w-4 md:h-4" />
                      <span>Deduct</span>
                    </button>
                  </div>
                </div>

                {/* Amount */}
                <div className="mb-3 md:mb-4">
                  <label className="block text-xs md:text-sm font-medium mb-1 md:mb-2">Amount</label>
                  <input
                    type="number"
                    value={updateAmount}
                    onChange={(e) => setUpdateAmount(e.target.value)}
                    placeholder={`Enter amount in ${updateAsset.toUpperCase()}`}
                    className="w-full px-3 md:px-4 py-1.5 md:py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 text-sm md:text-base"
                    step={updateAsset === 'NGN' ? '100' : updateAsset === 'btc' ? '0.0001' : '0.001'}
                  />
                </div>

                {/* Warning */}
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2 md:p-3">
                  <div className="flex items-start space-x-1 md:space-x-2">
                    <AlertCircle className="w-3 h-3 md:w-4 md:h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <p className="text-[10px] md:text-xs text-yellow-400">
                      {updateType === 'add' 
                        ? 'This will increase the user\'s balance. A transaction record will be created.'
                        : 'This will decrease the user\'s balance. Ensure the user has sufficient funds.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions - Sticky on mobile */}
              <div className="flex space-x-2 md:space-x-3 pt-3 md:pt-4 sticky bottom-0 bg-gray-800 pb-2 md:pb-0">
                <button
                  onClick={() => setSelectedWallet(null)}
                  className="flex-1 px-3 md:px-4 py-1.5 md:py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm md:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateBalance}
                  disabled={updating || !updateAmount}
                  className="flex-1 px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 flex items-center justify-center space-x-1 md:space-x-2 text-sm md:text-base"
                >
                  {updating ? (
                    <RefreshCw className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
                  ) : (
                    <Save className="w-3 h-3 md:w-4 md:h-4" />
                  )}
                  <span>{updating ? 'Updating...' : 'Update Balance'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminWallets;