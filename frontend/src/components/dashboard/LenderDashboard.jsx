import React, { useState, useEffect } from 'react';
import { IoStorefront } from 'react-icons/io5';
import { dashboardAPI } from '../../utils/api';
import LoanMarketplace from '../loans/LoanMarketplace';

const LenderDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMarketplace, setShowMarketplace] = useState(false);

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

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  const { stats, activeInvestments, expectedPayments, recentTransactions } = dashboardData;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Lender Dashboard</h1>
        <button
          onClick={() => setShowMarketplace(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2 text-sm sm:text-base w-full sm:w-auto"
        >
          <IoStorefront size={18} className="sm:w-5 sm:h-5" />
          <span>Browse Loans</span>
        </button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Invested</h3>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">${stats.totalInvested.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Earned</h3>
          <p className="text-xl sm:text-2xl font-bold text-green-600">${stats.totalEarned.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Current Value</h3>
          <p className="text-xl sm:text-2xl font-bold text-blue-600">${stats.currentValue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Average Return</h3>
          <p className="text-xl sm:text-2xl font-bold text-purple-600">{stats.averageReturn}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
        {/* Expected Payments */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 sm:p-6 border-b">
            <h2 className="text-lg sm:text-xl font-semibold">Expected Payments</h2>
          </div>
          <div className="p-4 sm:p-6">
            {expectedPayments.length === 0 ? (
              <p className="text-gray-500 text-sm sm:text-base">No expected payments</p>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {expectedPayments.slice(0, 5).map((payment, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 border rounded-lg space-y-2 sm:space-y-0">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-base">${payment.netAmount.toFixed(2)}</p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Due: {new Date(payment.dueDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        From: {payment.borrower.firstName} {payment.borrower.lastName}
                      </p>
                    </div>
                    <div className="text-left sm:text-right flex-shrink-0">
                      <p className="text-xs sm:text-sm text-gray-500">
                        Gross: ${payment.grossAmount}
                      </p>
                      <span className={`px-2 py-1 rounded text-xs inline-block mt-1 ${
                        payment.status === 'overdue' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active Investments */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 sm:p-6 border-b">
            <h2 className="text-lg sm:text-xl font-semibold">Active Investments</h2>
          </div>
          <div className="p-4 sm:p-6">
            {activeInvestments.length === 0 ? (
              <p className="text-gray-500 text-sm sm:text-base">No active investments</p>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {activeInvestments.map((investment) => (
                  <div key={investment._id} className="p-3 sm:p-4 border rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-2 sm:space-y-0">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base">${investment.amount.toLocaleString()}</p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {investment.interestRate}% • {investment.tenure} months
                        </p>
                        <p className="text-xs text-gray-400">
                          Borrower: {investment.borrower.firstName} {investment.borrower.lastName}
                        </p>
                        <p className="text-xs text-gray-400">
                          Credit Score: {investment.borrower.creditScore}
                        </p>
                      </div>
                      <div className="text-left sm:text-right flex-shrink-0">
                        <p className="text-xs sm:text-sm font-medium">
                          ${investment.outstandingBalance.toLocaleString()} remaining
                        </p>
                        <p className="text-xs text-gray-500">
                          {investment.paymentsCompleted}/{investment.totalPaymentsRequired} payments
                        </p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ 
                            width: `${(investment.paymentsCompleted / investment.totalPaymentsRequired) * 100}%` 
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

      {/* Investment Performance */}
      <div className="mt-6 sm:mt-8 bg-white rounded-lg shadow">
        <div className="p-4 sm:p-6 border-b">
          <h2 className="text-lg sm:text-xl font-semibold">Investment Performance</h2>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-bold text-blue-600">{stats.activeInvestmentsCount}</p>
              <p className="text-xs sm:text-sm text-gray-500">Active Investments</p>
            </div>
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.completedInvestmentsCount}</p>
              <p className="text-xs sm:text-sm text-gray-500">Completed Investments</p>
            </div>
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-bold text-purple-600">${stats.expectedReturns.toLocaleString()}</p>
              <p className="text-xs sm:text-sm text-gray-500">Expected Total Returns</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      {recentTransactions.length > 0 && (
        <div className="mt-6 sm:mt-8 bg-white rounded-lg shadow">
          <div className="p-4 sm:p-6 border-b">
            <h2 className="text-lg sm:text-xl font-semibold">Recent Payments Received</h2>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div key={transaction._id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 border rounded space-y-2 sm:space-y-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm sm:text-base">${transaction.netAmount}</p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400">
                      Platform fee: ${transaction.platformFee}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded self-start sm:self-auto flex-shrink-0">
                    Received
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <LoanMarketplace 
        isOpen={showMarketplace}
        onClose={() => setShowMarketplace(false)}
      />
    </div>
  );
};

export default LenderDashboard;