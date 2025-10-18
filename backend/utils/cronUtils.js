import cron from 'node-cron';
import { FundedLoan, Notification } from '../models/index.js';

// Manual trigger for testing repayment scheduler
export const triggerRepaymentCheck = async () => {
  console.log('Manually triggering repayment check...');
  
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find loans with payments due today
    const loansWithDuePayments = await FundedLoan.find({
      status: 'active',
      nextPaymentDate: {
        $gte: today,
        $lt: tomorrow
      }
    }).populate('borrower lender');

    console.log(`Found ${loansWithDuePayments.length} loans with payments due today`);

    for (const loan of loansWithDuePayments) {
      const duePayment = loan.repaymentSchedule.find(
        payment => payment.dueDate.toDateString() === today.toDateString() && 
                  payment.status === 'pending'
      );

      if (duePayment) {
        await Notification.create({
          user: loan.borrower._id,
          type: 'repayment_due',
          title: 'Payment Due Today',
          message: `Your loan payment of $${duePayment.totalAmount} is due today.`,
          priority: 'high',
          relatedLoan: loan._id
        });

        console.log(`Payment due notification sent for loan ${loan._id}`);
      }
    }

    // Check for overdue payments
    const overdueLoans = await FundedLoan.find({
      status: 'active',
      'repaymentSchedule': {
        $elemMatch: {
          dueDate: { $lt: today },
          status: 'pending'
        }
      }
    }).populate('borrower lender');

    console.log(`Found ${overdueLoans.length} loans with overdue payments`);

    for (const loan of overdueLoans) {
      let hasOverdue = false;
      
      loan.repaymentSchedule.forEach(payment => {
        if (payment.dueDate < today && payment.status === 'pending') {
          payment.status = 'overdue';
          hasOverdue = true;
        }
      });

      if (hasOverdue) {
        await loan.save();

        await Notification.create({
          user: loan.borrower._id,
          type: 'repayment_overdue',
          title: 'Payment Overdue',
          message: 'Your loan payment is overdue. Please make payment immediately.',
          priority: 'urgent',
          relatedLoan: loan._id
        });

        console.log(`Overdue notification sent for loan ${loan._id}`);
      }
    }

    return {
      duePayments: loansWithDuePayments.length,
      overdueLoans: overdueLoans.length
    };

  } catch (error) {
    console.error('Error in manual repayment check:', error);
    throw error;
  }
};

// Test route for manual trigger
export const createTestRoute = (app) => {
  app.post('/api/test/trigger-repayment-check', async (req, res) => {
    try {
      const result = await triggerRepaymentCheck();
      res.json({
        success: true,
        message: 'Repayment check completed',
        result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Repayment check failed',
        error: error.message
      });
    }
  });
};