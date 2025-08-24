import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    // Extract token
    const token = authHeader.substring(7);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if user still exists
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Token is valid but user no longer exists.'
        });
      }
      
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User account is deactivated.'
        });
      }
      
      // Add user to request object
      req.user = user;
      next();
      
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
  } catch (error) {
    next(error);
  }
};

// Optional auth middleware for routes that can work with or without authentication
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (error) {
        // Token is invalid, but we continue without authentication
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
};
