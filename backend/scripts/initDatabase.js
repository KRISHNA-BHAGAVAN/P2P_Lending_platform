import 'dotenv/config';
import mongoose from 'mongoose';
import { User, LoanRequest, FundedLoan, Transaction, Notification } from '../models/index.js';

const initDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('Connected to MongoDB');

    await User.createIndexes();
    await LoanRequest.createIndexes();
    await FundedLoan.createIndexes();
    await Transaction.createIndexes();
    await Notification.createIndexes();

    console.log('Database indexes created successfully');

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Creating sample users...');
      
      const sampleBorrower = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'borrower@example.com',
        password: 'password123',
        role: 'borrower',
        phone: '+12345678901',
        creditScore: 720,
        isVerified: true
      });

      const sampleLender = new User({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'lender@example.com',
        password: 'password123',
        role: 'lender',
        phone: '+12345678902',
        isVerified: true
      });

      await sampleBorrower.save();
      await sampleLender.save();

      console.log('Sample users created');
    }

    console.log('Database initialization completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

initDatabase();