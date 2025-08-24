import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { validateRegistration, validateLogin } from '../middleware/validation.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// POST /auth/signup — user registration
router.post('/signup', validateRegistration, async (req, res, next) => {
  try {
    console.log('Signup request received:', { 
      fullName: req.body.fullName, 
      email: req.body.email,
      passwordLength: req.body.password ? req.body.password.length : 0,
      hasFullName: !!req.body.fullName,
      hasEmail: !!req.body.email,
      hasPassword: !!req.body.password
    });
    
    const { fullName, email, password } = req.body;
    
    // Check if user already exists by email
    const existingUserByEmail = await User.findOne({ email });
    
    if (existingUserByEmail) {
      console.log('Signup failed: Email already exists');
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    
    // Generate username from fullName
    const username = fullName.toLowerCase().replace(/\s+/g, '_');
    console.log('Generated username:', username);
    
    // Check if username already exists
    const existingUserByUsername = await User.findOne({ username });
    
    if (existingUserByUsername) {
      console.log('Signup failed: Username already exists');
      return res.status(400).json({
        success: false,
        message: 'Username already taken, please try a different name'
      });
    }
    
    // Create new user
    const user = new User({
      username,
      fullName,
      email,
      password
    });
    
    console.log('Saving user to database...');
    await user.save();
    console.log('User saved successfully, ID:', user._id);
    
    // Check if JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not configured!');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('JWT token generated successfully');
    
    res.status(201).json({
      success: true,
      data: {
        user: user.toJSON(),
        token
      },
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Signup error:', error);
    next(error);
  }
});

// POST /auth/login — user login
router.post('/login', validateLogin, async (req, res, next) => {
  try {
    console.log('Login request received for email:', req.body.email);
    
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('Login failed: User not found');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    console.log('User found, ID:', user._id);
    
    // Check if user is active
    if (!user.isActive) {
      console.log('Login failed: Account deactivated');
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }
    
    // Verify password
    console.log('Verifying password...');
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      console.log('Login failed: Invalid password');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    console.log('Password verified successfully');
    
    // Check if JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not configured!');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('JWT token generated successfully');
    
    res.json({
      success: true,
      data: {
        user: user.toJSON(),
        token
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
});

// GET /auth/me — get current user (protected route)
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    // This route will be protected by authMiddleware
    // req.user will be set by the middleware
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// PUT /auth/profile — update user profile (protected route)
router.put('/profile', authMiddleware, async (req, res, next) => {
  try {
    const { fullName, mobileNumber, address } = req.body;
    const userId = req.user.id;
    
    // Find and update user
    const user = await User.findByIdAndUpdate(
      userId,
      {
        fullName,
        mobileNumber,
        address
      },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// POST /auth/profile-image — upload profile image (protected route)
router.post('/profile-image', authMiddleware, async (req, res, next) => {
  try {
    // For now, return success response
    // This will be enhanced when we implement file upload middleware
    res.json({
      success: true,
      data: {
        profileImage: 'https://via.placeholder.com/150'
      },
      message: 'Profile image updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// PUT /auth/change-password — change user password (protected route)
router.put('/change-password', authMiddleware, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
});

// GET /auth/bank-accounts — get user bank accounts (protected route)
router.get('/bank-accounts', authMiddleware, async (req, res, next) => {
  try {
    // For now, return empty array
    // This will be enhanced when we implement bank account functionality
    res.json([]);
  } catch (error) {
    next(error);
  }
});

// POST /auth/bank-accounts — add bank account (protected route)
router.post('/bank-accounts', authMiddleware, async (req, res, next) => {
  try {
    // For now, return success response
    // This will be enhanced when we implement bank account functionality
    res.json({
      success: true,
      message: 'Bank account added successfully'
    });
  } catch (error) {
    next(error);
  }
});

// PUT /auth/bank-accounts/:id — update bank account (protected route)
router.put('/bank-accounts/:id', authMiddleware, async (req, res, next) => {
  try {
    // For now, return success response
    // This will be enhanced when we implement bank account functionality
    res.json({
      success: true,
      message: 'Bank account updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /auth/bank-accounts/:id — delete bank account (protected route)
router.delete('/bank-accounts/:id', authMiddleware, async (req, res, next) => {
  try {
    // For now, return success response
    // This will be enhanced when we implement bank account functionality
    res.json({
      success: true,
      message: 'Bank account deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
