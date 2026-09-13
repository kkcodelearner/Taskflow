import express from 'express';
import { getEmployees, getAllUsers, createUser, toggleUserStatus } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/employees', getEmployees);
router.get('/all', authorize('admin'), getAllUsers);
router.post('/', authorize('admin'), createUser);
router.patch('/:id/status', authorize('admin'), toggleUserStatus);

export default router;
