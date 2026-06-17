import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { Wallet2Icon, Bitcoin, Coins, TrendingUp, ArrowUp, ArrowDown, Send, Copy, Check, Eye, EyeOff } from 'lucide-react';
import walletService from '../services/walletService';

const Wallet = () => {
  const [wallet, setWallet] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    const res = await walletService.getBalance();
    setWallet(res.data.wallet);
  };

  const copyAddress = () => {
    navigator.clipboard.writeText('0x742d35Cc6634C0532925a3b844Bc9e7595f');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const assets = [
    { name: 'Naira', symbol: 'NGN', balance: wallet?.nairaBalance || 0, icon: Wallet2Icon, color: 'from-blue-500 to-blue-600', action: '/deposit', isCurrency: true },
    { name: 'Bitcoin', symbol: 'BTC', balance: wallet?.btcBalance || 0, icon: Bitcoin, color: 'from-orange-500 to-orange-600', action: '/deposit?asset=BTC', isCurrency: false },
    { name: 'Ethereum', symbol: 'ETH', balance: wallet?.ethBalance || 0, icon: Coins, color: 'from-purple-500 to-purple-600', action: '/deposit?asset=ETH', isCurrency: false },
    { name: 'USDT', symbol: 'USDT', balance: wallet?.usdtBalance || 0, icon: TrendingUp, color: 'from-green-500 to-green-600', action: '/deposit?asset=USDT', isCurrency: false },
  ];

  const formatBalance = (asset) => {
    if (!showBalance) return '••••••';
    return asset.symbol === 'NGN' 
      ? `₦${asset.balance.toLocaleString()}`
      : `${asset.balance.toLocaleString()} ${asset.symbol}`;
  };

  const formatApproximateValue = (asset) => {
    if (!showBalance) return null;
    if (asset.symbol === 'BTC') {
      return `≈ ₦${(asset.balance * 35000000).toLocaleString()}`;
    }
    if (asset.symbol === 'ETH') {
      return `≈ ₦${(asset.balance * 1800000).toLocaleString()}`;
    }
    if (asset.symbol === 'USDT') {
      return `≈ ₦${(asset.balance * 1500).toLocaleString()}`;
    }
    return null;
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header with Hide/Show Button - Matching Dashboard */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">My Wallet</h1>
            <p className="text-gray-400 mt-1">Manage your digital assets</p>
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

        {/* Wallet Address - Consistent with dashboard card style */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm text-gray-400 mb-1">Your Wallet Address</p>
              <code className="text-sm font-mono text-gray-300 break-all">0x742d35Cc6634C0532925a3b844Bc9e7595f</code>
            </div>
            <button 
              onClick={copyAddress} 
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy Address'}</span>
            </button>
          </div>
        </div>

        {/* Assets Grid - Matching dashboard stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assets.map((asset, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-gradient-to-br ${asset.color} rounded-xl`}>
                  <asset.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">{asset.symbol}</span>
                  {index === 0 && (
                    <button
                      onClick={() => setShowBalance(!showBalance)}
                      className="p-1 rounded-lg text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
              
              {/* Amount size matching dashboard (text-2xl font-bold) */}
              <p className="text-2xl font-bold text-white mb-2">
                {formatBalance(asset)}
              </p>
              
              {formatApproximateValue(asset) && (
                <p className="text-sm text-green-400 mb-4">
                  {formatApproximateValue(asset)}
                </p>
              )}
              
              <div className="flex space-x-3 mt-4">
                <Link 
                  to={asset.action} 
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-lg text-center flex items-center justify-center space-x-2 hover:from-blue-600 hover:to-blue-700 transition-all"
                >
                  <ArrowUp className="w-4 h-4" />
                  <span>Deposit</span>
                </Link>
                <Link 
                  to={`/withdraw?asset=${asset.symbol}`} 
                  className="flex-1 bg-gray-700 text-white py-2 rounded-lg text-center flex items-center justify-center space-x-2 hover:bg-gray-600 transition-all"
                >
                  <ArrowDown className="w-4 h-4" />
                  <span>Withdraw</span>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Total Portfolio Value Card - Matching dashboard balance card */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Portfolio Value</p>
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-3xl font-bold text-white">
                  {showBalance ? `₦${wallet?.nairaBalance?.toLocaleString() || 0}` : '••••••'}
                </p>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="p-1 rounded-lg text-blue-100 hover:text-white transition-colors"
                >
                  {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm">Assets</p>
              <p className="text-white font-semibold text-2xl">
                {showBalance ? Object.keys(assets).length : '••'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Wallet;