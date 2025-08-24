import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import taskRoutes from './routes/tasks.js';
import authRoutes from './routes/auth.js';
import expenseRoutes from './routes/expense.js';
import incomeRoutes from './routes/income.js';
import dashboardRoutes from './routes/dashboard.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(path.dirname(fileURLToPath(import.meta.url)), 'uploads')));

// Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRoutes);
app.use('/expense', expenseRoutes);
app.use('/income', incomeRoutes);
app.use('/dashboard', dashboardRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Simple Expense Tracker API is running!' });
});

// Test endpoint for debugging
app.post('/api/test-signup', (req, res) => {
  console.log('Test signup endpoint hit');
  console.log('Request body:', req.body);
  console.log('Content-Type:', req.headers['content-type']);
  res.json({ 
    message: 'Test endpoint working',
    receivedData: req.body,
    headers: req.headers
  });
});

// Error handling middleware
app.use(errorHandler);

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI;
console.log('Attempting to connect to MongoDB at:');

mongoose.connect(mongoURI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`JWT Secret configured: ${process.env.JWT_SECRET ? 'Yes' : 'No'}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

export default app;
