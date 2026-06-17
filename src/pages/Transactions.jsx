import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout';
import { Search, Filter, ArrowUpRight, ArrowDownRight, RefreshCw, Download, X, Calendar, Clock, Hash, FileText, User, CheckCircle, XCircle, AlertCircle, Copy, Check } from 'lucide-react';
import transactionService from '../services/transactionService';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await transactionService.getTransactions();
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'deposit': return <ArrowUpRight className="w-5 h-5 text-green-500" />;
      case 'withdrawal': return <ArrowDownRight className="w-5 h-5 text-red-500" />;
      default: return <RefreshCw className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'success': return 'text-green-500 bg-green-500/10';
      case 'pending': return 'text-yellow-500 bg-yellow-500/10';
      case 'failed': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredTransactions = transactions.filter(t => {
    if (filter !== 'all' && t.type !== filter) return false;
    if (searchTerm && !t.reference?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // Get the app icon from the icons folder
    const appIcon = '/icons/icon-192x192.png';
    
  // Receipt-style Transaction Detail Modal
  const TransactionDetailModal = ({ transaction, onClose }) => {
    if (!transaction) return null;

    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          {/* Modal - Receipt Style */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-sm bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Receipt Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4 text-center">
              <div className="inline-flex p-2 bg-white/20 rounded-full mb-2">
                <img 
                    src={appIcon} 
                    alt="FinPay" 
                    className="w-6 h-6 rounded-lg"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                    }}
                  />
              </div>
              <h3 className="text-white font-bold text-lg capitalize">
                {transaction.type} Receipt
              </h3>
              <p className="text-blue-100 text-xs mt-1">
                Transaction ID: {transaction.reference?.slice(-8)}
              </p>
            </div>

            {/* Receipt Content */}
            <div className="p-5 space-y-4">
              {/* Amount */}
              <div className="text-center border-b border-gray-700 pb-4">
                <p className="text-gray-400 text-sm mb-1">Amount</p>
                <p className={`text-3xl font-bold ${
                  transaction.type === 'deposit' ? 'text-green-500' : 
                  transaction.type === 'withdrawal' ? 'text-red-500' : 
                  'text-blue-500'
                }`}>
                  {transaction.type === 'deposit' ? '+' : '-'} ₦{transaction.amount?.toLocaleString()}
                </p>
                <div className="inline-flex mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(transaction.status)}`}>
                    {transaction.status?.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3">
                {/* Reference */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Reference</span>
                  <div className="flex items-center space-x-2">
                    <code className="text-xs text-white font-mono">{transaction.reference?.slice(0, 12)}...</code>
                    <button
                      onClick={() => copyToClipboard(transaction.reference)}
                      className="p-1 rounded-lg text-gray-400 hover:text-white"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Date */}
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Date</span>
                  <span className="text-white text-sm">
                    {format(new Date(transaction.createdAt), 'MMM dd, yyyy')}
                  </span>
                </div>

                {/* Time */}
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Time</span>
                  <span className="text-white text-sm">
                    {format(new Date(transaction.createdAt), 'hh:mm:ss a')}
                  </span>
                </div>

                {/* Description */}
                {transaction.description && (
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Description</span>
                    <span className="text-white text-sm text-right max-w-[60%] break-words">
                      {transaction.description}
                    </span>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-dashed border-gray-700 my-3"></div>

              {/* Status */}
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Status</span>
                <span className={`text-sm font-medium capitalize ${
                  transaction.status === 'success' ? 'text-green-500' :
                  transaction.status === 'pending' ? 'text-yellow-500' :
                  'text-red-500'
                }`}>
                  {transaction.status}
                </span>
              </div>
            </div>

            {/* Close Button */}
            <div className="p-4 border-t border-gray-700 bg-gray-800/50">
              <button
                onClick={onClose}
                className="w-full py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-colors text-sm font-medium"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  };

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Transactions</h1>
            <p className="text-sm sm:text-base text-gray-400 mt-1">View all your financial activities</p>
          </div>
          <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-700 rounded-xl hover:bg-gray-600 transition-colors w-full sm:w-auto">
            <Download className="w-4 h-4" />
            <span className="text-sm">Export CSV</span>
          </button>
        </div>

        {/* Filters */}
        <div className="glass-card p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-premium pl-12 text-sm sm:text-base"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              {['all', 'deposit', 'withdrawal', 'transfer'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-3 sm:px-4 py-2 rounded-xl capitalize transition-all text-sm sm:text-base whitespace-nowrap ${
                    filter === type 
                      ? 'gradient-bg text-white' 
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="glass-card p-4 sm:p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-400">Loading transactions...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <RefreshCw className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400">No transactions found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((transaction, index) => (
                <motion.div
                  key={transaction._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedTransaction(transaction)}
                  className="flex items-center justify-between p-3 sm:p-4 rounded-xl hover:bg-white/5 transition-all cursor-pointer active:bg-white/10"
                >
                  <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                    <div className="p-2 bg-white/5 rounded-xl flex-shrink-0">
                      {getIcon(transaction.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold capitalize text-sm sm:text-base">{transaction.type}</p>
                      <p className="text-xs sm:text-sm text-gray-400">
                        {format(new Date(transaction.createdAt), 'MMM dd, yyyy')}
                      </p>
                      <p className="text-xs text-gray-500 font-mono truncate hidden sm:block">
                        {transaction.reference}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className={`font-bold text-sm sm:text-base ${
                      transaction.type === 'deposit' ? 'text-green-500' : 
                      transaction.type === 'withdrawal' ? 'text-red-500' : 
                      'text-blue-500'
                    }`}>
                      {transaction.type === 'deposit' ? '+' : '-'} ₦{transaction.amount?.toLocaleString()}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      transaction.status === 'success' ? 'bg-green-500/20 text-green-400' :
                      transaction.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {transaction.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Transaction Detail Modal */}
      <TransactionDetailModal 
        transaction={selectedTransaction} 
        onClose={() => setSelectedTransaction(null)} 
      />
    </Layout>
  );
};

export default Transactions;