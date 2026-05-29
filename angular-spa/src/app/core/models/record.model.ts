import { Role } from './user.model';

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

export interface RecordResponse {
  role: Role;
  accessNote: string;
  records: WorkRecord[];
}
