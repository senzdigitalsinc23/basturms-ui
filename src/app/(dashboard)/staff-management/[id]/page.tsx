

'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getStaffByStaffId, getStaffDocumentsByStaffId, getUserById, deleteStaffDocument, addAuditLog, getStaffAppointmentHistory, addStaffDocument as storeAddStaffDocument, updateStaff, getClasses, getSubjects, addStaffAcademicHistory, addStaffAppointmentHistory, storeGetStaffAcademicHistory } from '@/lib/store';
import { Staff, User, StaffDocument, StaffAppointmentHistory, Role, Class, Subject } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Download, Trash2, File as FileIcon, Upload, Check, GraduationCap, Input } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AddStaffForm } from '@/components/staff-management/add-staff-form';
import { StaffDocumentUploadForm } from '@/components/staff-management/staff-document-upload-form';
import { saveToStorage, STAFF_ACADEMIC_HISTORY_KEY } from '@/lib/store';


function InfoItem({ label, value }: { label: string; value?: React.ReactNode }) {
    return (
        <div>
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className="font-medium">{value || 'N/A'}</div>
        </div>
    )
}

export default function StaffProfilePage() {
    const params = useParams();
    const staffId = params.id as string;
    const router = useRouter();
    const { user: currentUser } = useAuth();
    const { toast } = useToast();

    const [staff, setStaff] = useState<Staff | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [documents, setDocuments] = useState<StaffDocument[]>([]);
    const [appointmentHistory, setAppointmentHistory] = useState<StaffAppointmentHistory | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [classes, setClasses] = useState<Class[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);


    const fetchStaffData = () => {
        const staffData = getStaffByStaffId(staffId);
        if (staffData) {
            setStaff(staffData);
            setClasses(getClasses());
            setSubjects(getSubjects());
            const userData = getUserById(staffData.user_id);
            setUser(userData || null);
            const staffDocuments = getStaffDocumentsByStaffId(staffId);
            setDocuments(staffDocuments);
            const staffAppointments = getStaffAppointmentHistory();
            const latestAppointment = staffAppointments
                .filter(a => a.staff_id === staffId)
                .sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime())[0];
            setAppointmentHistory(latestAppointment || null);
        } else {
            router.push('/staff-management');
        }
    }

    useEffect(() => {
        fetchStaffData();
    }, [staffId]);

    const handleUpdate = (data: {staffData: Omit<Staff, 'user_id'>, academic_history: any[], documents: any[], appointment_history: any}) => {
        if (!currentUser || !staff) return;

        const updated = updateStaff(staff.staff_id, data.staffData, currentUser.id);

        if(updated) {
            // This is not ideal, but for now we remove and re-add to update.
            const existingAcademicHistory = storeGetStaffAcademicHistory().filter(h => h.staff_id !== staff.staff_id);
            saveToStorage(STAFF_ACADEMIC_HISTORY_KEY, existingAcademicHistory);
            data.academic_history.forEach(history => {
                addStaffAcademicHistory({ ...history, staff_id: staff.staff_id });
            });

            const existingAppointments = getStaffAppointmentHistory().filter(a => a.staff_id !== staff.staff_id);
            saveToStorage(STAFF_APPOINTMENT_HISTORY_KEY, existingAppointments);
            addStaffAppointmentHistory({...data.appointment_history, staff_id: staff.staff_id});
            
            fetchStaffData(); // Re-fetch all data
            toast({ title: 'Staff Updated', description: "The staff member's details have been updated." });
            setIsEditOpen(false);
        }
    };
    
    const handleUploadDocument = (values: { name: string; file: string }) => {
        if (!currentUser || !staff) return;
        storeAddStaffDocument({
            staff_id: staff.staff_id,
            document_name: values.name,
            file: values.file,
        });
        toast({ title: 'Document Uploaded', description: `${values.name} has been added.` });
        fetchStaffData();
        setIsUploadOpen(false);
    }

    const handleDeleteDocument = (docName: string) => {
        if (!currentUser || !staff) return;
        const success = deleteStaffDocument(staff.staff_id, docName);
        if (success) {
            toast({ title: 'Document Deleted', description: `${docName} has been removed.` });
            addAuditLog({ user: currentUser.email, name: currentUser.name, action: 'Delete Staff Document', details: `Deleted document ${docName} for staff ${staff.first_name} ${staff.last_name}` });
            fetchStaffData(); // Re-fetch data
        } else {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete document.' });
        }
    }
    
     const handleDownload = (fileDataUrl: string, fileName: string) => {
        const link = document.createElement("a");
        link.href = fileDataUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!staff || !user) {
        return <div className="flex items-center justify-center h-full">Loading...</div>;
    }

    const userInitials = `${staff.first_name[0]}${staff.last_name[0]}`;
    const experience = formatDistanceToNow(new Date(staff.date_of_joining), { addSuffix: false });
    const isTeacher = (staff.roles || []).includes('Teacher');
    
    const assignedClassNames = appointmentHistory?.class_assigned?.map(classId => classes.find(c => c.id === classId)?.name).filter(Boolean).join(', ') || 'N/A';
    const assignedSubjectNames = appointmentHistory?.subjects_assigned?.map(subjectId => subjects.find(s => s.id === subjectId)?.name).filter(Boolean).join(', ') || 'N/A';


    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Staff Profile</h1>
                    <p className="text-muted-foreground">Details for {staff.first_name} {staff.last_name}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/staff-management"><ArrowLeft className="mr-2" /> Back to List</Link>
                    </Button>
                    <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm">
                                <Edit className="mr-2" /> Edit Staff
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
                            <DialogHeader>
                                <DialogTitle>Edit Staff</DialogTitle>
                                <DialogDescription>Update details for {staff.first_name} {staff.last_name}</DialogDescription>
                            </DialogHeader>
                            <div className="flex-grow overflow-hidden">
                                <AddStaffForm isEditMode defaultValues={staff} onSubmit={handleUpdate} />
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center gap-6">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback className="text-3xl">{userInitials}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="text-2xl font-bold">{user.name}</h2>
                        <p className="text-muted-foreground">{staff.staff_id}</p>
                        <div className="flex gap-2 mt-2">
                            {(staff.roles || []).map(role => <Badge key={role} variant="outline">{role}</Badge>)}
                            <Badge variant={user.status === 'active' ? 'secondary' : 'destructive'}>{user.status === 'active' ? 'Active' : 'Inactive'}</Badge>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <div className="grid md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Personal & Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <InfoItem label="Full Name" value={user.name} />
                        <InfoItem label="Email Address" value={user.email} />
                        <InfoItem label="Phone Number" value={staff.phone} />
                    </CardContent>
                     <CardHeader>
                        <CardTitle>Staff Documents</CardTitle>
                        <CardDescription>CV, letters, and other personal files.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-end items-center mb-4">
                            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm"><Upload className="mr-2 h-4 w-4" /> Upload</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader><DialogTitle>Upload Document</DialogTitle></DialogHeader>
                                    <StaffDocumentUploadForm onSubmit={handleUploadDocument} />
                                </DialogContent>
                            </Dialog>
                        </div>
                        <ul className="space-y-3">
                           {documents.map((doc) => (
                                <li key={doc.document_name} className="flex items-center justify-between p-3 rounded-md border">
                                    <div className="flex items-center gap-3">
                                        <FileIcon className="h-6 w-6 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">{doc.document_name}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleDownload(doc.file, doc.document_name)}>
                                            <Download className="h-4 w-4" />
                                        </Button>
                                         <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This will permanently delete the document {doc.document_name}.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteDocument(doc.document_name)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </li>
                           ))}
                        </ul>
                    </CardContent>
                </Card>
                 <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Professional Information</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <InfoItem label="Staff ID" value={staff.staff_id} />
                            <InfoItem label="Roles" value={<div className="flex flex-wrap gap-1">{(staff.roles || []).map(r => <Badge key={r} variant="outline">{r}</Badge>)}</div>} />
                            <InfoItem label="Status" value={<Badge variant={user.status === 'active' ? 'secondary' : 'destructive'}>{user.status}</Badge>} />
                            <InfoItem label="Joining Date" value={format(new Date(staff.date_of_joining), "MMMM do, yyyy")} />
                            <InfoItem label="Experience" value={experience} />
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle>Official Identification</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <InfoItem label={staff.id_type} value={staff.id_no} />
                            <InfoItem label="SSNIT Number" value={staff.snnit_no} />
                        </CardContent>
                    </Card>
                </div>
            </div>
             {isTeacher && (
                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Academic Responsibilities</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <InfoItem label="Class Assigned" value={assignedClassNames} />
                           <InfoItem label="Subjects Taught" value={assignedSubjectNames} />
                        </CardContent>
                    </Card>
                    <Card>
                         <CardHeader>
                            <CardTitle>Performance Evaluation</CardTitle>
                            <CardDescription>Based on assigned class performance.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Check className="h-5 w-5 text-green-500" />
                                    <p>Avg. Class Attendance</p>
                                </div>
                                <p className="font-bold">94.5%</p>
                            </div>
                             <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <GraduationCap className="h-5 w-5 text-blue-500" />
                                    <p>Avg. Student Score</p>
                                </div>
                                <p className="font-bold">88.2%</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
             )}
             {isTeacher && (
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Assignments & Activities</CardTitle>
                        <CardDescription>A log of assignments, projects, and exercises given by the teacher.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>- Assigned 'Algebra Basics' worksheet to Basic 5. (2 days ago)</li>
                            <li>- Graded 'English Comprehension' for Basic 6. (5 days ago)</li>
                        </ul>
                    </CardContent>
                </Card>
             )}
        </div>
    );
}
