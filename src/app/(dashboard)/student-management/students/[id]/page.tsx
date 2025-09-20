'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getStudentProfileById, getClasses } from '@/lib/store';
import { StudentProfile } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { Calendar, Edit, Mail, Phone, User, Users, GraduationCap, Building, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

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

export default function StudentProfilePage() {
    const params = useParams();
    const studentId = params.id as string;
    const [profile, setProfile] = useState<StudentProfile | null>(null);
    const [className, setClassName] = useState('');

    useEffect(() => {
        if (studentId) {
            const studentProfile = getStudentProfileById(studentId);
            setProfile(studentProfile || null);

            if(studentProfile) {
                const classes = getClasses();
                const studentClass = classes.find(c => c.id === studentProfile.admissionDetails.class_assigned);
                setClassName(studentClass?.name || 'N/A');
            }
        }
    }, [studentId]);

    if (!profile) {
        return (
            <div className="flex items-center justify-center h-full">
                <p>Student not found or loading...</p>
            </div>
        );
    }

    const { student, contactDetails, guardianInfo, admissionDetails } = profile;
    const fullName = `${student.first_name} ${student.last_name} ${student.other_name || ''}`.trim();
    const initials = `${student.first_name[0]}${student.last_name[0]}`;

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
                        <Button asChild>
                            <Link href="#">
                                <Edit className="mr-2 h-4 w-4" /> Edit Profile
                            </Link>
                        </Button>
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
                <TabsList>
                    <TabsTrigger value="contact">Contact & Guardian</TabsTrigger>
                    <TabsTrigger value="academic">Academic</TabsTrigger>
                    <TabsTrigger value="financials">Financials</TabsTrigger>
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
                     <Card>
                        <CardHeader>
                            <CardTitle>Academic Records</CardTitle>
                            <CardDescription>Grades, attendance, and performance reports.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <p className="text-muted-foreground">No academic records found. This section is under development.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="financials" asChild>
                    <Card>
                        <CardHeader>
                            <CardTitle>Financial Records</CardTitle>
                            <CardDescription>Fee payments and financial statements.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <p className="text-muted-foreground">No financial records found. This section is under development.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
