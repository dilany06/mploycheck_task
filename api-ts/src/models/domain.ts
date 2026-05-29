export type Role = 'General User' | 'Admin';

export interface User {
  id: string;
  userId: string;
  name: string;
  password: string;
  role: Role;
  department: string;
  active: boolean;
}

export interface WorkRecord {
  id: string;
  ownerId: string;
  customer: string;
  opportunity: string;
  value: number;
  status: 'Open' | 'Review' | 'Won' | 'Blocked';
  accessLevel: Role | 'Shared';
  updatedAt: string;
}

export interface Session {
  token: string;
  userId: string;
  createdAt: string;
}

export interface Database {
  users: User[];
  records: WorkRecord[];
  sessions: Session[];
}
