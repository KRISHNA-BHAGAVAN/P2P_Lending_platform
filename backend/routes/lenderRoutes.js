import express from 'express';
import { User, FundedLoan, Transaction } from '../models/index.js';
import { authenticateToken, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get lender dashboard data
router.get('/dashboard', authenticateToken, authorize('lender'), async (req, res) => {
  try {
    const lenderId = req.user._id;

    const fundedLoans = await FundedLoan.find({ lender: lenderId })
      .populate('borrower', 'firstName lastName email')
      .populate('loanRequest', 'purpose description')
      .sort({ createdAt: -1 });

    const transactions = await Transaction.find({ 
      $or: [{ fromUser: lenderId }, { toUser: lenderId }]
    }).sort({ createdAt: -1 }).limit(10);

    const stats = {
      totalInvested: fundedLoans.reduce((sum, loan) => sum + loan.amount, 0),
      activeLoans: fundedLoans.filter(loan => loan.status === 'active').length,
      completedLoans: fundedLoans.filter(loan => loan.status === 'completed').length,
      expectedReturns: fundedLoans.reduce((sum, loan) => sum + loan.totalRepayment, 0)
    };

    res.json({
      success: true,
      stats,
      fundedLoans,
      recentTransactions: transactions
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get lender's funded loans
router.get('/funded-loans', authenticateToken, authorize('lender'), async (req, res) => {
  try {
    const loans = await FundedLoan.find({ lender: req.user._id })
      .populate('borrower', 'firstName lastName email')
      .populate('loanRequest', 'purpose description')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      loans
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;