import axiosInstance from '../utils/axiosConfig';

const kycService = {
  submitKyc: async (formData) => {
    const response = await axiosInstance.post('/kyc/submit', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getKycStatus: async () => {
    const response = await axiosInstance.get('/kyc/status');
    return response.data;
  },
};

export default kycService;