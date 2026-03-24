import groupController, { splitExpenses } from '../controllers/groupController.js';
import { authMiddleware } from '../middleware/index.js';
import { createBaseRouter } from './baseRoute.js';

const router = createBaseRouter('groups', groupController, [authMiddleware]);

// Add custom routes
router.post('/groups/split', authMiddleware, splitExpenses);

export default router;