import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  created_by: {
    type: mongoose.Schema.Types.Mixed, // ObjectId અથવા String (System) બંને માટે
    ref: 'User',
  },
});

export const User = mongoose.model('User', userSchema);
