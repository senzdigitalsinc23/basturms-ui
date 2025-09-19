'use client';
import { useEffect, useState } from 'react';
import { getUsers, addUser, updateUser, addAuditLog, toggleUserStatus, resetPassword as resetUserPassword } from '@/lib/store';
import { User, Role } from '@/lib/types';
import { UserDataTable } from './data-table';
import { columns } from './columns';
import { useAuth } from '@/hooks/use-auth';

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    setUsers(getUsers());
  }, []);

  const handleAddUser = (user: Omit<User, 'id' | 'avatarUrl' | 'created_at' | 'updated_at' | 'username' | 'is_super_admin' | 'role_id' | 'status'> & { role: Role }) => {
    const newUser = addUser(user);
    setUsers((prev) => [...prev, newUser]);
    if(currentUser) {
        addAuditLog({
            user: currentUser.email,
            name: currentUser.name,
            action: 'Create User',
            details: `Created user ${newUser.email} with role ${newUser.role}`,
        });
    }
  };

  const handleUpdateUser = (user: User) => {
    const updated = updateUser(user);
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    if(currentUser) {
        addAuditLog({
            user: currentUser.email,
            name: currentUser.name,
            action: 'Update User',
            details: `Updated user ${updated.email}`,
        });
    }
  };

  const handleToggleStatus = (userId: string) => {
    const updatedUser = toggleUserStatus(userId);
    if (updatedUser) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? updatedUser : u)));
        if (currentUser) {
            addAuditLog({
                user: currentUser.email,
                name: currentUser.name,
                action: 'Toggle User Status',
                details: `User ${updatedUser.email} status changed to ${updatedUser.status}`,
            });
        }
    }
  };

  const handleResetPassword = (userId: string, newPassword: string): boolean => {
    const success = resetUserPassword(userId, newPassword);
    if (success && currentUser) {
        const user = users.find(u => u.id === userId);
        addAuditLog({
            user: currentUser.email,
            name: currentUser.name,
            action: 'Reset Password',
            details: `Reset password for user ${user?.email}`,
        });
    }
    return success;
  }

  return (
    <UserDataTable
      columns={columns({
        onUpdate: handleUpdateUser,
        onToggleStatus: handleToggleStatus,
        onResetPassword: handleResetPassword,
      })}
      data={users}
      onAdd={handleAddUser}
    />
  );
}
