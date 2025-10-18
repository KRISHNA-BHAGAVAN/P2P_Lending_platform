import { Notification } from '../models/index.js';
import emailService from './emailService.js';

class NotificationService {
  async createNotification(data) {
    try {
      const notification = await Notification.create(data);
      console.log(`Notification created: ${notification.type} for user ${notification.user}`);
      return notification;
    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  }

  async sendLoanFundedNotifications(borrower, lender, loan) {
    // Create in-app notifications
    await this.createNotification({
      user: borrower._id,
      type: 'loan_funded',
      title: 'Loan Funded Successfully!',
      message: `Your loan request for $${loan.amount} has been funded by ${lender.firstName} ${lender.lastName}.`,
      priority: 'high',
      relatedLoan: loan._id
    });

    await this.createNotification({
      user: lender._id,
      type: 'loan_funded',
      title: 'Investment Confirmed',
      message: `You have successfully funded a loan for $${loan.amount} to ${borrower.firstName} ${borrower.lastName}.`,
      priority: 'medium',
      relatedLoan: loan._id
    });

    // Send emails
    await emailService.sendLoanFundedEmail(borrower, lender, loan);
  }

  async sendRepaymentDueNotifications(borrower, payment, loan) {
    await this.createNotification({
      user: borrower._id,
      type: 'repayment_due',
      title: 'Payment Due Today',
      message: `Your loan payment of $${payment.totalAmount} is due today.`,
      priority: 'high',
      relatedLoan: loan._id
    });

    await emailService.sendRepaymentDueEmail(borrower, payment, loan);
  }

  async sendRepaymentReceivedNotifications(borrower, lender, payment, loan) {
    // Borrower notification
    await this.createNotification({
      user: borrower._id,
      type: 'repayment_received',
      title: 'Payment Processed',
      message: `Your payment of $${payment.totalAmount} has been processed successfully.`,
      priority: 'medium',
      relatedLoan: loan._id
    });

    // Lender notification
    const netAmount = payment.totalAmount * 0.98; // After 2% platform fee
    await this.createNotification({
      user: lender._id,
      type: 'repayment_received',
      title: 'Payment Received',
      message: `You received $${netAmount.toFixed(2)} from ${borrower.firstName} ${borrower.lastName}'s loan repayment.`,
      priority: 'medium',
      relatedLoan: loan._id
    });

    // Send emails
    await emailService.sendRepaymentReceivedEmail(lender, borrower, { netAmount }, loan);
  }

  async sendOverdueNotifications(borrower, payment, loan) {
    await this.createNotification({
      user: borrower._id,
      type: 'repayment_overdue',
      title: 'Payment Overdue',
      message: `Your loan payment of $${payment.totalAmount} is overdue. Please make payment immediately.`,
      priority: 'urgent',
      relatedLoan: loan._id
    });

    await emailService.sendOverduePaymentEmail(borrower, payment, loan);
  }

  async sendLoanCompletedNotifications(borrower, lender, loan) {
    await this.createNotification({
      user: borrower._id,
      type: 'loan_completed',
      title: 'Loan Completed!',
      message: `Congratulations! You have successfully completed your loan of $${loan.amount}.`,
      priority: 'high',
      relatedLoan: loan._id
    });

    await this.createNotification({
      user: lender._id,
      type: 'loan_completed',
      title: 'Investment Completed',
      message: `The loan you funded for $${loan.amount} has been fully repaid by ${borrower.firstName} ${borrower.lastName}.`,
      priority: 'medium',
      relatedLoan: loan._id
    });
  }

  async cleanupExpiredNotifications() {
    try {
      const result = await Notification.deleteMany({
        expiresAt: { $lt: new Date() }
      });
      
      if (result.deletedCount > 0) {
        console.log(`Cleaned up ${result.deletedCount} expired notifications`);
      }
    } catch (error) {
      console.error('Failed to cleanup expired notifications:', error);
    }
  }
}

export default new NotificationService();