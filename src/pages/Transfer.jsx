import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout';
import { 
  Send, User, Wallet2Icon, AlertCircle, ArrowRight, 
  Building, CheckCircle, Users, Banknote, RefreshCw, Keyboard, Eye, EyeOff, Lock, Shield, X, Copy, Check, Receipt, Share2, Printer
} from 'lucide-react';
import walletService from '../services/walletService';
import axiosInstance from '../utils/axiosConfig';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Transfer = () => {
  const [transferType, setTransferType] = useState('internal');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    amount: '',
    description: '',
    accountNumber: '',
    bankCode: '',
    bankName: '',
    accountName: '',
    narration: ''
  });
  const [banks, setBanks] = useState([]);
  const [verifiedAccount, setVerifiedAccount] = useState(null);
  const [showNumpad, setShowNumpad] = useState(false);
  const [wallet, setWallet] = useState(null);
  const accountInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const receiptRef = useRef(null);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const res = await walletService.getBalance();
      setWallet(res.data.wallet);
    } catch (error) {
      console.error('Error fetching wallet:', error);
    }
  };

  // Fetch banks from Paystack on component mount
  useEffect(() => {
    fetchBanksFromPaystack();
  }, []);

  const fetchBanksFromPaystack = async () => {
    setLoadingBanks(true);
    try {
      const response = await axiosInstance.get('/banks');
      const bankList = response.data.data.banks;
      
      const uniqueBanksMap = new Map();
      bankList.forEach(bank => {
        if (!uniqueBanksMap.has(bank.code)) {
          uniqueBanksMap.set(bank.code, bank);
        }
      });
      
      const uniqueBanks = Array.from(uniqueBanksMap.values());
      const sortedBanks = uniqueBanks.sort((a, b) => a.name.localeCompare(b.name));
      
      setBanks(sortedBanks);
    } catch (error) {
      console.error('Error fetching banks:', error);
      toast.error('Failed to load banks. Please refresh.');
    } finally {
      setLoadingBanks(false);
    }
  };

  // Auto-verify when account number reaches 10 digits
  useEffect(() => {
    if (transferType === 'bank' && formData.accountNumber.length === 10 && formData.bankCode && !verifiedAccount && !verifying) {
      const timer = setTimeout(() => {
        verifyBankAccount();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [formData.accountNumber, formData.bankCode, transferType]);

  const verifyBankAccount = async () => {
    if (!formData.accountNumber || !formData.bankCode) {
      toast.error('Please select a bank first');
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
      
      const selectedBank = banks.find(b => b.code === formData.bankCode);
      
      setVerifiedAccount({
        accountName: response.data.accountName,
        accountNumber: formData.accountNumber,
        bankName: selectedBank?.name || '',
        bankCode: formData.bankCode
      });
      
      setFormData(prev => ({ 
        ...prev, 
        accountName: response.data.accountName,
        bankName: selectedBank?.name || ''
      }));
      
      toast.success('Account verified successfully!');
      
      setTimeout(() => {
        const amountInput = document.querySelector('input[type="number"]');
        if (amountInput) amountInput.focus();
      }, 100);
    } catch (error) {
      console.error('Verification error:', error);
      const errorMessage = error.response?.data?.message || 'Account verification failed. Please check the account number.';
      toast.error(errorMessage);
      setVerifiedAccount(null);
      setFormData(prev => ({ ...prev, accountName: '' }));
    } finally {
      setVerifying(false);
    }
  };

  const handleAccountNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 10) value = value.slice(0, 10);
    
    setFormData(prev => ({ ...prev, accountNumber: value }));
    
    if (verifiedAccount) {
      setVerifiedAccount(null);
      setFormData(prev => ({ ...prev, accountName: '' }));
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy');
    }
  };

  const shareReceipt = async (platform) => {
    // Get current date and time
    const currentDate = format(new Date(), 'MMM dd, yyyy hh:mm a');
    
    // Create a beautiful receipt text with app branding
    const receiptText = `🏦 FINPAY - OFFICIAL TRANSACTION RECEIPT 🏦\n` +
      `═══════════════════════════════════════\n` +
      `Reference: ${completedTransaction?.reference}\n` +
      `Date & Time: ${currentDate}\n` +
      `Transaction Type: ${completedTransaction?.type === 'internal' ? 'FinPay Transfer' : 'Bank Transfer'}\n` +
      `\n💰 AMOUNT: ₦${completedTransaction?.amount?.toLocaleString()}\n` +
      `👤 Recipient: ${completedTransaction?.recipient}\n` +
      `${completedTransaction?.bankName ? `🏦 Bank: ${completedTransaction.bankName}\n` : ''}` +
      `${completedTransaction?.description ? `📝 Description: ${completedTransaction.description}\n` : ''}` +
      `${completedTransaction?.fee > 0 ? `💸 Fee: ₦${completedTransaction.fee.toLocaleString()}\n` : ''}` +
      `${completedTransaction?.fee > 0 ? `💰 Total Debited: ₦${completedTransaction.total.toLocaleString()}\n` : ''}` +
      `\n✅ Status: ${completedTransaction?.status === 'success' ? 'COMPLETED ✓' : 'PENDING ⏰'}\n` +
      `═══════════════════════════════════════\n` +
      `Download our app: ${window.location.origin}\n` +
      `© FinPay - Secure Digital Banking\n` +
      `This is an electronically generated receipt.`;

    const htmlReceipt = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 15px; color: #fff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="display: inline-block; background: linear-gradient(135deg, #0066FF, #00C6FF); padding: 10px 20px; border-radius: 10px; margin-bottom: 10px;">
            <h2 style="margin: 0; color: #fff;">🏦 FINPAY</h2>
          </div>
          <p style="margin: 5px 0 0; color: #888;">Official Transaction Receipt</p>
        </div>
        
        <div style="background: #0f0f23; border-radius: 10px; padding: 15px; margin-bottom: 15px;">
          <p style="margin: 5px 0;"><strong>Reference:</strong> ${completedTransaction?.reference}</p>
          <p style="margin: 5px 0;"><strong>Date & Time:</strong> ${currentDate}</p>
          <p style="margin: 5px 0;"><strong>Type:</strong> ${completedTransaction?.type === 'internal' ? 'FinPay Transfer' : 'Bank Transfer'}</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #0066FF20, #00C6FF20); border-radius: 10px; padding: 15px; margin-bottom: 15px; text-align: center;">
          <h3 style="margin: 0 0 5px; color: #aaa;">Amount</h3>
          <p style="margin: 0; font-size: 32px; font-weight: bold; color: #10b981;">₦${completedTransaction?.amount?.toLocaleString()}</p>
        </div>
        
        <div style="background: #0f0f23; border-radius: 10px; padding: 15px; margin-bottom: 15px;">
          <p style="margin: 5px 0;"><strong>👤 Recipient:</strong> ${completedTransaction?.recipient}</p>
          ${completedTransaction?.bankName ? `<p style="margin: 5px 0;"><strong>🏦 Bank:</strong> ${completedTransaction.bankName}</p>` : ''}
          ${completedTransaction?.description ? `<p style="margin: 5px 0;"><strong>📝 Description:</strong> ${completedTransaction.description}</p>` : ''}
          ${completedTransaction?.fee > 0 ? `<p style="margin: 5px 0;"><strong>💸 Fee:</strong> ₦${completedTransaction.fee.toLocaleString()}</p>` : ''}
          ${completedTransaction?.fee > 0 ? `<p style="margin: 5px 0;"><strong>💰 Total Debited:</strong> ₦${completedTransaction.total.toLocaleString()}</p>` : ''}
        </div>
        
        <div style="text-align: center; padding: 10px; background: ${completedTransaction?.status === 'success' ? '#10b98120' : '#f59e0b20'}; border-radius: 10px; margin-bottom: 15px;">
          <p style="margin: 0; font-weight: bold; color: ${completedTransaction?.status === 'success' ? '#10b981' : '#f59e0b'}">
            ✅ Status: ${completedTransaction?.status === 'success' ? 'COMPLETED' : 'PENDING'}
          </p>
          ${completedTransaction?.processingTime ? `<p style="margin: 5px 0 0; font-size: 12px; color: #f59e0b;">⏰ Processing: ${completedTransaction.processingTime}</p>` : ''}
        </div>
        
        <div style="text-align: center; padding-top: 15px; border-top: 1px solid #333; font-size: 11px; color: #666;">
          <p style="margin: 0;">Download app: ${window.location.origin}</p>
          <p style="margin: 5px 0 0;">This is an electronically generated receipt. No signature required.</p>
          <p style="margin: 5px 0 0;">© FinPay - Secure Digital Banking</p>
        </div>
      </div>
    `;

    if (platform === 'copy') {
      await copyToClipboard(receiptText);
      setShowShareOptions(false);
      return;
    }

    if (platform === 'print') {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>FinPay Transaction Receipt</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
                background: #0a0a0a;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                padding: 20px;
              }
              @media print {
                body { background: white; padding: 0; }
                .no-print { display: none; }
                .receipt-container { box-shadow: none; margin: 0; }
              }
            </style>
          </head>
          <body>
            <div class="receipt-container" style="max-width: 500px; margin: 0 auto;">
              ${htmlReceipt}
            </div>
            <div class="no-print" style="text-align: center; margin-top: 20px;">
              <button onclick="window.print()" style="padding: 10px 20px; background: #0066FF; color: white; border: none; border-radius: 5px; cursor: pointer;">🖨️ Print</button>
              <button onclick="window.close()" style="padding: 10px 20px; background: #666; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">Close</button>
            </div>
            <script>
              setTimeout(() => { window.print(); }, 500);
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
      setShowShareOptions(false);
      return;
    }

    if (navigator.share && platform === 'native') {
      try {
        // Create a blob for the HTML receipt to share as a file
        const htmlBlob = new Blob([htmlReceipt], { type: 'text/html' });
        const textBlob = new Blob([receiptText], { type: 'text/plain' });
        
        // Try to share as both text and file
        await navigator.share({
          title: 'FinPay Transaction Receipt',
          text: receiptText,
          url: window.location.origin,
          files: [new File([htmlBlob], `receipt-${completedTransaction?.reference}.html`, { type: 'text/html' })]
        });
        setShowShareOptions(false);
      } catch (error) {
        console.error('Share failed:', error);
        // Fallback to copy
        await copyToClipboard(receiptText);
        toast.info('Receipt copied to clipboard instead');
      }
    }
  };

  const verifyPassword = async () => {
    if (!password) {
      setPasswordError('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post('/auth/verify-password', { password });
      setPasswordError('');
      
      if (transferType === 'internal') {
        await executeInternalTransfer();
      } else {
        await executeBankTransfer();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid password. Please try again.';
      setPasswordError(message);
      setPassword('');
      if (passwordInputRef.current) {
        passwordInputRef.current.focus();
      }
    } finally {
      setLoading(false);
    }
  };

  const executeInternalTransfer = async () => {
    const amount = parseFloat(formData.amount);
    
    try {
      const response = await walletService.transferFunds({
        email: formData.email,
        amount: amount,
        description: formData.description || 'Transfer',
        password: password
      });
      
      const receiptData = {
        type: 'internal',
        reference: response.data?.data?.reference || 'TXN-' + Date.now(),
        amount: amount,
        recipient: formData.email,
        description: formData.description || 'Transfer',
        status: 'success',
        date: new Date(),
        fee: 0,
        total: amount,
        senderEmail: wallet?.user?.email || 'N/A'
      };
      
      setCompletedTransaction(receiptData);
      setShowReceipt(true);
      
      await fetchWallet();
      
      setFormData({ 
        email: '', 
        amount: '', 
        description: '',
        accountNumber: '',
        bankCode: '',
        bankName: '',
        accountName: '',
        narration: ''
      });
      setStep(1);
      setVerifiedAccount(null);
      setShowPassword(false);
      setPassword('');
    } catch (error) {
      console.log(error)
      const message = error.response?.data?.message || 'Transfer failed';
      toast.error(message);
      setShowPassword(false);
      setPassword('');
    }
  };

  const executeBankTransfer = async () => {
    const amount = parseFloat(formData.amount);
    const transactionData = {
      type: 'bank_transfer',
      amount: amount,
      recipientAccount: formData.accountNumber,
      recipientBank: formData.bankName,
      recipientName: verifiedAccount.accountName,
      narration: formData.narration || 'Bank transfer',
      status: 'pending',
      password: password
    };

    try {
      const response = await axiosInstance.post('/wallet/bank-transfer', transactionData);
      
      const receiptData = {
        type: 'bank',
        reference: response.data?.data?.reference || 'BANK-' + Date.now(),
        amount: amount,
        recipient: `${verifiedAccount.accountName} - ${formData.accountNumber}`,
        bankName: formData.bankName,
        description: formData.narration || 'Bank transfer',
        status: 'pending',
        date: new Date(),
        fee: calculateFee(amount),
        total: amount + calculateFee(amount),
        senderEmail: wallet?.user?.email || 'N/A',
        processingTime: '1-2 business days'
      };
      
      setCompletedTransaction(receiptData);
      setShowReceipt(true);
      
      await fetchWallet();
      
      setFormData({
        email: '',
        amount: '',
        description: '',
        accountNumber: '',
        bankCode: '',
        bankName: '',
        accountName: '',
        narration: ''
      });
      setVerifiedAccount(null);
      setStep(1);
      setTransferType('internal');
      setShowPassword(false);
      setPassword('');
    } catch (error) {
      const message = error.response?.data?.message || 'Transfer failed';
      toast.error(message);
      setShowPassword(false);
      setPassword('');
    }
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
    setCompletedTransaction(null);
    setShowShareOptions(false);
  };

  const handleProceedToConfirm = () => {
    const amount = parseFloat(formData.amount);
    if (transferType === 'internal') {
      if (!formData.email || !amount || amount < 100) {
        toast.error('Please fill in all required fields');
        return;
      }
      if (amount > (wallet?.nairaBalance || 0)) {
        toast.error(`Insufficient balance. Maximum available: ₦${(wallet?.nairaBalance || 0).toLocaleString()}`);
        return;
      }
    } else {
      const totalAmount = amount + calculateFee(amount);
      if (!verifiedAccount || !amount || amount < 1000) {
        toast.error('Please verify account and enter valid amount');
        return;
      }
      if (totalAmount > (wallet?.nairaBalance || 0)) {
        toast.error(`Insufficient balance. Including fees, you need ₦${totalAmount.toLocaleString()}`);
        return;
      }
    }
    setStep(2);
  };

  const handleConfirmTransfer = () => {
    setShowPassword(true);
    setPassword('');
    setPasswordError('');
    setTimeout(() => {
      if (passwordInputRef.current) {
        passwordInputRef.current.focus();
      }
    }, 100);
  };

  const suggestedAmounts = [1000, 5000, 10000, 25000, 50000, 100000];

  const Numpad = ({ onNumberClick, onDelete, onClose, value }) => {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
    
    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex items-end justify-center lg:hidden">
        <div className="bg-gray-900 w-full rounded-t-3xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Enter Account Number</h3>
            <button onClick={onClose} className="text-gray-400 text-2xl hover:text-white transition-colors">
              ×
            </button>
          </div>
          
          <div className="text-center mb-6">
            <div className="text-3xl font-mono tracking-wider text-white">
              {value.split('').map((digit, i) => (
                <span key={i} className="mx-1">{digit}</span>
              ))}
              {Array(10 - value.length).fill('•').map((dot, i) => (
                <span key={`dot-${i}`} className="mx-1 text-gray-500">•</span>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">{value.length}/10 digits</p>
          </div>
          
          <div className="grid grid-cols-3 gap-3 mb-4">
            {numbers.map((num) => (
              <button
                key={num}
                onClick={() => onNumberClick(num.toString())}
                className="bg-gray-800 py-5 rounded-2xl text-2xl font-semibold active:bg-gray-700 transition-colors hover:bg-gray-700"
              >
                {num}
              </button>
            ))}
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onDelete}
              className="bg-red-600/20 text-red-400 py-4 rounded-2xl font-semibold active:bg-red-600/30 transition-colors hover:bg-red-600/30"
            >
              Delete
            </button>
            <button
              onClick={onClose}
              className="bg-blue-600 py-4 rounded-2xl font-semibold active:bg-blue-700 transition-colors hover:bg-blue-700"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  };

  const calculateFee = (amount) => {
    if (!amount) return 0;
    return Math.ceil(50 + (parseFloat(amount) * 0.005));
  };

  const fee = transferType === 'bank' ? calculateFee(formData.amount) : 0;
  const totalAmount = transferType === 'bank' ? (parseFloat(formData.amount) || 0) + fee : parseFloat(formData.amount) || 0;

  // Receipt Modal Component - Updated with App Icon
  const ReceiptModal = ({ transaction, onClose }) => {
    if (!transaction) return null;

    // Get the app icon from the icons folder
    const appIcon = '/icons/icon-192x192.png';

    return (
      <AnimatePresence>
        {showReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
              ref={receiptRef}
            >
              {/* Receipt Header with App Icon */}
              <div className={`p-4 text-center ${transaction.type === 'internal' ? 'bg-gradient-to-r from-blue-600 to-blue-500' : 'bg-gradient-to-r from-green-600 to-green-500'}`}>
                <div className="flex items-center justify-center mb-2">
                  {/* App Icon */}
                  <img 
                    src={appIcon} 
                    alt="FinPay" 
                    className="w-12 h-12 rounded-xl shadow-lg mr-2"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
                <h3 className="text-white font-bold text-lg">Payment Receipt</h3>
                <p className="text-white/80 text-xs mt-1">
                  {transaction.status === 'success' ? 'Transaction Successful' : 'Transaction Initiated'}
                </p>
              </div>

              {/* Receipt Content */}
              <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
                {/* App Branding */}
                <div className="text-center border-b border-gray-700 pb-3">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <img 
                      src={appIcon} 
                      alt="FinPay" 
                      className="w-6 h-6 rounded-lg"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                      }}
                    />
                    <span className="text-xs font-semibold text-gray-400">FinPay</span>
                  </div>
                  <p className="text-xs text-gray-500">Secure Digital Banking</p>
                </div>

                {/* Amount */}
                <div className="text-center border-b border-gray-700 pb-4">
                  <p className="text-gray-400 text-sm mb-1">Amount</p>
                  <p className="text-3xl font-bold text-green-500">
                    ₦{transaction.amount?.toLocaleString()}
                  </p>
                </div>

                {/* Transaction Details */}
                <div className="space-y-3">
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

                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Date & Time</span>
                    <span className="text-white text-sm">
                      {format(new Date(transaction.date), 'MMM dd, yyyy hh:mm a')}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Transfer Type</span>
                    <span className="text-white text-sm capitalize">
                      {transaction.type === 'internal' ? 'FinPay User' : 'Bank Transfer'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Recipient</span>
                    <span className="text-white text-sm text-right max-w-[60%] break-words">
                      {transaction.recipient}
                    </span>
                  </div>

                  {transaction.bankName && (
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Bank</span>
                      <span className="text-white text-sm">{transaction.bankName}</span>
                    </div>
                  )}

                  {transaction.description && (
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Description</span>
                      <span className="text-white text-sm text-right max-w-[60%] break-words">
                        {transaction.description}
                      </span>
                    </div>
                  )}

                  {transaction.fee > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Fee</span>
                        <span className="text-white text-sm">₦{transaction.fee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Total Debited</span>
                        <span className="text-white text-sm font-semibold">₦{transaction.total.toLocaleString()}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="border-t border-dashed border-gray-700 my-3"></div>

                {/* Status */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Status</span>
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                    transaction.status === 'success' 
                      ? 'text-green-500 bg-green-500/10' 
                      : 'text-yellow-500 bg-yellow-500/10'
                  }`}>
                    {transaction.status === 'success' ? 'Completed ✅' : 'Processing ⏰'}
                  </span>
                </div>

                {transaction.processingTime && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2">
                    <p className="text-xs text-yellow-400 text-center">
                      ⏰ Processing time: {transaction.processingTime}
                    </p>
                  </div>
                )}

                {/* Footer with App Info */}
                <div className="border-t border-gray-700 pt-3 mt-2 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <img 
                      src={appIcon} 
                      alt="FinPay" 
                      className="w-4 h-4 rounded"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                      }}
                    />
                    <span className="text-xs text-gray-500">FinPay</span>
                  </div>
                  <p className="text-[10px] text-gray-600">
                    This is an electronically generated receipt. No signature required.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 border-t border-gray-700 space-y-2">
                <div className="relative">
                  <button
                    onClick={() => setShowShareOptions(!showShareOptions)}
                    className="w-full py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-colors text-sm font-medium flex items-center justify-center space-x-2"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share Receipt</span>
                  </button>
                  
                  {showShareOptions && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden z-10">
                      <button
                        onClick={() => shareReceipt('native')}
                        className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-700 flex items-center space-x-2"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>Share via...</span>
                      </button>
                      <button
                        onClick={() => shareReceipt('copy')}
                        className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-700 flex items-center space-x-2"
                      >
                        <Copy className="w-4 h-4" />
                        <span>Copy Text</span>
                      </button>
                      <button
                        onClick={() => shareReceipt('print')}
                        className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-700 flex items-center space-x-2"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Print Receipt</span>
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={onClose}
                  className="w-full py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Close</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Send Money</h1>
          <p className="text-gray-400">Transfer funds instantly to anyone</p>
        </div>

        {/* Balance Card */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/20 rounded-xl">
                <Wallet2Icon className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Available Balance</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-white">
                    {showBalance ? `₦${(wallet?.nairaBalance || 0).toLocaleString()}` : '••••••'}
                  </p>
                  <button
                    onClick={() => setShowBalance(!showBalance)}
                    className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Quick Stats</p>
              <p className="text-sm font-semibold text-green-400">
                {wallet?.nairaBalance > 0 ? '✓ Balance' : '⚠️ Low balance'}
              </p>
            </div>
          </div>
        </div>

        {/* Transfer Type Toggle */}
        <div className="glass-card p-2 flex gap-2">
          <button
            onClick={() => {
              setTransferType('internal');
              setStep(1);
              setVerifiedAccount(null);
              setShowPassword(false);
            }}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              transferType === 'internal'
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Users className="w-5 h-5" />
              <span>To FinPay</span>
            </div>
          </button>
          <button
            onClick={() => {
              setTransferType('bank');
              setStep(1);
              setVerifiedAccount(null);
              setShowPassword(false);
            }}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              transferType === 'bank'
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Building className="w-5 h-5" />
              <span>To Bank</span>
            </div>
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 md:p-8"
        >
          {!showPassword ? (
            step === 1 ? (
              <div className="space-y-6">
                {transferType === 'internal' ? (
                  <>
                    {/* Internal Transfer Form */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Recipient Email</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="input-premium pl-12"
                          placeholder="recipient@finpay.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Amount (₦)</label>
                      <div className="relative">
                        <Wallet2Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                          className="input-premium pl-12 text-2xl"
                          placeholder="0.00"
                          min="100"
                          step="100"
                          required
                        />
                      </div>
                      {formData.amount && parseFloat(formData.amount) > (wallet?.nairaBalance || 0) && (
                        <p className="text-xs text-red-500 mt-1">
                          Amount exceeds available balance of ₦{(wallet?.nairaBalance || 0).toLocaleString()}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="input-premium"
                        rows="3"
                        placeholder="What's this for?"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {/* Bank Transfer Form */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium">Select Bank</label>
                        <button
                          onClick={fetchBanksFromPaystack}
                          disabled={loadingBanks}
                          className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                        >
                          <RefreshCw className={`w-3 h-3 ${loadingBanks ? 'animate-spin' : ''}`} />
                          <span>Refresh</span>
                        </button>
                      </div>
                      
                      {loadingBanks ? (
                        <div className="flex items-center justify-center py-6">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                          <span className="ml-2 text-sm text-gray-400">Loading banks...</span>
                        </div>
                      ) : (
                        <select
                          value={formData.bankCode}
                          onChange={(e) => {
                            const bank = banks.find(b => b.code === e.target.value);
                            setFormData(prev => ({ 
                              ...prev, 
                              bankCode: e.target.value,
                              bankName: bank?.name || ''
                            }));
                            setVerifiedAccount(null);
                            setFormData(prev => ({ ...prev, accountName: '' }));
                          }}
                          className="input-premium"
                          required
                        >
                          <option value="">Select a bank</option>
                          {banks.map(bank => (
                            <option key={bank.code} value={bank.code}>
                              {bank.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Account Number</label>
                      
                      <div className="hidden md:flex gap-3">
                        <div className="flex-1 relative">
                          <Banknote className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="tel"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={formData.accountNumber}
                            onChange={handleAccountNumberChange}
                            className="input-premium pl-12 font-mono text-lg tracking-wide"
                            placeholder="0123456789"
                            maxLength="10"
                            required
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <span className={`text-xs ${formData.accountNumber.length === 10 ? 'text-green-500' : 'text-gray-500'}`}>
                              {formData.accountNumber.length}/10
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={verifyBankAccount}
                          disabled={verifying || !formData.accountNumber || !formData.bankCode || loadingBanks || formData.accountNumber.length !== 10}
                          className="btn-outline whitespace-nowrap"
                        >
                          {verifying ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          ) : (
                            'Verify'
                          )}
                        </button>
                      </div>

                      <div className="md:hidden">
                        <div className="relative">
                          <Banknote className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            ref={accountInputRef}
                            type="tel"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={formData.accountNumber}
                            onChange={handleAccountNumberChange}
                            onClick={() => setShowNumpad(true)}
                            className="input-premium pl-12 font-mono text-lg tracking-wide"
                            placeholder="Enter 10-digit account number"
                            maxLength="10"
                            readOnly
                            required
                          />
                          <button
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            onClick={() => setShowNumpad(true)}
                          >
                            <Keyboard className="w-5 h-5 text-gray-400" />
                          </button>
                        </div>
                        
                        {formData.accountNumber.length === 10 && formData.bankCode && (
                          <div className="mt-2 text-center">
                            {verifying ? (
                              <div className="flex items-center justify-center space-x-2 text-blue-400">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                                <span className="text-xs">Verifying account...</span>
                              </div>
                            ) : verifiedAccount ? (
                              <div className="text-green-500 text-xs flex items-center justify-center space-x-1">
                                <CheckCircle className="w-4 h-4" />
                                <span>Auto-verified!</span>
                              </div>
                            ) : formData.accountNumber.length === 10 && (
                              <div className="text-yellow-500 text-xs">
                                Auto-verifying...
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {verifiedAccount && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-green-500/10 border border-green-500/20 rounded-xl p-4"
                      >
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-semibold text-green-400 text-sm">Account Verified</p>
                            <p className="text-base font-medium">{verifiedAccount.accountName}</p>
                            <p className="text-xs text-gray-400">
                              {verifiedAccount.accountNumber} • {verifiedAccount.bankName}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <div>
                      <label className="block text-sm font-medium mb-2">Amount (₦)</label>
                      <div className="relative">
                        <Wallet2Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                          className="input-premium pl-12 text-xl md:text-2xl"
                          placeholder="0.00"
                          min="1000"
                          step="1000"
                          required
                        />
                      </div>
                      {formData.amount && (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs text-gray-400">
                            Fee: ₦{fee.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-400">
                            Total debit: ₦{totalAmount.toLocaleString()}
                          </p>
                          {totalAmount > (wallet?.nairaBalance || 0) && (
                            <p className="text-xs text-red-500">
                              Insufficient balance. Available: ₦{(wallet?.nairaBalance || 0).toLocaleString()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Narration (Optional)</label>
                      <input
                        type="text"
                        value={formData.narration}
                        onChange={(e) => setFormData({ ...formData, narration: e.target.value })}
                        className="input-premium"
                        placeholder="e.g., Rent payment, Salary, etc."
                      />
                    </div>
                  </>
                )}

                {/* Quick Amounts */}
                <div>
                  <label className="block text-sm font-medium mb-3">Quick Amounts</label>
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    {suggestedAmounts.map((amount) => {
                      const amountTotal = transferType === 'bank' ? amount + calculateFee(amount) : amount;
                      const isDisabled = amountTotal > (wallet?.nairaBalance || 0);
                      
                      return (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => setFormData({ ...formData, amount: amount.toString() })}
                          disabled={isDisabled}
                          className={`px-3 md:px-4 py-2 rounded-xl border transition-all text-sm md:text-base ${
                            isDisabled 
                              ? 'border-gray-700 text-gray-500 cursor-not-allowed opacity-50'
                              : 'border-gray-700 hover:border-blue-500 hover:text-blue-400'
                          }`}
                        >
                          ₦{amount.toLocaleString()}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium mb-1">Transfer Information</p>
                      <ul className="text-xs text-gray-400 space-y-1">
                        {transferType === 'internal' ? (
                          <>
                            <li>• Instant transfer to other FinPay users</li>
                            <li>• No fees for internal transfers</li>
                            <li>• Minimum transfer: ₦100</li>
                            <li>• Maximum transfer: ₦500,000 per transaction</li>
                          </>
                        ) : (
                          <>
                            <li>• Account auto-verifies when 10 digits are entered</li>
                            <li>• Supports all Nigerian banks via Paystack</li>
                            <li>• Transfer fee: ₦50 + 0.5% of amount</li>
                            <li>• Processing time: 1-2 business days</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleProceedToConfirm}
                  className="btn-gradient w-full flex items-center justify-center space-x-2 py-3"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            ) : (
              // Confirmation Step
              <div className="space-y-6">
                <h3 className="text-xl font-semibold mb-4">Confirm</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between py-3 border-b border-gray-800">
                    <span className="text-gray-400">Transfer Type</span>
                    <span className="font-semibold">
                      {transferType === 'internal' ? 'FinPay User' : 'Bank Transfer'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between py-3 border-b border-gray-800">
                    <span className="text-gray-400">Recipient</span>
                    <div className="text-right">
                      {transferType === 'internal' 
                        ? formData.email 
                        : (
                          <>
                            <p className="font-semibold">{verifiedAccount?.accountName}</p>
                            <p className="text-sm text-gray-400">{verifiedAccount?.accountNumber}</p>
                            <p className="text-xs text-gray-500">{verifiedAccount?.bankName}</p>
                          </>
                        )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between py-3 border-b border-gray-800">
                    <span className="text-gray-400">Amount</span>
                    <span className="text-2xl font-bold text-blue-500">
                      ₦{parseFloat(formData.amount).toLocaleString()}
                    </span>
                  </div>
                  
                  {transferType === 'bank' && (
                    <>
                      <div className="flex justify-between py-3 border-b border-gray-800">
                        <span className="text-gray-400">Fee</span>
                        <span className="text-gray-300">
                          ₦{fee.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-gray-800">
                        <span className="text-gray-400">Total</span>
                        <span className="text-xl font-bold text-white">
                          ₦{totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </>
                  )}
                  
                  <div className="flex justify-between py-3 border-t border-gray-800">
                    <span className="text-gray-400">Balance After</span>
                    <span className="font-semibold text-green-400">
                      ₦{((wallet?.nairaBalance || 0) - totalAmount).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                  <p className="text-sm text-yellow-400">
                    ⚠️ Please double-check the recipient details. Transfers cannot be reversed once completed.
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 btn-outline"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConfirmTransfer}
                    className="flex-1 btn-gradient flex items-center justify-center space-x-2"
                  >
                    <Shield className="w-5 h-5" />
                    <span>Confirm</span>
                  </button>
                </div>
              </div>
            )
          ) : (
            // Password Confirmation Step
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-10 h-10 text-yellow-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Confirm Transaction</h3>
                <p className="text-sm text-gray-400">
                  Enter your password to complete the transfer
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      ref={passwordInputRef}
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordError('');
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          verifyPassword();
                        }
                      }}
                      className="input-premium pl-12"
                      placeholder="Enter your password"
                      autoFocus
                    />
                  </div>
                  {passwordError && (
                    <p className="text-xs text-red-500 mt-1">{passwordError}</p>
                  )}
                </div>

                <div className="bg-gray-800/50 rounded-xl p-4 space-y-2">
                  <p className="text-sm text-gray-300">Transaction Summary:</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Amount:</span>
                    <span className="font-semibold">₦{parseFloat(formData.amount).toLocaleString()}</span>
                  </div>
                  {transferType === 'bank' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Fee:</span>
                      <span className="font-semibold">₦{fee.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-700">
                    <span className="text-gray-400">Total:</span>
                    <span className="font-bold text-blue-400">₦{totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowPassword(false);
                      setPassword('');
                      setPasswordError('');
                    }}
                    className="flex-1 btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={verifyPassword}
                    disabled={loading || !password}
                    className="flex-1 btn-gradient flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Shield className="w-5 h-5" />
                        <span>Send</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {showNumpad && (
        <Numpad
          value={formData.accountNumber}
          onNumberClick={(num) => {
            if (formData.accountNumber.length < 10) {
              setFormData(prev => ({ ...prev, accountNumber: prev.accountNumber + num }));
              if (verifiedAccount) {
                setVerifiedAccount(null);
                setFormData(prev => ({ ...prev, accountName: '' }));
              }
            }
          }}
          onDelete={() => {
            setFormData(prev => ({ ...prev, accountNumber: prev.accountNumber.slice(0, -1) }));
            if (verifiedAccount) {
              setVerifiedAccount(null);
              setFormData(prev => ({ ...prev, accountName: '' }));
            }
          }}
          onClose={() => setShowNumpad(false)}
        />
      )}

      {/* Receipt Modal */}
      <ReceiptModal 
        transaction={completedTransaction} 
        onClose={handleCloseReceipt} 
      />
    </Layout>
  );
};

export default Transfer;