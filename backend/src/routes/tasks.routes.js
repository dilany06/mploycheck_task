import express from 'express';
import { protect } from '../middleware/auth.js';
import { Lead } from '../models/Lead.js';
import { Task, TASK_STATUSES } from '../models/Task.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.get(
  '/',
  protect,
  asyncHandler(async (_req, res) => {
    const tasks = await Task.find()
      .populate('lead', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ dueDate: 1 });
    res.json(tasks);
  })
);

router.post(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const { title, description, lead, assignedTo, dueDate, status } = req.body;

    if (!title || !lead || !assignedTo || !dueDate) {
      return res.status(400).json({ message: 'Title, lead, assigned user, and due date are required' });
    }
    if (status && !TASK_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid task status' });
    }

    const [leadExists, userExists] = await Promise.all([
      Lead.exists({ _id: lead, isDeleted: false }),
      User.exists({ _id: assignedTo, isActive: true })
    ]);

    if (!leadExists || !userExists) {
      return res.status(400).json({ message: 'Lead or assigned user was not found' });
    }

    const task = await Task.create({ title, description, lead, assignedTo, dueDate, status });
    const populated = await task.populate([
      { path: 'lead', select: 'name email' },
      { path: 'assignedTo', select: 'name email' }
    ]);
    res.status(201).json(populated);
  })
);

router.patch(
  '/:id/status',
  protect,
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    if (!TASK_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid task status' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the assigned user can update this task status' });
    }

    task.status = status;
    await task.save();

    const populated = await task.populate([
      { path: 'lead', select: 'name email' },
      { path: 'assignedTo', select: 'name email' }
    ]);
    res.json(populated);
  })
);

export default router;
