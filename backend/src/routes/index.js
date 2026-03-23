import express from 'express';
import taskRoutes from './taskRoutes.js';
import userRoutes from './userRoutes.js';
import groupRoutes from './groupRoutes.js';

const router = express.Router();

/**
 * @description Combine all routes here
 */
router.use(taskRoutes);
router.use(userRoutes);
router.use(groupRoutes);

export default router;
