

'use client';
import { useEffect, useState } from 'react';
import { getUsers, fetchUsersFromApi, addUser, updateUser, addAuditLog, toggleUserStatus, resetPassword as resetUserPassword, deleteUser, bulkDeleteUsers, getStaff } from '@/lib/store';
import { User, Role, Staff } from '@/lib/types';
import { UserDataTable } from './data-table';
import { columns } from './columns';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { user: currentUser, logout } = useAuth();
  const { toast } = useToast();

  const refreshData = async () => {
    setLoading(true);
    try {
      const fetchedUsers = await fetchUsersFromApi();
      setUsers(fetchedUsers);
      setStaff(getStaff());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [refreshTrigger]);

  const handleAddUser = (user: Omit<User, 'id' | 'avatarUrl' | 'created_at' | 'updated_at' | 'is_super_admin' | 'role_id' | 'password' | 'status'> & { role: User['role'], password?: string, entityId?: string, signature?: string }) => {
    const newUser = addUser(user);
    setRefreshTrigger(prev => prev + 1); // Trigger refresh
    if (currentUser) {
      addAuditLog({
        user: currentUser.email,
        name: currentUser.name,
        action: 'Create User',
        details: `Created user for ${newUser.name} (${newUser.email}) with role ${newUser.role}.`,
      });
    }
  };

  const handleUpdateUser = (user: User) => {
    const updated = updateUser(user);
    refreshData();
    if (currentUser) {
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
      refreshData();
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

  const handleDeleteUser = (userId: string) => {
    if (!currentUser || !currentUser.is_super_admin) {
      toast({ variant: 'destructive', title: 'Permission Denied', description: 'Only super admins can delete users.' });
      return;
    }
    const success = deleteUser(userId);
    if (success) {
      refreshData();
      addAuditLog({
        user: currentUser.email,
        name: currentUser.name,
        action: 'Delete User',
        details: `Deleted user with ID ${userId}`,
      });
      toast({ title: 'User Deleted', description: 'The user has been permanently deleted.' });

      if (userId === currentUser.id) {
        logout();
      }
    }
  }

  const handleBulkDelete = (userIds: string[]) => {
    if (!currentUser || !currentUser.is_super_admin) {
      toast({ variant: 'destructive', title: 'Permission Denied', description: 'Only super admins can delete users.' });
      return;
    }
    const deletedCount = bulkDeleteUsers(userIds);
    if (deletedCount > 0) {
      refreshData();
      addAuditLog({
        user: currentUser.email,
        name: currentUser.name,
        action: 'Bulk Delete Users',
        details: `Deleted ${deletedCount} user(s).`,
      });
      toast({ title: 'Users Deleted', description: `${deletedCount} user(s) have been deleted.` });

      if (userIds.includes(currentUser.id)) {
        logout();
      }
    }
  }


  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <UserDataTable
      columns={columns({
        onUpdate: handleUpdateUser,
        onToggleStatus: handleToggleStatus,
        onResetPassword: handleResetPassword,
        onDelete: handleDeleteUser,
      })}
      data={users}
      staff={staff}
      onAdd={handleAddUser}
      onBulkDelete={handleBulkDelete}
    />
  );
}
