import express from 'express';
import { createTask, getTasks, deleteTask, updateTask } from '../controllers/taskController.js';
import {authMiddleware} from '../middleware/index.js';


const router = express.Router();

router.post('/tasks', authMiddleware, createTask);
router.get('/tasks', authMiddleware, getTasks);
router.delete('/tasks/:id', authMiddleware, deleteTask);
router.put('/tasks/:id', authMiddleware, updateTask);


export default router;
