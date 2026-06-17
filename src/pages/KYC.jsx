import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { Upload, CheckCircle, XCircle, Clock, FileText, Shield, ArrowRight, AlertCircle, Check, X, Camera, CarTaxiFront, Users, TrendingUp } from 'lucide-react';
import kycService from '../services/kycService';
import toast from 'react-hot-toast';

const KYC = () => {
  const [kycStatus, setKycStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({
    passportPhoto: null,
    nationalId: null,
    driverLicense: null,
    ninSlip: null
  });

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await kycService.getKycStatus();
      setKycStatus(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      setUploadedFiles({ ...uploadedFiles, [field]: file });
    } else {
      toast.error('File must be less than 5MB');
    }
  };

  const removeFile = (field) => {
    setUploadedFiles({ ...uploadedFiles, [field]: null });
    // Clear the file input
    const input = document.getElementById(field);
    if (input) input.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!uploadedFiles.passportPhoto || !uploadedFiles.nationalId) {
      toast.error('Please upload Passport Photo and National ID');
      return;
    }

    const formData = new FormData();
    formData.append('passportPhoto', uploadedFiles.passportPhoto);
    formData.append('nationalId', uploadedFiles.nationalId);
    if (uploadedFiles.driverLicense) formData.append('driverLicense', uploadedFiles.driverLicense);
    if (uploadedFiles.ninSlip) formData.append('ninSlip', uploadedFiles.ninSlip);

    setSubmitting(true);
    try {
      await kycService.submitKyc(formData);
      toast.success('KYC documents submitted successfully');
      fetchStatus();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading verification status...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (kycStatus && kycStatus.status !== 'not_submitted' && kycStatus.status !== 'rejected') {
    const statusConfig = {
      pending: { 
        icon: Clock, 
        color: 'text-yellow-500', 
        bg: 'bg-yellow-500/10', 
        border: 'border-yellow-500/20',
        title: 'Verification Pending',
        message: 'Your documents are being reviewed. This typically takes 1-2 business days.',
        details: [
          'We will notify you once verification is complete',
          'You can still use basic features while verification is pending',
          'Contact support if verification takes longer than expected'
        ]
      },
      approved: { 
        icon: CheckCircle, 
        color: 'text-green-500', 
        bg: 'bg-green-500/10', 
        border: 'border-green-500/20',
        title: 'Verification Approved',
        message: 'Your identity has been verified successfully!',
        details: [
          'You now have full access to all features',
          'Increased transaction limits have been applied',
          'Your account is fully secured'
        ]
      },
    };
    const config = statusConfig[kycStatus.status];

    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border ${config.border} p-8 text-center`}
          >
            <div className={`w-20 h-20 ${config.bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <config.icon className={`w-10 h-10 ${config.color}`} />
            </div>
            <h2 className={`text-2xl font-bold mb-2 ${config.color}`}>{config.title}</h2>
            <p className="text-gray-300 mb-6">{config.message}</p>
            
            <div className="bg-gray-800/50 rounded-lg p-4 text-left mb-6">
              <h3 className="text-sm font-semibold text-gray-300 mb-2">What happens next?</h3>
              <ul className="space-y-2">
                {config.details.map((detail, index) => (
                  <li key={index} className="flex items-center space-x-2 text-sm text-gray-400">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-white">Identity Verification</h1>
          <p className="text-gray-400 text-sm mt-1">Verify your identity to unlock all features</p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Shield className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-xs text-gray-500">SECURITY</span>
            </div>
            <p className="text-sm text-white font-medium">Enhanced Protection</p>
            <p className="text-xs text-gray-400 mt-1">KYC-verified accounts have additional security measures</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
              <span className="text-xs text-gray-500">LIMITS</span>
            </div>
            <p className="text-sm text-white font-medium">Higher Transaction Limits</p>
            <p className="text-xs text-gray-400 mt-1">Increase your daily and monthly transaction limits</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Users className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-xs text-gray-500">TRUST</span>
            </div>
            <p className="text-sm text-white font-medium">Build Trust</p>
            <p className="text-xs text-gray-400 mt-1">Verified accounts are trusted by other users</p>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
          <div className="border-b border-gray-700 px-6 py-4">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-semibold text-white">Upload Documents</h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">Please provide clear, readable copies of your documents</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Passport Photo */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Passport Photograph <span className="text-red-400">*</span>
              </label>
              <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                uploadedFiles.passportPhoto 
                  ? 'border-green-500/50 bg-green-500/5' 
                  : 'border-gray-600 hover:border-blue-500'
              }`}>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileChange(e, 'passportPhoto')}
                  className="hidden"
                  id="passportPhoto"
                />
                <label htmlFor="passportPhoto" className="cursor-pointer block">
                  {uploadedFiles.passportPhoto ? (
                    <div className="flex flex-col items-center">
                      <CheckCircle className="w-12 h-12 text-green-500 mb-2" />
                      <p className="text-green-400 text-sm font-medium">{uploadedFiles.passportPhoto.name}</p>
                      <button 
                        onClick={(e) => { e.preventDefault(); removeFile('passportPhoto'); }}
                        className="mt-2 text-xs text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Camera className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm">Click to upload passport photo</p>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG or PDF (Max 5MB)</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* National ID */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                National ID Card <span className="text-red-400">*</span>
              </label>
              <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                uploadedFiles.nationalId 
                  ? 'border-green-500/50 bg-green-500/5' 
                  : 'border-gray-600 hover:border-blue-500'
              }`}>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileChange(e, 'nationalId')}
                  className="hidden"
                  id="nationalId"
                />
                <label htmlFor="nationalId" className="cursor-pointer block">
                  {uploadedFiles.nationalId ? (
                    <div className="flex flex-col items-center">
                      <CheckCircle className="w-12 h-12 text-green-500 mb-2" />
                      <p className="text-green-400 text-sm font-medium">{uploadedFiles.nationalId.name}</p>
                      <button 
                        onClick={(e) => { e.preventDefault(); removeFile('nationalId'); }}
                        className="mt-2 text-xs text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm">Click to upload National ID</p>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG or PDF (Max 5MB)</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Driver's License (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Driver's License <span className="text-gray-500">(Optional)</span>
              </label>
              <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                uploadedFiles.driverLicense 
                  ? 'border-green-500/50 bg-green-500/5' 
                  : 'border-gray-600 hover:border-blue-500'
              }`}>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileChange(e, 'driverLicense')}
                  className="hidden"
                  id="driverLicense"
                />
                <label htmlFor="driverLicense" className="cursor-pointer block">
                  {uploadedFiles.driverLicense ? (
                    <div className="flex flex-col items-center">
                      <CheckCircle className="w-10 h-10 text-green-500 mb-2" />
                      <p className="text-green-400 text-sm">{uploadedFiles.driverLicense.name}</p>
                      <button 
                        onClick={(e) => { e.preventDefault(); removeFile('driverLicense'); }}
                        className="mt-1 text-xs text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <CarTaxiFront className="w-10 h-10 text-gray-500 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">Click to upload Driver's License</p>
                      <p className="text-xs text-gray-500">Optional but recommended</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* NIN Slip (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                NIN Slip <span className="text-gray-500">(Optional)</span>
              </label>
              <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                uploadedFiles.ninSlip 
                  ? 'border-green-500/50 bg-green-500/5' 
                  : 'border-gray-600 hover:border-blue-500'
              }`}>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileChange(e, 'ninSlip')}
                  className="hidden"
                  id="ninSlip"
                />
                <label htmlFor="ninSlip" className="cursor-pointer block">
                  {uploadedFiles.ninSlip ? (
                    <div className="flex flex-col items-center">
                      <CheckCircle className="w-10 h-10 text-green-500 mb-2" />
                      <p className="text-green-400 text-sm">{uploadedFiles.ninSlip.name}</p>
                      <button 
                        onClick={(e) => { e.preventDefault(); removeFile('ninSlip'); }}
                        className="mt-1 text-xs text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <FileText className="w-10 h-10 text-gray-500 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">Click to upload NIN Slip</p>
                      <p className="text-xs text-gray-500">Optional but speeds up verification</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button 
                type="submit" 
                disabled={submitting} 
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
              >
                {submitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </div>
                ) : (
                  'Submit for Verification'
                )}
              </button>
              <p className="text-xs text-gray-500 text-center mt-3">
                By submitting, you confirm that the documents are authentic and belong to you
              </p>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default KYC;