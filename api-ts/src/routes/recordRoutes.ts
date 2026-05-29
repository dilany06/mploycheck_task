import { Router } from 'express';
import { listRecords } from '../controllers/recordsController';
import { requireAuth } from '../middleware/auth';

export const recordRoutes = Router();

recordRoutes.get('/', requireAuth, listRecords);
