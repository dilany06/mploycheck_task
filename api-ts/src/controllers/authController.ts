import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { loadDatabase, saveDatabase } from '../services/xmlDatabase';
import { Role } from '../models/domain';

function sanitizeUser(user: any) {
  const { password, ...safeUser } = user;
  return safeUser;
}

export async function login(req: Request, res: Response): Promise<void> {
  const { userId, password, role } = req.body as { userId?: string; password?: string; role?: Role };
  const db = await loadDatabase();
  const user = db.users.find(
    (item) => item.userId === userId && item.password === password && item.role === role && item.active
  );

  if (!user) {
    res.status(401).json({ message: 'Invalid credentials, role, or inactive user' });
    return;
  }

  const token = uuid();
  db.sessions = db.sessions.filter((session) => session.userId !== user.id);
  db.sessions.push({ token, userId: user.id, createdAt: new Date().toISOString() });
  await saveDatabase(db);

  res.json({ token, user: sanitizeUser(user) });
}

export async function me(req: Request, res: Response): Promise<void> {
  res.json({ user: sanitizeUser(req.currentUser) });
}
