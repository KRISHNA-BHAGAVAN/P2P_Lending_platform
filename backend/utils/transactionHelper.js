import mongoose from 'mongoose';
import { Transaction, FundedLoan, User } from '../models/index.js';

class TransactionHelper {
  static async executeWithTransaction(operations) {
    // Execute without transactions for standalone MongoDB
    try {
      const result = await operations(null);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async createTransaction(transactionData, session = null) {
    const transaction = new Transaction(transactionData);
    return await transaction.save({ session });
  }

  static async updateLoanBalance(loanId, paymentAmount, session = null) {
    return await FundedLoan.findByIdAndUpdate(
      loanId,
      {
        $inc: { 
          outstandingBalance: -paymentAmount,
          paymentsCompleted: 1
        },
        $set: {
          nextPaymentDate: this.calculateNextPaymentDate()
        }
      },
      { session, new: true }
    );
  }

  static calculateNextPaymentDate(currentDate = new Date()) {
    const nextDate = new Date(currentDate);
    nextDate.setMonth(nextDate.getMonth() + 1);
    return nextDate;
  }

  static calculatePlatformFee(amount, feeRate = 0.05) {
    return Math.round(amount * feeRate * 100) / 100;
  }
}

export default TransactionHelper;