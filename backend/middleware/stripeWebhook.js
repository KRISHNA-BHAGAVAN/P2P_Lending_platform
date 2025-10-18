import Stripe from 'stripe';
import { Transaction, FundedLoan } from '../models/index.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        await handlePaymentSuccess(paymentIntent);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        await handlePaymentFailure(failedPayment);
        break;

      case 'account.updated':
        const account = event.data.object;
        console.log('Account updated:', account.id);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

const handlePaymentSuccess = async (paymentIntent) => {
  const { loanId } = paymentIntent.metadata;
  
  if (loanId) {
    await Transaction.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntent.id },
      { 
        status: 'completed',
        processedAt: new Date()
      }
    );
  }
};

const handlePaymentFailure = async (paymentIntent) => {
  const { loanId } = paymentIntent.metadata;
  
  if (loanId) {
    await Transaction.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntent.id },
      { 
        status: 'failed',
        failureReason: 'Payment failed'
      }
    );
  }
};