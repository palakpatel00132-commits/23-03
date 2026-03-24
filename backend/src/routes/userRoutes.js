import express from 'express';
import { createUser, getUsers, deleteUser, loginUser, refreshToken, logoutUser } from '../controllers/userController.js';
import {authMiddleware, optionalAuth} from '../middleware/index.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();


router.post('/users', optionalAuth, authLimiter, createUser);
router.get('/users', authMiddleware, getUsers);
router.delete('/users/:id', authMiddleware, deleteUser);
router.post('/login', authLimiter, loginUser);
router.post('/refresh-token', refreshToken);
router.post('/logout', logoutUser);

export default router;
