import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { ArrowDown, Banknote, AlertCircle, Building, User, DollarSign, CheckCircle } from 'lucide-react';
import walletService from '../services/walletService';
import toast from 'react-hot-toast';

const Withdraw = () => {
  const [searchParams] = useSearchParams();
  const asset = searchParams.get('asset') || 'NGN';
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [formData, setFormData] = useState({
    accountNumber: '',
    bankCode: '',
    bankName: '',
    accountName: '',
    amount: ''
  });

  // Unique banks list - removed duplicates
  const banks = [
    { code: '044', name: 'Access Bank' },
    { code: '063', name: 'Access Bank (Diamond)' },
    { code: '023', name: 'Citibank Nigeria' },
    { code: '050', name: 'Ecobank Nigeria' },
    { code: '070', name: 'Fidelity Bank' },
    { code: '011', name: 'First Bank of Nigeria' },
    { code: '214', name: 'FCMB' },
    { code: '058', name: 'GTBank' },
    { code: '030', name: 'Heritage Bank' },
    { code: '301', name: 'Jaiz Bank' },
    { code: '082', name: 'Keystone Bank' },
    { code: '076', name: 'Polaris Bank' },
    { code: '101', name: 'Providus Bank' },
    { code: '221', name: 'Stanbic IBTC Bank' },
    { code: '068', name: 'Standard Chartered Bank' },
    { code: '232', name: 'Sterling Bank' },
    { code: '100', name: 'SunTrust Bank' },
    { code: '032', name: 'Union Bank' },
    { code: '033', name: 'UBA' },
    { code: '215', name: 'Unity Bank' },
    { code: '035', name: 'Wema Bank' },
    { code: '057', name: 'Zenith Bank' },
  ];

  const handleAccountVerification = async () => {
    if (!formData.accountNumber || !formData.bankCode) {
      toast.error('Please enter account number and select bank');
      return;
    }

    if (formData.accountNumber.length !== 10) {
      toast.error('Please enter a valid 10-digit account number');
      return;
    }

    setVerifying(true);
    try {
      const response = await walletService.verifyBankAccount(
        formData.accountNumber,
        formData.bankCode
      );
      const bank = banks.find(b => b.code === formData.bankCode);
      setFormData(prev => ({ 
        ...prev, 
        accountName: response.data.accountName,
        bankName: bank?.name || ''
      }));
      setStep(2);
      toast.success('Account verified successfully');
    } catch (error) {
      console.error('Verification error:', error);
      toast.error(error.response?.data?.message || 'Account verification failed. Please check your details.');
    } finally {
      setVerifying(false);
    }
  };

  const handleWithdrawal = async () => {
    const amount = parseFloat(formData.amount);
    if (amount < 1000) {
      toast.error('Minimum withdrawal amount is ₦1000');
      return;
    }

    if (amount > 500000) {
      toast.error('Maximum withdrawal amount is ₦500,000 per day');
      return;
    }

    setLoading(true);
    try {
      await walletService.withdrawNaira({
        accountNumber: formData.accountNumber,
        bankCode: formData.bankCode,
        bankName: formData.bankName,
        amount: amount
      });
      toast.success('Withdrawal initiated successfully! Funds will be sent within 1-2 business days');
      // Reset form
      setFormData({
        accountNumber: '',
        bankCode: '',
        bankName: '',
        accountName: '',
        amount: ''
      });
      setStep(1);
    } catch (error) {
      const message = error.response?.data?.message || 'Withdrawal failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (asset !== 'NGN') {
    return (
      <Layout>
        <div className="text-center py-20">
          <div className="glass-card p-12 max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Coming Soon</h2>
            <p className="text-gray-400">Crypto withdrawals will be available soon</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Withdraw Funds</h1>
          <p className="text-gray-400">Withdraw money to your bank account</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {[
            { step: 1, title: 'Verify Account', icon: Building },
            { step: 2, title: 'Enter Amount', icon: DollarSign },
          ].map((s) => (
            <div key={s.step} className="flex-1 text-center">
              <div className={`relative flex items-center justify-center`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  step >= s.step 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                    : 'bg-white/10 text-gray-400'
                }`}>
                  <s.icon className="w-5 h-5" />
                </div>
                {s.step === 1 && (
                  <div className={`absolute left-full w-full h-0.5 ${
                    step > s.step ? 'bg-blue-500' : 'bg-white/10'
                  }`} style={{ right: '-50%', left: '50%' }} />
                )}
              </div>
              <p className={`text-sm mt-2 ${step >= s.step ? 'text-white' : 'text-gray-500'}`}>
                {s.title}
              </p>
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-8"
        >
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Select Bank</label>
                <select
                  value={formData.bankCode}
                  onChange={(e) => {
                    const bank = banks.find(b => b.code === e.target.value);
                    setFormData(prev => ({ 
                      ...prev, 
                      bankCode: e.target.value,
                      bankName: bank?.name || ''
                    }));
                  }}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">Select a bank</option>
                  {banks.map(bank => (
                    <option key={bank.code} value={bank.code}>
                      {bank.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Account Number</label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Enter 10-digit account number"
                  maxLength="10"
                  required
                />
              </div>

              <button
                onClick={handleAccountVerification}
                disabled={verifying || !formData.accountNumber || !formData.bankCode}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {verifying ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Verify Account</span>
                  </>
                )}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {/* Verified Account Display */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <p className="text-sm text-gray-400 mb-1">Verified Account</p>
                <p className="font-semibold text-lg text-white">{formData.accountName}</p>
                <p className="text-sm text-gray-400">{formData.accountNumber}</p>
                <p className="text-sm text-gray-400">{formData.bankName}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Amount to Withdraw (₦)</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-2xl focus:outline-none focus:border-blue-500"
                  placeholder="0.00"
                  min="1000"
                  step="1000"
                  required
                />
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium mb-1">Withdrawal Information</p>
                    <ul className="text-xs text-gray-400 space-y-1">
                      <li>• Minimum withdrawal: ₦1,000</li>
                      <li>• Maximum withdrawal: ₦500,000 per day</li>
                      <li>• Processing fee: ₦50 + 0.5% of amount</li>
                      <li>• Processing time: 1-2 business days</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleWithdrawal}
                  disabled={loading || !formData.amount}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Banknote className="w-5 h-5" />
                      <span>Withdraw</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default Withdraw;