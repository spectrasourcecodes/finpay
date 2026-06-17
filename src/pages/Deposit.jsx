import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { Wallet2Icon, ArrowUp, AlertCircle, Sparkles, Shield } from 'lucide-react';
import walletService from '../services/walletService';
import toast from 'react-hot-toast';

const Deposit = () => {
  const [searchParams] = useSearchParams();
  const asset = searchParams.get('asset') || 'NGN';
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeposit = async (e) => {
    e.preventDefault();
    
    const depositAmount = parseFloat(amount);
    if (depositAmount < 100) {
      toast.error('Minimum deposit amount is ₦100');
      return;
    }

    if (depositAmount > 1000000) {
      toast.error('Maximum deposit amount is ₦1,000,000');
      return;
    }

    setLoading(true);
    try {
      const response = await walletService.initializeDeposit(depositAmount);
      const { authorizationUrl } = response.data;
      
      // Redirect to Paystack payment page - Paystack handles all payment methods
      window.location.href = authorizationUrl;
    } catch (error) {
      const message = error.response?.data?.message || 'Deposit initialization failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const suggestedAmounts = [1000, 5000, 10000, 25000, 50000, 100000];

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Deposit Funds</h1>
          <p className="text-gray-400">Add money to your {asset} wallet securely</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8"
        >
          <form onSubmit={handleDeposit} className="space-y-6">
            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium mb-2">Amount to Deposit (₦)</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Wallet2Icon className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input-premium pl-12 text-2xl"
                  placeholder="0.00"
                  required
                  min="100"
                  step="100"
                />
              </div>
            </div>

            {/* Suggested Amounts */}
            <div>
              <label className="block text-sm font-medium mb-3">Quick Amounts</label>
              <div className="flex flex-wrap gap-3">
                {suggestedAmounts.map((suggested) => (
                  <button
                    key={suggested}
                    type="button"
                    onClick={() => setAmount(suggested.toString())}
                    className="px-4 py-2 rounded-xl border border-gray-700 hover:border-blue-500 hover:text-blue-400 transition-all"
                  >
                    ₦{suggested.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Methods Info */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium mb-1">Secure Payment via Paystack</p>
                  <p className="text-xs text-gray-400">
                    You'll be redirected to Paystack's secure payment page where you can pay with:
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs px-2 py-1 bg-white/5 rounded">💳 Card</span>
                    <span className="text-xs px-2 py-1 bg-white/5 rounded">🏦 Bank Transfer</span>
                    <span className="text-xs px-2 py-1 bg-white/5 rounded">📱 USSD</span>
                    <span className="text-xs px-2 py-1 bg-white/5 rounded">🏧 QR Code</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium mb-1">Important Information</p>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• Minimum deposit: ₦100</li>
                    <li>• Maximum deposit: ₦1,000,000 per transaction</li>
                    <li>• Deposits are credited instantly after confirmation</li>
                    <li>• Transaction fee: 1.5% (capped at ₦2,000)</li>
                    <li>• Bank transfers may take 5-10 minutes to reflect</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !amount}
              className="btn-gradient w-full flex items-center justify-center space-x-2 py-3 text-lg"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <ArrowUp className="w-5 h-5" />
                  <span>Proceed to Paystack</span>
                  <Sparkles className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Security Note */}
        <div className="text-center text-xs text-gray-500">
          <p className="flex items-center justify-center space-x-1">
            <Shield className="w-3 h-3" />
            <span>All transactions are secured with 256-bit SSL encryption</span>
          </p>
          <p className="mt-1">Powered by Paystack Secure Payment Gateway</p>
        </div>
      </div>
    </Layout>
  );
};

export default Deposit;