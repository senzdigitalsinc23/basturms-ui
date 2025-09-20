'use client';
import { useEffect, useState } from 'react';
import { getStudentProfiles, addStudentProfile, updateStudentProfile, addAuditLog } from '@/lib/store';
import { StudentProfile } from '@/lib/types';
import { StudentDataTable } from './data-table';
import { columns } from './columns';
import { useAuth } from '@/hooks/use-auth';

// Flatten the StudentProfile for easier display in the data table
export type StudentDisplay = {
  student_id: string;
  name: string;
  class: string;
  status: string;
  admission_date: string;
};

export function StudentManagement() {
  const [students, setStudents] = useState<StudentDisplay[]>([]);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const profiles = getStudentProfiles();
    const displayData = profiles.map(p => ({
        student_id: p.student.student_no,
        name: `${p.student.first_name} ${p.student.last_name}`,
        class: p.admissionDetails.class_assigned,
        status: p.admissionDetails.admission_status,
        admission_date: p.admissionDetails.enrollment_date,
    }))
    setStudents(displayData);
  }, []);

  const handleAddStudent = (profileData: Omit<StudentProfile, 'student.student_no' | 'contactDetails.student_no' | 'guardianInfo.student_no' | 'emergencyContact.student_no' | 'admissionDetails.student_no' | 'admissionDetails.admission_no'>) => {
    if (!currentUser) return;

    const newProfile = addStudentProfile(profileData, currentUser.id);
    const newDisplayData: StudentDisplay = {
        student_id: newProfile.student.student_no,
        name: `${newProfile.student.first_name} ${newProfile.student.last_name}`,
        class: newProfile.admissionDetails.class_assigned,
        status: newProfile.admissionDetails.admission_status,
        admission_date: newProfile.admissionDetails.enrollment_date,
    };
    
    setStudents((prev) => [...prev, newDisplayData]);

    addAuditLog({
        user: currentUser.email,
        name: currentUser.name,
        action: 'Create Student',
        details: `Created student ${newDisplayData.name} with ID ${newDisplayData.student_id}`,
    });
  };

//   const handleUpdateStudent = (profile: StudentProfile) => {
//     if (!currentUser) return;
//     const updatedProfile = updateStudentProfile(profile, currentUser.id);
//     //... update state and log
//   };

  return (
    <StudentDataTable
      columns={columns({
        // onUpdate: handleUpdateStudent,
      })}
      data={students}
    //   onAdd={handleAddStudent}
    />
  );
}
