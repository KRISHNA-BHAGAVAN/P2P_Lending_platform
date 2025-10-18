import cron from 'node-cron';
import { FundedLoan, Notification } from '../models/index.js';

// Run daily at 9 AM to check for due payments
export const startRepaymentScheduler = () => {
  cron.schedule('0 9 * * *', async () => {
    console.log('Running repayment due checker...');
    
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

      for (const loan of loansWithDuePayments) {
        // Find the current due payment
        const duePayment = loan.repaymentSchedule.find(
          payment => payment.dueDate.toDateString() === today.toDateString() && 
                    payment.status === 'pending'
        );

        if (duePayment) {
          // Create notification for borrower
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

      // Check for overdue payments (1 day past due)
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const overdueLoans = await FundedLoan.find({
        status: 'active',
        'repaymentSchedule': {
          $elemMatch: {
            dueDate: { $lt: today },
            status: 'pending'
          }
        }
      }).populate('borrower lender');

      for (const loan of overdueLoans) {
        // Update overdue payments
        loan.repaymentSchedule.forEach(payment => {
          if (payment.dueDate < today && payment.status === 'pending') {
            payment.status = 'overdue';
          }
        });

        await loan.save();

        // Create overdue notification
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

    } catch (error) {
      console.error('Error in repayment scheduler:', error);
    }
  });

  console.log('Repayment scheduler started - runs daily at 9 AM');
};