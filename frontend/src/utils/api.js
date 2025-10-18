import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// Dashboard API
export const dashboardAPI = {
  getDashboard: () => api.get('/dashboard'),
  getAnalytics: (period = '6months') => api.get(`/dashboard/analytics?period=${period}`)
};

// Loans API
export const loansAPI = {
  createLoan: (data) => api.post('/loans', data),
  getMyLoans: () => api.get('/loans/my-loans'),
  getMarketplace: (params = {}) => api.get('/loans/marketplace', { params }),
  getLoan: (id) => api.get(`/loans/${id}`),
  updateLoan: (id, data) => api.put(`/loans/${id}`, data),
  deleteLoan: (id) => api.delete(`/loans/${id}`)
};

// Repayments API
export const repaymentsAPI = {
  getMyLoans: () => api.get('/repayments/my-loans'),
  getLoanDetails: (loanId) => api.get(`/repayments/loan/${loanId}`),
  createPaymentIntent: (loanId) => api.post('/repayments/create-payment-intent', { loanId }),
  confirmPayment: (paymentIntentId) => api.post('/repayments/confirm-payment', { paymentIntentId }),
  getHistory: () => api.get('/repayments/history')
};

// Stripe API
export const stripeAPI = {
  createConnectAccount: () => api.post('/stripe/create-connect-account'),
  getAccountStatus: (accountId) => api.get(`/stripe/account/${accountId}`),
  createAccountLink: (accountId) => api.post('/stripe/create-account-link', { accountId }),
  fundLoan: (loanId, paymentMethodId) => api.post(`/stripe/fund-loan/${loanId}`, { paymentMethodId }),
  createPaymentIntent: (loanId) => api.post('/stripe/create-payment-intent', { loanId })
};

// Notifications API
export const notificationsAPI = {
  getNotifications: (params = {}) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  getSummary: () => api.get('/notifications/summary')
};

export default api;