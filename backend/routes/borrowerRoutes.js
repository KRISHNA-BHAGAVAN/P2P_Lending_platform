import express from 'express';
import { FundedLoan, Transaction, Notification } from '../models/index.js';
import { authenticateToken, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get borrower dashboard
router.get('/dashboard', authenticateToken, authorize('borrower'), async (req, res) => {
  try {
    const borrowerId = req.user._id;

    const activeLoans = await FundedLoan.find({ 
      borrower: borrowerId,
      status: 'active'
    }).populate('lender', 'firstName lastName email');

    const completedLoans = await FundedLoan.find({ 
      borrower: borrowerId,
      status: 'completed'
    }).populate('lender', 'firstName lastName email');

    const transactions = await Transaction.find({ 
      fromUser: borrowerId,
      type: 'loan_repayment'
    }).sort({ createdAt: -1 }).limit(10);

    // Calculate stats
    const totalBorrowed = [...activeLoans, ...completedLoans].reduce((sum, loan) => sum + loan.amount, 0);
    const totalRepaid = transactions.reduce((sum, txn) => sum + txn.amount, 0);
    const outstandingBalance = activeLoans.reduce((sum, loan) => sum + loan.outstandingBalance, 0);

    // Get upcoming payments
    const upcomingPayments = [];
    activeLoans.forEach(loan => {
      const nextPayment = loan.repaymentSchedule.find(p => p.status === 'pending');
      if (nextPayment) {
        upcomingPayments.push({
          loanId: loan._id,
          amount: nextPayment.totalAmount,
          dueDate: nextPayment.dueDate,
          paymentNumber: nextPayment.paymentNumber
        });
      }
    });

    res.json({
      success: true,
      stats: {
        totalBorrowed,
        totalRepaid,
        outstandingBalance,
        activeLoansCount: activeLoans.length,
        completedLoansCount: completedLoans.length
      },
      activeLoans,
      completedLoans,
      upcomingPayments,
      recentTransactions: transactions
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get notifications
router.get('/notifications', authenticateToken, authorize('borrower'), async (req, res) => {
  try {
    const notifications = await Notification.find({ 
      user: req.user._id 
    }).sort({ createdAt: -1 }).limit(20);

    res.json({
      success: true,
      notifications
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', authenticateToken, authorize('borrower'), async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true }
    );

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;