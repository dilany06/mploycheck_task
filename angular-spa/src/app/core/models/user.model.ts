export type Role = 'General User' | 'Admin';

export interface User {
  id: string;
  userId: string;
  name: string;
  role: Role;
  department: string;
  active: boolean;
}

export interface LoginRequest {
  userId: string;
  password: string;
  role: Role;
}

export interface LoginResponse {
  token: string;
  user: User;
}
