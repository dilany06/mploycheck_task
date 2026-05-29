import { NextFunction, Request, Response } from 'express';
import { Role, User } from '../models/domain';
import { loadDatabase } from '../services/xmlDatabase';

declare global {
  namespace Express {
    interface Request {
      currentUser?: User;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = req.header('authorization')?.replace('Bearer ', '');
  if (!token) {
    res.status(401).json({ message: 'Missing bearer token' });
    return;
  }

  const db = await loadDatabase();
  const session = db.sessions.find((item) => item.token === token);
  const user = db.users.find((item) => item.id === session?.userId && item.active);

  if (!session || !user) {
    res.status(401).json({ message: 'Session expired or user inactive' });
    return;
  }

  req.currentUser = user;
  next();
}

export function requireRole(role: Role) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.currentUser?.role !== role) {
      res.status(403).json({ message: `${role} access required` });
      return;
    }

    next();
  };
}
