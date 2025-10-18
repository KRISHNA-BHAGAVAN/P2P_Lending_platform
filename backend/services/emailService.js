import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendEmail(to, subject, html) {
    try {
      if (!process.env.SMTP_USER) {
        console.log('Email service not configured, skipping email send');
        return;
      }

      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject,
        html
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('Email send failed:', error);
    }
  }

  async sendLoanFundedEmail(borrower, lender, loan) {
    const subject = 'Your Loan Has Been Funded!';
    const html = `
      <h2>Congratulations! Your loan has been funded</h2>
      <p>Dear ${borrower.firstName},</p>
      <p>Great news! Your loan request for $${loan.amount} has been successfully funded by ${lender.firstName} ${lender.lastName}.</p>
      <h3>Loan Details:</h3>
      <ul>
        <li>Amount: $${loan.amount}</li>
        <li>Interest Rate: ${loan.interestRate}%</li>
        <li>Tenure: ${loan.tenure} months</li>
        <li>Monthly Payment: $${loan.monthlyPayment}</li>
        <li>First Payment Due: ${new Date(loan.nextPaymentDate).toLocaleDateString()}</li>
      </ul>
      <p>Please log in to your dashboard to view your repayment schedule.</p>
      <p>Best regards,<br>P2P Lending Platform</p>
    `;
    
    await this.sendEmail(borrower.email, subject, html);
  }

  async sendRepaymentDueEmail(borrower, payment, loan) {
    const subject = 'Loan Payment Due Reminder';
    const html = `
      <h2>Payment Due Reminder</h2>
      <p>Dear ${borrower.firstName},</p>
      <p>This is a reminder that your loan payment is due today.</p>
      <h3>Payment Details:</h3>
      <ul>
        <li>Amount Due: $${payment.totalAmount}</li>
        <li>Due Date: ${new Date(payment.dueDate).toLocaleDateString()}</li>
        <li>Payment Number: ${payment.paymentNumber} of ${loan.totalPaymentsRequired}</li>
      </ul>
      <p>Please log in to your dashboard to make the payment.</p>
      <p>Best regards,<br>P2P Lending Platform</p>
    `;
    
    await this.sendEmail(borrower.email, subject, html);
  }

  async sendRepaymentReceivedEmail(lender, borrower, payment, loan) {
    const subject = 'Payment Received';
    const html = `
      <h2>Payment Received</h2>
      <p>Dear ${lender.firstName},</p>
      <p>You have received a payment from ${borrower.firstName} ${borrower.lastName}.</p>
      <h3>Payment Details:</h3>
      <ul>
        <li>Amount Received: $${payment.netAmount}</li>
        <li>Payment Date: ${new Date().toLocaleDateString()}</li>
        <li>Remaining Balance: $${loan.outstandingBalance}</li>
      </ul>
      <p>The payment has been transferred to your connected account.</p>
      <p>Best regards,<br>P2P Lending Platform</p>
    `;
    
    await this.sendEmail(lender.email, subject, html);
  }

  async sendOverduePaymentEmail(borrower, payment, loan) {
    const subject = 'URGENT: Overdue Payment Notice';
    const html = `
      <h2>Overdue Payment Notice</h2>
      <p>Dear ${borrower.firstName},</p>
      <p><strong>Your loan payment is now overdue.</strong></p>
      <h3>Overdue Payment Details:</h3>
      <ul>
        <li>Amount Due: $${payment.totalAmount}</li>
        <li>Original Due Date: ${new Date(payment.dueDate).toLocaleDateString()}</li>
        <li>Days Overdue: ${Math.ceil((new Date() - payment.dueDate) / (1000 * 60 * 60 * 24))}</li>
      </ul>
      <p>Please make this payment immediately to avoid further penalties.</p>
      <p>Best regards,<br>P2P Lending Platform</p>
    `;
    
    await this.sendEmail(borrower.email, subject, html);
  }
}

export default new EmailService();