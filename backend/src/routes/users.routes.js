import express from 'express';
import { protect } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.get(
  '/',
  protect,
  asyncHandler(async (_req, res) => {
    const users = await User.find({ isActive: true }).select('name email role').sort({ name: 1 });
    res.json(users);
  })
);

export default router;
