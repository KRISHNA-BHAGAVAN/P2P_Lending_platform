import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { User } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profiles/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `profile-${req.user._id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Upload profile picture
router.post('/profile-picture', authenticateToken, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Get current user to check for existing profile picture
    const currentUser = await User.findById(req.user._id);
    
    // Delete old profile picture if it exists
    if (currentUser.profilePicture) {
      const oldFilePath = path.join(process.cwd(), currentUser.profilePicture.replace(/^\//, ''));
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    const profilePictureUrl = `/uploads/profiles/${req.file.filename}`;
    
    // Update user profile picture in database
    await User.findByIdAndUpdate(req.user._id, {
      profilePicture: profilePictureUrl
    });

    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      profilePicture: profilePictureUrl
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete profile picture
router.delete('/profile-picture', authenticateToken, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $unset: { profilePicture: 1 }
    });

    res.json({
      success: true,
      message: 'Profile picture removed successfully'
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;