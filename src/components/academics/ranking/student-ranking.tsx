
'use client';
import { useState, useEffect, useMemo } from 'react';
import { getStudentProfiles, getClasses, getSubjects, getClassSchoolLevel, getAcademicYears } from '@/lib/store';
import { StudentProfile, Class, Subject, AssignmentScore, SchoolLevel, ALL_SCHOOL_LEVELS } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

type StudentRank = {
    studentId: string;
    studentName: string;
    className: string;
    averageScore: number;
    rank: number;
};

export function StudentRanking() {
    const [profiles, setProfiles] = useState<StudentProfile[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [activeTermName, setActiveTermName] = useState<string>('');
    const [filterType, setFilterType] = useState<'class' | 'level' | 'school'>('class');
    const [selectedFilter, setSelectedFilter] = useState<string>('');
    const [rankedStudents, setRankedStudents] = useState<StudentRank[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const { students } = await getStudentProfiles();
            setProfiles(students);
            setClasses(getClasses());
            setSubjects(getSubjects());

            const activeYear = getAcademicYears().find(y => y.status === 'Active');
            if (activeYear) {
                const activeTerm = activeYear.terms.find(t => t.status === 'Active');
                if (activeTerm) {
                    setActiveTermName(`${activeTerm.name} ${activeYear.year}`);
                }
            }
            setLoading(false);
        }
        fetchData();
    }, []);

    const classMap = useMemo(() => new Map(classes.map(c => [c.id, c.name])), [classes]);

    const calculateAverage = (scores: AssignmentScore[]): number => {
        if (!scores || scores.length === 0) return 0;
        const total = scores.reduce((acc, s) => acc + s.score, 0);
        return total / scores.length;
    };

    useEffect(() => {
        let filteredProfiles = profiles;
        setLoading(true);

        if (filterType === 'class' && selectedFilter) {
            filteredProfiles = profiles.filter(p => p.admissionDetails.class_assigned === selectedFilter);
        } else if (filterType === 'level' && selectedFilter) {
            filteredProfiles = profiles.filter(p => getClassSchoolLevel(p.admissionDetails.class_assigned) === selectedFilter);
        }
        // 'school' filter uses all profiles

        const studentAverages = filteredProfiles.map(profile => {
            const averageScore = calculateAverage(profile.assignmentScores || []);
            return {
                studentId: profile.student.student_no,
                studentName: `${profile.student.first_name} ${profile.student.last_name}`,
                className: classMap.get(profile.admissionDetails.class_assigned) || 'N/A',
                averageScore,
            };
        });

        const sortedStudents = studentAverages.sort((a, b) => b.averageScore - a.averageScore);

        const ranked = sortedStudents.map((student, index, arr) => {
             const rank = index > 0 && student.averageScore === arr[index - 1].averageScore
                ? arr[index - 1].rank
                : index + 1;
            return { ...student, rank };
        });

        setRankedStudents(ranked);
        setLoading(false);

    }, [profiles, filterType, selectedFilter, classMap]);
    
    const handleFilterTypeChange = (type: 'class' | 'level' | 'school') => {
        setFilterType(type);
        setSelectedFilter('');
        if (type === 'school') {
            // Trigger calculation for school right away
            setSelectedFilter('all');
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Filter Rankings</CardTitle>
                    <CardDescription>Select filters to view student rankings for the current term: <strong>{activeTermName}</strong></CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-4">
                     <Select value={filterType} onValueChange={handleFilterTypeChange as any}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="class">By Class</SelectItem>
                            <SelectItem value="level">By School Level</SelectItem>
                            <SelectItem value="school">Entire School</SelectItem>
                        </SelectContent>
                    </Select>
                    
                    {filterType === 'class' && (
                        <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Select Class" />
                            </SelectTrigger>
                            <SelectContent>
                                {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    )}

                     {filterType === 'level' && (
                        <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Select Level" />
                            </SelectTrigger>
                            <SelectContent>
                                {ALL_SCHOOL_LEVELS.map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    )}
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <CardTitle>Ranking Results</CardTitle>
                 </CardHeader>
                 <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">Rank</TableHead>
                                    <TableHead>Student Name</TableHead>
                                    <TableHead>Class</TableHead>
                                    <TableHead className="text-right">Average Score</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                                <Loader2 className="h-5 w-5 animate-spin"/>
                                                <span>Calculating rankings...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : rankedStudents.length > 0 ? (
                                    rankedStudents.map(student => (
                                        <TableRow key={student.studentId}>
                                            <TableCell className="font-bold text-lg">{student.rank}</TableCell>
                                            <TableCell className="font-medium">{student.studentName}</TableCell>
                                            <TableCell><Badge variant="outline">{student.className}</Badge></TableCell>
                                            <TableCell className="text-right font-semibold">{student.averageScore.toFixed(2)}%</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            Select a filter to view rankings.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                 </CardContent>
            </Card>
        </div>
    );
}
