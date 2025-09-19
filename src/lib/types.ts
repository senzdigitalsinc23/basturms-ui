export type Role =
  | 'Admin'
  | 'Teacher'
  | 'Student'
  | 'Parent'
  | 'Headmaster'
  | 'Librarian'
  | 'Security'
  | 'Procurement Manager'
  | 'Stores Manager'
  | 'Proprietor'
  | 'I.T Manager'
  | 'I.T Support';

export const ALL_ROLES: Role[] = [
  'Admin',
  'Teacher',
  'Student',
  'Parent',
  'Headmaster',
  'Librarian',
  'Security',
  'Procurement Manager',
  'Stores Manager',
  'Proprietor',
  'I.T Manager',
  'I.T Support',
];

export interface RoleStorage {
  id: string;
  name: Role;
}

export interface User {
  id: string; // Will be used as user_id as well
  name: string;
  username: string;
  email: string;
  role: Role; // For easy access in the app
  role_id: string;
  avatarUrl: string;
  is_super_admin: boolean;
  status: 'active' | 'frozen';
  created_at: string;
  updated_at: string;
  password?: string;
}

export interface UserStorage extends Omit<User, 'role'> {}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string; // user email
  name: string; // user's full name
  action: string;
  details: string;
}
