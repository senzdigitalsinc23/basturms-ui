

'use client';
import { useEffect, useState } from 'react';
import { getStaff, getUsers } from '@/lib/store';
import { Staff, User } from '@/lib/types';
import { StaffDataTable } from './data-table';
import { columns } from './columns';

export type StaffDisplay = {
  user: User;
  staff_id: string;
  status: string;
  joining_date: string;
};

export function StaffManagement() {
  const [staff, setStaff] = useState<StaffDisplay[]>([]);

  const refreshStaff = () => {
    const allUsers = getUsers();
    const allStaff = getStaff();

    const displayData = allStaff.map(staffMember => {
        const user = allUsers.find(u => u.id === staffMember.user_id);
        // This is a placeholder for a more complex status logic
        const status = user?.status === 'active' ? 'Active' : 'Inactive';
        
        if (!user) return null;

        return { 
            user,
            staff_id: staffMember.staff_id,
            status: status,
            joining_date: staffMember.date_of_joining,
        };
    }).filter(Boolean) as StaffDisplay[];
    
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
