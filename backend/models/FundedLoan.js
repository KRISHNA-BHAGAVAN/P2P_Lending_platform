import mongoose from 'mongoose';

const fundedLoanSchema = new mongoose.Schema({
  loanRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LoanRequest',
    required: true
  },
  borrower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  interestRate: {
    type: Number,
    required: true
  },
  tenure: {
    type: Number,
    required: true
  },
  monthlyPayment: {
    type: Number,
    required: true
  },
  totalRepayment: {
    type: Number,
    required: true
  },
  outstandingBalance: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'defaulted', 'cancelled'],
    default: 'active'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  nextPaymentDate: {
    type: Date,
    required: true
  },
  paymentsCompleted: {
    type: Number,
    default: 0
  },
  totalPaymentsRequired: {
    type: Number,
    required: true
  },
  stripePaymentIntentId: String,
  stripeTransferId: String,
  platformFeeRate: {
    type: Number,
    default: 0.05 // 5% platform fee
  },
  repaymentSchedule: [{
    paymentNumber: Number,
    dueDate: Date,
    principalAmount: Number,
    interestAmount: Number,
    totalAmount: Number,
    status: {
      type: String,
      enum: ['pending', 'paid', 'overdue'],
      default: 'pending'
    },
    paidDate: Date,
    transactionId: String
  }]
}, {
  timestamps: true
});

// Generate repayment schedule before saving
fundedLoanSchema.pre('save', function(next) {
  if (this.isNew && this.repaymentSchedule.length === 0) {
    const schedule = [];
    const monthlyRate = this.interestRate / 100 / 12;
    let remainingBalance = this.amount;
    
    for (let i = 1; i <= this.tenure; i++) {
      const interestAmount = Math.round(remainingBalance * monthlyRate * 100) / 100;
      const principalAmount = Math.round((this.monthlyPayment - interestAmount) * 100) / 100;
      
      const dueDate = new Date(this.startDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      
      schedule.push({
        paymentNumber: i,
        dueDate: dueDate,
        principalAmount: principalAmount,
        interestAmount: interestAmount,
        totalAmount: this.monthlyPayment,
        status: 'pending'
      });
      
      remainingBalance -= principalAmount;
    }
    
    this.repaymentSchedule = schedule;
    this.totalPaymentsRequired = this.tenure;
    this.nextPaymentDate = schedule[0].dueDate;
    
    // Set end date
    this.endDate = new Date(this.startDate);
    this.endDate.setMonth(this.endDate.getMonth() + this.tenure);
  }
  next();
});

export default mongoose.model('FundedLoan', fundedLoanSchema);