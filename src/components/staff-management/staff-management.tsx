

'use client';
import { useEffect, useState } from 'react';
import { addStaff as storeAddStaff, getStaff, getUsers, updateStaff as storeUpdateStaff, addStaffAcademicHistory, addStaffAppointmentHistory, addStaffDocument, deleteStaff as storeDeleteStaff, bulkDeleteStaff as storeBulkDeleteStaff, toggleEmploymentStatus as storeToggleEmploymentStatus } from '@/lib/store';
import { Staff, User, StaffAcademicHistory, StaffAppointmentHistory, StaffDocument, Role, EmploymentStatus } from '@/lib/types';
import { StaffDataTable } from './data-table';
import { columns } from './columns';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { AddStaffForm } from './add-staff-form';

export type StaffDisplay = {
  user?: User; // User can be optional
  staff: Staff;
  staff_id: string;
  roles: Role[];
  status: EmploymentStatus;
  joining_date: string;
};

export function StaffManagement() {
  const [staff, setStaff] = useState<StaffDisplay[]>([]);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  const refreshStaff = () => {
    const allUsers = getUsers();
    const allStaff = getStaff();

    const displayData = allStaff.map(staffMember => {
        const user = allUsers.find(u => u.id === staffMember.user_id);
        
        return { 
            user,
            staff: staffMember,
            staff_id: staffMember.staff_id,
            roles: staffMember.roles,
            status: staffMember.status,
            joining_date: staffMember.date_of_joining,
        };
    });
    
    setStaff(displayData);
  }

  useEffect(() => {
    refreshStaff();
  }, []);
  
  const handleUpdateStaff = (data: {staffData: Staff, academic_history: any[], appointment_history: any}) => {
    if (!currentUser) return;
    storeUpdateStaff(data.staffData.staff_id, data.staffData, currentUser.id);
    refreshStaff();
    setIsEditFormOpen(false);
    setEditingStaff(null);
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

  const handleEdit = (staffToEdit: Staff) => {
    setEditingStaff(staffToEdit);
    setIsEditFormOpen(true);
  };
  
  const handleToggleStatus = (staffId: string) => {
    if (!currentUser) return;
    const updatedStaff = storeToggleEmploymentStatus(staffId, currentUser.id);
    if (updatedStaff) {
        refreshStaff();
        toast({
            title: "Staff Status Updated",
            description: `The status for ${updatedStaff.first_name} has been updated to ${updatedStaff.status}.`
        })
    } else {
         toast({
            variant: 'destructive',
            title: "Error",
            description: "Could not update staff status."
        })
    }
  }


  return (
    <>
    <StaffDataTable
      columns={columns({ onEdit: handleEdit, onDelete: handleDelete, onToggleStatus: handleToggleStatus })}
      data={staff}
      onBulkDelete={handleBulkDelete}
    />
     <Dialog open={isEditFormOpen} onOpenChange={(isOpen) => {
        if (!isOpen) setEditingStaff(null);
        setIsEditFormOpen(isOpen);
     }}>
        <DialogContent className="sm:max-w-4xl max-h-screen flex flex-col">
            <DialogHeader>
                <DialogTitle>Edit Staff Member</DialogTitle>
                <DialogDescription>Update details for {editingStaff?.first_name} {editingStaff?.last_name}</DialogDescription>
            </DialogHeader>
            {editingStaff && <AddStaffForm isEditMode defaultValues={editingStaff} onSubmit={handleUpdateStaff} />}
        </DialogContent>
    </Dialog>
    </>
  );
}
