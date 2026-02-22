'use client';
import { useState, useEffect, useMemo } from 'react';
import { getStudentProfiles, getClasses, getSubjects, getClassSchoolLevel, getAcademicYears, fetchClassRankings, fetchLevelRankings, fetchSchoolRankings } from '@/lib/store';
import { StudentProfile, Class, Subject, AssignmentScore, SchoolLevel, ALL_SCHOOL_LEVELS, AcademicYear } from '@/lib/types';
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
    const [classes, setClasses] = useState<Class[]>([]);
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
    const [selectedYear, setSelectedYear] = useState<string>('');
    const [selectedTerm, setSelectedTerm] = useState<string>('');
    const [filterType, setFilterType] = useState<'class' | 'level' | 'school'>('class');
    const [selectedFilter, setSelectedFilter] = useState<string>('');
    const [rankedStudents, setRankedStudents] = useState<StudentRank[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchData() {
            setClasses(getClasses());
            const years = getAcademicYears();
            setAcademicYears(years);

            const activeYear = years.find(y => y.status === 'Active');
            if (activeYear) {
                setSelectedYear(activeYear.year);
                const activeTerm = activeYear.terms.find(t => t.status === 'Active');
                if (activeTerm) {
                    setSelectedTerm(activeTerm.name);
                }
            }
        }
        fetchData();
    }, []);

    const fetchRankings = async () => {
        if (!selectedYear || !selectedTerm) return;
        if ((filterType === 'class' || filterType === 'level') && !selectedFilter) return;

        setLoading(true);
        try {
            let data: any[] = [];
            if (filterType === 'class') {
                data = await fetchClassRankings(selectedFilter, selectedYear, selectedTerm);
            } else if (filterType === 'level') {
                data = await fetchLevelRankings(selectedFilter, selectedYear, selectedTerm);
            } else if (filterType === 'school') {
                data = await fetchSchoolRankings(selectedYear, selectedTerm);
            }

            const mapped = data.map((item: any) => ({
                studentId: item.student_no,
                studentName: `${item.first_name} ${item.last_name}`,
                className: item.class_name,
                averageScore: parseFloat(item.average_score || '0'),
                rank: item.rank || item.class_position || 0
            }));
            setRankedStudents(mapped);
        } catch (error) {
            console.error('Error fetching rankings:', error);
            setRankedStudents([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRankings();
    }, [filterType, selectedFilter, selectedYear, selectedTerm]);

    const handleFilterTypeChange = (type: 'class' | 'level' | 'school') => {
        setFilterType(type);
        setSelectedFilter('');
        if (type === 'school') {
            setSelectedFilter('all');
        }
    }

    const availableTerms = useMemo(() => {
        const year = academicYears.find((y: AcademicYear) => y.year === selectedYear);
        return year ? year.terms : [];
    }, [academicYears, selectedYear]);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Filter Rankings</CardTitle>
                    <CardDescription>Select filters to view student rankings.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-4">
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Academic Year" />
                        </SelectTrigger>
                        <SelectContent>
                            {academicYears.map(y => <SelectItem key={y.year} value={y.year}>{y.year}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Term" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableTerms.map((t: any) => <SelectItem key={t.name} value={t.name}>{t.name}</SelectItem>)}
                        </SelectContent>
                    </Select>

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
                                                <Loader2 className="h-5 w-5 animate-spin" />
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
