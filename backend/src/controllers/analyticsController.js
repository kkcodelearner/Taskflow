import { Task } from '../models/Task.js';
import { User } from '../models/User.js';

export const getDashboardAnalytics = async (req, res, next) => {
  try {
    const isEmployee = req.user.role === 'employee';
    const baseFilter = isEmployee ? { assignedTo: req.user.id } : {};

    const [
      totalTasks,
      pendingTasks,
      inProgressTasks,
      inReviewTasks,
      completedTasks,
      rejectedTasks,
      allTasks,
    ] = await Promise.all([
      Task.countDocuments(baseFilter),
      Task.countDocuments({ ...baseFilter, status: 'pending_acceptance' }),
      Task.countDocuments({ ...baseFilter, status: 'in_progress' }),
      Task.countDocuments({ ...baseFilter, status: 'in_review' }),
      Task.countDocuments({ ...baseFilter, status: 'completed' }),
      Task.countDocuments({ ...baseFilter, status: 'rejected' }),
      Task.find(baseFilter).select('dueDate status priority department estimatedHours actualHours assignedTo'),
    ]);

    const now = new Date();
    const overdueTasks = allTasks.filter(
      (t) => t.status !== 'completed' && new Date(t.dueDate) < now
    ).length;

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Priority breakdown
    const priorityCounts = {
      urgent: 0,
      high: 0,
      medium: 0,
      low: 0,
    };
    allTasks.forEach((t) => {
      if (priorityCounts[t.priority] !== undefined) {
        priorityCounts[t.priority]++;
      }
    });

    // Department breakdown
    const departmentCounts = {};
    allTasks.forEach((t) => {
      const dept = t.department || 'Other';
      departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
    });

    // Total estimated vs actual logged hours
    let totalEstimated = 0;
    let totalActual = 0;
    allTasks.forEach((t) => {
      totalEstimated += t.estimatedHours || 0;
      totalActual += t.actualHours || 0;
    });

    // Team workload (if Admin)
    let teamWorkload = [];
    if (!isEmployee) {
      const employees = await User.find({ role: 'employee', status: 'active' }).select('name department avatar title');
      teamWorkload = employees.map((emp) => {
        const empTasks = allTasks.filter((t) => t.assignedTo && t.assignedTo.toString() === emp._id.toString());
        const active = empTasks.filter((t) => ['pending_acceptance', 'in_progress', 'in_review'].includes(t.status)).length;
        const done = empTasks.filter((t) => t.status === 'completed').length;
        const overdue = empTasks.filter((t) => t.status !== 'completed' && new Date(t.dueDate) < now).length;
        return {
          id: emp._id,
          name: emp.name,
          department: emp.department,
          avatar: emp.avatar,
          title: emp.title,
          activeTasks: active,
          completedTasks: done,
          overdueTasks: overdue,
          totalAssigned: empTasks.length,
        };
      });
    }

    res.json({
      success: true,
      data: {
        summary: {
          totalTasks,
          pendingTasks,
          inProgressTasks,
          inReviewTasks,
          completedTasks,
          rejectedTasks,
          overdueTasks,
          completionRate,
          totalEstimatedHours: totalEstimated,
          totalActualHours: totalActual,
        },
        priorityBreakdown: priorityCounts,
        departmentBreakdown: departmentCounts,
        teamWorkload,
      },
    });
  } catch (error) {
    next(error);
  }
};
