import express from 'express';
import Stripe from 'stripe';
import { FundedLoan, Transaction, User, Notification } from '../models/index.js';
import { authenticateToken, authorize } from '../middleware/auth.js';
import TransactionHelper from '../utils/transactionHelper.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

// Get borrower's active loans with repayment schedule
router.get('/my-loans', authenticateToken, authorize('borrower'), async (req, res) => {
  try {
    const loans = await FundedLoan.find({ 
      borrower: req.user._id,
      status: 'active'
    }).populate('lender', 'firstName lastName email');

    res.json({
      success: true,
      loans
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get specific loan repayment details
router.get('/loan/:loanId', authenticateToken, authorize('borrower'), async (req, res) => {
  try {
    const loan = await FundedLoan.findOne({
      _id: req.params.loanId,
      borrower: req.user._id
    }).populate('lender', 'firstName lastName email');

    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    // Get next due payment
    const nextPayment = loan.repaymentSchedule.find(
      payment => payment.status === 'pending'
    );

    res.json({
      success: true,
      loan,
      nextPayment,
      totalPaid: loan.amount - loan.outstandingBalance,
      remainingPayments: loan.repaymentSchedule.filter(p => p.status === 'pending').length
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Create payment intent for repayment
router.post('/create-payment-intent', authenticateToken, authorize('borrower'), async (req, res) => {
  try {
    const { loanId } = req.body;

    const loan = await FundedLoan.findOne({
      _id: loanId,
      borrower: req.user._id,
      status: 'active'
    }).populate('lender');

    if (!loan) {
      return res.status(404).json({ message: 'Active loan not found' });
    }

    const nextPayment = loan.repaymentSchedule.find(
      payment => payment.status === 'pending' || payment.status === 'overdue'
    );

    if (!nextPayment) {
      return res.status(400).json({ message: 'No pending payments found' });
    }

    // Calculate platform fee (2%)
    const platformFee = Math.round(nextPayment.totalAmount * 0.02 * 100); // in cents
    const totalAmount = Math.round(nextPayment.totalAmount * 100); // in cents

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'usd',
      application_fee_amount: platformFee,
      on_behalf_of: loan.lender.stripeConnectAccountId,
      transfer_data: {
        destination: loan.lender.stripeConnectAccountId,
      },
      metadata: {
        loanId: loanId,
        borrowerId: req.user._id.toString(),
        paymentNumber: nextPayment.paymentNumber.toString(),
        lenderId: loan.lender._id.toString()
      }
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      amount: nextPayment.totalAmount,
      paymentNumber: nextPayment.paymentNumber,
      platformFee: platformFee / 100
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Confirm payment (called after successful payment on frontend)
router.post('/confirm-payment', authenticateToken, authorize('borrower'), async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    // Retrieve and verify payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment not successful' });
    }

    const loanId = paymentIntent.metadata.loanId;
    const paymentNumber = parseInt(paymentIntent.metadata.paymentNumber);

    const loan = await FundedLoan.findOne({
      _id: loanId,
      borrower: req.user._id,
      status: 'active'
    }).populate('lender');

    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    const payment = loan.repaymentSchedule.find(p => p.paymentNumber === paymentNumber);

    if (!payment || payment.status === 'paid') {
      return res.status(400).json({ message: 'Invalid payment or already processed' });
    }

    // Use atomic transaction to update loan
    const result = await TransactionHelper.executeWithTransaction(async (session) => {
      const platformFee = Math.round(payment.totalAmount * 0.02 * 100) / 100;
      const lenderAmount = payment.totalAmount - platformFee;

      // Update payment status
      payment.status = 'paid';
      payment.paidDate = new Date();
      payment.transactionId = paymentIntentId;

      // Update loan details
      loan.outstandingBalance -= payment.principalAmount;
      loan.paymentsCompleted += 1;

      // Set next payment date
      const nextPendingPayment = loan.repaymentSchedule.find(
        p => p.paymentNumber > paymentNumber && p.status === 'pending'
      );
      
      if (nextPendingPayment) {
        loan.nextPaymentDate = nextPendingPayment.dueDate;
      } else {
        loan.status = 'completed';
        loan.nextPaymentDate = null;
      }

      await loan.save({ session });

      // Create transaction record
      const transaction = await Transaction.create([{
        type: 'loan_repayment',
        amount: payment.totalAmount,
        fromUser: req.user._id,
        toUser: loan.lender._id,
        loan: loan._id,
        stripePaymentIntentId: paymentIntentId,
        platformFee: platformFee,
        netAmount: lenderAmount,
        status: 'completed',
        processedAt: new Date(),
        description: `Loan repayment - Payment ${paymentNumber}`
      }], { session });

      return { loan, transaction: transaction[0], platformFee, lenderAmount };
    });

    // Create notifications
    await Notification.create({
      user: loan.borrower,
      type: 'repayment_received',
      title: 'Payment Processed',
      message: `Your payment of $${payment.totalAmount} has been processed successfully.`,
      relatedLoan: loan._id
    });

    await Notification.create({
      user: loan.lender._id,
      type: 'repayment_received',
      title: 'Payment Received',
      message: `You received $${result.lenderAmount} from loan repayment.`,
      relatedLoan: loan._id
    });

    res.json({
      success: true,
      message: 'Payment confirmed and processed successfully',
      paymentDetails: {
        amount: payment.totalAmount,
        platformFee: result.platformFee,
        lenderAmount: result.lenderAmount,
        remainingBalance: loan.outstandingBalance,
        paymentsCompleted: loan.paymentsCompleted,
        totalPayments: loan.totalPaymentsRequired,
        loanStatus: loan.status
      }
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get repayment history
router.get('/history', authenticateToken, authorize('borrower'), async (req, res) => {
  try {
    const transactions = await Transaction.find({
      fromUser: req.user._id,
      type: 'loan_repayment'
    }).populate('loan').sort({ createdAt: -1 });

    res.json({
      success: true,
      transactions
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;