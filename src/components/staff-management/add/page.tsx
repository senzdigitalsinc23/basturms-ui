

'use client';
import { ProtectedRoute } from '@/components/protected-route';
import { AddStaffForm } from '@/components/staff-management/add-staff-form';
import { addStaff as storeAddStaff, addStaffAcademicHistory, addStaffAppointmentHistory, addStaffDocument, addUser } from '@/lib/store';
import { Staff, StaffAcademicHistory, StaffAppointmentHistory, StaffDocument, Role } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

export default function AddStaffPage() {
  const router = useRouter();
  const { user } = useAuth();

  const handleAddStaff = (data: {staffData: Omit<Staff, 'user_id'>, academic_history: StaffAcademicHistory[], documents: any[], appointment_history: StaffAppointmentHistory}) => {
    if (!user) return;

    if (data.appointment_history.appointment_status === 'Declined') {
        // Handle declined staff separately if needed, maybe save to a different list
        console.log("Staff appointment declined:", data.staffData);
        // saveDeclinedStaff(data.staffData);
        return;
    }

    const userToCreate = {
        name: `${data.staffData.first_name} ${data.staffData.last_name}`,
        email: data.staffData.email,
        username: data.staffData.email,
        password: `${data.staffData.last_name.toLowerCase()}${data.staffData.staff_id.slice(-3)}`,
        role: data.staffData.roles[0] as Role, // Assuming the first role is the primary one
        status: 'active' as 'active' | 'frozen',
        entityId: data.staffData.staff_id,
    };
    const newUser = addUser(userToCreate);
    
    const staffWithUser = { ...data.staffData, user_id: newUser.id };

    const newStaff = storeAddStaff(staffWithUser, user.id);

    if (data.academic_history) {
        data.academic_history.forEach(history => {
            addStaffAcademicHistory({ ...history, staff_id: newStaff.staff_id });
        });
    }

    if (data.documents) {
        for (const doc of data.documents) {
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
    }
    
    addStaffAppointmentHistory({...data.appointment_history, staff_id: newStaff.staff_id});
    router.push('/staff-management');
  }

  return (
    <ProtectedRoute allowedRoles={['Admin', 'Headmaster']}>
      <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold font-headline">Add New Staff</h1>
            <p className="text-muted-foreground">Fill in the details below to add a new staff member.</p>
        </div>
        <AddStaffForm onSubmit={handleAddStaff} />
      </div>
    </ProtectedRoute>
  );
}
