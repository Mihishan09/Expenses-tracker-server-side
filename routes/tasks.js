import express from 'express';
import Task from '../models/Task.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateTask } from '../middleware/validation.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// GET /tasks — list all tasks for the authenticated user
router.get('/', async (req, res, next) => {
  try {
    const tasks = await Task.find({ userId: req.user.id })
      .sort({ date: -1, createdAt: -1 });
    
    res.json({
      success: true,
      data: tasks,
      count: tasks.length
    });
  } catch (error) {
    next(error);
  }
});

// POST /tasks — create a new task
router.post('/', validateTask, async (req, res, next) => {
  try {
    const taskData = {
      ...req.body,
      userId: req.user.id
    };
    
    const task = new Task(taskData);
    await task.save();
    
    res.status(201).json({
      success: true,
      data: task,
      message: 'Task created successfully'
    });
  } catch (error) {
    next(error);
  }
});

// PUT /tasks/:id — update a task
router.put('/:id', validateTask, async (req, res, next) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    res.json({
      success: true,
      data: task,
      message: 'Task updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /tasks/:id — delete a task
router.delete('/:id', async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// GET /tasks/:id — get a specific task
router.get('/:id', async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
});

export default router;
