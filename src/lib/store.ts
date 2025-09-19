'use client';

import { User, AuditLog, Role } from './types';

const USERS_KEY = 'campusconnect_users';
const LOGS_KEY = 'campusconnect_logs';

const getInitialUsers = (): User[] => [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@campus.com',
    password: 'password',
    role: 'Admin',
    avatarUrl: 'https://picsum.photos/seed/avatar1/40/40',
  },
  {
    id: '2',
    name: 'Teacher Smith',
    email: 'teacher@campus.com',
    password: 'password',
    role: 'Teacher',
    avatarUrl: 'https://picsum.photos/seed/avatar2/40/40',
  },
  {
    id: '3',
    name: 'Student Johnson',
    email: 'student@campus.com',
    password: 'password',
    role: 'Student',
    avatarUrl: 'https://picsum.photos/seed/avatar3/40/40',
  },
  {
    id: '4',
    name: 'Parent Doe',
    email: 'parent@campus.com',
    password: 'password',
    role: 'Parent',
    avatarUrl: 'https://picsum.photos/seed/avatar4/40/40',
  },
];

const getFromStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key “${key}”:`, error);
    return defaultValue;
  }
};

const saveToStorage = <T>(key: string, value: T) => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage key “${key}”:`, error);
  }
};

export const initializeStore = () => {
  if (typeof window !== 'undefined') {
    if (!window.localStorage.getItem(USERS_KEY)) {
      saveToStorage(USERS_KEY, getInitialUsers());
    }
    if (!window.localStorage.getItem(LOGS_KEY)) {
      saveToStorage(LOGS_KEY, []);
    }
  }
};

// User Functions
export const getUsers = (): User[] => getFromStorage<User[]>(USERS_KEY, []);
export const getUserByEmailAndRole = (email: string, role: Role): User | undefined =>
  getUsers().find((user) => user.email === email && user.role === role);
export const addUser = (user: Omit<User, 'id' | 'avatarUrl'>): User => {
  const users = getUsers();
  const newUser: User = {
    ...user,
    id: (users.length + 1).toString(),
    avatarUrl: `https://picsum.photos/seed/avatar${users.length + 1}/40/40`,
  };
  saveToStorage(USERS_KEY, [...users, newUser]);
  return newUser;
};
export const updateUser = (updatedUser: User): User => {
  const users = getUsers();
  const userIndex = users.findIndex((u) => u.id === updatedUser.id);
  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...updatedUser };
    saveToStorage(USERS_KEY, users);
  }
  return updatedUser;
};
export const deleteUser = (userId: string): void => {
  const users = getUsers();
  const updatedUsers = users.filter((u) => u.id !== userId);
  saveToStorage(USERS_KEY, updatedUsers);
};

// Audit Log Functions
export const getAuditLogs = (): AuditLog[] => getFromStorage<AuditLog[]>(LOGS_KEY, []);
export const addAuditLog = (log: Omit<AuditLog, 'id' | 'timestamp'>): void => {
  const logs = getAuditLogs();
  const newLog: AuditLog = {
    ...log,
    id: (logs.length + 1).toString(),
    timestamp: new Date().toISOString(),
  };
  saveToStorage(LOGS_KEY, [newLog, ...logs]);
};
