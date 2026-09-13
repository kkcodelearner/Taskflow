import express from 'express';
import {
  createTask,
  getTasks,
  getTaskById,
  acceptTask,
  rejectTask,
  updateTask,
  toggleSubtask,
  addSubtask,
  logTime,
  deleteTask,
} from '../controllers/taskController.js';
import { getTaskComments, addComment } from '../controllers/commentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getTasks)
  .post(authorize('admin'), createTask);

router.route('/:id')
  .get(getTaskById)
  .patch(updateTask)
  .delete(authorize('admin'), deleteTask);

router.post('/:id/accept', acceptTask);
router.post('/:id/reject', rejectTask);
router.patch('/:id/subtasks/:subtaskId', toggleSubtask);
router.post('/:id/subtasks', addSubtask);
router.post('/:id/log-time', logTime);

// Comments sub-routes
router.route('/:taskId/comments')
  .get(getTaskComments)
  .post(addComment);

export default router;
