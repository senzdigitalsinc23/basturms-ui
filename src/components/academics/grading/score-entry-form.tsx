
'use client';
import { useState, useEffect } from 'react';
import {
    getClasses, fetchClassesFromApi,
    getStudentProfiles, getStudentsByClass,
    getSubjects, fetchSubjectsFromApi,
    getClassesSubjects, saveClassSubjects, fetchClassSubjectAssignmentsFromApi,
    addScore, fetchScoresFromApi, saveScoreToApi,
    getScoresForClass,
    getAssignmentActivities, fetchAssignmentActivitiesFromApi,
    getClassAssignmentActivities,
    getStaff, fetchStaffFromApi,
    getStaffAppointmentHistory, fetchStaffAppointmentHistoryFromApi,
    getStudentReport,
    getAcademicYears, fetchAcademicYearsFromApi,
    fetchClassActivitiesApi
} from '@/lib/store';
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
    const [activities, setActivities] = useState<AssignmentActivity[]>([]);
    const [isTermFinalized, setIsTermFinalized] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [originalScores, setOriginalScores] = useState<Record<string, Record<string, string>>>({});

    const { toast } = useToast();
    const { user } = useAuth();

    useEffect(() => {
        const loadInitialData = async () => {
            const classes = await fetchClassesFromApi();
            setAllClasses(classes);

            // Also fetch staff and academic years if they aren't loaded
            await fetchStaffFromApi();
            await fetchStaffAppointmentHistoryFromApi();
            await fetchAcademicYearsFromApi();

            if (user?.role === 'Admin') {
                setTeacherClasses(classes);
            } else if (user?.role === 'Teacher') {
                const staffList = getStaff();
                const currentTeacher = staffList.find(s => s.user_id === user.id);
                if (currentTeacher) {
                    const appointments = getStaffAppointmentHistory();
                    const teacherAppointments = appointments
                        .filter(a => a.staff_id === currentTeacher.staff_id)
                        .sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime());
                    const latestAppointment = teacherAppointments[0];
                    if (latestAppointment && latestAppointment.class_assigned) {
                        const assignedClasses = classes.filter(c => latestAppointment.class_assigned?.includes(c.id));
                        setTeacherClasses(assignedClasses);
                    }
                }
            }
        };
        loadInitialData();
    }, [user]);

    // Effect for when the class changes
    useEffect(() => {
        async function onClassChange() {
            if (selectedClass) {
                // Refresh class subject assignments and activities from API
                const assignmentsForClass = await fetchClassSubjectAssignmentsFromApi(true, selectedClass);
                await fetchAssignmentActivitiesFromApi(true);

                const allSubjects = await fetchSubjectsFromApi();
                // console.log('All subjects:', allSubjects.length);
                let subjectsToShow: Subject[] = [];

                if (user?.role === 'Admin' || user?.role === 'Headmaster') {
                    const subjectIds = assignmentsForClass.map(cs => cs.subject_id);
                    // console.log('Subject IDs from assignments:', subjectIds);
                    subjectsToShow = allSubjects.filter(s => subjectIds.includes(s.id));
                } else if (user?.role === 'Teacher') {
                    // console.log('Teacher role detected, checking appointments...');
                    const staffMember = getStaff().find(s => s.user_id === user.id);
                    if (staffMember) {
                        const latestAppointment = getStaffAppointmentHistory()
                            .filter(a => a.staff_id === staffMember.staff_id)
                            .sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime())[0];

                        if (latestAppointment?.subjects_assigned && latestAppointment.class_assigned?.includes(selectedClass)) {
                            // Filter subjects assigned to the class AND to the teacher.
                            const classSubjectIds = assignmentsForClass.map(cs => cs.subject_id);
                            const teacherAndClassSubjectIds = latestAppointment.subjects_assigned.filter(subId => classSubjectIds.includes(subId));
                            subjectsToShow = allSubjects.filter(s => teacherAndClassSubjectIds.includes(s.id));
                        }
                    }
                }

                setClassSubjects(subjectsToShow);

                // Get activities for the selected class using the API directly
                const uniqueActivities = await fetchClassActivitiesApi(selectedClass);

                const options: string[] = [];
                uniqueActivities.forEach((act: AssignmentActivity) => {
                    if (act.sub_activities && act.sub_activities.length > 0) {
                        act.sub_activities.forEach(sub => {
                            options.push(sub.activity_name);
                        });
                    } else if (act.expected_per_term > 1) {
                        for (let i = 1; i <= act.expected_per_term; i++) {
                            options.push(`${act.name} ${i}`);
                        }
                    } else {
                        options.push(act.name);
                    }
                });
                setAssignmentOptions(options);
                setActivities(uniqueActivities);

                setAssignmentName(undefined);

                // Use the dedicated endpoint for fetching students by class
                const filteredStudents = await getStudentsByClass(selectedClass, 'Admitted');


                const initialScores: Record<string, string> = {};
                subjectsToShow.forEach(sub => {
                    initialScores[sub.id] = '';
                });

                setStudents(filteredStudents.map(p => ({
                    id: p.student.student_no,
                    name: `${p.student.first_name} ${p.student.last_name}`,
                    scores: { ...initialScores }
                })));

                // Check if term is finalized
                const academicYears = getAcademicYears();
                const activeYear = academicYears.find(y => y.status === 'Active');
                if (activeYear) {
                    const activeTermInfo = activeYear.terms.find(t => t.status === 'Active');
                    if (activeTermInfo) {
                        const activeTermName = `${activeTermInfo.name} ${activeYear.year}`;
                        const allReportsFinal = filteredStudents.every(student => {
                            const report = getStudentReport(student.student.student_no, activeTermName);
                            return report?.status === 'Final';
                        });
                        setIsTermFinalized(allReportsFinal && filteredStudents.length > 0);
                    }
                }


            } else {
                setClassSubjects([]);
                setStudents([]);
                setAssignmentOptions([]);
                setIsTermFinalized(false);
            }
        }
        onClassChange();
    }, [selectedClass, user]);

    // Effect for loading scores when an assignment is selected
    useEffect(() => {
        const loadScores = async () => {
            if (selectedClass && students.length > 0 && assignmentName) {
                const allScores = await fetchScoresFromApi(selectedClass);
                //console.log('All scores fetched:', allScores);
                //console.log('Selected assignment name:', assignmentName);
                //console.log('Students:', students);
                //console.log('Class subjects:', classSubjects);

                setStudents(prevStudents => {
                    const isStandalone = isStandaloneActivity();
                    const updatedStudents = prevStudents.map(student => {
                        const studentScores = allScores.filter(s => s.student_no === student.id && s.activity_name === assignmentName);
                        const scoresBySubject: Record<string, number | string> = {};

                        if (isStandalone) {
                            // Find score where subject_id is "0" 
                            const score = studentScores.find(s => (s as any).subject_id === "0" || (s as any).subject_id === 0 || !(s as any).subject_code)?.score;
                            scoresBySubject['0'] = score !== undefined ? score : '';
                        } else {
                            classSubjects.forEach(sub => {
                                const score = studentScores.find(s => s.subject_code === sub.code)?.score;
                                scoresBySubject[sub.id] = score !== undefined ? score : '';
                            });
                        }
                        return { ...student, scores: scoresBySubject };
                    });

                    // Store original scores for comparison
                    const originals: Record<string, Record<string, string>> = {};
                    updatedStudents.forEach(student => {
                        originals[student.id] = {};
                        Object.keys(student.scores).forEach(subjectId => {
                            originals[student.id][subjectId] = student.scores[subjectId]?.toString() || '';
                        });
                    });
                    setOriginalScores(originals);

                    return updatedStudents;
                });
            }
            else if (selectedClass && students.length > 0 && !assignmentName) {
                // When assignment is reset, clear out the scores in the UI
                const initialScores: Record<string, string> = {};
                classSubjects.forEach(sub => {
                    initialScores[sub.id] = '';
                });
                initialScores['0'] = ''; // Always clear standalone key too
                setStudents(prevStudents => prevStudents.map(student => ({
                    ...student,
                    scores: { ...initialScores }
                })));
            }
        };
        loadScores();
    }, [selectedClass, assignmentName, classSubjects]);


    const handleScoreChange = (studentId: string, subjectId: string, value: string) => {
        setStudents(prev => prev.map(s => {
            if (s.id === studentId) {
                // For standalone, subjectId might be 'standalone' or 0
                const newScores = { ...s.scores, [subjectId]: value };
                return { ...s, scores: newScores };
            }
            return s;
        }));
    }

    const isStandaloneActivity = () => {
        if (!assignmentName || !activities) return false;
        const activity = activities.find(act => {
            if (act.sub_activities && act.sub_activities.length > 0) {
                return act.sub_activities.some(sub => sub.activity_name === assignmentName);
            }
            if (act.expected_per_term > 1) {
                const match = assignmentName.match(/^(.+)\s+(\d+)$/);
                if (match) return act.name === match[1];
            }
            return act.name === assignmentName;
        });
        return activity?.is_standalone === 1;
    };

    const handleScoreBlur = async (studentNo: string, subjectId: string, score: string) => {
        if (!selectedClass || !assignmentName || isTermFinalized) return;

        // Check if score actually changed
        const originalScore = originalScores[studentNo]?.[subjectId] || '';
        if (originalScore.toString() === score.toString()) {
            return; // No change, don't save or show toast
        }

        if (!score) return; // Don't save empty scores

        const activity = activities.find(act => {
            if (act.sub_activities && act.sub_activities.length > 0) {
                return act.sub_activities.some(sub => sub.activity_name === assignmentName);
            }
            if (act.expected_per_term > 1) {
                const match = assignmentName.match(/^(.+)\s+(\d+)$/);
                if (match) return act.name === match[1];
            }
            return act.name === assignmentName;
        });

        if (!activity) {
            console.error('Activity not found for assignment:', assignmentName);
            return;
        }

        console.log('Activity found:', activity);

        let isSubActivity = false;
        let submittedId: string | number = activity.activity_id ?? parseInt(activity.id);

        if (activity.sub_activities && activity.sub_activities.length > 0) {
            const sub = activity.sub_activities.find(s => s.activity_name === assignmentName);
            if (sub) {
                submittedId = sub.sub_activity_id;
                isSubActivity = true;
            }
        } else if (activity.expected_per_term > 1) {
            const match = assignmentName.match(/^(.+)\s+(\d+)$/);
            if (match) {
                const index = match[2];
                // Use activity_id + index for numbered sub-activities
                submittedId = `${activity.activity_id}${index}`;
                isSubActivity = true;
            }
        }

        const isStandalone = isStandaloneActivity();

        const payload: any = {
            student_no: studentNo,
            subject_id: isStandalone ? 0 : parseInt(subjectId),
            class_id: parseInt(selectedClass),
            score: parseFloat(score)
        };

        if (isSubActivity) {
            payload.activity_id = submittedId;
        } else {
            payload.activity_id = submittedId;
        }

        console.log('Sending Score Payload:', payload);

        try {
            const token = localStorage.getItem('campusconnect_token');
            const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'devKey123';
            const csrfToken = localStorage.getItem('csrf_token') || '';

            const response = await fetch('/api/academic/scores/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                    'X-API-KEY': apiKey,
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to save score');
            }

            const result = await response.json();

            console.log("Result: ", result);

            if (result.success) {
                // Update original scores after successful save
                setOriginalScores(prev => ({
                    ...prev,
                    [studentNo]: {
                        ...prev[studentNo],
                        [subjectId]: score
                    }
                }));

                toast({
                    title: 'Score Updated',
                    description: 'Score updated successfully',
                    duration: 2000
                });
            }
        } catch (error: any) {
            console.error('Error saving score:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Failed to save score. Please try again.',
            });
        }
    }


    const handleSaveScores = async () => {
        if (!selectedClass || !user || !assignmentName || isTermFinalized) return;

        try {
            const token = localStorage.getItem('campusconnect_token');
            const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'devKey123';
            const csrfToken = localStorage.getItem('csrf_token') || '';

            const payload = {
                academic_year: user.academic_year,
                term: user.academic_term
            };

            const response = await fetch('/api/academic/scores/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                    'X-API-KEY': apiKey,
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to finalize scores');
            }

            const result = await response.json();
            console.log("Result: ", result);


            if (result.success) {
                toast({
                    title: 'Scores Finalized',
                    description: 'Scores have been successfully finalized for this term.'
                });
            }
        } catch (error: any) {
            console.error('Error finalizing scores:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Failed to finalize scores. Please try again.',
            });
        }
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
                    <div className="flex gap-4 flex-1 justify-between">
                        <Select onValueChange={setAssignmentName} value={assignmentName} disabled={isTermFinalized}>
                            <SelectTrigger className="w-auto min-w-[200px]">
                                <SelectValue placeholder="Select assignment..." />
                            </SelectTrigger>
                            <SelectContent>
                                {assignmentOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <div className="relative w-64">
                            <Input
                                placeholder="Search student name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
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
                                {isStandaloneActivity() ? (
                                    <TableHead className="min-w-[100px]">Score</TableHead>
                                ) : (
                                    classSubjects.map(sub => (
                                        <TableHead key={sub.id} className="min-w-[100px]">{sub.name}</TableHead>
                                    ))
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students
                                .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map(student => (
                                    <TableRow key={student.id}>
                                        <TableCell className="sticky left-0 bg-background z-10 font-medium">{student.name}</TableCell>
                                        {isStandaloneActivity() ? (
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    className="w-20"
                                                    value={student.scores['0'] || ''}
                                                    onChange={(e) => handleScoreChange(student.id, '0', e.target.value)}
                                                    onBlur={(e) => handleScoreBlur(student.id, '0', e.target.value)}
                                                    disabled={isTermFinalized}
                                                />
                                            </TableCell>
                                        ) : (
                                            classSubjects.map(subject => (
                                                <TableCell key={subject.id}>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        className="w-20"
                                                        value={student.scores[subject.id]}
                                                        onChange={(e) => handleScoreChange(student.id, subject.id, e.target.value)}
                                                        onBlur={(e) => handleScoreBlur(student.id, subject.id, e.target.value)}
                                                        disabled={isTermFinalized}
                                                    />
                                                </TableCell>
                                            ))
                                        )}
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {selectedClass && students.length > 0 && assignmentName && (
                <div className="flex justify-end pt-4">
                    <Button onClick={handleSaveScores} disabled={isTermFinalized}>
                        <Save className="mr-2 h-4 w-4" /> Finalize
                    </Button>
                </div>
            )}
        </div>
    );
}
