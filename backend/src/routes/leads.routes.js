import express from 'express';
import mongoose from 'mongoose';
import { protect } from '../middleware/auth.js';
import { Company } from '../models/Company.js';
import { Lead, LEAD_STATUSES } from '../models/Lead.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

function buildLeadFilter(query) {
  const filter = { isDeleted: false };

  if (query.status) filter.status = query.status;
  if (query.assignedTo && mongoose.isValidObjectId(query.assignedTo)) filter.assignedTo = query.assignedTo;
  if (query.company && mongoose.isValidObjectId(query.company)) filter.company = query.company;
  if (query.search) {
    const search = new RegExp(query.search.trim(), 'i');
    filter.$or = [{ name: search }, { email: search }, { phone: search }];
  }

  return filter;
}

router.get(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const filter = buildLeadFilter(req.query);

    const [items, total] = await Promise.all([
      Lead.find(filter)
        .populate('assignedTo', 'name email')
        .populate('company', 'name')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Lead.countDocuments(filter)
    ]);

    res.json({ items, page, pages: Math.ceil(total / limit) || 1, total });
  })
);

router.post(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const { name, email, phone, status, assignedTo, company } = req.body;

    if (!name || !email || !phone || !assignedTo || !company) {
      return res.status(400).json({ message: 'Name, email, phone, assigned user, and company are required' });
    }
    if (status && !LEAD_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid lead status' });
    }

    const [userExists, companyExists] = await Promise.all([
      User.exists({ _id: assignedTo, isActive: true }),
      Company.exists({ _id: company })
    ]);

    if (!userExists || !companyExists) {
      return res.status(400).json({ message: 'Assigned user or company was not found' });
    }

    const lead = await Lead.create({ name, email, phone, status, assignedTo, company });
    const populated = await lead.populate([
      { path: 'assignedTo', select: 'name email' },
      { path: 'company', select: 'name' }
    ]);
    res.status(201).json(populated);
  })
);

router.get(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    const lead = await Lead.findOne({ _id: req.params.id, isDeleted: false })
      .populate('assignedTo', 'name email')
      .populate('company', 'name');

    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  })
);

router.put(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    const allowed = ['name', 'email', 'phone', 'status', 'assignedTo', 'company'];
    const payload = {};

    allowed.forEach((key) => {
      if (req.body[key] !== undefined) payload[key] = req.body[key];
    });

    if (payload.status && !LEAD_STATUSES.includes(payload.status)) {
      return res.status(400).json({ message: 'Invalid lead status' });
    }

    const lead = await Lead.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, payload, {
      new: true,
      runValidators: true
    })
      .populate('assignedTo', 'name email')
      .populate('company', 'name');

    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  })
);

router.patch(
  '/:id/status',
  protect,
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    if (!LEAD_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid lead status' });
    }

    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { status },
      { new: true, runValidators: true }
    )
      .populate('assignedTo', 'name email')
      .populate('company', 'name');

    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  })
);

router.delete(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json({ message: 'Lead deleted' });
  })
);

export default router;
