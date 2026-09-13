import { Comment } from '../models/Comment.js';
import { Task } from '../models/Task.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { Notification } from '../models/Notification.js';

export const getTaskComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ task: req.params.taskId })
      .populate('author', 'name email avatar role department')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      comments,
    });
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const { taskId } = req.params;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text cannot be empty' });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const comment = await Comment.create({
      task: taskId,
      author: req.user.id,
      content: content.trim(),
    });

    // Log activity
    await ActivityLog.create({
      task: taskId,
      user: req.user.id,
      action: 'comment_added',
      description: `${req.user.name} commented on "${task.title}"`,
    });

    // Notify the other party
    const recipient =
      req.user.id.toString() === task.createdBy.toString()
        ? task.assignedTo
        : task.createdBy;

    await Notification.create({
      recipient,
      sender: req.user.id,
      task: task._id,
      title: 'New Comment on Task',
      message: `${req.user.name}: "${content.length > 50 ? content.substring(0, 50) + '...' : content}"`,
      type: 'comment_added',
    });

    const populatedComment = await Comment.findById(comment._id).populate(
      'author',
      'name email avatar role department'
    );

    res.status(201).json({
      success: true,
      comment: populatedComment,
      message: 'Comment posted',
    });
  } catch (error) {
    next(error);
  }
};
