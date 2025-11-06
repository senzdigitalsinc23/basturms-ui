

'use client';
import { useEffect, useState } from 'react';
import { getStudentProfiles, updateStudentStatus, addAuditLog, getClasses, deleteStudentProfile } from '@/lib/store';
import { AdmissionStatus, Class, StudentProfile } from '@/lib/types';
import { StudentDataTable } from './data-table';
import { columns } from './columns';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { type PaginationState } from '@tanstack/react-table';

// Flatten the StudentProfile for easier display in the data table
export type StudentDisplay = {
  student_id: string;
  name: string;
  class_name: string;
  class_id: string;
  status: string;
  admission_date: string;
  email?: string;
};


export function StudentManagement() {
  const [students, setStudents] = useState<StudentDisplay[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [pageCount, setPageCount] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
        setDebouncedSearchTerm(searchTerm);
        setPagination(prev => ({...prev, pageIndex: 0})); // Reset to first page on new search
    }, 500); // 500ms debounce delay

    return () => {
        clearTimeout(handler);
    };
  }, [searchTerm]);


  const refreshStudents = async () => {
    setLoading(true);
    const { students: profiles, pagination: paginationData } = await getStudentProfiles(pagination.pageIndex + 1, pagination.pageSize, debouncedSearchTerm);
    const classesData = getClasses();
    setClasses(classesData);
    const classMap = new Map(classesData.map(c => [c.id, c.name]));

    const displayData = profiles.map(p => ({
        student_id: p.student.student_no,
        name: `${p.student.first_name} ${p.student.last_name}`,
        class_name: classMap.get(p.admissionDetails.class_assigned) || 'N/A',
        class_id: p.admissionDetails.class_assigned,
        status: p.admissionDetails.admission_status,
        admission_date: p.admissionDetails.enrollment_date,
        email: p.contactDetails.email,
    })).sort((a, b) => new Date(b.admission_date).getTime() - new Date(a.admission_date).getTime());
    setStudents(displayData);
    setPageCount(paginationData.pages);
    setTotalRecords(paginationData.total);
    setLoading(false);
  }

  useEffect(() => {
    refreshStudents();
  }, [pagination, debouncedSearchTerm]);

  const handleImportStudents = (importedData: any[]) => {
    if (!currentUser) return;
    toast({
        variant: "destructive",
        title: "Import Not Implemented",
        description: "Importing from CSV is not connected to the new API yet."
    });
  }

  const handleUpdateStatus = (studentId: string, status: AdmissionStatus) => {
    if (!currentUser) return;
    const updatedProfile = updateStudentStatus(studentId, status, currentUser.id);
    if (updatedProfile) {
        refreshStudents();
        toast({
            title: "Status Updated",
            description: `Student status has been changed to ${status}.`
        });
        addAuditLog({
            user: currentUser.email,
            name: currentUser.name,
            action: 'Update Student Status',
            details: `Changed status of student ID ${studentId} to ${status}`,
        });
    } else {
        toast({
            variant: 'destructive',
            title: "Update Failed",
            description: "Could not find the student to update."
        })
    }
  };
  
  const handleBulkUpdateStatus = (studentIds: string[], status: AdmissionStatus) => {
    if (!currentUser) return;
    let successCount = 0;
    studentIds.forEach(id => {
        const updated = updateStudentStatus(id, status, currentUser.id);
        if (updated) successCount++;
    });
    refreshStudents();
    toast({
        title: "Bulk Status Update",
        description: `Updated status for ${successCount} of ${studentIds.length} students to ${status}.`
    });
    addAuditLog({
        user: currentUser.email,
        name: currentUser.name,
        action: 'Bulk Update Student Status',
        details: `Changed status of ${studentIds.length} students to ${status}`,
    });
  }
  
  const handleBulkDelete = async (studentIds: string[]) => {
    if (!currentUser) return;
    let successCount = 0;
    for (const id of studentIds) {
      const success = deleteStudentProfile(id);
      if (success) successCount++;
    }
    await refreshStudents();
    toast({
      title: "Bulk Delete Successful",
      description: `Deleted ${successCount} of ${studentIds.length} students.`
    });
    addAuditLog({
      user: currentUser.email,
      name: currentUser.name,
      action: 'Bulk Delete Students',
      details: `Deleted ${studentIds.length} students.`,
    });
  };

  return (
    <StudentDataTable
      columns={columns({
        onUpdateStatus: handleUpdateStatus,
      })}
      data={students}
      classes={classes}
      onImport={handleImportStudents}
      onBulkUpdateStatus={handleBulkUpdateStatus}
      onBulkDelete={handleBulkDelete}
      pagination={pagination}
      setPagination={setPagination}
      pageCount={pageCount}
      totalRecords={totalRecords}
      isLoading={loading}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
    />
  );
}
