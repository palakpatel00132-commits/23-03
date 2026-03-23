import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/db.js';
import { User } from '../models/user.js';
import { sendError } from '../utils/responseHandler.js';

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).send({ message: 'No token, authorization denied' });
  }

  // Handle "Bearer <token>" format
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return sendError(res, 'User not found', 401);
    }
    req.user = { id: decoded.id }; // standard format set for controllers
  
    next();
  } catch (err) {
    console.error('JWT Verification Error:', err.message);
    return sendError(res, 'Token is not valid', 401);
  }
};

/**
 * @description Optional authentication middleware
 * Proceed even if no token is provided, but attach user if valid token exists
 */
export const optionalAuth = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return next();
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    // If token is invalid, just proceed without req.user
    next();
  }
};


