import mongoose from 'mongoose';

const subtaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
  },
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      required: [true, 'Task description is required'],
      trim: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true,
    },
    department: {
      type: String,
      enum: ['Engineering', 'Design', 'Product', 'Marketing', 'DevOps', 'Operations', 'Executive'],
      default: 'Engineering',
      index: true,
    },
    status: {
      type: String,
      enum: ['pending_acceptance', 'in_progress', 'in_review', 'completed', 'rejected', 'blocked'],
      default: 'pending_acceptance',
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task must be assigned to an employee'],
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task creator is required'],
      index: true,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
      index: true,
    },
    estimatedHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    actualHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    subtasks: [subtaskSchema],
    tags: [{
      type: String,
      trim: true,
    }],
    rejectionReason: {
      type: String,
      trim: true,
      default: '',
    },
    acceptanceNotes: {
      type: String,
      trim: true,
      default: '',
    },
    acceptanceDate: {
      type: Date,
    },
    completionDate: {
      type: Date,
    },
    attachments: [
      {
        name: String,
        url: String,
        type: { type: String, default: 'link' },
      }
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for checklist completion percentage
taskSchema.virtual('progressPercentage').get(function () {
  if (!this.subtasks || this.subtasks.length === 0) {
    return this.status === 'completed' ? 100 : this.status === 'in_progress' ? 30 : 0;
  }
  const completedCount = this.subtasks.filter((st) => st.completed).length;
  return Math.round((completedCount / this.subtasks.length) * 100);
});

// Index for efficient sorting & filtering
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ dueDate: 1, status: 1 });

export const Task = mongoose.model('Task', taskSchema);
