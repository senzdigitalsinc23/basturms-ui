

'use client';
import { useEffect, useState } from 'react';
import { getStudentProfiles, addAuditLog, getClasses, deleteStudentProfile, getStudentProfileById, updateStudentStatus, fetchClassesFromApi } from '@/lib/store';
import { AdmissionStatus, Class, StudentProfile } from '@/lib/types';
import { StudentDataTable } from './data-table';
import { columns } from './columns';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { type PaginationState } from '@tanstack/react-table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StudentForm } from './student-form';
import { Loader2 } from 'lucide-react';

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
  const [statusFilter, setStatusFilter] = useState<string | undefined>('Admitted');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date } | undefined>(undefined);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<StudentProfile | null>(null);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);
  const [isImportLoading, setIsImportLoading] = useState(false);

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
    // Note: Backend only supports status and search filtering, not date filtering
    // Date filtering is handled client-side below

    let profiles, paginationData;

    // When date filtering is applied, fetch all data for client-side filtering and pagination
    if (dateRange?.from || dateRange?.to) {
      const result = await getStudentProfiles(
        1, // page
        10000, // large limit to get all records
        debouncedSearchTerm,
        statusFilter,
        currentUser?.email
      );
      profiles = result.students;
      paginationData = result.pagination;
    } else {
      // Normal pagination when no date filter
      const result = await getStudentProfiles(
        pagination.pageIndex + 1,
        pagination.pageSize,
        debouncedSearchTerm,
        statusFilter,
        currentUser?.email
      );
      profiles = result.students;
      paginationData = result.pagination;
    }

    await fetchClassesFromApi(); // Ensure classes are fetched before getting them from storage
    const classesData = getClasses();
    setClasses(classesData);
    const classMap = new Map(classesData.map(c => [c.id, c.name]));

    let displayData = profiles.map(p => {
        return {
            student_id: p.student.student_no,
            name: `${p.student.first_name} ${p.student.last_name}`,
            class_name: classMap.get(p.admissionDetails.class_assigned) || 'N/A',
            class_id: p.admissionDetails.class_assigned,
            status: p.admissionDetails.admission_status,
            admission_date: p.admissionDetails.enrollment_date,
            email: p.contactDetails.email,
        };
    });

    // Client-side date filtering (backend doesn't support date filtering yet)
    if (dateRange?.from || dateRange?.to) {
        displayData = displayData.filter(student => {
            if (!student.admission_date) return false;
            const admissionDate = new Date(student.admission_date);
            if (isNaN(admissionDate.getTime())) return false;

            // Normalize dates to start of day for comparison
            const admissionDateOnly = new Date(admissionDate.getFullYear(), admissionDate.getMonth(), admissionDate.getDate());

            if (dateRange.from && dateRange.to) {
                const fromDateOnly = new Date(dateRange.from.getFullYear(), dateRange.from.getMonth(), dateRange.from.getDate());
                const toDateOnly = new Date(dateRange.to.getFullYear(), dateRange.to.getMonth(), dateRange.to.getDate());
                return admissionDateOnly >= fromDateOnly && admissionDateOnly <= toDateOnly;
            } else if (dateRange.from) {
                const fromDateOnly = new Date(dateRange.from.getFullYear(), dateRange.from.getMonth(), dateRange.from.getDate());
                return admissionDateOnly >= fromDateOnly;
            } else if (dateRange.to) {
                const toDateOnly = new Date(dateRange.to.getFullYear(), dateRange.to.getMonth(), dateRange.to.getDate());
                return admissionDateOnly <= toDateOnly;
            }
            return true;
        });
    }

    displayData.sort((a, b) => new Date(b.admission_date).getTime() - new Date(a.admission_date).getTime());

    // Handle client-side pagination when date filtering is applied
    if (dateRange?.from || dateRange?.to) {
      const totalFilteredRecords = displayData.length;
      const totalPages = Math.ceil(totalFilteredRecords / pagination.pageSize);

      // Apply client-side pagination to filtered results
      const startIndex = pagination.pageIndex * pagination.pageSize;
      const endIndex = startIndex + pagination.pageSize;
      const paginatedData = displayData.slice(startIndex, endIndex);

      setStudents(paginatedData);
      setPageCount(totalPages);
      setTotalRecords(totalFilteredRecords);
    } else {
      // Normal backend pagination
      setStudents(displayData);
      setPageCount(paginationData.pages);
      setTotalRecords(paginationData.total);
    }

    setLoading(false);
  }

  useEffect(() => {
    refreshStudents();
  }, [pagination, debouncedSearchTerm, statusFilter, dateRange]);

  const handleImportStudents = async (csvFile: File) => {
    if (!currentUser) return;

    setIsImportLoading(true);
    try {
      const apiUrl = '/api/students/upload';

      const token = localStorage.getItem('campusconnect_token');
      const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'devKey123';

      // Create FormData to send the CSV file
      const formData = new FormData();
      formData.append('csv_file', csvFile, csvFile.name);
      formData.append('user_id', currentUser.user_id || currentUser.id);
      
      // Create JSON object with user_id
      

      console.log('Student Upload Request:', {
        apiUrl,
        fileName: csvFile.name,
        fileSize: csvFile.size,
        

      });

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-API-KEY': apiKey,
          // Don't set Content-Type when using FormData - browser sets it automatically
        },
        body: formData,
      });

      // Log the server response for debugging
      console.log('Student Upload Response Status:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Student Upload Error Response Body:', errorText);
        const errorData = JSON.parse(errorText).catch(() => ({}));
        throw new Error(errorData.message || `Upload failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Student Upload Success Response Body:', result);

      toast({
        title: "Import Successful",
        description: `Successfully imported ${result.uploaded_count || result.count || 'students'}.`,
      });

      // Refresh the student list
      await refreshStudents();

    } catch (error) {
      console.error("Student upload failed:", error);
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to upload students. Please try again.",
      });
    } finally {
      setIsImportLoading(false);
    }
  }

  const handleChangeStudentStatus = async (studentId: string, newStatus: AdmissionStatus) => {
    if (!currentUser) return;

    const result = await updateStudentStatus(studentId, newStatus, currentUser.email);
    if (result.success) {
      await refreshStudents();
      toast({
        title: 'Status Updated',
        description: result.message || `Student status changed to ${newStatus}.`,
      });
      addAuditLog({
        user: currentUser.email,
        name: currentUser.name,
        action: 'Update Student Status',
        details: `Changed student ID ${studentId} status to ${newStatus}`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Status Update Failed',
        description: result.message || 'Unable to update student status. Please try again.',
      });
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!currentUser || !currentUser.is_super_admin) return;

    const success = await deleteStudentProfile(studentId, 'Stopped', currentUser.email);
    if (success) {
      await refreshStudents();
      toast({
        title: 'Student Deleted',
        description: `Student ID ${studentId} has been marked as deleted.`,
      });
      addAuditLog({
        user: currentUser.email,
        name: currentUser.name,
        action: 'Delete Student',
        details: `Soft deleted student ID ${studentId}`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: 'Unable to delete student. Please try again.',
      });
    }
  };
  
  const handleBulkUpdateStatus = async (studentIds: string[], status: AdmissionStatus) => {
    if (!currentUser) return;
    let successCount = 0;
    const errors: { studentId: string; message: string }[] = [];
    
    for (const id of studentIds) {
      const result = await updateStudentStatus(id, status, currentUser.email);
      if (result.success) {
        successCount++;
      } else {
        errors.push({ studentId: id, message: result.message || 'Unknown error' });
      }
    }
    
    await refreshStudents();
    
    if (successCount > 0) {
      toast({
        title: 'Status Update Successful',
        description: `Updated status to ${status} for ${successCount} of ${studentIds.length} students.`,
      });
    }
    
    if (errors.length > 0) {
      const errorDetails = errors.map(e => `${e.studentId}: ${e.message}`).join('\n');
      toast({
        variant: 'destructive',
        title: `Failed to Update ${errors.length} Student${errors.length > 1 ? 's' : ''}`,
        description: errorDetails.length > 100 ? `${errors.length} student(s) failed to update. Check console for details.` : errorDetails,
      });
    }
    
    addAuditLog({
      user: currentUser.email,
      name: currentUser.name,
      action: 'Bulk Update Student Status',
      details: `Updated status to "${status}" for ${successCount} students. Failed: ${errors.length}.`,
    });
  }
  
  const handleBulkDelete = async (studentIds: string[]) => {
    if (!currentUser || !currentUser.is_super_admin) return;
    let successCount = 0;
    for (const id of studentIds) {
      const success = await deleteStudentProfile(id, 'Stopped', currentUser.email);
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

  const handleEditStudent = async (studentId: string) => {
    setIsEditDialogOpen(true);
    setIsFetchingProfile(true);
    try {
      const profile = await getStudentProfileById(studentId, currentUser?.email);
      if (!profile) {
        toast({
          variant: 'destructive',
          title: 'Unable to load student',
          description: 'Please try again in a moment.',
        });
        setIsEditDialogOpen(false);
        return;
      }
      setSelectedProfile(profile);
    } catch (error) {
      console.error('Error loading student profile', error);
      toast({
        variant: 'destructive',
        title: 'Unable to load student',
        description: 'Please try again in a moment.',
      });
      setIsEditDialogOpen(false);
    } finally {
      setIsFetchingProfile(false);
    }
  };

  const handleEditDialogChange = (open: boolean) => {
    setIsEditDialogOpen(open);
    if (!open) {
      setSelectedProfile(null);
      setIsFetchingProfile(false);
    }
  };

  const handleEditSubmit = async (_updatedProfile: StudentProfile) => {
    await refreshStudents();
    setIsEditDialogOpen(false);
    setSelectedProfile(null);
  };

  return (
    <>
      <StudentDataTable
        columns={columns({
          onDeleteStudent: handleDeleteStudent,
          onEditStudent: handleEditStudent,
          onChangeStatus: handleChangeStudentStatus,
          isSuperAdmin: currentUser?.is_super_admin,
        })}
        data={students}
        classes={classes}
        onImport={handleImportStudents}
        onBulkUpdateStatus={handleBulkUpdateStatus}
        onBulkDelete={handleBulkDelete}
        onRefresh={refreshStudents}
        pagination={pagination}
        setPagination={setPagination}
        pageCount={pageCount}
        totalRecords={totalRecords}
        isLoading={loading}
        isImportLoading={isImportLoading}
        isSuperAdmin={currentUser?.is_super_admin}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        dateRange={dateRange}
        setDateRange={setDateRange}
      />

      <Dialog open={isEditDialogOpen} onOpenChange={handleEditDialogChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>Update details for the selected student.</DialogDescription>
          </DialogHeader>
          {isFetchingProfile ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading student details...
            </div>
          ) : selectedProfile ? (
            <StudentForm
              isEditMode
              defaultValues={selectedProfile}
              onSubmit={handleEditSubmit}
            />
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Select a student to edit from the table.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
