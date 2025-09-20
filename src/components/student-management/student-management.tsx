'use client';
import { useEffect, useState } from 'react';
import { getStudentProfiles, addStudentProfile, updateStudentProfile, addAuditLog } from '@/lib/store';
import { StudentProfile } from '@/lib/types';
import { StudentDataTable } from './data-table';
import { columns } from './columns';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

// Flatten the StudentProfile for easier display in the data table
export type StudentDisplay = {
  student_id: string;
  name: string;
  class: string;
  status: string;
  admission_date: string;
};

// A more robust date parsing function
function parseDateString(dateStr: string): Date | null {
    if (!dateStr) return null;

    // Try standard ISO and MM/DD/YYYY directly
    let date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
        return date;
    }

    // Try DD/MM/YYYY
    const parts = dateStr.split('/');
    if (parts.length === 3) {
        // new Date(year, monthIndex, day)
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
        const year = parseInt(parts[2], 10);
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
            date = new Date(year, month, day);
            if (!isNaN(date.getTime())) {
                return date;
            }
        }
    }

    return null; // Return null if all parsing fails
}


export function StudentManagement() {
  const [students, setStudents] = useState<StudentDisplay[]>([]);
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  const refreshStudents = () => {
    const profiles = getStudentProfiles();
    const displayData = profiles.map(p => ({
        student_id: p.student.student_no,
        name: `${p.student.first_name} ${p.student.last_name}`,
        class: p.admissionDetails.class_assigned,
        status: p.admissionDetails.admission_status,
        admission_date: p.admissionDetails.enrollment_date,
    })).sort((a, b) => new Date(b.admission_date).getTime() - new Date(a.admission_date).getTime());
    setStudents(displayData);
  }

  useEffect(() => {
    refreshStudents();
  }, []);

  const handleAddStudent = (profileData: Omit<StudentProfile, 'student.student_no' | 'contactDetails.student_no' | 'guardianInfo.student_no' | 'emergencyContact.student_no' | 'admissionDetails.student_no' | 'admissionDetails.admission_no'>) => {
    if (!currentUser) return;

    const newProfile = addStudentProfile(profileData, currentUser.id);
    
    addAuditLog({
        user: currentUser.email,
        name: currentUser.name,
        action: 'Create Student',
        details: `Created student ${newProfile.student.first_name} ${newProfile.student.last_name} with ID ${newProfile.student.student_no}`,
    });
    return newProfile;
  };

  const handleImportStudents = (importedData: any[]) => {
    if (!currentUser) return;
    try {
        let createdCount = 0;
        importedData.forEach((row, index) => {
            // Very basic validation
            if (row.first_name && row.last_name && row.enrollment_date && row.class_assigned) {
                const enrollmentDate = parseDateString(row.enrollment_date);
                const dobDate = parseDateString(row.dob);

                if (!enrollmentDate) {
                    console.error(`Skipping row ${index + 2} due to invalid enrollment_date:`, row.enrollment_date);
                    return;
                }
                 if (!dobDate) {
                    console.error(`Skipping row ${index + 2} due to invalid dob:`, row.dob);
                    return;
                }

                const profileData: Parameters<typeof handleAddStudent>[0] = {
                    student: {
                        first_name: row.first_name,
                        last_name: row.last_name,
                        other_name: row.other_name,
                        dob: dobDate.toISOString(),
                        gender: row.gender,
                    },
                    contactDetails: {
                        email: row.email,
                        phone: row.phone,
                        country_id: '1', // Assuming default
                        city: row.city,
                        hometown: row.hometown,
                        residence: row.residence,
                    },
                    guardianInfo: {
                        guardian_name: row.guardian_name,
                        guardian_phone: row.guardian_phone,
                        guardian_relationship: row.guardian_relationship,
                        guardian_email: row.guardian_email,
                    },
                    emergencyContact: {
                        emergency_name: row.emergency_name,
                        emergency_phone: row.emergency_phone,
                        emergency_relationship: row.emergency_relationship,
                        emergency_email: row.emergency_email,
                    },
                    admissionDetails: {
                        enrollment_date: enrollmentDate.toISOString(),
                        class_assigned: row.class_assigned,
                        admission_status: row.admission_status || 'Admitted',
                    }
                };
                handleAddStudent(profileData);
                createdCount++;
            }
        });
        
        refreshStudents();

        toast({
            title: "Import Successful",
            description: `${createdCount} student(s) imported successfully.`
        });
        addAuditLog({
            user: currentUser.email,
            name: currentUser.name,
            action: 'Import Students',
            details: `Imported ${createdCount} students from CSV.`,
        });

    } catch (error) {
        console.error("Import failed:", error);
        toast({
            variant: "destructive",
            title: "Import Failed",
            description: "There was an error processing the CSV file. Please check the file format and try again."
        });
    }
  }


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
      onImport={handleImportStudents}
    //   onAdd={handleAddStudent}
    />
  );
}
