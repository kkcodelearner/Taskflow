import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: [
        'created',
        'assigned',
        'reassigned',
        'accepted',
        'rejected',
        'status_changed',
        'subtask_completed',
        'subtask_uncompleted',
        'time_logged',
        'comment_added',
        'updated',
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
