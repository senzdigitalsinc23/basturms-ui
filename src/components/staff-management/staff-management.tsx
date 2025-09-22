

'use client';
import { useEffect, useState } from 'react';
import { addStaff as storeAddStaff, getStaff, getUsers, updateStaff as storeUpdateStaff, addStaffAcademicHistory, addStaffAppointmentHistory, addStaffDocument } from '@/lib/store';
import { Staff, User, StaffAcademicHistory, StaffAppointmentHistory, StaffDocument } from '@/lib/types';
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

  const handleAddStaff = (data: {staffData: Omit<Staff, 'user_id'>, academic_history: StaffAcademicHistory[], documents: any[], appointment_history: StaffAppointmentHistory}) => {
    const newStaff = storeAddStaff(data.staffData, '1'); // Assuming admin user '1' is the creator

    data.academic_history?.forEach(history => {
        addStaffAcademicHistory({ ...history, staff_id: newStaff.staff_id });
    });

    for (const doc of data.documents || []) {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(doc.file);
        fileReader.onload = () => {
            addStaffDocument({
                staff_id: newStaff.staff_id,
                document_name: doc.name,
                file: fileReader.result as string
            });
        };
    }
    
    addStaffAppointmentHistory(data.appointment_history);
    
    refreshStaff();
  }
  
  const handleUpdateStaff = (data: Staff) => {
    storeUpdateStaff(data.staff_id, data, '1'); // Assuming admin user '1' is the editor
    refreshStaff();
  }


  return (
    <StaffDataTable
      columns={columns({})}
      data={staff}
      onAdd={handleAddStaff}
      onUpdate={handleUpdateStaff}
    />
  );
}
