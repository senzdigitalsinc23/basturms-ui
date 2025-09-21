
'use client';
import { useEffect, useState } from 'react';
import { getStaffProfiles, getUsers, addUser, addAuditLog } from '@/lib/store';
import { StaffProfile, User, Role } from '@/lib/types';
import { StaffDataTable } from './data-table';
import { columns } from './columns';
import { useAuth } from '@/hooks/use-auth';

export type StaffDisplay = {
  user: User;
  profile?: StaffProfile;
};

export function StaffManagement() {
  const [staff, setStaff] = useState<StaffDisplay[]>([]);
  const { user: currentUser } = useAuth();

  const refreshStaff = () => {
    const allUsers = getUsers();
    const staffProfiles = getStaffProfiles();
    
    const staffUsers = allUsers.filter(user => user.role !== 'Student' && user.role !== 'Parent');

    const displayData = staffUsers.map(user => {
        const profile = staffProfiles.find(p => p.user_id === user.id);
        return { user, profile };
    });
    
    setStaff(displayData);
  }

  useEffect(() => {
    refreshStaff();
  }, []);

  const handleAddUser = (user: Omit<User, 'id' | 'avatarUrl' | 'created_at' | 'updated_at' | 'username' | 'is_super_admin' | 'role_id' | 'password' | 'status'> & { role: Role }) => {
    const newUser = addUser(user);
    refreshStaff();
    if(currentUser) {
        addAuditLog({
            user: currentUser.email,
            name: currentUser.name,
            action: 'Create Staff User',
            details: `Created staff user ${newUser.email} with role ${newUser.role}`,
        });
    }
  };

  return (
    <StaffDataTable
      columns={columns({
        // onUpdateStatus: handleUpdateStatus,
      })}
      data={staff}
      onAdd={handleAddUser}
    />
  );
}
