

'use client';
import { useEffect, useState } from 'react';
import { addStaff as storeAddStaff, getStaff, getUsers, updateStaff as storeUpdateStaff, addStaffAcademicHistory, addStaffAppointmentHistory, addStaffDocument, deleteStaff as storeDeleteStaff, bulkDeleteStaff as storeBulkDeleteStaff } from '@/lib/store';
import { Staff, User, StaffAcademicHistory, StaffAppointmentHistory, StaffDocument, Role } from '@/lib/types';
import { StaffDataTable } from './data-table';
import { columns } from './columns';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

export type StaffDisplay = {
  user: User;
  staff: Staff; // Pass the whole staff object
  staff_id: string;
  roles: Role[];
  status: string;
  joining_date: string;
};

export function StaffManagement() {
  const [staff, setStaff] = useState<StaffDisplay[]>([]);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

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
            staff: staffMember,
            staff_id: staffMember.staff_id,
            roles: staffMember.roles,
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
    if (!currentUser) return;
    const newStaff = storeAddStaff(data.staffData, currentUser.id); 

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
    
    addStaffAppointmentHistory({...data.appointment_history, staff_id: newStaff.staff_id});
    
    refreshStaff();
  }
  
  const handleUpdateStaff = (data: Staff) => {
    if (!currentUser) return;
    storeUpdateStaff(data.staff_id, data, currentUser.id); 
    refreshStaff();
  }

  const handleDelete = (staffId: string) => {
    if (!currentUser) return;
    const success = storeDeleteStaff(staffId, currentUser.id);
    if(success) {
      toast({ title: 'Staff Deleted', description: "The staff member has been removed." });
      refreshStaff();
    } else {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete staff member.' });
    }
  }

  const handleBulkDelete = (staffIds: string[]) => {
    if (!currentUser) return;
    const deletedCount = storeBulkDeleteStaff(staffIds, currentUser.id);
    if(deletedCount > 0) {
        toast({ title: 'Bulk Delete Successful', description: `${deletedCount} staff member(s) have been removed.` });
        refreshStaff();
    } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not delete selected staff members.' });
    }
  }


  return (
    <StaffDataTable
      columns={columns({ onEdit: (staff) => {}, onDelete: handleDelete })}
      data={staff}
      onAdd={handleAddStaff}
      onUpdate={handleUpdateStaff}
      onBulkDelete={handleBulkDelete}
    />
  );
}
