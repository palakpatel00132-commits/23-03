import { models } from '../models/index.js';
const { User } = models;
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';



export const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // જો req.user હોય તો એની ID, નહીતર 'System'
    const createdBy = req.user && req.user.id ? req.user.id : 'System';

    const user = new User({
      name,
      email,
      password: bcrypt.hashSync(password, 10),
      created_by: createdBy,
    });
    
    await user.save();
    return sendSuccess(res, user, 'User created successfully', 201);
  } catch (error) {
    return sendError(res, 'Error creating user', 500, error);
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, 'User not found', 404);
    }
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return sendError(res, 'Invalid password', 401);
    }
    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: '1h',
    });
    return sendSuccess(res, { token, user: { id: user._id, name: user.name } }, 'Login successful');
  } catch (error) {
    return sendError(res, 'Error logging in', 500, error);
  }
};


export const getUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Fetching users for current user:', userId);

    // બધા યુઝર્સ શોધો (પોતાના સિવાય)
    const users = await User.find({ _id: { $ne: userId } });
    
    return sendSuccess(res, users, 'Users fetched successfully');
  } catch (error) {
    console.error('Error in getUsers:', error);
    return sendError(res, 'Error fetching users', 500, error);
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    if (id === userId) {
      return sendError(res, 'Cannot delete self', 400);
    }
    
    await User.findByIdAndDelete(id);
    return sendSuccess(res, null, 'User deleted successfully');
  } catch (error) {
    return sendError(res, 'Error deleting user', 500, error);
  }
};

export default{
    createUser,
    getUsers,
    deleteUser,
    loginUser,
}
