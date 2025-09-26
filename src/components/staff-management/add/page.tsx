
'use client';
import { ProtectedRoute } from '@/components/protected-route';
import { AddStaffForm } from '@/components/staff-management/add-staff-form';
import { addStaff as storeAddStaff, addStaffAcademicHistory, addStaffAppointmentHistory, addStaffDocument } from '@/lib/store';
import { Staff, StaffAcademicHistory, StaffAppointmentHistory, StaffDocument } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

export default function AddStaffPage() {
  const router = useRouter();
  const { user } = useAuth();

  const handleAddStaff = (data: {staffData: Omit<Staff, 'user_id'>, academic_history: StaffAcademicHistory[], documents: any[], appointment_history: StaffAppointmentHistory}) => {
    if (!user) return;
    const newStaff = storeAddStaff(data.staffData, data.appointment_history, user.id); 

    if (newStaff) {
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
                  if (newStaff) {
                      addStaffDocument({
                          staff_id: newStaff.staff_id,
                          document_name: doc.name,
                          file: fileReader.result as string
                      });
                  }
              };
          }
      }
      
      addStaffAppointmentHistory({...data.appointment_history, staff_id: newStaff.staff_id});
    }
    
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
