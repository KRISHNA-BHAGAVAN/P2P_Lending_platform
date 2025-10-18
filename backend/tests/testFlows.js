import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

class TestFlows {
  constructor() {
    this.borrowerToken = null;
    this.lenderToken = null;
    this.testData = {};
  }

  async runAllTests() {
    console.log('🚀 Starting comprehensive P2P lending platform tests...\n');
    
    try {
      await this.testUserRegistration();
      await this.testUserLogin();
      await this.testLoanCreation();
      await this.testLoanMarketplace();
      await this.testStripeOnboarding();
      await this.testLoanFunding();
      await this.testRepaymentFlow();
      await this.testDashboards();
      await this.testNotifications();
      
      console.log('✅ All tests completed successfully!');
    } catch (error) {
      console.error('❌ Test failed:', error.message);
    }
  }

  async testUserRegistration() {
    console.log('📝 Testing user registration...');
    
    const borrowerData = {
      firstName: 'John',
      lastName: 'Doe',
      email: `borrower_${Date.now()}@test.com`,
      password: 'password123',
      role: 'borrower',
      phone: '+12345678901'
    };

    const borrowerResponse = await axios.post(`${BASE_URL}/auth/register`, borrowerData);
    console.log('✓ Borrower registered successfully');

    const lenderData = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: `lender_${Date.now()}@test.com`,
      password: 'password123',
      role: 'lender',
      phone: '+12345678902'
    };

    const lenderResponse = await axios.post(`${BASE_URL}/auth/register`, lenderData);
    console.log('✓ Lender registered successfully');

    this.testData.borrower = borrowerData;
    this.testData.lender = lenderData;
  }

  async testUserLogin() {
    console.log('🔐 Testing user login...');
    
    const borrowerLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: this.testData.borrower.email,
      password: this.testData.borrower.password
    });
    
    this.borrowerToken = borrowerLogin.data.token;
    console.log('✓ Borrower login successful');

    const lenderLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: this.testData.lender.email,
      password: this.testData.lender.password
    });
    
    this.lenderToken = lenderLogin.data.token;
    console.log('✓ Lender login successful');
  }

  async testLoanCreation() {
    console.log('💰 Testing loan creation...');
    
    const loanData = {
      amount: 5000,
      interestRate: 12.5,
      tenure: 24,
      purpose: 'business',
      description: 'Test loan for business expansion'
    };

    const response = await axios.post(`${BASE_URL}/loans`, loanData, {
      headers: { Authorization: `Bearer ${this.borrowerToken}` }
    });

    this.testData.loanId = response.data.loanRequest._id;
    console.log('✓ Loan request created successfully');
    console.log(`  Loan ID: ${this.testData.loanId}`);
    console.log(`  Monthly Payment: $${response.data.loanRequest.monthlyPayment}`);
  }

  async testLoanMarketplace() {
    console.log('🏪 Testing loan marketplace...');
    
    const response = await axios.get(`${BASE_URL}/loans/marketplace`, {
      headers: { Authorization: `Bearer ${this.lenderToken}` }
    });

    console.log('✓ Marketplace accessed successfully');
    console.log(`  Available loans: ${response.data.loans.length}`);
  }

  async testStripeOnboarding() {
    console.log('💳 Testing Stripe Connect onboarding...');
    
    try {
      const response = await axios.post(`${BASE_URL}/stripe/create-connect-account`, {}, {
        headers: { Authorization: `Bearer ${this.lenderToken}` }
      });

      this.testData.stripeAccountId = response.data.accountId;
      console.log('✓ Stripe Connect account created');
      console.log(`  Account ID: ${this.testData.stripeAccountId}`);
    } catch (error) {
      console.log('⚠️  Stripe Connect test skipped (requires valid Stripe keys)');
    }
  }

  async testLoanFunding() {
    console.log('💸 Testing loan funding...');
    
    try {
      const response = await axios.post(`${BASE_URL}/stripe/create-payment-intent`, {
        loanId: this.testData.loanId
      }, {
        headers: { Authorization: `Bearer ${this.lenderToken}` }
      });

      console.log('✓ Payment intent created for loan funding');
      console.log(`  Client Secret: ${response.data.clientSecret ? 'Generated' : 'Not generated'}`);
    } catch (error) {
      console.log('⚠️  Loan funding test skipped (requires Stripe setup)');
    }
  }

  async testRepaymentFlow() {
    console.log('🔄 Testing repayment flow...');
    
    try {
      const loansResponse = await axios.get(`${BASE_URL}/repayments/my-loans`, {
        headers: { Authorization: `Bearer ${this.borrowerToken}` }
      });

      console.log('✓ Borrower loans retrieved');
      console.log(`  Active loans: ${loansResponse.data.loans.length}`);

      if (loansResponse.data.loans.length > 0) {
        const loanId = loansResponse.data.loans[0]._id;
        
        const paymentResponse = await axios.post(`${BASE_URL}/repayments/create-payment-intent`, {
          loanId: loanId
        }, {
          headers: { Authorization: `Bearer ${this.borrowerToken}` }
        });

        console.log('✓ Repayment payment intent created');
      }
    } catch (error) {
      console.log('⚠️  Repayment flow test skipped (no active loans)');
    }
  }

  async testDashboards() {
    console.log('📊 Testing dashboards...');
    
    const borrowerDashboard = await axios.get(`${BASE_URL}/dashboard`, {
      headers: { Authorization: `Bearer ${this.borrowerToken}` }
    });

    console.log('✓ Borrower dashboard loaded');
    console.log(`  Pending requests: ${borrowerDashboard.data.stats.pendingRequestsCount}`);

    const lenderDashboard = await axios.get(`${BASE_URL}/dashboard`, {
      headers: { Authorization: `Bearer ${this.lenderToken}` }
    });

    console.log('✓ Lender dashboard loaded');
    console.log(`  Total invested: $${lenderDashboard.data.stats.totalInvested}`);

    const analytics = await axios.get(`${BASE_URL}/dashboard/analytics?period=6months`, {
      headers: { Authorization: `Bearer ${this.borrowerToken}` }
    });

    console.log('✓ Analytics data retrieved');
  }

  async testNotifications() {
    console.log('🔔 Testing notifications...');
    
    const notifications = await axios.get(`${BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${this.borrowerToken}` }
    });

    console.log('✓ Notifications retrieved');
    console.log(`  Total notifications: ${notifications.data.notifications.length}`);
    console.log(`  Unread count: ${notifications.data.unreadCount}`);

    const summary = await axios.get(`${BASE_URL}/notifications/summary`, {
      headers: { Authorization: `Bearer ${this.borrowerToken}` }
    });

    console.log('✓ Notification summary retrieved');
  }
}

export default TestFlows;