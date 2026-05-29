import fs from 'fs/promises';
import path from 'path';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { Database, Session, User, WorkRecord } from '../models/domain';

const dataFile = path.join(__dirname, '../../data/minicrm.xml');

const seed: Database = {
  users: [
    {
      id: 'u-admin',
      userId: 'admin',
      name: 'Aarav Mehta',
      password: 'Admin@123',
      role: 'Admin',
      department: 'Operations',
      active: true
    },
    {
      id: 'u-general',
      userId: 'general',
      name: 'Nisha Rao',
      password: 'User@123',
      role: 'General User',
      department: 'Field Sales',
      active: true
    }
  ],
  records: [
    {
      id: 'r-1001',
      ownerId: 'u-general',
      customer: 'Northwind Retail',
      opportunity: 'Device onboarding pilot',
      value: 180000,
      status: 'Open',
      accessLevel: 'General User',
      updatedAt: '2026-05-17T10:30:00.000Z'
    },
    {
      id: 'r-1002',
      ownerId: 'u-admin',
      customer: 'Contoso Health',
      opportunity: 'Admin-only account audit',
      value: 420000,
      status: 'Review',
      accessLevel: 'Admin',
      updatedAt: '2026-05-18T08:00:00.000Z'
    },
    {
      id: 'r-1003',
      ownerId: 'u-general',
      customer: 'Bluepine Finance',
      opportunity: 'Shared workflow rollout',
      value: 260000,
      status: 'Won',
      accessLevel: 'Shared',
      updatedAt: '2026-05-20T14:15:00.000Z'
    }
  ],
  sessions: []
};

const parser = new XMLParser({
  ignoreAttributes: false,
  parseAttributeValue: true,
  isArray: (_name, pathName) => ['db.users.user', 'db.records.record', 'db.sessions.session'].includes(pathName)
});

const builder = new XMLBuilder({
  ignoreAttributes: false,
  format: true,
  suppressEmptyNode: true
});

async function ensureDataFile(): Promise<void> {
  await fs.mkdir(path.dirname(dataFile), { recursive: true });
  try {
    await fs.access(dataFile);
  } catch {
    await saveDatabase(seed);
  }
}

function normalize<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export async function loadDatabase(): Promise<Database> {
  await ensureDataFile();
  const xml = await fs.readFile(dataFile, 'utf-8');
  const parsed = parser.parse(xml).db ?? {};

  return {
    users: normalize<User>(parsed.users?.user),
    records: normalize<WorkRecord>(parsed.records?.record),
    sessions: normalize<Session>(parsed.sessions?.session)
  };
}

export async function saveDatabase(db: Database): Promise<void> {
  const xml = builder.build({
    db: {
      users: { user: db.users },
      records: { record: db.records },
      sessions: { session: db.sessions }
    }
  });
  await fs.writeFile(dataFile, xml, 'utf-8');
}
