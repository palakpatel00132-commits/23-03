import express from 'express';
import { createGroup, getGroups, deleteGroup, updateGroup, splitExpenses } from '../controllers/groupController.js';

import {authMiddleware} from '../middleware/index.js';

const router = express.Router();

router.post('/groups', authMiddleware, createGroup);
router.get('/groups', authMiddleware, getGroups);
router.delete('/groups/:id', authMiddleware, deleteGroup);
router.put('/groups/:id', authMiddleware, updateGroup);
router.post('/groups/split', authMiddleware, splitExpenses);

export default router;