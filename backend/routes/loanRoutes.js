import express from 'express';
import { LoanRequest } from '../models/index.js';
import { authenticateToken, authorize } from '../middleware/auth.js';
import { validateLoanRequest } from '../middleware/validation.js';

const router = express.Router();

// Create loan request (borrowers only)
router.post('/', authenticateToken, authorize('borrower'), validateLoanRequest, async (req, res) => {
  try {
    const { amount, interestRate, tenure, purpose, description } = req.body;

    const loanRequest = await LoanRequest.create({
      borrower: req.user._id,
      amount,
      interestRate,
      tenure,
      purpose,
      description
    });

    await loanRequest.populate('borrower', 'firstName lastName email creditScore');

    res.status(201).json({
      success: true,
      loanRequest
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get borrower's loans
router.get('/my-loans', authenticateToken, authorize('borrower'), async (req, res) => {
  try {
    const loans = await LoanRequest.find({ borrower: req.user._id })
      .populate('borrower', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      loans
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get marketplace (lenders only)
router.get('/marketplace', authenticateToken, authorize('lender'), async (req, res) => {
  try {
    const { page = 1, limit = 10, riskGrade, minAmount, maxAmount } = req.query;
    
    const filter = { status: 'pending' };
    
    if (riskGrade) filter.riskGrade = riskGrade;
    if (minAmount) filter.amount = { ...filter.amount, $gte: Number(minAmount) };
    if (maxAmount) filter.amount = { ...filter.amount, $lte: Number(maxAmount) };

    const loans = await LoanRequest.find(filter)
      .populate('borrower', 'firstName lastName creditScore')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await LoanRequest.countDocuments(filter);

    res.json({
      success: true,
      loans,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get specific loan request
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const loan = await LoanRequest.findById(req.params.id)
      .populate('borrower', 'firstName lastName email creditScore');

    if (!loan) {
      return res.status(404).json({ message: 'Loan request not found' });
    }

    res.json({
      success: true,
      loan
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update loan request (borrowers only)
router.put('/:id', authenticateToken, authorize('borrower'), validateLoanRequest, async (req, res) => {
  try {
    const loan = await LoanRequest.findOne({
      _id: req.params.id,
      borrower: req.user._id,
      status: 'pending'
    });

    if (!loan) {
      return res.status(404).json({ message: 'Loan request not found or cannot be modified' });
    }

    const { amount, interestRate, tenure, purpose, description } = req.body;
    
    Object.assign(loan, { amount, interestRate, tenure, purpose, description });
    await loan.save();

    res.json({
      success: true,
      loan
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete loan request (borrowers only)
router.delete('/:id', authenticateToken, authorize('borrower'), async (req, res) => {
  try {
    const loan = await LoanRequest.findOneAndDelete({
      _id: req.params.id,
      borrower: req.user._id,
      status: 'pending'
    });

    if (!loan) {
      return res.status(404).json({ message: 'Loan request not found or cannot be deleted' });
    }

    res.json({
      success: true,
      message: 'Loan request deleted successfully'
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;