import { Request, Response } from 'express';
import { loadDatabase } from '../services/xmlDatabase';

export async function listRecords(req: Request, res: Response): Promise<void> {
  const db = await loadDatabase();
  const user = req.currentUser!;
  const records =
    user.role === 'Admin'
      ? db.records
      : db.records.filter((record) => record.ownerId === user.id || record.accessLevel === 'Shared');

  res.json({
    role: user.role,
    accessNote:
      user.role === 'Admin'
        ? 'Admin can view every record in the XML data store.'
        : 'General User can view owned and shared records only.',
    records
  });
}
