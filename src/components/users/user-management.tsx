'use client';
import { useEffect, useState } from 'react';
import { getUsers, addUser, updateUser, deleteUser, addAuditLog } from '@/lib/store';
import { User } from '@/lib/types';
import { UserDataTable } from './data-table';
import { columns } from './columns';
import { useAuth } from '@/hooks/use-auth';

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    setUsers(getUsers());
  }, []);

  const handleAddUser = (user: Omit<User, 'id' | 'avatarUrl'>) => {
    const newUser = addUser(user);
    setUsers((prev) => [...prev, newUser]);
    if(currentUser) {
        addAuditLog({
            user: currentUser.email,
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
            action: 'Update User',
            details: `Updated user ${updated.email}`,
        });
    }
  };

  const handleDeleteUser = (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    deleteUser(userId);
    setUsers((prev) => prev.filter((u) => u.id !== userId));
     if(currentUser && userToDelete) {
        addAuditLog({
            user: currentUser.email,
            action: 'Delete User',
            details: `Deleted user ${userToDelete.email}`,
        });
    }
  };

  return (
    <UserDataTable
      columns={columns({
        onUpdate: handleUpdateUser,
        onDelete: handleDeleteUser,
      })}
      data={users}
      onAdd={handleAddUser}
    />
  );
}
