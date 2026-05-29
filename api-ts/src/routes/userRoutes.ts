import { Router } from 'express';
import { createUser, listUsers, updateUser } from '../controllers/usersController';
import { requireAuth, requireRole } from '../middleware/auth';

export const userRoutes = Router();

userRoutes.use(requireAuth, requireRole('Admin'));
userRoutes.get('/', listUsers);
userRoutes.post('/', createUser);
userRoutes.patch('/:id', updateUser);
