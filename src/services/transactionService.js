import axiosInstance from '../utils/axiosConfig';

const transactionService = {
  getTransactions: async (page = 1, limit = 10) => {
    const response = await axiosInstance.get(`/transactions?page=${page}&limit=${limit}`);
    return response.data;
  },

  getTransactionByReference: async (reference) => {
    const response = await axiosInstance.get(`/transactions/${reference}`);
    return response.data;
  },

  getTransactionSummary: async () => {
    const response = await axiosInstance.get('/transactions/summary');
    return response.data;
  },
};

export default transactionService;