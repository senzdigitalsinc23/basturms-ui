

'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { getStudentProfileById, getClasses, getUsers, updateStudentProfile, addAuditLog, addAcademicRecord, addDisciplinaryRecord, addAttendanceRecord, addCommunicationLog, addUploadedDocument, updateHealthRecords, deleteUploadedDocument, getSchoolProfile, getSubjects } from '@/lib/store';
import { StudentProfile, DisciplinaryRecord, AcademicRecord, StudentAttendanceRecord, CommunicationLog, UploadedDocument, Class, HealthRecords, TermPayment, SchoolProfileData, AssignmentScore, Subject } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { format, differenceInYears } from 'date-fns';
import { Calendar, Edit, Mail, Phone, User, Users, GraduationCap, Building, Shield, FileText, PlusCircle, HeartPulse, Scale, Activity, MessageSquare, ArrowLeft, Droplet, Trash2, Landmark, Image as ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { EditStudentForm } from '@/components/student-management/profile/edit-student-form';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { AcademicRecordForm } from '@/components/student-management/profile/academic-record-form';
import { DisciplinaryRecordForm } from '@/components/student-management/profile/disciplinary-record-form';
import { AttendanceRecordForm } from '@/components/student-management/profile/attendance-record-form';
import { CommunicationLogForm } from '@/components/student-management/profile/communication-log-form';
import { DocumentUploadForm } from '@/components/student-management/profile/document-upload-form';
import { HealthRecordsForm } from '@/components/student-management/profile/health-records-form';
import { IDCardTemplate } from '@/components/id-cards/id-card-template';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';


const statusColors: Record<string, string> = {
    Admitted: 'bg-green-100 text-green-800',
    Pending: 'bg-yellow-100 text-yellow-800',
    Withdrawn: 'bg-red-100 text-red-800',
    Graduated: 'bg-blue-100 text-blue-800',
    Suspended: 'bg-orange-100 text-orange-800',
    Transferred: 'bg-purple-100 text-purple-800',
    Stopped: 'bg-gray-100 text-gray-800',
};


function DetailItem({ icon, label, value }: { icon: React.ElementType, label: string, value?: string | null }) {
    const Icon = icon;
    return (
        <div className="flex items-start gap-4">
            <div className="flex items-center gap-3">
                <div className="bg-muted p-2 rounded-md">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-sm text-muted-foreground">{value || 'N/A'}</p>
                </div>
            </div>
        </div>
    )
}

function RecordCard<T>({ title, description, icon, records, columns, renderRow, emptyMessage = "No records found.", addRecordButton }: { 
    title: string, 
    description: string, 
    icon: React.ElementType,
    records?: T[], 
    columns: string[],
    renderRow: (record: T, index: number) => React.ReactNode,
    emptyMessage?: string,
    addRecordButton?: React.ReactNode,
}) {
    const Icon = icon;
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-4">
                    <Icon className="h-6 w-6 text-primary" />
                    <div>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {records && records.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {columns.map(col => <TableHead key={col}>{col}</TableHead>)}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {records.map(renderRow)}
                        </TableBody>
                    </Table>
                ) : (
                    <p className="text-muted-foreground">{emptyMessage}</p>
                )}
            </CardContent>
            {addRecordButton && <CardFooter>{addRecordButton}</CardFooter>}
        </Card>
    );
}

export default function StudentProfilePage() {
    const params = useParams();
    const studentId = params.id as string;
    const [profile, setProfile] = useState<StudentProfile | null>(null);
    const [classes, setClasses] = useState<Class[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [className, setClassName] = useState('');
    const [age, setAge] = useState<number | null>(null);
    const [isEditFormOpen, setIsEditFormOpen] = useState(false);
    const [schoolProfile, setSchoolProfile] = useState<SchoolProfileData | null>(null);
    
    // Dialog states
    const [isAcademicFormOpen, setIsAcademicFormOpen] = useState(false);
    const [isDisciplinaryFormOpen, setIsDisciplinaryFormOpen] = useState(false);
    const [isAttendanceFormOpen, setIsAttendanceFormOpen] = useState(false);
    const [isCommunicationFormOpen, setIsCommunicationFormOpen] = useState(false);
    const [isDocumentFormOpen, setIsDocumentFormOpen] = useState(false);
    const [isHealthFormOpen, setIsHealthFormOpen] = useState(false);
    
    const { user: currentUser } = useAuth();
    const { toast } = useToast();
    const idCardRef = useRef<HTMLDivElement>(null);

    const fetchProfile = () => {
        if (studentId) {
            const studentProfile = getStudentProfileById(studentId);
            setProfile(studentProfile || null);
            const allClasses = getClasses();
            setClasses(allClasses);
            setSubjects(getSubjects());
            setSchoolProfile(getSchoolProfile());

            if(studentProfile) {
                const studentClass = allClasses.find(c => c.id === studentProfile.admissionDetails.class_assigned);
                setClassName(studentClass?.name || 'N/A');
                setAge(differenceInYears(new Date(), new Date(studentProfile.student.dob)));
            }
        }
    }

    useEffect(() => {
        fetchProfile();
    }, [studentId]);
    
    const handleDownload = (dataUrl: string, fileName: string) => {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadID = async (format: 'pdf' | 'png') => {
        if (!idCardRef.current || !profile) return;

        const canvas = await html2canvas(idCardRef.current, { scale: 3 });
        const fileName = `ID_Card_${profile.student.first_name}_${profile.student.last_name}`;

        if (format === 'png') {
            const dataUrl = canvas.toDataURL('image/png');
            handleDownload(dataUrl, `${fileName}.png`);
        } else { // pdf
            const cardWidth = 85.6; // mm
            const cardHeight = 53.98; // mm
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: [cardWidth, cardHeight]
            });
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, cardWidth, cardHeight);
            pdf.save(`${fileName}.pdf`);
        }
    };


    const handleUpdateProfile = (values: Partial<StudentProfile>) => {
        if (!currentUser || !profile) return;
        
        const updatedProfile = updateStudentProfile(profile.student.student_no, values, currentUser.id);
        if (updatedProfile) {
            setProfile(updatedProfile);
            fetchProfile(); // re-fetch to ensure all derived state is updated
            
            toast({
                title: 'Profile Updated',
                description: "The student's profile has been successfully updated.",
            });
            setIsEditFormOpen(false);
        }
    };
    
    const handleUpdateHealthRecords = (values: HealthRecords) => {
        if (!currentUser || !profile) return;
        const updatedProfile = updateHealthRecords(profile.student.student_no, values, currentUser.id);
        if (updatedProfile) {
            setProfile(updatedProfile);
            addAuditLog({
                user: currentUser.email,
                name: currentUser.name,
                action: 'Update Health Records',
                details: `Updated health records for student ${updatedProfile.student.first_name} ${updatedProfile.student.last_name}`,
            });
            toast({
                title: 'Health Records Updated',
                description: "The student's health records have been successfully updated.",
            });
            setIsHealthFormOpen(false);
        }
    }

    const handleAddRecord = <T,>(
        addFunction: (studentId: string, record: T, editorId: string) => StudentProfile | null,
        record: T,
        logAction: string,
        logDetails: string,
        successTitle: string,
        successDescription: string,
        closeDialog: () => void
    ) => {
        if (!currentUser || !profile) return;
        
        const updatedProfile = addFunction(profile.student.student_no, record, currentUser.id);
        
        if (updatedProfile) {
            setProfile(updatedProfile);
            addAuditLog({ user: currentUser.email, name: currentUser.name, action: logAction, details: logDetails });
            toast({ title: successTitle, description: successDescription });
            closeDialog();
        }
    };
    
    const handleDeleteDocument = (documentId: string) => {
        if (!currentUser || !profile) return;

        const updatedProfile = deleteUploadedDocument(profile.student.student_no, documentId, currentUser.id);

        if (updatedProfile) {
            setProfile(updatedProfile);
            addAuditLog({
                user: currentUser.email,
                name: currentUser.name,
                action: 'Delete Document',
                details: `Deleted document (ID: ${documentId}) for student ${fullName}`,
            });
            toast({
                title: 'Document Deleted',
                description: 'The document has been successfully deleted.',
            });
        }
    };


    if (!profile) {
        return (
            <div className="flex items-center justify-center h-full">
                <p>Student not found or loading...</p>
            </div>
        );
    }

    const { student, contactDetails, guardianInfo, admissionDetails, academicRecords, healthRecords, disciplinaryRecords, attendanceRecords, communicationLogs, uploadedDocuments, financialDetails, assignmentScores } = profile;
    const fullName = `${student.first_name} ${student.last_name} ${student.other_name || ''}`.trim();
    const initials = `${student.first_name[0]}${student.last_name[0]}`;
    const users = getUsers();
    const getUserName = (id: string) => users.find(u => u.id === id)?.name || 'Unknown User';
    
    const currentTermPayment = financialDetails?.payment_history.slice(-1)[0];
    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(amount);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>{/* This empty div helps with flex layout */}</div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/student-management/students">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to List
                        </Link>
                    </Button>
                    <Dialog open={isCommunicationFormOpen} onOpenChange={setIsCommunicationFormOpen}>
                        <DialogTrigger asChild>
                             <Button variant="outline" size="sm">
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Log Communication
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Communication Log</DialogTitle>
                                <DialogDescription>Record a communication with a parent/guardian.</DialogDescription>
                            </DialogHeader>
                            <CommunicationLogForm onSubmit={values => handleAddRecord(addCommunicationLog, values, "Add Communication Log", `Logged communication with ${values.with_whom}`, "Log Added", "Communication log added successfully.", () => setIsCommunicationFormOpen(false))} />
                        </DialogContent>
                    </Dialog>
                    <Dialog open={isEditFormOpen} onOpenChange={setIsEditFormOpen}>
                        <DialogTrigger asChild>
                             <Button size="sm">
                                <Edit className="mr-2 h-4 w-4" /> Edit Student
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Edit Student Profile</DialogTitle>
                                <DialogDescription>
                                    Update the details for {fullName}.
                                </DialogDescription>
                            </DialogHeader>
                            <EditStudentForm
                                defaultValues={profile}
                                classes={classes}
                                onSubmit={handleUpdateProfile}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            <Card>
                <CardHeader className="flex flex-row items-center gap-6 space-y-0">
                    <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                        <AvatarImage src={student.avatarUrl} alt={fullName} />
                        <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold font-headline">{fullName}</h1>
                        <p className="text-muted-foreground">Student ID: {student.student_no}</p>
                        <p className="text-muted-foreground">Class: {className}</p>
                    </div>
                </CardHeader>
            </Card>

            <div className="grid md:grid-cols-3 gap-6">
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-medium text-muted-foreground">Admission Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Badge className={`text-sm ${statusColors[admissionDetails.admission_status]}`}>{admissionDetails.admission_status}</Badge>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-medium text-muted-foreground">Date of Birth</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="font-semibold text-lg">{format(new Date(student.dob), 'do MMMM, yyyy')}</p>
                         {age !== null && <p className="text-sm text-muted-foreground">{age} years old</p>}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-medium text-muted-foreground">Gender</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="font-semibold text-lg">{student.gender}</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="contact">
                <TabsList className="grid w-full grid-cols-7">
                    <TabsTrigger value="contact">Contact & Guardian</TabsTrigger>
                    <TabsTrigger value="academic">Academic</TabsTrigger>
                    <TabsTrigger value="financials">Financials</TabsTrigger>
                    <TabsTrigger value="health">Health</TabsTrigger>
                    <TabsTrigger value="conduct">Conduct</TabsTrigger>
                    <TabsTrigger value="attendance">Attendance</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>

                <TabsContent value="contact" asChild>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg flex items-center"><User className="mr-2 h-5 w-5 text-primary" /> Student's Contact</h3>
                                    <Separator />
                                     <DetailItem icon={Mail} label="Email" value={contactDetails.email} />
                                     <DetailItem icon={Phone} label="Phone Number" value={contactDetails.phone} />
                                     <DetailItem icon={Building} label="Current Residence" value={contactDetails.residence} />
                                </div>
                                <div className="space-y-4">
                                     <h3 className="font-semibold text-lg flex items-center"><Shield className="mr-2 h-5 w-5 text-primary" /> Guardian's Contact</h3>
                                     <Separator />
                                     <DetailItem icon={User} label="Name" value={guardianInfo.guardian_name} />
                                     <DetailItem icon={Phone} label="Phone Number" value={guardianInfo.guardian_phone} />
                                     <DetailItem icon={Mail} label="Email" value={guardianInfo.guardian_email} />
                                     <DetailItem icon={Users} label="Relationship" value={guardianInfo.guardian_relationship} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="academic" className="space-y-6">
                    <RecordCard<AssignmentScore>
                        title="Assignment Scores"
                        description="Detailed scores from classwork, homework, and exams."
                        icon={FileText}
                        records={assignmentScores}
                        columns={['Assignment', 'Subject', 'Score']}
                        renderRow={(rec, i) => (
                             <TableRow key={i}>
                                <TableCell>{rec.assignment_name}</TableCell>
                                <TableCell>{subjects.find(s => s.id === rec.subject_id)?.name || rec.subject_id}</TableCell>
                                <TableCell><Badge variant="secondary">{rec.score}</Badge></TableCell>
                            </TableRow>
                        )}
                        emptyMessage="No individual assignment scores have been recorded yet."
                    />
                    <RecordCard<AcademicRecord>
                        title="Academic Performance"
                        description="Review final grades and remarks for each term."
                        icon={GraduationCap}
                        records={academicRecords}
                        columns={['Term', 'Subject', 'Grade', 'Teacher Remarks']}
                        renderRow={(rec, i) => (
                            <TableRow key={i}>
                                <TableCell>{rec.term}</TableCell>
                                <TableCell>{rec.subject}</TableCell>
                                <TableCell><Badge variant="secondary">{rec.grade}</Badge></TableCell>
                                <TableCell className="max-w-xs truncate">{rec.teacher_remarks}</TableCell>
                            </TableRow>
                        )}
                        addRecordButton={
                            <Dialog open={isAcademicFormOpen} onOpenChange={setIsAcademicFormOpen}>
                                <DialogTrigger asChild><Button variant="outline" size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Add Record</Button></DialogTrigger>
                                <DialogContent><DialogHeader><DialogTitle>Add Academic Record</DialogTitle></DialogHeader>
                                    <AcademicRecordForm onSubmit={values => handleAddRecord(addAcademicRecord, values, "Add Academic Record", `Added grade for ${values.subject}`, "Record Added", "Academic record added successfully.", () => setIsAcademicFormOpen(false))} />
                                </DialogContent>
                            </Dialog>
                        }
                    />
                </TabsContent>
                <TabsContent value="financials">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Landmark className="h-6 w-6 text-primary" />
                                <div>
                                    <CardTitle>Financials</CardTitle>
                                    <CardDescription>Overview of the student's financial account.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {financialDetails ? (
                                <>
                                    <div className="grid md:grid-cols-3 gap-4 text-center">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-sm font-medium text-muted-foreground">Current Term Fees</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-2xl font-bold">{formatCurrency(currentTermPayment?.total_fees || 0)}</p>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-sm font-medium text-muted-foreground">Amount Paid</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-2xl font-bold text-green-600">{formatCurrency(currentTermPayment?.amount_paid || 0)}</p>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-sm font-medium text-muted-foreground">Outstanding</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-2xl font-bold text-red-600">{formatCurrency(currentTermPayment?.outstanding || 0)}</p>
                                            </CardContent>
                                        </Card>
                                    </div>
                                    
                                     <Card className="bg-muted/50">
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <p className="font-medium">Total Account Balance</p>
                                            <p className={`text-xl font-bold ${financialDetails.account_balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                {formatCurrency(Math.abs(financialDetails.account_balance))}
                                                <span className="text-sm font-normal ml-2">{financialDetails.account_balance < 0 ? 'Debit' : 'Credit'}</span>
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <div>
                                        <h4 className="font-semibold mb-2">Payment History</h4>
                                        <RecordCard<TermPayment>
                                            title=""
                                            description=""
                                            icon={() => null}
                                            records={financialDetails.payment_history}
                                            columns={['Term', 'Total Billed', 'Amount Paid', 'Outstanding', 'Status']}
                                            renderRow={(rec, i) => (
                                                <TableRow key={i}>
                                                    <TableCell>{rec.term}</TableCell>
                                                    <TableCell>{formatCurrency(rec.total_fees)}</TableCell>
                                                    <TableCell>{formatCurrency(rec.amount_paid)}</TableCell>
                                                    <TableCell>{formatCurrency(rec.outstanding)}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={rec.status === 'Paid' ? 'secondary' : (rec.status === 'Partially Paid' ? 'default' : 'destructive')}>
                                                            {rec.status}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        />
                                    </div>
                                </>
                            ) : (
                                <p className="text-muted-foreground text-center py-8">No financial records found for this student.</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="health" asChild>
                    <Card>
                        <CardHeader className="flex flex-row justify-between items-start">
                           <div className="flex items-center gap-4">
                                <HeartPulse className="h-6 w-6 text-primary" />
                                <div>
                                    <CardTitle>Health Records</CardTitle>
                                    <CardDescription>Allergies, vaccinations, and other medical information.</CardDescription>
                                </div>
                            </div>
                             <Dialog open={isHealthFormOpen} onOpenChange={setIsHealthFormOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm"><Edit className="mr-2 h-4 w-4" /> Edit Health Records</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader><DialogTitle>Edit Health Records</DialogTitle></DialogHeader>
                                    <HealthRecordsForm 
                                        defaultValues={healthRecords}
                                        onSubmit={handleUpdateHealthRecords}
                                    />
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-semibold mb-2 flex items-center"><Droplet className="mr-2 h-4 w-4 text-destructive" /> Blood Group</h4>
                                    <p className="text-lg font-bold">{healthRecords?.blood_group || 'N/A'}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2">Allergies</h4>
                                    {healthRecords?.allergies?.length ? (
                                        <div className="flex flex-wrap gap-2">
                                            {healthRecords.allergies.map(allergy => <Badge key={allergy} variant="destructive">{allergy}</Badge>)}
                                        </div>
                                    ) : <p className="text-sm text-muted-foreground">No known allergies.</p>}
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <h4 className="font-semibold mb-2">Vaccinations</h4>
                                {healthRecords?.vaccinations?.length ? (
                                    <ul className="list-disc pl-5 text-sm space-y-1">
                                        {healthRecords.vaccinations.map(vax => <li key={vax.name}>{vax.name} on {format(new Date(vax.date), 'do MMM, yyyy')}</li>)}
                                    </ul>
                                ) : <p className="text-sm text-muted-foreground">No vaccination records.</p>}
                            </div>
                             <Separator />
                            <div>
                                <h4 className="font-semibold mb-2">Medical Notes</h4>
                                <p className="text-sm text-muted-foreground">{healthRecords?.medical_notes || 'No additional medical notes.'}</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="conduct" asChild>
                     <RecordCard<DisciplinaryRecord>
                        title="Student Conduct & Disciplinary Records"
                        description="Log of all disciplinary incidents."
                        icon={Scale}
                        records={disciplinaryRecords}
                        columns={['Date', 'Incident Reported', 'Action Taken', 'Reported By']}
                        renderRow={(rec, i) => (
                            <TableRow key={i}>
                                <TableCell>{format(new Date(rec.date), 'do MMM, yyyy')}</TableCell>
                                <TableCell>{rec.incident}</TableCell>
                                <TableCell>{rec.action_taken}</TableCell>
                                <TableCell>{getUserName(rec.reported_by)}</TableCell>
                            </TableRow>
                        )}
                        addRecordButton={
                             <Dialog open={isDisciplinaryFormOpen} onOpenChange={setIsDisciplinaryFormOpen}>
                                <DialogTrigger asChild><Button variant="outline" size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Add Record</Button></DialogTrigger>
                                <DialogContent><DialogHeader><DialogTitle>Add Disciplinary Record</DialogTitle></DialogHeader>
                                    <DisciplinaryRecordForm users={users} onSubmit={values => handleAddRecord(addDisciplinaryRecord, values, "Add Disciplinary Record", `Logged incident: ${values.incident}`, "Record Added", "Disciplinary record added successfully.", () => setIsDisciplinaryFormOpen(false))} />
                                </DialogContent>
                            </Dialog>
                        }
                    />
                </TabsContent>
                <TabsContent value="attendance" asChild>
                     <div className="grid gap-6">
                        <RecordCard<StudentAttendanceRecord>
                            title="Attendance Summary"
                            description="Overview of student's attendance."
                            icon={Activity}
                            records={attendanceRecords}
                            columns={['Date', 'Status']}
                            renderRow={(rec, i) => (
                                <TableRow key={i}>
                                    <TableCell>{format(new Date(rec.date), 'do MMM, yyyy')}</TableCell>
                                    <TableCell><Badge variant={rec.status === 'Present' ? 'secondary' : 'destructive'}>{rec.status}</Badge></TableCell>
                                </TableRow>
                            )}
                             addRecordButton={
                                <Dialog open={isAttendanceFormOpen} onOpenChange={setIsAttendanceFormOpen}>
                                    <DialogTrigger asChild><Button variant="outline" size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Add Record</Button></DialogTrigger>
                                    <DialogContent><DialogHeader><DialogTitle>Add Attendance Record</DialogTitle></DialogHeader>
                                        <AttendanceRecordForm onSubmit={values => handleAddRecord(addAttendanceRecord, {...values, student_id: studentId}, "Add Attendance Record", `Logged attendance for ${format(new Date(values.date), 'yyyy-MM-dd')}`, "Record Added", "Attendance record added successfully.", () => setIsAttendanceFormOpen(false))} />
                                    </DialogContent>
                                </Dialog>
                            }
                        />
                         <RecordCard<CommunicationLog>
                            title="Communication Log"
                            description="Record of communications with parents/guardians."
                            icon={MessageSquare}
                            records={communicationLogs}
                            columns={['Date', 'Type', 'With Whom', 'Notes']}
                            renderRow={(rec, i) => (
                                <TableRow key={i}>
                                    <TableCell>{format(new Date(rec.date), 'do MMM, yyyy')}</TableCell>
                                    <TableCell>{rec.type}</TableCell>
                                    <TableCell>{rec.with_whom}</TableCell>
                                    <TableCell>{rec.notes}</TableCell>
                                </TableRow>
                            )}
                             addRecordButton={
                                <Dialog open={isCommunicationFormOpen} onOpenChange={setIsCommunicationFormOpen}>
                                    <DialogTrigger asChild><Button variant="outline" size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Add Record</Button></DialogTrigger>
                                    <DialogContent><DialogHeader><DialogTitle>Add Communication Log</DialogTitle></DialogHeader>
                                        <CommunicationLogForm onSubmit={values => handleAddRecord(addCommunicationLog, values, "Add Communication Log", `Logged communication with ${values.with_whom}`, "Log Added", "Communication log added successfully.", () => setIsCommunicationFormOpen(false))} />
                                    </DialogContent>
                                </Dialog>
                            }
                        />
                    </div>
                </TabsContent>
                <TabsContent value="documents" className="space-y-6">
                    <RecordCard<UploadedDocument>
                        title="Uploaded Documents"
                        description="Official student documents."
                        icon={FileText}
                        records={uploadedDocuments}
                        columns={['Document Name', 'Type', 'Upload Date', 'Actions']}
                        renderRow={(rec, i) => (
                            <TableRow key={i}>
                                <TableCell>{rec.name}</TableCell>
                                <TableCell>{rec.type}</TableCell>
                                <TableCell>{format(new Date(rec.uploaded_at), 'do MMM, yyyy')}</TableCell>
                                <TableCell className="flex gap-2">
                                    <Button variant="link" size="sm" asChild>
                                        <Link href={rec.url} target="_blank" rel="noopener noreferrer" download={rec.name}>View</Link>
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="sm">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete the document.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteDocument(rec.uploaded_at)}>
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                        )}
                        emptyMessage="No documents have been uploaded."
                        addRecordButton={
                             <Dialog open={isDocumentFormOpen} onOpenChange={setIsDocumentFormOpen}>
                                <DialogTrigger asChild><Button variant="outline" size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Add Record</Button></DialogTrigger>
                                <DialogContent><DialogHeader><DialogTitle>Upload Document</DialogTitle></DialogHeader>
                                    <DocumentUploadForm onSubmit={values => handleAddRecord(addUploadedDocument, values, "Upload Document", `Uploaded document: ${values.name}`, "Document Uploaded", "Document uploaded successfully.", () => setIsDocumentFormOpen(false))} />
                                </DialogContent>
                            </Dialog>
                        }
                    />
                    <Card>
                        <CardHeader>
                            <CardTitle>ID Card</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-4">
                             <div ref={idCardRef}>
                                <IDCardTemplate
                                    cardData={{ type: 'student', data: profile }}
                                    schoolProfile={schoolProfile}
                                    classes={classes}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleDownloadID('pdf')}>
                                    <FileText className="mr-2" /> PDF
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleDownloadID('png')}>
                                    <ImageIcon className="mr-2" /> PNG
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
