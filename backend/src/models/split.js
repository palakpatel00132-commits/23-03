import mongoose from 'mongoose';

export const splitSchema = new mongoose.Schema({
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  splitType: {
    type: String,
    required: true,
  },
});

export const Split = mongoose.model('Split', splitSchema);
