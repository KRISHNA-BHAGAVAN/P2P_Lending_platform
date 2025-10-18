import mongoose from 'mongoose';

const loanRequestSchema = new mongoose.Schema({
  borrower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Loan amount is required'],
    min: [100, 'Minimum loan amount is $100'],
    max: [50000, 'Maximum loan amount is $50,000']
  },
  interestRate: {
    type: Number,
    required: [true, 'Interest rate is required'],
    min: [1, 'Interest rate must be at least 1%'],
    max: [36, 'Interest rate cannot exceed 36%']
  },
  tenure: {
    type: Number,
    required: [true, 'Loan tenure is required'],
    min: [1, 'Minimum tenure is 1 month'],
    max: [60, 'Maximum tenure is 60 months']
  },
  purpose: {
    type: String,
    required: [true, 'Loan purpose is required'],
    enum: [
      'debt_consolidation',
      'home_improvement',
      'business',
      'education',
      'medical',
      'personal',
      'other'
    ]
  },
  description: {
    type: String,
    required: [true, 'Loan description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'funded', 'rejected', 'cancelled'],
    default: 'pending'
  },
  riskGrade: {
    type: String,
    enum: ['A', 'B', 'C', 'D', 'E'],
    default: 'C'
  },
  monthlyPayment: {
    type: Number
  },
  totalRepayment: {
    type: Number
  },
  fundingDeadline: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    }
  },
  documents: [{
    name: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Calculate monthly payment and total repayment before saving
loanRequestSchema.pre('save', function(next) {
  if (this.isModified('amount') || this.isModified('interestRate') || this.isModified('tenure')) {
    const monthlyRate = this.interestRate / 100 / 12;
    const numPayments = this.tenure;
    
    // Calculate monthly payment using loan formula
    this.monthlyPayment = Math.round(
      (this.amount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1) * 100
    ) / 100;
    
    this.totalRepayment = Math.round(this.monthlyPayment * numPayments * 100) / 100;
  }
  next();
});

export default mongoose.model('LoanRequest', loanRequestSchema);