

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getStudentProfileById, getClasses, getUsers, updateStudentProfile, addAuditLog } from '@/lib/store';
import { StudentProfile, DisciplinaryRecord, AcademicRecord, AttendanceRecord, CommunicationLog, UploadedDocument, Class } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { format, differenceInYears } from 'date-fns';
import { Calendar, Edit, Mail, Phone, User, Users, GraduationCap, Building, Shield, FileText, PlusCircle, HeartPulse, Scale, Activity, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { EditStudentForm } from '@/components/student-management/profile/edit-student-form';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

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

function RecordCard<T>({ title, description, icon, records, columns, renderRow, emptyMessage = "No records found." }: { 
    title: string, 
    description: string, 
    icon: React.ElementType,
    records?: T[], 
    columns: string[],
    renderRow: (record: T, index: number) => React.ReactNode,
    emptyMessage?: string
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
            <CardFooter>
                 <Button variant="outline" size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Add Record</Button>
            </CardFooter>
        </Card>
    );
}

export default function StudentProfilePage() {
    const params = useParams();
    const studentId = params.id as string;
    const [profile, setProfile] = useState<StudentProfile | null>(null);
    const [classes, setClasses] = useState<Class[]>([]);
    const [className, setClassName] = useState('');
    const [age, setAge] = useState<number | null>(null);
    const [isEditFormOpen, setIsEditFormOpen] = useState(false);
    const { user: currentUser } = useAuth();
    const { toast } = useToast();

    const fetchProfile = () => {
        if (studentId) {
            const studentProfile = getStudentProfileById(studentId);
            setProfile(studentProfile || null);
            const allClasses = getClasses();
            setClasses(allClasses);

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

    const handleUpdateProfile = (values: Partial<StudentProfile>) => {
        if (!currentUser || !profile) return;
        const updatedProfile = updateStudentProfile(profile.student.student_no, values, currentUser.id);
        if (updatedProfile) {
            setProfile(updatedProfile);
            fetchProfile(); // re-fetch to ensure all derived state is updated
            addAuditLog({
                user: currentUser.email,
                name: currentUser.name,
                action: 'Update Student Profile',
                details: `Updated details for student ${updatedProfile.student.first_name} ${updatedProfile.student.last_name}`,
            });
            toast({
                title: 'Profile Updated',
                description: "The student's profile has been successfully updated.",
            });
            setIsEditFormOpen(false);
        }
    };


    if (!profile) {
        return (
            <div className="flex items-center justify-center h-full">
                <p>Student not found or loading...</p>
            </div>
        );
    }

    const { student, contactDetails, guardianInfo, admissionDetails, academicRecords, healthRecords, disciplinaryRecords, attendanceRecords, communicationLogs, uploadedDocuments } = profile;
    const fullName = `${student.first_name} ${student.last_name} ${student.other_name || ''}`.trim();
    const initials = `${student.first_name[0]}${student.last_name[0]}`;
    const users = getUsers();
    const getUserName = (id: string) => users.find(u => u.id === id)?.name || 'Unknown User';

    return (
        <div className="space-y-6">
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
                    <div>
                         <Dialog open={isEditFormOpen} onOpenChange={setIsEditFormOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Edit className="mr-2 h-4 w-4" /> Edit Profile
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
                <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="contact">Contact & Guardian</TabsTrigger>
                    <TabsTrigger value="academic">Academic</TabsTrigger>
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
                <TabsContent value="academic" asChild>
                    <RecordCard<AcademicRecord>
                        title="Academic Performance"
                        description="Review grades and remarks for each term."
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
                    />
                </TabsContent>
                 <TabsContent value="health" asChild>
                    <Card>
                        <CardHeader>
                           <div className="flex items-center gap-4">
                                <HeartPulse className="h-6 w-6 text-primary" />
                                <div>
                                    <CardTitle>Health Records</CardTitle>
                                    <CardDescription>Allergies, vaccinations, and other medical information.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold mb-2">Allergies</h4>
                                {healthRecords?.allergies?.length ? (
                                    <div className="flex flex-wrap gap-2">
                                        {healthRecords.allergies.map(allergy => <Badge key={allergy} variant="destructive">{allergy}</Badge>)}
                                    </div>
                                ) : <p className="text-sm text-muted-foreground">No known allergies.</p>}
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
                    />
                </TabsContent>
                <TabsContent value="attendance" asChild>
                     <div className="grid gap-6">
                        <RecordCard<AttendanceRecord>
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
                        />
                    </div>
                </TabsContent>
                <TabsContent value="documents" asChild>
                    <RecordCard<UploadedDocument>
                        title="Uploaded Documents"
                        description="Official student documents."
                        icon={FileText}
                        records={uploadedDocuments}
                        columns={['Document Name', 'Type', 'Upload Date', 'Action']}
                        renderRow={(rec, i) => (
                            <TableRow key={i}>
                                <TableCell>{rec.name}</TableCell>
                                <TableCell>{rec.type}</TableCell>
                                <TableCell>{format(new Date(rec.uploaded_at), 'do MMM, yyyy')}</TableCell>
                                <TableCell><Button variant="link" asChild><Link href={rec.url}>View</Link></Button></TableCell>
                            </TableRow>
                        )}
                        emptyMessage="No documents have been uploaded."
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
