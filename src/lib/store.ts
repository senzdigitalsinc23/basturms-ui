'use client';

import {
  User,
  AuditLog,
  Role,
  ALL_ROLES,
  RoleStorage,
  UserStorage,
  AuthLog,
} from './types';

const USERS_KEY = 'campusconnect_users';
const ROLES_KEY = 'campusconnect_roles';
const LOGS_KEY = 'campusconnect_logs';
const AUTH_LOGS_KEY = 'campusconnect_auth_logs';

const getInitialRoles = (): RoleStorage[] => {
  return ALL_ROLES.map((role, index) => ({
    id: (index + 1).toString(),
    name: role,
  }));
};

const getInitialUsers = (roles: RoleStorage[]): UserStorage[] => {
  const now = new Date().toISOString();
  const getRoleId = (name: Role) => roles.find((r) => r.name === name)?.id;

  return [
    {
      id: '1',
      name: 'Admin User',
      username: 'adminuser',
      email: 'admin@campus.com',
      password: 'password',
      role_id: getRoleId('Admin')!,
      is_super_admin: true,
      avatarUrl: 'https://picsum.photos/seed/avatar1/40/40',
      status: 'active',
      created_at: now,
      updated_at: now,
    },
    {
      id: '2',
      name: 'Teacher Smith',
      username: 'teachersmith',
      email: 'teacher@campus.com',
      password: 'password',
      role_id: getRoleId('Teacher')!,
      is_super_admin: false,
      avatarUrl: 'https://picsum.photos/seed/avatar2/40/40',
      status: 'active',
      created_at: now,
      updated_at: now,
    },
    {
      id: '3',
      name: 'Headmaster Brown',
      username: 'headmasterbrown',
      email: 'headmaster@campus.com',
      password: 'password',
      role_id: getRoleId('Headmaster')!,
      is_super_admin: false,
      avatarUrl: 'https://picsum.photos/seed/avatar3/40/40',
      status: 'active',
      created_at: now,
      updated_at: now,
    },
    {
      id: '4',
      name: 'Parent Doe',
      username: 'parentdoe',
      email: 'parent@campus.com',
      password: 'password',
      role_id: getRoleId('Parent')!,
      is_super_admin: false,
      avatarUrl: 'https://picsum.photos/seed/avatar4/40/40',
      status: 'active',
      created_at: now,
      updated_at: now,
    },
    {
      id: '5',
      name: 'Student Johnson',
      username: 'studentjohnson',
      email: 'student@campus.com',
      password: 'password',
      role_id: getRoleId('Student')!,
      is_super_admin: false,
      avatarUrl: 'https://picsum.photos/seed/avatar5/40/40',
      status: 'active',
      created_at: now,
      updated_at: now,
    },
  ];
};

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
    if (!window.localStorage.getItem(ROLES_KEY)) {
      saveToStorage(ROLES_KEY, getInitialRoles());
    }
    const roles = getRoles();
    if (!window.localStorage.getItem(USERS_KEY)) {
      saveToStorage(USERS_KEY, getInitialUsers(roles));
    }
    if (!window.localStorage.getItem(LOGS_KEY)) {
      saveToStorage(LOGS_KEY, []);
    }
     if (!window.localStorage.getItem(AUTH_LOGS_KEY)) {
      saveToStorage(AUTH_LOGS_KEY, []);
    }
  }
};

// Role Functions
export const getRoles = (): RoleStorage[] => getFromStorage<RoleStorage[]>(ROLES_KEY, []);

// User Functions
const getUsersInternal = (): UserStorage[] => getFromStorage<UserStorage[]>(USERS_KEY, []);

const mapUser = (user: UserStorage): User => {
    const roles = getRoles();
    const role = roles.find(r => r.id === user.role_id);
    return {
        ...user,
        role: role?.name || 'Admin', // Safely default to Admin role
    };
}

export const getUsers = (): User[] => {
    return getUsersInternal().map(mapUser);
};

export const getUserById = (userId: string): User | undefined => {
  const user = getUsersInternal().find((user) => user.id === userId);
  return user ? mapUser(user) : undefined;
};

export const getUserByEmail = (email: string): User | undefined => {
  const user = getUsersInternal().find((user) => user.email === email);
  return user ? mapUser(user) : undefined;
}

export const addUser = (user: Omit<User, 'id' | 'avatarUrl' | 'created_at' | 'updated_at' | 'username' | 'is_super_admin' | 'role_id' | 'status'> & { role: Role }): User => {
  const users = getUsersInternal();
  const roles = getRoles();
  const role = roles.find(r => r.name === user.role);
  const now = new Date().toISOString();
  const nextId = users.length > 0 ? (Math.max(...users.map(u => parseInt(u.id, 10))) + 1).toString() : '1';

  const newUser: UserStorage = {
    ...user,
    id: nextId,
    username: user.name.replace(/\s/g, '').toLowerCase(),
    role_id: role!.id,
    is_super_admin: false,
    avatarUrl: `https://picsum.photos/seed/avatar${nextId}/40/40`,
    status: 'active',
    created_at: now,
    updated_at: now,
  };
  saveToStorage(USERS_KEY, [...users, newUser]);
  return mapUser(newUser);
};

export const updateUser = (updatedUser: User): User => {
  const users = getUsersInternal();
  const userIndex = users.findIndex((u) => u.id === updatedUser.id);
  if (userIndex !== -1) {
    const roles = getRoles();
    const role = roles.find(r => r.name === updatedUser.role);
    const { role: _, ...userToStore } = updatedUser;

    users[userIndex] = {
        ...users[userIndex],
        ...userToStore,
        role_id: role ? role.id : users[userIndex].role_id,
        updated_at: new Date().toISOString(),
    };
    saveToStorage(USERS_KEY, users);
  }
  return updatedUser;
};

export const toggleUserStatus = (userId: string): User | undefined => {
    const users = getUsersInternal();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        const user = users[userIndex];
        user.status = user.status === 'active' ? 'frozen' : 'active';
        user.updated_at = new Date().toISOString();
        saveToStorage(USERS_KEY, users);
        return mapUser(user);
    }
    return undefined;
};

export const resetPassword = (userId: string, newPassword: string): boolean => {
    const users = getUsersInternal();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        users[userIndex].updated_at = new Date().toISOString();
        saveToStorage(USERS_KEY, users);
        return true;
    }
    return false;
}

// Audit Log Functions
export const getAuditLogs = (): AuditLog[] => getFromStorage<AuditLog[]>(LOGS_KEY, []);
export const addAuditLog = (log: Omit<AuditLog, 'id' | 'timestamp'>): void => {
  const logs = getAuditLogs();
  const nextId = logs.length > 0 ? (Math.max(...logs.map(l => parseInt(l.id, 10))) + 1).toString() : '1';
  const newLog: AuditLog = {
    ...log,
    id: nextId,
    timestamp: new Date().toISOString(),
  };
  saveToStorage(LOGS_KEY, [newLog, ...logs]);
};

// Auth Log Functions
export const getAuthLogs = (): AuthLog[] => getFromStorage<AuthLog[]>(AUTH_LOGS_KEY, []);
export const addAuthLog = (log: Omit<AuthLog, 'id' | 'timestamp'>): void => {
    const logs = getAuthLogs();
    const nextId = logs.length > 0 ? (Math.max(...logs.map(l => parseInt(l.id, 10))) + 1).toString() : '1';
    const newLog: AuthLog = {
        ...log,
        id: nextId,
        timestamp: new Date().toISOString(),
    };
    saveToStorage(AUTH_LOGS_KEY, [newLog, ...logs]);
}
