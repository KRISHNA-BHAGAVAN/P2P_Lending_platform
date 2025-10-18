import express from 'express';
import Stripe from 'stripe';
import { User, LoanRequest, FundedLoan, Transaction } from '../models/index.js';
import { authenticateToken, authorize } from '../middleware/auth.js';
import TransactionHelper from '../utils/transactionHelper.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

// Create Stripe Connect account for lender onboarding
router.post('/create-connect-account', authenticateToken, authorize('lender'), async (req, res) => {
  try {
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: req.user.email,
      capabilities: {
        transfers: { requested: true },
      },
    });

    // Update user with Stripe Connect account ID
    await User.findByIdAndUpdate(req.user._id, {
      stripeConnectAccountId: account.id
    });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.FRONTEND_URL}/onboarding/refresh`,
      return_url: `${process.env.FRONTEND_URL}/onboarding/success`,
      type: 'account_onboarding',
    });

    res.json({
      success: true,
      accountId: account.id,
      url: accountLink.url
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get account status
router.get('/account/:id', authenticateToken, async (req, res) => {
  try {
    const account = await stripe.accounts.retrieve(req.params.id);
    res.json({
      success: true,
      account: {
        id: account.id,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        details_submitted: account.details_submitted
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Create new account link for refresh
router.post('/create-account-link', authenticateToken, async (req, res) => {
  try {
    const { accountId } = req.body;
    
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.FRONTEND_URL}/onboarding/refresh`,
      return_url: `${process.env.FRONTEND_URL}/onboarding/success`,
      type: 'account_onboarding',
    });

    res.json({
      success: true,
      url: accountLink.url
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Fund a loan
router.post('/fund-loan/:loanId', authenticateToken, authorize('lender'), async (req, res) => {
  try {
    const { paymentMethodId } = req.body;
    const loanId = req.params.loanId;

    const loan = await LoanRequest.findById(loanId).populate('borrower');
    if (!loan || loan.status !== 'pending') {
      return res.status(400).json({ message: 'Loan not available for funding' });
    }

    const lender = await User.findById(req.user._id);
    if (!lender.stripeConnectAccountId) {
      return res.status(400).json({ message: 'Please complete onboarding first' });
    }

    // Create payment intent with proper Connect flow
    const platformFee = Math.round(loan.amount * 0.05 * 100); // 5% platform fee in cents
    const paymentIntent = await stripe.paymentIntents.create({
      payment_method: paymentMethodId,
      amount: Math.round(loan.amount * 100), // Convert to cents
      currency: 'usd',
      confirm: true,
      return_url: `${process.env.FRONTEND_URL}/funding/success`,
      application_fee_amount: platformFee,
      transfer_data: {
        destination: lender.stripeConnectAccountId,
      },
      metadata: {
        loanId: loanId,
        lenderId: req.user._id.toString(),
        borrowerId: loan.borrower._id.toString()
      }
    });

    if (paymentIntent.status === 'succeeded') {
      // Execute operations without transactions
      const result = await TransactionHelper.executeWithTransaction(async (session) => {
        // Update loan status
        await LoanRequest.findByIdAndUpdate(
          loanId,
          { status: 'funded' }
        );

        // Create funded loan record
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + loan.tenure);
        
        const nextPaymentDate = new Date(startDate);
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
        
        const fundedLoan = await FundedLoan.create({
          loanRequest: loanId,
          borrower: loan.borrower._id,
          lender: req.user._id,
          amount: loan.amount,
          interestRate: loan.interestRate,
          tenure: loan.tenure,
          monthlyPayment: loan.monthlyPayment,
          totalRepayment: loan.totalRepayment,
          outstandingBalance: loan.amount,
          stripePaymentIntentId: paymentIntent.id,
          startDate: startDate,
          endDate: endDate,
          nextPaymentDate: nextPaymentDate,
          totalPaymentsRequired: loan.tenure
        });

        // Create transaction record
        await Transaction.create({
          type: 'loan_funding',
          amount: loan.amount,
          fromUser: req.user._id,
          toUser: loan.borrower._id,
          loan: fundedLoan._id,
          stripePaymentIntentId: paymentIntent.id,
          platformFee: platformFee / 100,
          netAmount: loan.amount - (platformFee / 100),
          status: 'completed',
          processedAt: new Date()
        });

        return fundedLoan;
      });

      res.json({
        success: true,
        message: 'Loan funded successfully',
        fundedLoan: result,
        paymentIntentId: paymentIntent.id
      });
    } else {
      res.status(400).json({ message: 'Payment failed' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Create payment intent for funding
router.post('/create-payment-intent', authenticateToken, authorize('lender'), async (req, res) => {
  try {
    const { loanId } = req.body;

    const loan = await LoanRequest.findById(loanId);
    if (!loan || loan.status !== 'pending') {
      return res.status(400).json({ message: 'Loan not available for funding' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(loan.amount * 100),
      currency: 'usd',
      metadata: {
        loanId: loanId,
        lenderId: req.user._id.toString()
      }
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;