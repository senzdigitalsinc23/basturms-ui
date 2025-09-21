
'use client';
import { useEffect, useState } from 'react';
import { getStaffProfiles, getUsers } from '@/lib/store';
import { StaffProfile, User } from '@/lib/types';
import { StaffDataTable } from './data-table';
import { columns } from './columns';

export type StaffDisplay = {
  user: User;
  profile?: StaffProfile;
};

export function StaffManagement() {
  const [staff, setStaff] = useState<StaffDisplay[]>([]);

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


  return (
    <StaffDataTable
      columns={columns({})}
      data={staff}
    />
  );
}
