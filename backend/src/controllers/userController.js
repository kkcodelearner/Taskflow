import { User } from '../models/User.js';
import { Task } from '../models/Task.js';

export const getEmployees = async (req, res, next) => {
  try {
    const employees = await User.find({ role: 'employee', status: 'active' })
      .select('name email department title avatar status')
      .sort({ name: 1 });

    // Attach active task count for workload calculation
    const employeesWithWorkload = await Promise.all(
      employees.map(async (emp) => {
        const activeTasksCount = await Task.countDocuments({
          assignedTo: emp._id,
          status: { $in: ['pending_acceptance', 'in_progress', 'in_review'] },
        });
        const completedTasksCount = await Task.countDocuments({
          assignedTo: emp._id,
          status: 'completed',
        });
        return {
          ...emp.toObject(),
          activeTasksCount,
          completedTasksCount,
        };
      })
    );

    res.json({
      success: true,
      employees: employeesWithWorkload,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ role: 1, name: 1 });

    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        const activeTasks = await Task.countDocuments({
          assignedTo: u._id,
          status: { $in: ['pending_acceptance', 'in_progress', 'in_review'] },
        });
        const completedTasks = await Task.countDocuments({
          assignedTo: u._id,
          status: 'completed',
        });
        return {
          ...u.toObject(),
          activeTasks,
          completedTasks,
        };
      })
    );

    res.json({
      success: true,
      users: usersWithStats,
    });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, department, title } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password: password || 'TaskFlow123!',
      role: role || 'employee',
      department: department || 'Engineering',
      title: title || 'Team Member',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    });

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        title: user.title,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user._id.toString() === req.user.id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot deactivate your own account' });
    }

    user.status = user.status === 'active' ? 'inactive' : 'active';
    await user.save();

    res.json({
      success: true,
      message: `User status updated to ${user.status}`,
      user: {
        id: user._id,
        name: user.name,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};
