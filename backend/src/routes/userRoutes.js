import express from 'express';
import { createUser, getUsers, deleteUser, loginUser } from '../controllers/userController.js';
import {authMiddleware, optionalAuth} from '../middleware/index.js';

const router = express.Router();


router.post('/users', optionalAuth, createUser);
router.get('/users', authMiddleware, getUsers);
router.delete('/users/:id', authMiddleware, deleteUser);
router.post('/login', loginUser);

export default router;
