import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../../components/AdminLayout';
import { Eye, CheckCircle, XCircle, Download, Clock, User, Mail, Phone, FileText, Image } from 'lucide-react';
import axiosInstance from '../../utils/axiosConfig';
import toast from 'react-hot-toast';

const AdminKYC = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    fetchSubmissions();
  }, [filter]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const endpoint = filter === 'pending' ? '/admin/kyc/pending' : '/admin/kyc/all';
      const response = await axiosInstance.get(endpoint);
      setSubmissions(response.data.data.kycSubmissions || response.data.data);
    } catch (error) {
      console.error('Fetch KYC error:', error);
      toast.error('Failed to load KYC submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await axiosInstance.put(`/api/kyc/approve/${userId}`);
      toast.success('KYC approved successfully');
      fetchSubmissions();
      setSelected(null);
    } catch (error) {
      toast.error('Failed to approve KYC');
    }
  };

  const handleReject = async (userId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      try {
        await axiosInstance.put(`/api/kyc/reject/${userId}`, { reason });
        toast.success('KYC rejected');
        fetchSubmissions();
        setSelected(null);
      } catch (error) {
        toast.error('Failed to reject KYC');
      }
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return 'bg-green-500/20 text-green-400';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'rejected': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading KYC submissions...</p>
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
            <h1 className="text-3xl font-bold text-white">KYC Verification</h1>
            <p className="text-gray-400 mt-1">Review and verify user documents</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              All
            </button>
          </div>
        </div>

        {/* Submissions Grid */}
        {submissions.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">All Caught Up!</h3>
            <p className="text-gray-400">No pending KYC submissions to review</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {submissions.map((submission, index) => (
              <motion.div
                key={submission._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-5 hover:border-blue-500/30 transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{submission.user?.fullName}</h3>
                      <div className="flex items-center space-x-2 text-xs text-gray-400">
                        <Mail className="w-3 h-3" />
                        <span>{submission.user?.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-400">
                        <Phone className="w-3 h-3" />
                        <span>{submission.user?.phone}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center space-x-1 px-2 py-1 text-xs rounded-full ${getStatusColor(submission.status)}`}>
                      {getStatusIcon(submission.status)}
                      <span>{submission.status}</span>
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Submitted</span>
                    <span className="text-gray-300">{new Date(submission.submittedAt).toLocaleString()}</span>
                  </div>
                  {submission.rejectionReason && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Rejection Reason</span>
                      <span className="text-red-400">{submission.rejectionReason}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelected(submission)}
                    className="flex-1 px-3 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Docs</span>
                  </button>
                  {submission.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(submission.user._id)}
                        className="px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleReject(submission.user._id)}
                        className="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Document Viewer Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">KYC Documents</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white text-2xl">×</button>
            </div>
            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">User Information</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-400">Name:</span> {selected.user?.fullName}</p>
                  <p><span className="text-gray-400">Email:</span> {selected.user?.email}</p>
                  <p><span className="text-gray-400">Phone:</span> {selected.user?.phone}</p>
                </div>
              </div>

              {/* Documents */}
              {['passportPhoto', 'nationalId', 'driverLicense', 'ninSlip'].map((doc) => (
                selected[doc] && (
                  <div key={doc} className="bg-gray-700/30 rounded-lg p-4">
                    <h3 className="font-semibold text-white mb-2 capitalize">
                      {doc.replace(/([A-Z])/g, ' $1').trim()}
                    </h3>
                    <a
                      href={`/${selected[doc]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300"
                    >
                      <Download className="w-4 h-4" />
                      <span>View Document</span>
                    </a>
                  </div>
                )
              ))}

              {/* Action Buttons */}
              {selected.status === 'pending' && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => handleApprove(selected.user._id)}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Approve KYC</span>
                  </button>
                  <button
                    onClick={() => handleReject(selected.user._id)}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <XCircle className="w-5 h-5" />
                    <span>Reject KYC</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </Layout>
  );
};

export default AdminKYC;