import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { Role, User } from '../models/domain';
import { loadDatabase, saveDatabase } from '../services/xmlDatabase';

function sanitize(user: User) {
  const { password, ...safeUser } = user;
  return safeUser;
}

export async function listUsers(_req: Request, res: Response): Promise<void> {
  const db = await loadDatabase();
  res.json({ users: db.users.map(sanitize) });
}

export async function createUser(req: Request, res: Response): Promise<void> {
  const payload = req.body as Partial<User>;
  const db = await loadDatabase();

  if (!payload.userId || !payload.name || !payload.password || !payload.role) {
    res.status(400).json({ message: 'userId, name, password, and role are required' });
    return;
  }

  if (!['General User', 'Admin'].includes(payload.role as Role)) {
    res.status(400).json({ message: 'Role must be General User or Admin' });
    return;
  }

  if (db.users.some((user) => user.userId === payload.userId)) {
    res.status(409).json({ message: 'User ID already exists' });
    return;
  }

  const user: User = {
    id: uuid(),
    userId: payload.userId,
    name: payload.name,
    password: payload.password,
    role: payload.role as Role,
    department: payload.department || 'Unassigned',
    active: payload.active ?? true
  };

  db.users.push(user);
  await saveDatabase(db);
  res.status(201).json({ user: sanitize(user) });
}

export async function updateUser(req: Request, res: Response): Promise<void> {
  const db = await loadDatabase();
  const user = db.users.find((item) => item.id === req.params.id);

  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  Object.assign(user, {
    name: req.body.name ?? user.name,
    role: req.body.role ?? user.role,
    department: req.body.department ?? user.department,
    active: req.body.active ?? user.active
  });

  await saveDatabase(db);
  res.json({ user: sanitize(user) });
}
