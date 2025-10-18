import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['loan_funding', 'loan_repayment', 'platform_fee', 'lender_payout'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount must be positive']
  },
  currency: {
    type: String,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  loan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FundedLoan'
  },
  stripePaymentIntentId: String,
  stripeTransferId: String,
  stripeChargeId: String,
  platformFee: {
    type: Number,
    default: 0
  },
  netAmount: {
    type: Number,
    required: true
  },
  description: String,
  metadata: {
    type: Map,
    of: String
  },
  processedAt: Date,
  failureReason: String
}, {
  timestamps: true
});

// Index for efficient querying
transactionSchema.index({ fromUser: 1, createdAt: -1 });
transactionSchema.index({ toUser: 1, createdAt: -1 });
transactionSchema.index({ loan: 1, createdAt: -1 });
transactionSchema.index({ type: 1, status: 1 });

export default mongoose.model('Transaction', transactionSchema);