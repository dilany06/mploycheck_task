import express from 'express';
import { protect } from '../middleware/auth.js';
import { Company } from '../models/Company.js';
import { Lead } from '../models/Lead.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.get(
  '/',
  protect,
  asyncHandler(async (_req, res) => {
    const companies = await Company.find().sort({ name: 1 });
    res.json(companies);
  })
);

router.post(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const { name, industry, location, website } = req.body;
    if (!name || !industry || !location) {
      return res.status(400).json({ message: 'Company name, industry, and location are required' });
    }

    const company = await Company.create({ name, industry, location, website });
    res.status(201).json(company);
  })
);

router.get(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    const leads = await Lead.find({ company: company._id, isDeleted: false })
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json({ company, leads });
  })
);

export default router;
