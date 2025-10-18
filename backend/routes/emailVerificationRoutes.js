import express from 'express';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { User } from '../models/index.js';

const router = express.Router();

// In-memory store for verification codes (use Redis in production)
const verificationCodes = new Map();

// Email transporter (configure with your email service)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send verification code
router.post('/send-code', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store code with expiration (5 minutes)
    verificationCodes.set(email, {
      code,
      expires: Date.now() + 5 * 60 * 1000
    });

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'P2P Lending - Email Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Email Verification</h2>
          <p>Your verification code for P2P Lending Platform is:</p>
          <div style="background: #F3F4F6; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #1F2937; font-size: 32px; letter-spacing: 8px; margin: 0;">${code}</h1>
          </div>
          <p>This code will expire in 5 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Verification code sent to your email'
    });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ message: 'Failed to send verification code' });
  }
});

// Verify code
router.post('/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email and code are required' });
    }

    const storedData = verificationCodes.get(email);
    
    if (!storedData) {
      return res.status(400).json({ message: 'No verification code found for this email' });
    }

    if (Date.now() > storedData.expires) {
      verificationCodes.delete(email);
      return res.status(400).json({ message: 'Verification code has expired' });
    }

    if (storedData.code !== code) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // Code is valid, remove from store
    verificationCodes.delete(email);

    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Verification failed' });
  }
});

export default router;