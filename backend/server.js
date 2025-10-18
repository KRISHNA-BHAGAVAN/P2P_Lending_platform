import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/database.js';
import { connectRedis } from './config/redis.js';
import authRoutes from './routes/authRoutes.js';
import loanRoutes from './routes/loanRoutes.js';
import stripeRoutes from './routes/stripeRoutes.js';
import lenderRoutes from './routes/lenderRoutes.js';
import repaymentRoutes from './routes/repaymentRoutes.js';
import borrowerRoutes from './routes/borrowerRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import emailVerificationRoutes from './routes/emailVerificationRoutes.js';
import { startRepaymentScheduler } from './jobs/repaymentScheduler.js';
import { createTestRoute } from './utils/cronUtils.js';
const app = express();

// Connect to MongoDB and Redis
connectDB();
connectRedis();

// Start cron jobs
startRepaymentScheduler();

// Add test routes in development
if (process.env.NODE_ENV === 'development') {
  createTestRoute(app);
}

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Stripe webhook (before JSON parsing)
app.post('/api/webhook/stripe', express.raw({ type: 'application/json' }), (req, res, next) => {
  import('./middleware/stripeWebhook.js').then(({ handleStripeWebhook }) => {
    handleStripeWebhook(req, res);
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/lender', lenderRoutes);
app.use('/api/repayments', repaymentRoutes);
app.use('/api/borrower', borrowerRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/email', emailVerificationRoutes);

// Serve static files
app.use('/uploads', express.static('uploads'));



// Health check
app.get('/health', (req, res) => {
  res.json({ message: "Micro P2P Platform API is Running",status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});