import { ActivityLog } from '../models/ActivityLog.js';

export const getActivityFeed = async (req, res, next) => {
  try {
    const { limit = 50, taskId } = req.query;
    const filter = {};

    if (taskId) {
      filter.task = taskId;
    }

    const activities = await ActivityLog.find(filter)
      .populate('user', 'name email avatar role department')
      .populate('task', 'title priority status')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json({
      success: true,
      count: activities.length,
      activities,
    });
  } catch (error) {
    next(error);
  }
};
