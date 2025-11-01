
'use client';
import { ProtectedRoute } from '@/components/protected-route';
import { useAuth } from '@/hooks/use-auth';
import { useState, useEffect } from 'react';
import { getStaffAppointmentHistory, getClasses, getSubjects, getStaff, getStudentProfiles } from '@/lib/store';
import { Staff, Class, Subject, StaffAppointmentHistory, StudentProfile } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Book, Users, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';

export default function MyClassesPage() {
    const { user } = useAuth();
    const [teacher, setTeacher] = useState<Staff | null>(null);
    const [latestAppointment, setLatestAppointment] = useState<StaffAppointmentHistory | null>(null);
    const [classes, setClasses] = useState<Class[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [students, setStudents] = useState<StudentProfile[]>([]);

    useEffect(() => {
        async function fetchData() {
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
                const { students: studentProfiles } = await getStudentProfiles();
                setStudents(studentProfiles);
            }
        }
        fetchData();
    }, [user]);

    const assignedClasses = latestAppointment?.class_assigned || [];
    const getSubjectsForClass = (classId: string) => {
        return (latestAppointment?.subjects_assigned || [])
            .map(subId => subjects.find(s => s.id === subId))
            .filter(Boolean) as Subject[];
    }
    
    const getStudentsInClass = (classId: string) => {
        return students.filter(s => s.admissionDetails.class_assigned === classId);
    }


    return (
        <ProtectedRoute allowedRoles={['Teacher']}>
            <div className="space-y-6">
                 <div>
                    <h1 className="text-3xl font-bold font-headline">My Classes & Students</h1>
                    <p className="text-muted-foreground">An overview of your teaching assignments and student rosters.</p>
                </div>

                {assignedClasses.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {assignedClasses.map(classId => {
                            const currentClass = classes.find(c => c.id === classId);
                            const classSubjects = getSubjectsForClass(classId);
                            const isClassTeacher = latestAppointment?.is_class_teacher_for_class_id === classId;
                            const studentsInClass = getStudentsInClass(classId);

                            return (
                                <Card key={classId}>
                                    <AccordionItem value={classId} className="border-b-0">
                                        <AccordionTrigger className="p-6 hover:no-underline">
                                             <div className="flex items-center justify-between w-full">
                                                <div className="text-left">
                                                    <h3 className="text-xl font-semibold flex items-center gap-2">
                                                        {currentClass?.name}
                                                        {isClassTeacher && <Badge>Class Teacher</Badge>}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">{classSubjects.length} subjects · {studentsInClass.length} students</p>
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-6 pb-6">
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div>
                                                    <h4 className="font-semibold mb-2">Subjects Taught</h4>
                                                     <div className="space-y-3">
                                                        {classSubjects.map(subject => (
                                                            <div key={subject.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                                                                <Book className="h-4 w-4 text-muted-foreground" />
                                                                <span className="text-sm font-medium">{subject.name}</span>
                                                            </div>
                                                        ))}
                                                        {classSubjects.length === 0 && <p className="text-sm text-muted-foreground">No subjects assigned for this class.</p>}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold mb-2">Student Roster</h4>
                                                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                                        {studentsInClass.map(student => (
                                                             <Link href={`/student-management/students/${student.student.student_no}`} key={student.student.student_no} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md hover:bg-muted transition-colors">
                                                                <User className="h-4 w-4 text-muted-foreground" />
                                                                <span className="text-sm font-medium">{student.student.first_name} {student.student.last_name}</span>
                                                            </Link>
                                                        ))}
                                                        {studentsInClass.length === 0 && <p className="text-sm text-muted-foreground">No students in this class.</p>}
                                                    </div>
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Card>
                            );
                        })}
                    </Accordion>
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
