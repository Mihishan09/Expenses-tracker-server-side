import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import Expense from '../models/Expense.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// GET /expense — list all expenses for the authenticated user
router.get('/', async (req, res, next) => {
  try {
    const expenses = await Expense.find({ userId: req.user.id })
      .sort({ date: -1, createdAt: -1 });
    
    res.json(expenses);
  } catch (error) {
    next(error);
  }
});

// POST /expense — create a new expense
router.post('/', async (req, res, next) => {
  try {
    console.log('Creating expense with data:', req.body);
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
    
    const expenseData = {
      ...req.body,
      userId: req.user.id
    };
    
    console.log('Final expense data:', expenseData);
    
    const expense = new Expense(expenseData);
    await expense.save();
    
    console.log('Expense saved successfully:', expense._id);
    
    res.status(201).json({
      success: true,
      data: expense,
      message: 'Expense created successfully'
    });
  } catch (error) {
    console.error('Error creating expense:', error);
    next(error);
  }
});

// DELETE /expense/:id — delete an expense
router.delete('/:id', async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// GET /expense/export — export expenses
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
