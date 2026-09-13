import express from 'express';
import { getActivityFeed } from '../controllers/activityController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.get('/', getActivityFeed);

export default router;
