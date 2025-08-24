import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import Income from '../models/Income.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// GET /income — list all income for the authenticated user
router.get('/', async (req, res, next) => {
  try {
    const income = await Income.find({ userId: req.user.id })
      .sort({ date: -1, createdAt: -1 });
    
    res.json(income);
  } catch (error) {
    next(error);
  }
});

// POST /income — create a new income entry
router.post('/', async (req, res, next) => {
  try {
    console.log('Creating income with data:', req.body);
    console.log('User ID:', req.user.id);
    
    // Basic validation
    if (!req.body.description || !req.body.amount || !req.body.date) {
      return res.status(400).json({
        success: false,
        message: 'Description, amount, and date are required'
      });
    }
    
    if (isNaN(req.body.amount) || Number(req.body.amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number'
      });
    }
    
    const incomeData = {
      ...req.body,
      userId: req.user.id
    };
    
    console.log('Final income data:', incomeData);
    
    const income = new Income(incomeData);
    await income.save();
    
    console.log('Income saved successfully:', income._id);
    
    res.status(201).json({
      success: true,
      data: income,
      message: 'Income created successfully'
    });
  } catch (error) {
    console.error('Error creating income:', error);
    next(error);
  }
});

// DELETE /income/:id — delete an income entry
router.delete('/:id', async (req, res, next) => {
  try {
    const income = await Income.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!income) {
      return res.status(404).json({
        success: false,
        message: 'Income not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Income deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// GET /income/export — export income
router.get('/export', async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: []
    });
  } catch (error) {
    next(error);
  }
});

export default router;
