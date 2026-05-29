import express from 'express';
import { protect } from '../middleware/auth.js';
import { Lead } from '../models/Lead.js';
import { Task } from '../models/Task.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.get(
  '/summary',
  protect,
  asyncHandler(async (_req, res) => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const [leadStats, taskStats] = await Promise.all([
      Lead.aggregate([
        { $match: { isDeleted: false } },
        {
          $group: {
            _id: null,
            totalLeads: { $sum: 1 },
            qualifiedLeads: { $sum: { $cond: [{ $eq: ['$status', 'Qualified'] }, 1, 0] } }
          }
        }
      ]),
      Task.aggregate([
        {
          $group: {
            _id: null,
            tasksDueToday: {
              $sum: {
                $cond: [
                  { $and: [{ $gte: ['$dueDate', start] }, { $lt: ['$dueDate', end] }] },
                  1,
                  0
                ]
              }
            },
            completedTasks: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } }
          }
        }
      ])
    ]);

    res.json({
      totalLeads: leadStats[0]?.totalLeads || 0,
      qualifiedLeads: leadStats[0]?.qualifiedLeads || 0,
      tasksDueToday: taskStats[0]?.tasksDueToday || 0,
      completedTasks: taskStats[0]?.completedTasks || 0
    });
  })
);

export default router;
