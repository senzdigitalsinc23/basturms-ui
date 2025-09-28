
'use client';
import { useState, useEffect } from 'react';
import { getClasses, getStudentProfiles, getSubjects, addClassSubject, addScore, getScoresForClass, getAssignmentActivities, getClassAssignmentActivities } from '@/lib/store';
import { Class, StudentProfile, Subject, ClassSubject, AssignmentScore, AssignmentActivity } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Save } from 'lucide-react';

type StudentForGrading = {
    id: string;
    name: string;
    scores: Record<string, number | string>; // subjectId -> score
};

export function ScoreEntryForm() {
    const [classes, setClasses] = useState<Class[]>([]);
    const [selectedClass, setSelectedClass] = useState<string | undefined>();
    const [classSubjects, setClassSubjects] = useState<Subject[]>([]);
    const [students, setStudents] = useState<StudentForGrading[]>([]);
    const [assignmentName, setAssignmentName] = useState<string | undefined>();
    const [classActivities, setClassActivities] = useState<AssignmentActivity[]>([]);
    const { toast } = useToast();
    const { user } = useAuth();

    useEffect(() => {
        setClasses(getClasses());
    }, []);

    useEffect(() => {
        if (selectedClass) {
            // Get subjects for the selected class
            const allSubjects = getSubjects();
            const assignmentsForClass = addClassSubject().filter(cs => cs.class_id === selectedClass);
            const subjectIds = assignmentsForClass.map(cs => cs.subject_id);
            const subjects = allSubjects.filter(s => subjectIds.includes(s.id));
            setClassSubjects(subjects);

            // Get activities for the selected class
            const allActivities = getAssignmentActivities();
            const classActivityLinks = getClassAssignmentActivities().filter(ca => ca.class_id === selectedClass);
            const activityIds = classActivityLinks.map(ca => ca.activity_id);
            const activities = allActivities.filter(a => activityIds.includes(a.id));
            
            // Deduplicate activities to prevent key errors
            const uniqueActivities = Array.from(new Map(activities.map(item => [item.id, item])).values());
            setClassActivities(uniqueActivities);
            
            setAssignmentName(undefined); // Reset assignment selection

            // Get students for the selected class and their existing scores
            const allStudents = getStudentProfiles().filter(p => p.admissionDetails.class_assigned === selectedClass);
            const allScores = getScoresForClass(selectedClass);
            
            const studentsWithScores = allStudents.map(p => {
                const studentScores = allScores.filter(s => s.student_id === p.student.student_no && s.assignment_name === assignmentName);
                const scoresBySubject: Record<string, number | string> = {};
                subjects.forEach(sub => {
                    const score = studentScores.find(s => s.subject_id === sub.id)?.score;
                    scoresBySubject[sub.id] = score !== undefined ? score : '';
                });
                return {
                    id: p.student.student_no,
                    name: `${p.student.first_name} ${p.student.last_name}`,
                    scores: scoresBySubject
                };
            });
            setStudents(studentsWithScores);
        } else {
            setClassSubjects([]);
            setStudents([]);
            setClassActivities([]);
        }
    }, [selectedClass, assignmentName]);

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
        if (!selectedClass || !user || !assignmentName) return;
        
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
                        {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                {selectedClass && (
                    <Select onValueChange={setAssignmentName} value={assignmentName}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select assignment..." />
                        </SelectTrigger>
                        <SelectContent>
                            {classActivities.map(act => <SelectItem key={act.id} value={act.name}>{act.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                )}
            </div>
            
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
                    <Button onClick={handleSaveScores}>
                        <Save className="mr-2 h-4 w-4" /> Save Scores
                    </Button>
                </div>
            )}
        </div>
    );
}
