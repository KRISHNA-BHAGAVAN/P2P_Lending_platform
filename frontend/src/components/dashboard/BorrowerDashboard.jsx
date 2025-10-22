import React, { useState, useEffect } from 'react';
import { IoAdd, IoPencil, IoTrash } from 'react-icons/io5';
import { dashboardAPI, repaymentsAPI } from '../../utils/api';
import { api } from '../../config/api';
import CreateLoanRequest from '../loans/CreateLoanRequest';
import EditLoanRequest from '../loans/EditLoanRequest';

const BorrowerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateLoan, setShowCreateLoan] = useState(false);
  const [showEditLoan, setShowEditLoan] = useState(false);
  const [editLoanId, setEditLoanId] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await dashboardAPI.getDashboard();
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditLoan = (loanId) => {
    setEditLoanId(loanId);
    setShowEditLoan(true);
  };

  const handleDeleteLoan = async (loanId) => {
    if (window.confirm('Are you sure you want to delete this loan request?')) {
      try {
        await api.delete(`/loans/${loanId}`);
        fetchDashboardData();
      } catch (error) {
        console.error('Error deleting loan:', error);
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  const { stats, activeLoans, upcomingPayments, pendingRequests, recentTransactions } = dashboardData;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Borrower Dashboard</h1>
        <button
          onClick={() => setShowCreateLoan(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2 text-sm sm:text-base w-full sm:w-auto"
        >
          <IoAdd size={18} className="sm:w-5 sm:h-5" />
          <span className="hidden xs:inline">Create Loan Request</span>
          <span className="xs:hidden">Create Loan</span>
        </button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Borrowed</h3>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">${stats.totalBorrowed.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Repaid</h3>
          <p className="text-xl sm:text-2xl font-bold text-green-600">${stats.totalRepaid.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Outstanding Balance</h3>
          <p className="text-xl sm:text-2xl font-bold text-red-600">${stats.outstandingBalance.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Active Loans</h3>
          <p className="text-xl sm:text-2xl font-bold text-blue-600">{stats.activeLoansCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
        {/* Upcoming Payments */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 sm:p-6 border-b">
            <h2 className="text-lg sm:text-xl font-semibold">Upcoming Payments</h2>
          </div>
          <div className="p-4 sm:p-6">
            {upcomingPayments.length === 0 ? (
              <p className="text-gray-500 text-sm sm:text-base">No upcoming payments</p>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {upcomingPayments.slice(0, 5).map((payment, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 border rounded-lg space-y-2 sm:space-y-0">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-base">${payment.amount}</p>
                      <p className="text-xs sm:text-sm text-gray-500 break-words">
                        Payment {payment.paymentNumber} • Due: {new Date(payment.dueDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        To: {payment.lender.firstName} {payment.lender.lastName}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs self-start sm:self-auto flex-shrink-0 ${
                      payment.status === 'overdue' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {payment.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active Loans */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 sm:p-6 border-b">
            <h2 className="text-lg sm:text-xl font-semibold">Active Loans</h2>
          </div>
          <div className="p-4 sm:p-6">
            {activeLoans.length === 0 ? (
              <p className="text-gray-500 text-sm sm:text-base">No active loans</p>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {activeLoans.map((loan) => (
                  <div key={loan._id} className="p-3 sm:p-4 border rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-2 sm:space-y-0">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base">${loan.amount.toLocaleString()}</p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {loan.interestRate}% • {loan.tenure} months
                        </p>
                        <p className="text-xs text-gray-400">
                          Lender: {loan.lender.firstName} {loan.lender.lastName}
                        </p>
                      </div>
                      <div className="text-left sm:text-right flex-shrink-0">
                        <p className="text-xs sm:text-sm font-medium">
                          ${loan.outstandingBalance.toLocaleString()} remaining
                        </p>
                        <p className="text-xs text-gray-500">
                          {loan.paymentsCompleted}/{loan.totalPaymentsRequired} payments
                        </p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ 
                            width: `${(loan.paymentsCompleted / loan.totalPaymentsRequired) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="mt-6 sm:mt-8 bg-white rounded-lg shadow">
          <div className="p-4 sm:p-6 border-b">
            <h2 className="text-lg sm:text-xl font-semibold">Pending Loan Requests</h2>
          </div>
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {pendingRequests.map((request) => (
                <div key={request._id} className="p-4 border rounded-lg">
                  <div className="flex flex-col space-y-3">
                    <div className="flex-1">
                      <p className="font-medium text-sm sm:text-base">${request.amount.toLocaleString()}</p>
                      <p className="text-xs sm:text-sm text-gray-500 break-words">{request.purpose}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {request.interestRate}% • {request.tenure} months
                      </p>
                      <span className="inline-block mt-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                        Pending
                      </span>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEditLoan(request._id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit"
                      >
                        <IoPencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteLoan(request._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <IoTrash size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      {recentTransactions.length > 0 && (
        <div className="mt-6 sm:mt-8 bg-white rounded-lg shadow">
          <div className="p-4 sm:p-6 border-b">
            <h2 className="text-lg sm:text-xl font-semibold">Recent Payments</h2>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div key={transaction._id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 border rounded space-y-2 sm:space-y-0">
                  <div>
                    <p className="font-medium text-sm sm:text-base">${transaction.amount}</p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded self-start sm:self-auto">
                    Completed
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <CreateLoanRequest 
        isOpen={showCreateLoan}
        onClose={() => setShowCreateLoan(false)}
        onSuccess={fetchDashboardData}
      />
      
      <EditLoanRequest 
        isOpen={showEditLoan}
        onClose={() => setShowEditLoan(false)}
        onSuccess={fetchDashboardData}
        loanId={editLoanId}
      />
    </div>
  );
};

export default BorrowerDashboard;