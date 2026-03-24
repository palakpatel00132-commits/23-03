import { authMiddleware, optionalAuth } from '../middleware/index.js';
import taskController from '../controllers/taskController.js';
import { createBaseRouter } from './baseRoute.js';

// 'getAll' માટે optionalAuth વાપરીશું જેથી જો ટોકન હોય તો ફિલ્ટર થાય, નહીતર બધા દેખાય
const router = createBaseRouter('tasks', taskController, {
  all: [authMiddleware],
  getAll: [optionalAuth]
});

export default router;
