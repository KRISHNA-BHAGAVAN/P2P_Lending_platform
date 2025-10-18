import React, { useState } from 'react';
import { IoClose, IoCash, IoCard, IoWarning } from 'react-icons/io5';
import { api } from '../../config/api';

const FundLoanModal = ({ isOpen, onClose, loan, onSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setPaymentMethod({
      ...paymentMethod,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // In a real implementation, you would use Stripe Elements
      // For now, we'll simulate with test card data
      const testPaymentMethodId = 'pm_card_visa'; // Stripe test payment method

      const response = await api.post(`/stripe/fund-loan/${loan._id}`, {
        paymentMethodId: testPaymentMethodId
      });

      if (response.data.success) {
        onSuccess();
        onClose();
        setPaymentMethod({
          cardNumber: '',
          expiryMonth: '',
          expiryYear: '',
          cvc: '',
          name: ''
        });
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !loan) return null;

  const platformFee = loan.amount * 0.05;
  const totalAmount = loan.amount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Fund Loan</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <IoClose size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Loan Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Loan Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Borrower:</span>
                <span>{loan.borrower.firstName} {loan.borrower.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount:</span>
                <span>${loan.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Interest Rate:</span>
                <span>{loan.interestRate}%</span>
              </div>
              <div className="flex justify-between">
                <span>Tenure:</span>
                <span>{loan.tenure} months</span>
              </div>
              <div className="flex justify-between">
                <span>Monthly Payment:</span>
                <span>${loan.monthlyPayment}</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Total Return:</span>
                <span>${loan.totalRepayment.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Payment Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Loan Amount:</span>
                <span>${loan.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Fee (5%):</span>
                <span>${platformFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Total to Pay:</span>
                <span>${totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
              <IoWarning className="text-red-500 mr-2" size={16} />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Test Mode Notice */}
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-800 text-sm">
              <strong>Test Mode:</strong> This will use Stripe test data. No real payment will be processed.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cardholder Name
              </label>
              <input
                type="text"
                name="name"
                value={paymentMethod.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="cardNumber"
                  value={paymentMethod.cardNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="4242 4242 4242 4242 (Test Card)"
                />
                <IoCard className="absolute right-3 top-2.5 text-gray-400" size={18} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Month
                </label>
                <input
                  type="text"
                  name="expiryMonth"
                  value={paymentMethod.expiryMonth}
                  onChange={handleChange}
                  required
                  maxLength="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year
                </label>
                <input
                  type="text"
                  name="expiryYear"
                  value={paymentMethod.expiryYear}
                  onChange={handleChange}
                  required
                  maxLength="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="25"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVC
                </label>
                <input
                  type="text"
                  name="cvc"
                  value={paymentMethod.cvc}
                  onChange={handleChange}
                  required
                  maxLength="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="123"
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <IoCash className="mr-2" size={16} />
                )}
                {loading ? 'Processing...' : `Fund $${totalAmount.toLocaleString()}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FundLoanModal;