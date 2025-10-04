
'use client';
import { useState, useEffect } from 'react';
import { getClasses, getStudentProfiles, getSubjects, addClassSubject, addScore, getScoresForClass, getAssignmentActivities, getClassAssignmentActivities, getStaff, getStaffAppointmentHistory, getStudentReport } from '@/lib/store';
import { Class, StudentProfile, Subject, ClassSubject, AssignmentScore, AssignmentActivity } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Save } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';


type StudentForGrading = {
    id: string;
    name: string;
    scores: Record<string, number | string>; // subjectId -> score
};

export function ScoreEntryForm() {
    const [allClasses, setAllClasses] = useState<Class[]>([]);
    const [teacherClasses, setTeacherClasses] = useState<Class[]>([]);
    const [selectedClass, setSelectedClass] = useState<string | undefined>();
    const [classSubjects, setClassSubjects] = useState<Subject[]>([]);
    const [students, setStudents] = useState<StudentForGrading[]>([]);
    const [assignmentName, setAssignmentName] = useState<string | undefined>();
    const [assignmentOptions, setAssignmentOptions] = useState<string[]>([]);
    const [isTermFinalized, setIsTermFinalized] = useState(false);

    const { toast } = useToast();
    const { user } = useAuth();

    useEffect(() => {
        const classes = getClasses();
        setAllClasses(classes);
        if (user?.role === 'Admin') {
            setTeacherClasses(classes);
        } else if (user?.role === 'Teacher') {
            const staffList = getStaff();
            const currentTeacher = staffList.find(s => s.user_id === user.id);
            if (currentTeacher) {
                const appointments = getStaffAppointmentHistory();
                const teacherAppointments = appointments
                    .filter(a => a.staff_id === currentTeacher.staff_id)
                    .sort((a,b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime());
                const latestAppointment = teacherAppointments[0];
                if (latestAppointment && latestAppointment.class_assigned) {
                    const assignedClasses = classes.filter(c => latestAppointment.class_assigned?.includes(c.id));
                    setTeacherClasses(assignedClasses);
                }
            }
        }
    }, [user]);

    // Effect for when the class changes
    useEffect(() => {
        if (selectedClass) {
            const allSubjects = getSubjects();
            let subjectsToShow: Subject[] = [];

            if (user?.role === 'Admin') {
                const assignmentsForClass = addClassSubject().filter(cs => cs.class_id === selectedClass);
                const subjectIds = assignmentsForClass.map(cs => cs.subject_id);
                subjectsToShow = allSubjects.filter(s => subjectIds.includes(s.id));
            } else if (user?.role === 'Teacher') {
                const staffMember = getStaff().find(s => s.user_id === user.id);
                if (staffMember) {
                    const latestAppointment = getStaffAppointmentHistory()
                        .filter(a => a.staff_id === staffMember.staff_id)
                        .sort((a,b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime())[0];
                    
                    if (latestAppointment?.subjects_assigned && latestAppointment.class_assigned?.includes(selectedClass)) {
                         // Filter subjects assigned to the class AND to the teacher.
                        const classSubjectIds = addClassSubject().filter(cs => cs.class_id === selectedClass).map(cs => cs.subject_id);
                        const teacherAndClassSubjectIds = latestAppointment.subjects_assigned.filter(subId => classSubjectIds.includes(subId));
                        subjectsToShow = allSubjects.filter(s => teacherAndClassSubjectIds.includes(s.id));
                    }
                }
            }
            
            setClassSubjects(subjectsToShow);

            // Get activities for the selected class
            const allActivities = getAssignmentActivities();
            const classActivityLinks = getClassAssignmentActivities().filter(ca => ca.class_id === selectedClass);
            const activityIds = classActivityLinks.map(ca => ca.activity_id);
            const activities = allActivities.filter(a => activityIds.includes(a.id));
            const uniqueActivities = [...new Map(activities.map(item => [item.id, item])).values()];
            
            const options: string[] = [];
            uniqueActivities.forEach(act => {
                if (act.expected_per_term > 1) {
                    for (let i = 1; i <= act.expected_per_term; i++) {
                        options.push(`${act.name} ${i}`);
                    }
                } else {
                    options.push(act.name);
                }
            });
            setAssignmentOptions(options);

            setAssignmentName(undefined);
            
            const allStudentsInClass = getStudentProfiles().filter(p => p.admissionDetails.class_assigned === selectedClass);
            
            const initialScores: Record<string, string> = {};
            subjectsToShow.forEach(sub => {
                initialScores[sub.id] = '';
            });
            
            setStudents(allStudentsInClass.map(p => ({
                id: p.student.student_no,
                name: `${p.student.first_name} ${p.student.last_name}`,
                scores: { ...initialScores } 
            })));

            // Check if term is finalized
            const activeTerm = "Second Term 2023/2024"; // Placeholder, should be dynamically determined
            const allReportsFinal = allStudentsInClass.every(student => {
                const report = getStudentReport(student.student.student_no, activeTerm);
                return report?.status === 'Final';
            });
            setIsTermFinalized(allReportsFinal && allStudentsInClass.length > 0);

        } else {
            setClassSubjects([]);
            setStudents([]);
            setAssignmentOptions([]);
            setIsTermFinalized(false);
        }
    }, [selectedClass, user]);

    // Effect for loading scores when an assignment is selected
    useEffect(() => {
        if (selectedClass && students.length > 0 && assignmentName) {
            const allScores = getScoresForClass(selectedClass);
            
            setStudents(prevStudents => prevStudents.map(student => {
                 const studentScores = allScores.filter(s => s.student_id === student.id && s.assignment_name === assignmentName);
                 const scoresBySubject: Record<string, number | string> = {};
                 classSubjects.forEach(sub => {
                    const score = studentScores.find(s => s.subject_id === sub.id)?.score;
                    scoresBySubject[sub.id] = score !== undefined ? score : '';
                });
                return { ...student, scores: scoresBySubject };
            }));
        }
         else if (selectedClass && students.length > 0 && !assignmentName) {
            // When assignment is reset, clear out the scores in the UI
            const initialScores: Record<string, string> = {};
            classSubjects.forEach(sub => {
                initialScores[sub.id] = '';
            });
             setStudents(prevStudents => prevStudents.map(student => ({
                ...student,
                scores: {...initialScores}
            })));
        }
    }, [selectedClass, assignmentName, classSubjects]);


    const handleScoreChange = (studentId: string, subjectId: string, value: string) => {
        setStudents(prev => prev.map(s => {
            if (s.id === studentId) {
                const newScores = { ...s.scores, [subjectId]: value };
                return { ...s, scores: newScores };
            }
            return s;
        }));
    }

    const handleSaveScores = () => {
        if (!selectedClass || !user || !assignmentName || isTermFinalized) return;
        
        let savedCount = 0;

        students.forEach(student => {
            classSubjects.forEach(subject => {
                const scoreValue = student.scores[subject.id];
                if (scoreValue !== '' && scoreValue !== undefined) {
                    const score = parseFloat(String(scoreValue));
                    if (!isNaN(score)) {
                         addScore({
                            student_id: student.id,
                            class_id: selectedClass,
                            subject_id: subject.id,
                            assignment_name: assignmentName,
                            score: score
                        }, user.id);
                        savedCount++;
                    }
                }
            });
        });
        
        toast({
            title: 'Scores Saved',
            description: `Successfully saved ${savedCount} score(s) for ${assignmentName}.`
        });
    }

    return (
        <div className="space-y-4">
            <div className="flex gap-4">
                <Select onValueChange={setSelectedClass} value={selectedClass}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select a class..." />
                    </SelectTrigger>
                    <SelectContent>
                        {teacherClasses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                {selectedClass && (
                    <Select onValueChange={setAssignmentName} value={assignmentName} disabled={isTermFinalized}>
                        <SelectTrigger className="w-auto">
                            <SelectValue placeholder="Select assignment..." />
                        </SelectTrigger>
                        <SelectContent>
                            {assignmentOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                        </SelectContent>
                    </Select>
                )}
            </div>

            {isTermFinalized && (
                 <Alert variant="destructive">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Grading Locked</AlertTitle>
                    <AlertDescription>
                        All reports for this class and term have been finalized by the Headmaster. No further score entries or updates are allowed.
                    </AlertDescription>
                </Alert>
            )}
            
            {selectedClass && assignmentName && (
                 <div className="rounded-md border overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="sticky left-0 bg-background z-10">Student Name</TableHead>
                                {classSubjects.map(sub => (
                                    <TableHead key={sub.id} className="min-w-[100px]">{sub.name}</TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.map(student => (
                                <TableRow key={student.id}>
                                    <TableCell className="sticky left-0 bg-background z-10 font-medium">{student.name}</TableCell>
                                    {classSubjects.map(subject => (
                                        <TableCell key={subject.id}>
                                            <Input
                                                type="number"
                                                min="0"
                                                className="w-20"
                                                value={student.scores[subject.id]}
                                                onChange={(e) => handleScoreChange(student.id, subject.id, e.target.value)}
                                                disabled={isTermFinalized}
                                            />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
            
            {selectedClass && students.length > 0 && assignmentName && (
                <div className="flex justify-end pt-4">
                    <Button onClick={handleSaveScores} disabled={isTermFinalized}>
                        <Save className="mr-2 h-4 w-4" /> Save Scores
                    </Button>
                </div>
            )}
        </div>
    );
}
