'use client';
import { ProtectedRoute } from '@/components/protected-route';
import { useAuth } from '@/hooks/use-auth';
import { useState, useEffect } from 'react';
import { getStaffAppointmentHistory, getClasses, getSubjects, getStaff } from '@/lib/store';
import { Staff, Class, Subject, StaffAppointmentHistory } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Book, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function MyClassesPage() {
    const { user } = useAuth();
    const [teacher, setTeacher] = useState<Staff | null>(null);
    const [latestAppointment, setLatestAppointment] = useState<StaffAppointmentHistory | null>(null);
    const [classes, setClasses] = useState<Class[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);

    useEffect(() => {
        if (user) {
            const allStaff = getStaff();
            const currentTeacher = allStaff.find(s => s.user_id === user.id);
            setTeacher(currentTeacher || null);

            if (currentTeacher) {
                const appointments = getStaffAppointmentHistory();
                const teacherAppointments = appointments
                    .filter(a => a.staff_id === currentTeacher.staff_id)
                    .sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime());
                
                setLatestAppointment(teacherAppointments[0] || null);
            }
            setClasses(getClasses());
            setSubjects(getSubjects());
        }
    }, [user]);

    const assignedClasses = latestAppointment?.class_assigned || [];
    const getSubjectsForClass = (classId: string) => {
        return (latestAppointment?.subjects_assigned || [])
            .map(subId => subjects.find(s => s.id === subId))
            .filter(Boolean) as Subject[];
    }


    return (
        <ProtectedRoute allowedRoles={['Teacher']}>
            <div className="space-y-6">
                 <div>
                    <h1 className="text-3xl font-bold font-headline">My Classes & Subjects</h1>
                    <p className="text-muted-foreground">An overview of your teaching assignments.</p>
                </div>

                {assignedClasses.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {assignedClasses.map(classId => {
                            const currentClass = classes.find(c => c.id === classId);
                            const classSubjects = getSubjectsForClass(classId);
                            const isClassTeacher = latestAppointment?.is_class_teacher_for_class_id === classId;

                            return (
                                <Card key={classId}>
                                    <CardHeader>
                                        <CardTitle className="flex items-center justify-between">
                                            <span>{currentClass?.name}</span>
                                            {isClassTeacher && <Badge>Class Teacher</Badge>}
                                        </CardTitle>
                                        <CardDescription>Your assigned subjects for this class.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {classSubjects.map(subject => (
                                            <div key={subject.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                                                <Book className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm font-medium">{subject.name}</span>
                                            </div>
                                        ))}
                                        {classSubjects.length === 0 && <p className="text-sm text-muted-foreground">No subjects assigned for this class.</p>}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <Card className="mt-6">
                        <CardContent className="p-8 text-center">
                            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-xl font-semibold">No Classes Assigned</h3>
                            <p className="text-muted-foreground mt-2">You are not currently assigned to any classes. Please contact the administrator.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </ProtectedRoute>
    );
}
