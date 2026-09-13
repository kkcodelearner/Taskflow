import { Task } from '../models/Task.js';
import { User } from '../models/User.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { Notification } from '../models/Notification.js';

export const createTask = async (req, res, next) => {
  try {
    const {
      title,
      description,
      priority,
      department,
      assignedTo,
      dueDate,
      estimatedHours,
      subtasks,
      tags,
    } = req.body;

    const assignee = await User.findById(assignedTo);
    if (!assignee) {
      return res.status(404).json({ success: false, message: 'Assigned employee not found' });
    }

    const formattedSubtasks = (subtasks || []).map((st) => ({
      title: typeof st === 'string' ? st : st.title,
      completed: false,
    }));

    const task = await Task.create({
      title,
      description,
      priority: priority || 'medium',
      department: department || assignee.department || 'Engineering',
      assignedTo,
      createdBy: req.user.id,
      dueDate,
      estimatedHours: Number(estimatedHours) || 0,
      subtasks: formattedSubtasks,
      tags: tags || [],
      status: 'pending_acceptance',
    });

    // Create activity log
    await ActivityLog.create({
      task: task._id,
      user: req.user.id,
      action: 'created',
      description: `Task created by ${req.user.name} and assigned to ${assignee.name}`,
    });

    // Notify assignee
    await Notification.create({
      recipient: assignee._id,
      sender: req.user.id,
      task: task._id,
      title: 'New Task Assignment',
      message: `You have been assigned to: "${task.title}". Please review and accept or decline.`,
      type: 'task_assigned',
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar title department')
      .populate('createdBy', 'name email avatar');

    res.status(201).json({
      success: true,
      task: populatedTask,
      message: 'Task created and assigned successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getTasks = async (req, res, next) => {
  try {
    const {
      status,
      priority,
      department,
      assignedTo,
      search,
      scope,
      sortBy = 'dueDate',
      sortOrder = 'asc',
    } = req.query;

    const filter = {};

    // Scope check: If employee requests scope=my, or by default for employee if they choose to view only their tasks
    if (scope === 'my' || (req.user.role === 'employee' && scope !== 'all')) {
      filter.assignedTo = req.user.id;
    } else if (assignedTo) {
      filter.assignedTo = assignedTo;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (priority && priority !== 'all') {
      filter.priority = priority;
    }

    if (department && department !== 'all') {
      filter.department = department;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const sortOptions = {};
    if (sortBy === 'priority') {
      // Map priority to sorting order or sort by date
      sortOptions.createdAt = -1;
    } else {
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email avatar title department')
      .populate('createdBy', 'name email avatar')
      .sort(sortOptions);

    res.json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email avatar title department')
      .populate('createdBy', 'name email avatar')
      .populate('subtasks.completedBy', 'name email avatar');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Fetch activity logs for this task
    const activityLogs = await ActivityLog.find({ task: task._id })
      .populate('user', 'name email avatar role')
      .sort({ createdAt: -1 })
      .limit(30);

    res.json({
      success: true,
      task,
      activityLogs,
    });
  } catch (error) {
    next(error);
  }
};

export const acceptTask = async (req, res, next) => {
  try {
    const { acceptanceNotes } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Check authorization: must be assigned employee or admin
    if (req.user.role !== 'admin' && task.assignedTo.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to accept this task' });
    }

    task.status = 'in_progress';
    task.acceptanceDate = new Date();
    task.acceptanceNotes = acceptanceNotes || 'Accepted and commenced work';
    task.rejectionReason = ''; // Clear previous rejection if re-accepting
    await task.save();

    // Log activity
    await ActivityLog.create({
      task: task._id,
      user: req.user.id,
      action: 'accepted',
      description: `${req.user.name} accepted the task assignment. Status updated to In Progress.`,
      metadata: { acceptanceNotes: task.acceptanceNotes },
    });

    // Notify creator / admin
    if (task.createdBy.toString() !== req.user.id.toString()) {
      await Notification.create({
        recipient: task.createdBy,
        sender: req.user.id,
        task: task._id,
        title: 'Task Accepted',
        message: `${req.user.name} accepted the task: "${task.title}".`,
        type: 'task_accepted',
      });
    }

    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar title department')
      .populate('createdBy', 'name email avatar');

    res.json({
      success: true,
      message: 'Task accepted successfully. Commenced In Progress status.',
      task: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

export const rejectTask = async (req, res, next) => {
  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason || rejectionReason.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'A clear reason for declining the task is required (at least 5 characters)',
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (req.user.role !== 'admin' && task.assignedTo.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to decline this task' });
    }

    task.status = 'rejected';
    task.rejectionReason = rejectionReason.trim();
    await task.save();

    // Log activity
    await ActivityLog.create({
      task: task._id,
      user: req.user.id,
      action: 'rejected',
      description: `${req.user.name} declined task assignment. Reason: "${task.rejectionReason}"`,
      metadata: { reason: task.rejectionReason },
    });

    // High priority notification to task creator / admin
    await Notification.create({
      recipient: task.createdBy,
      sender: req.user.id,
      task: task._id,
      title: 'Task Assignment Declined',
      message: `${req.user.name} declined "${task.title}". Reason: ${task.rejectionReason}`,
      type: 'task_rejected',
    });

    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar title department')
      .populate('createdBy', 'name email avatar');

    res.json({
      success: true,
      message: 'Task declined. The administrator has been notified with your reason.',
      task: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const {
      title,
      description,
      priority,
      department,
      status,
      assignedTo,
      dueDate,
      estimatedHours,
      actualHours,
      tags,
    } = req.body;

    const previousStatus = task.status;
    const previousAssignee = task.assignedTo.toString();

    if (req.user.role === 'admin') {
      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (priority !== undefined) task.priority = priority;
      if (department !== undefined) task.department = department;
      if (dueDate !== undefined) task.dueDate = dueDate;
      if (estimatedHours !== undefined) task.estimatedHours = Number(estimatedHours);
      if (tags !== undefined) task.tags = tags;

      // Reassigning
      if (assignedTo && assignedTo.toString() !== previousAssignee) {
        task.assignedTo = assignedTo;
        task.status = 'pending_acceptance'; // requires new acceptance
        const newAssignee = await User.findById(assignedTo);

        await ActivityLog.create({
          task: task._id,
          user: req.user.id,
          action: 'reassigned',
          description: `Task reassigned to ${newAssignee ? newAssignee.name : assignedTo} by ${req.user.name}`,
        });

        await Notification.create({
          recipient: assignedTo,
          sender: req.user.id,
          task: task._id,
          title: 'Task Reassigned to You',
          message: `You have been assigned: "${task.title}". Please accept or decline.`,
          type: 'task_assigned',
        });
      }
    }

    // Status updates (allowed by assigned employee or admin)
    if (status && status !== previousStatus) {
      task.status = status;

      if (status === 'completed') {
        task.completionDate = new Date();
      }

      await ActivityLog.create({
        task: task._id,
        user: req.user.id,
        action: 'status_changed',
        description: `Status transitioned from '${previousStatus}' to '${status}' by ${req.user.name}`,
      });

      // Notify the other party
      const notifyTarget =
        req.user.id.toString() === task.createdBy.toString()
          ? task.assignedTo
          : task.createdBy;

      await Notification.create({
        recipient: notifyTarget,
        sender: req.user.id,
        task: task._id,
        title: `Task Status: ${status.replace('_', ' ').toUpperCase()}`,
        message: `${req.user.name} changed status of "${task.title}" to ${status.replace('_', ' ')}.`,
        type: status === 'completed' ? 'task_completed' : 'system',
      });
    }

    if (actualHours !== undefined) {
      task.actualHours = Number(actualHours);
    }

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar title department')
      .populate('createdBy', 'name email avatar');

    res.json({
      success: true,
      task: updatedTask,
      message: 'Task updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const toggleSubtask = async (req, res, next) => {
  try {
    const { subtaskId } = req.params;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const subtask = task.subtasks.id(subtaskId);
    if (!subtask) {
      return res.status(404).json({ success: false, message: 'Subtask item not found' });
    }

    subtask.completed = !subtask.completed;
    subtask.completedAt = subtask.completed ? new Date() : null;
    subtask.completedBy = subtask.completed ? req.user.id : null;

    // Check if all subtasks completed, recommend review or complete
    const allCompleted = task.subtasks.every((st) => st.completed);

    await task.save();

    await ActivityLog.create({
      task: task._id,
      user: req.user.id,
      action: subtask.completed ? 'subtask_completed' : 'subtask_uncompleted',
      description: `${req.user.name} marked checklist item "${subtask.title}" as ${subtask.completed ? 'complete' : 'incomplete'}`,
    });

    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar title department')
      .populate('createdBy', 'name email avatar')
      .populate('subtasks.completedBy', 'name email avatar');

    res.json({
      success: true,
      task: updatedTask,
      allSubtasksCompleted: allCompleted,
      message: `Checklist item updated`,
    });
  } catch (error) {
    next(error);
  }
};

export const addSubtask = async (req, res, next) => {
  try {
    const { title } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Subtask title cannot be empty' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task.subtasks.push({ title: title.trim(), completed: false });
    await task.save();

    await ActivityLog.create({
      task: task._id,
      user: req.user.id,
      action: 'updated',
      description: `${req.user.name} added checklist item: "${title.trim()}"`,
    });

    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar title department')
      .populate('createdBy', 'name email avatar');

    res.json({
      success: true,
      task: updatedTask,
      message: 'Checklist item added',
    });
  } catch (error) {
    next(error);
  }
};

export const logTime = async (req, res, next) => {
  try {
    const { hours, note } = req.body;
    const additionalHours = parseFloat(hours);

    if (isNaN(additionalHours) || additionalHours <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide valid positive hours' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task.actualHours = (task.actualHours || 0) + additionalHours;
    await task.save();

    await ActivityLog.create({
      task: task._id,
      user: req.user.id,
      action: 'time_logged',
      description: `${req.user.name} logged ${additionalHours}h work. ${note ? `Note: "${note}"` : ''}`,
      metadata: { loggedHours: additionalHours, totalHours: task.actualHours },
    });

    res.json({
      success: true,
      actualHours: task.actualHours,
      message: `${additionalHours} hours logged successfully`,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await Task.findByIdAndDelete(req.params.id);
    await ActivityLog.deleteMany({ task: req.params.id });
    await Notification.deleteMany({ task: req.params.id });

    res.json({
      success: true,
      message: 'Task and related history deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
