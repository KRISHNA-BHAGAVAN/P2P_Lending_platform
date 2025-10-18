import React, { useState, useEffect } from 'react';
import { IoSearch, IoCash, IoTime, IoTrendingUp, IoClose } from 'react-icons/io5';
import { api } from '../../config/api';
import FundLoanModal from './FundLoanModal';

const LoanMarketplace = ({ isOpen, onClose }) => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFundModal, setShowFundModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [filters, setFilters] = useState({
    riskGrade: '',
    minAmount: '',
    maxAmount: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchLoans();
    }
  }, [isOpen, filters]);

  const fetchLoans = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.riskGrade) params.append('riskGrade', filters.riskGrade);
      if (filters.minAmount) params.append('minAmount', filters.minAmount);
      if (filters.maxAmount) params.append('maxAmount', filters.maxAmount);

      const response = await api.get(`/loans/marketplace?${params}`);
      setLoans(response.data.loans);
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFundLoan = (loan) => {
    setSelectedLoan(loan);
    setShowFundModal(true);
  };

  const handleFundingSuccess = () => {
    fetchLoans(); // Refresh the loan list
    setShowFundModal(false);
    setSelectedLoan(null);
  };

  const getRiskColor = (grade) => {
    const colors = {
      'A': 'bg-green-100 text-green-800',
      'B': 'bg-blue-100 text-blue-800',
      'C': 'bg-yellow-100 text-yellow-800',
      'D': 'bg-orange-100 text-orange-800',
      'E': 'bg-red-100 text-red-800'
    };
    return colors[grade] || 'bg-gray-100 text-gray-800';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Loan Marketplace</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <IoClose size={24} />
            </button>
          </div>
          
          {/* Filters */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={filters.riskGrade}
              onChange={(e) => setFilters({...filters, riskGrade: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Risk Grades</option>
              <option value="A">Grade A</option>
              <option value="B">Grade B</option>
              <option value="C">Grade C</option>
              <option value="D">Grade D</option>
              <option value="E">Grade E</option>
            </select>
            
            <input
              type="number"
              placeholder="Min Amount"
              value={filters.minAmount}
              onChange={(e) => setFilters({...filters, minAmount: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <input
              type="number"
              placeholder="Max Amount"
              value={filters.maxAmount}
              onChange={(e) => setFilters({...filters, maxAmount: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : loans.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No loans available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loans.map((loan) => (
                <div key={loan._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">${loan.amount.toLocaleString()}</h3>
                      <p className="text-sm text-gray-600">
                        {loan.borrower.firstName} {loan.borrower.lastName}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(loan.riskGrade)}`}>
                      Grade {loan.riskGrade}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <IoTrendingUp className="mr-2" size={16} />
                      <span>{loan.interestRate}% interest rate</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <IoTime className="mr-2" size={16} />
                      <span>{loan.tenure} months</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <IoCash className="mr-2" size={16} />
                      <span>${loan.monthlyPayment}/month</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                    {loan.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Credit Score: {loan.borrower.creditScore || 'N/A'}
                    </span>
                    <button
                      onClick={() => handleFundLoan(loan)}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
                    >
                      Fund Loan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <FundLoanModal 
          isOpen={showFundModal}
          onClose={() => setShowFundModal(false)}
          loan={selectedLoan}
          onSuccess={handleFundingSuccess}
        />
      </div>
    </div>
  );
};

export default LoanMarketplace;