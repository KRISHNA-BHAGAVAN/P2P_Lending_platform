import express from 'express';
import { FundedLoan, LoanRequest, Transaction, Notification, User } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get comprehensive dashboard data based on user role
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    if (userRole === 'borrower') {
      // Borrower Dashboard
      const activeLoans = await FundedLoan.find({ 
        borrower: userId,
        status: 'active'
      }).populate('lender', 'firstName lastName email');

      const completedLoans = await FundedLoan.find({ 
        borrower: userId,
        status: 'completed'
      }).populate('lender', 'firstName lastName email');

      const pendingRequests = await LoanRequest.find({
        borrower: userId,
        status: 'pending'
      });

      const recentTransactions = await Transaction.find({ 
        fromUser: userId,
        type: 'loan_repayment'
      }).populate('loan').sort({ createdAt: -1 }).limit(5);

      // Calculate stats
      const totalBorrowed = [...activeLoans, ...completedLoans].reduce((sum, loan) => sum + loan.amount, 0);
      const totalRepaid = recentTransactions.reduce((sum, txn) => sum + txn.amount, 0);
      const outstandingBalance = activeLoans.reduce((sum, loan) => sum + loan.outstandingBalance, 0);

      // Get upcoming payments
      const upcomingPayments = [];
      activeLoans.forEach(loan => {
        const nextPayment = loan.repaymentSchedule.find(p => p.status === 'pending' || p.status === 'overdue');
        if (nextPayment) {
          upcomingPayments.push({
            loanId: loan._id,
            amount: nextPayment.totalAmount,
            dueDate: nextPayment.dueDate,
            paymentNumber: nextPayment.paymentNumber,
            status: nextPayment.status,
            lender: loan.lender
          });
        }
      });

      res.json({
        success: true,
        userRole: 'borrower',
        stats: {
          totalBorrowed,
          totalRepaid,
          outstandingBalance,
          activeLoansCount: activeLoans.length,
          completedLoansCount: completedLoans.length,
          pendingRequestsCount: pendingRequests.length
        },
        activeLoans,
        completedLoans,
        pendingRequests,
        upcomingPayments: upcomingPayments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)),
        recentTransactions
      });

    } else if (userRole === 'lender') {
      // Lender Dashboard
      const fundedLoans = await FundedLoan.find({ 
        lender: userId
      }).populate('borrower', 'firstName lastName email creditScore');

      const activeInvestments = fundedLoans.filter(loan => loan.status === 'active');
      const completedInvestments = fundedLoans.filter(loan => loan.status === 'completed');

      const recentTransactions = await Transaction.find({ 
        toUser: userId,
        type: 'loan_repayment'
      }).populate('loan').sort({ createdAt: -1 }).limit(5);

      // Calculate stats
      const totalInvested = fundedLoans.reduce((sum, loan) => sum + loan.amount, 0);
      const totalEarned = recentTransactions.reduce((sum, txn) => sum + txn.netAmount, 0);
      const expectedReturns = activeInvestments.reduce((sum, loan) => sum + loan.totalRepayment, 0);
      const currentValue = activeInvestments.reduce((sum, loan) => sum + loan.outstandingBalance, 0);

      // Get expected payments
      const expectedPayments = [];
      activeInvestments.forEach(loan => {
        const nextPayment = loan.repaymentSchedule.find(p => p.status === 'pending' || p.status === 'overdue');
        if (nextPayment) {
          const platformFee = nextPayment.totalAmount * 0.02;
          const netAmount = nextPayment.totalAmount - platformFee;
          expectedPayments.push({
            loanId: loan._id,
            grossAmount: nextPayment.totalAmount,
            netAmount: netAmount,
            dueDate: nextPayment.dueDate,
            paymentNumber: nextPayment.paymentNumber,
            status: nextPayment.status,
            borrower: loan.borrower
          });
        }
      });

      res.json({
        success: true,
        userRole: 'lender',
        stats: {
          totalInvested,
          totalEarned,
          expectedReturns,
          currentValue,
          activeInvestmentsCount: activeInvestments.length,
          completedInvestmentsCount: completedInvestments.length,
          averageReturn: fundedLoans.length > 0 ? (totalEarned / totalInvested * 100).toFixed(2) : 0
        },
        activeInvestments,
        completedInvestments,
        expectedPayments: expectedPayments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)),
        recentTransactions
      });
    }

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get detailed analytics
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const { period = '6months' } = req.query;

    let startDate = new Date();
    switch (period) {
      case '1month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case '3months':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case '6months':
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case '1year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    if (userRole === 'borrower') {
      const transactions = await Transaction.find({
        fromUser: userId,
        type: 'loan_repayment',
        createdAt: { $gte: startDate }
      }).sort({ createdAt: 1 });

      const monthlyData = {};
      transactions.forEach(txn => {
        const month = txn.createdAt.toISOString().substring(0, 7);
        if (!monthlyData[month]) {
          monthlyData[month] = { totalPaid: 0, count: 0 };
        }
        monthlyData[month].totalPaid += txn.amount;
        monthlyData[month].count += 1;
      });

      res.json({
        success: true,
        period,
        monthlyPayments: monthlyData,
        totalTransactions: transactions.length,
        totalAmount: transactions.reduce((sum, txn) => sum + txn.amount, 0)
      });

    } else if (userRole === 'lender') {
      const transactions = await Transaction.find({
        toUser: userId,
        type: 'loan_repayment',
        createdAt: { $gte: startDate }
      }).sort({ createdAt: 1 });

      const monthlyData = {};
      transactions.forEach(txn => {
        const month = txn.createdAt.toISOString().substring(0, 7);
        if (!monthlyData[month]) {
          monthlyData[month] = { totalReceived: 0, count: 0 };
        }
        monthlyData[month].totalReceived += txn.netAmount;
        monthlyData[month].count += 1;
      });

      res.json({
        success: true,
        period,
        monthlyEarnings: monthlyData,
        totalTransactions: transactions.length,
        totalEarned: transactions.reduce((sum, txn) => sum + txn.netAmount, 0)
      });
    }

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;