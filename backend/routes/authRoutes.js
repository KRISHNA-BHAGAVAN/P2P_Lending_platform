import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateRegistration } from '../middleware/validation.js';
import { blacklistUserTokens, storeUserToken, blacklistToken } from '../middleware/tokenBlacklist.js';

const generateToken = (id) => {
  const jti = crypto.randomUUID();
  const exp = Math.floor(Date.now() / 1000) + (10 * 60); // 10 minutes
  return {
    token: jwt.sign({ id, jti, exp }, process.env.JWT_SECRET),
    jti,
    exp
  };
};

const router = express.Router();

router.post('/register', validateRegistration, async (req, res) => {
    try {
    const { firstName, lastName, email, password, role, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
        firstName,
        lastName,
        email,
        password,
        role,
        phone
    });

    const tokenData = generateToken(user._id);
    await storeUserToken(user._id, tokenData.jti, tokenData.exp);

    res.cookie('token', tokenData.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', 
        sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax", 
        maxAge: 10 * 60 * 1000, // 10 minutes
    });

    res.status(201).json({
        success: true,
        user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture
        }
    });
    } catch (error) {
    res.status(400).json({ message: error.message });
    }

});
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Blacklist previous tokens for security
    await blacklistUserTokens(user._id);
    
    const tokenData = generateToken(user._id);

    try{
      await storeUserToken(user._id, tokenData.jti, tokenData.exp);
    }
    catch(err){
      console.warn("Redis Unavaliable, skipping token store");
    }
    
    res.cookie('token', tokenData.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax",
      maxAge: 10 * 60 * 1000, // 10 minutes
    });
    res.json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture

      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(400).json({ message: 'Token not provided' });
    }

    const decoded = jwt.decode(token);
    if (decoded?.jti && decoded?.exp) {
      try {
        jwt.verify(token, process.env.JWT_SECRET);
        await blacklistToken(decoded.jti, decoded.exp);
      } catch {
        console.warn('Token expired — still blacklisting');
        await blacklistToken(decoded.jti, decoded.exp);
      }
    }
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(200).json({ message: 'Logged out successfully' });
  }
});

router.get('/profile', authenticateToken, async (req, res) => {
  res.json({ success: true, user: req.user });
});

router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, phone, dateOfBirth, address } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { firstName, lastName, phone, dateOfBirth, address },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;