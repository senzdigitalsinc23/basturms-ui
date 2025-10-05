'use client';
import { useState, useEffect, useMemo } from 'react';
import { getStaff, getStudentProfiles, getClasses, getStaffAttendanceRecords } from '@/lib/store';
import { Staff, StudentProfile, Class, StaffAttendanceRecord } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, CheckCircle, Clock } from 'lucide-react';

type TeacherPerformance = {
  staffId: string;
  name: string;
  avgStudentScore: number;
  avgClassAttendance: number;
  punctualityScore: number;
  overallScore: number;
};

const WEIGHTS = {
    STUDENT_SCORE: 0.5,
    CLASS_ATTENDANCE: 0.3,
    PUNCTUALITY: 0.2,
};

export function TeacherPerformanceEvaluation() {
  const [teachers, setTeachers] = useState<Staff[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [staffAttendance, setStaffAttendance] = useState<StaffAttendanceRecord[]>([]);
  const [performanceData, setPerformanceData] = useState<TeacherPerformance[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<string | 'all'>('all');

  useEffect(() => {
    setTeachers(getStaff().filter(s => s.roles.includes('Teacher')));
    setStudents(getStudentProfiles());
    setClasses(getClasses());
    setStaffAttendance(getStaffAttendanceRecords());
  }, []);

  const calculatePerformance = useMemo(() => {
    return teachers.map(teacher => {
        // 1. Student Academic Performance
        const teacherClassIds = new Set<string>();
        const teacherStudentIds = new Set<string>();
        students.forEach(s => {
            const teachesThisClass = s.assignmentScores?.some(score => score.class_id && teacher.staff_id);
            if(teachesThisClass){
                teacherClassIds.add(s.admissionDetails.class_assigned);
                teacherStudentIds.add(s.student.student_no);
            }
        });

        let totalScore = 0;
        let scoreCount = 0;
        students.forEach(student => {
            if(teacherStudentIds.has(student.student.student_no)){
                student.assignmentScores?.forEach(score => {
                    totalScore += score.score;
                    scoreCount++;
                });
            }
        });
        const avgStudentScore = scoreCount > 0 ? totalScore / scoreCount : 0;
        
        // 2. Class Attendance
        let totalClassAttendance = 0;
        let attendanceDays = 0;
        students.forEach(student => {
            if(teacherStudentIds.has(student.student.student_no)) {
                student.attendanceRecords?.forEach(rec => {
                    if(rec.status === 'Present' || rec.status === 'Late') totalClassAttendance++;
                    attendanceDays++;
                });
            }
        });
        const avgClassAttendance = attendanceDays > 0 ? (totalClassAttendance / attendanceDays) * 100 : 0;

        // 3. Punctuality (Teacher's own attendance)
        const teacherRecords = staffAttendance.filter(rec => rec.staff_id === teacher.staff_id);
        const presentOrLate = teacherRecords.filter(r => r.status === 'Present' || r.status === 'Late').length;
        const punctualityScore = teacherRecords.length > 0 ? (presentOrLate / teacherRecords.length) * 100 : 0;

        // 4. Overall Score
        const overallScore = (avgStudentScore * WEIGHTS.STUDENT_SCORE) + (avgClassAttendance * WEIGHTS.CLASS_ATTENDANCE) + (punctualityScore * WEIGHTS.PUNCTUALITY);

        return {
            staffId: teacher.staff_id,
            name: `${teacher.first_name} ${teacher.last_name}`,
            avgStudentScore,
            avgClassAttendance,
            punctualityScore,
            overallScore: Math.min(100, overallScore), // Cap at 100
        };
    }).sort((a, b) => b.overallScore - a.overallScore);
  }, [teachers, students, staffAttendance]);

  useEffect(() => {
    setPerformanceData(calculatePerformance);
  }, [calculatePerformance]);
  
  const filteredData = selectedTeacher === 'all' ? performanceData : performanceData.filter(p => p.staffId === selectedTeacher);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filter by Teacher</CardTitle>
        </CardHeader>
        <CardContent>
          <Select onValueChange={setSelectedTeacher} defaultValue="all">
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Select a teacher" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teachers</SelectItem>
              {teachers.map(t => <SelectItem key={t.staff_id} value={t.staff_id}>{t.first_name} {t.last_name}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>Teacher performance rankings based on a weighted score of student results, class attendance, and punctuality.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead>Teacher</TableHead>
                        <TableHead>Overall Score</TableHead>
                        <TableHead>Avg. Student Score</TableHead>
                        <TableHead>Avg. Class Attendance</TableHead>
                        <TableHead>Punctuality</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredData.map((perf, index) => (
                        <TableRow key={perf.staffId}>
                            <TableCell className="font-bold text-lg">{index + 1}</TableCell>
                            <TableCell className="font-medium">{perf.name}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Progress value={perf.overallScore} className="w-24" />
                                    <span className={`font-semibold ${getScoreColor(perf.overallScore)}`}>{perf.overallScore.toFixed(1)}%</span>
                                </div>
                            </TableCell>
                             <TableCell>
                                <Badge variant="outline" className="flex items-center gap-1">
                                    <Users className="h-4 w-4" />
                                    {perf.avgStudentScore.toFixed(1)}%
                                </Badge>
                             </TableCell>
                             <TableCell>
                                <Badge variant="outline" className="flex items-center gap-1">
                                    <CheckCircle className="h-4 w-4" />
                                    {perf.avgClassAttendance.toFixed(1)}%
                                </Badge>
                             </TableCell>
                             <TableCell>
                                <Badge variant="outline" className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {perf.punctualityScore.toFixed(1)}%
                                </Badge>
                             </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
