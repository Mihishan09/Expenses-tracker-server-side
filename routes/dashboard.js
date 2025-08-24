import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import mongoose from 'mongoose';
import Expense from '../models/Expense.js';
import Income from '../models/Income.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// GET /dashboard — get dashboard summary data
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get total income and expenses
    const [totalIncome, totalExpense] = await Promise.all([
      Income.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Expense.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);
    
    // Get recent income and expenses (last 5 entries)
    const [recentIncome, recentExpenses] = await Promise.all([
      Income.find({ userId })
        .sort({ date: -1 })
        .limit(5)
        .select('amount description category date'),
      Expense.find({ userId })
        .sort({ date: -1 })
        .limit(5)
        .select('amount description category date')
    ]);
    
    const dashboardData = {
      totalIncome: totalIncome[0]?.total || 0,
      totalExpense: totalExpense[0]?.total || 0,
      recentIncome,
      recentExpenses
    };
    
    res.json(dashboardData);
  } catch (error) {
    next(error);
  }
});

export default router;
