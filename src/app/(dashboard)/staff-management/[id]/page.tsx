
'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getStaffByStaffId, getStaffDocumentsByStaffId, getUserById, deleteStaffDocument, addAuditLog } from '@/lib/store';
import { Staff, User, StaffDocument } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Download, Trash2, File as FileIcon, Upload } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


function InfoItem({ label, value }: { label: string; value?: React.ReactNode }) {
    return (
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-medium">{value || 'N/A'}</p>
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

    const fetchStaffData = () => {
        const staffData = getStaffByStaffId(staffId);
        if (staffData) {
            setStaff(staffData);
            const userData = getUserById(staffData.user_id);
            setUser(userData || null);
            const staffDocuments = getStaffDocumentsByStaffId(staffId);
            setDocuments(staffDocuments);
        } else {
            router.push('/staff-management');
        }
    }

    useEffect(() => {
        fetchStaffData();
    }, [staffId]);

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
                     <Button size="sm">
                        <Edit className="mr-2" /> Edit Staff
                    </Button>
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
                            <Badge variant="outline">{staff.role}</Badge>
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
                    <CardContent className="grid sm:grid-cols-3 gap-4">
                        <InfoItem label="Full Name" value={user.name} />
                        <InfoItem label="Email Address" value={user.email} />
                        <InfoItem label="Phone Number" value={staff.phone} />
                    </CardContent>
                     <CardHeader>
                        <CardTitle>Staff Documents</CardTitle>
                        <CardDescription>CV, letters, and other personal files.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-center mb-4">
                            <Input placeholder="Search documents..." className="max-w-xs" />
                            <Button variant="outline" size="sm"><Upload className="mr-2 h-4 w-4" /> Upload</Button>
                        </div>
                        <ul className="space-y-3">
                           {documents.map((doc) => (
                                <li key={doc.document_name} className="flex items-center justify-between p-3 rounded-md border">
                                    <div className="flex items-center gap-3">
                                        <FileIcon className="h-6 w-6 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">{doc.document_name}</p>
                                            <p className="text-sm text-muted-foreground">Uploaded on {format(new Date(JSON.parse(doc.file).split(',')[0].split(';')[0].split(':')[1]), 'yyyy-MM-dd')}</p>
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
                            <InfoItem label="Role" value={<Badge variant="outline">{staff.role}</Badge>} />
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
             <Card>
                <CardHeader>
                    <CardTitle>Recent Assignments & Activities</CardTitle>
                    <CardDescription>A log of assignments, projects, and exercises given by the teacher.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Activity log will be shown here.</p>
                </CardContent>
            </Card>
        </div>
    );
}
