import axiosInstance from '../utils/axiosConfig';

const API_URL = '/wallet';

const walletService = {
  getBalance: async () => {
    const response = await axiosInstance.get(`${API_URL}/balance`);
    return response.data;
  },

  initializeDeposit: async (amount) => {
    const response = await axiosInstance.post(`${API_URL}/deposit/initialize`, { amount });
    return response.data;
  },

  verifyBankAccount: async (accountNumber, bankCode) => {
    const response = await axiosInstance.post(`${API_URL}/verify-account`, { accountNumber, bankCode });
    return response.data;
  },

  withdrawNaira: async (withdrawalData) => {
    const response = await axiosInstance.post(`${API_URL}/withdraw`, withdrawalData);
    return response.data;
  },

  transferFunds: async (transferData) => {
    const response = await axiosInstance.post(`${API_URL}/transfer`, transferData);
    return response.data;
  },
};

export default walletService;