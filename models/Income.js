import mongoose from 'mongoose';

const incomeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other']
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  source: {
    type: String,
    required: false,
    trim: true,
    default: 'Unknown'
  },
  frequency: {
    type: String,
    enum: ['One-time', 'Weekly', 'Bi-weekly', 'Monthly', 'Quarterly', 'Yearly'],
    default: 'One-time'
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index for efficient queries
incomeSchema.index({ userId: 1, date: -1 });
incomeSchema.index({ userId: 1, category: 1 });

const Income = mongoose.model('Income', incomeSchema);

export default Income;
