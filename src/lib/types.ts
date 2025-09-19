export type Role = 'Admin' | 'Teacher' | 'Student' | 'Parent';

export const ROLES: Role[] = ['Admin', 'Teacher', 'Student', 'Parent'];

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl: string;
  password?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}
