

'use client';
import { useState, useEffect } from 'react';
import { getClasses, getStudentProfiles, getStaff, getStaffAttendanceRecords } from '@/lib/store';
import { Class, StudentProfile, Staff, StaffAttendanceRecord, StudentAttendanceRecord } from '@/lib/types';
import { ProtectedRoute } from '@/components/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

type StudentAttendanceHistory = {
    id: string;
    name: string;
    status: StudentAttendanceRecord['status'];
}

type StaffAttendanceHistory = {
    id: string;
    name: string;
    status: StaffAttendanceRecord['status'];
}

export default function AttendanceHistoryPage() {
    const [classes, setClasses] = useState<Class[]>([]);
    const [selectedClass, setSelectedClass] = useState<string | undefined>();
    const [attendanceDate, setAttendanceDate] = useState<Date>(new Date());
    
    const [studentRecords, setStudentRecords] = useState<StudentAttendanceHistory[]>([]);
    const [staffRecords, setStaffRecords] = useState<StaffAttendanceHistory[]>([]);

    useEffect(() => {
        setClasses(getClasses());
    }, []);

    // Effect for student records
    useEffect(() => {
        if (selectedClass) {
            const allProfiles = getStudentProfiles();
            const filteredStudents = allProfiles
                .filter(p => p.admissionDetails.class_assigned === selectedClass)
                .map(p => {
                    const record = p.attendanceRecords?.find(rec => format(new Date(rec.date), 'yyyy-MM-dd') === format(attendanceDate, 'yyyy-MM-dd'));
                    return {
                        id: p.student.student_no,
                        name: `${p.student.first_name} ${p.student.last_name}`,
                        status: record?.status || 'N/A' // Show N/A if no record found for that date
                    };
                });
            setStudentRecords(filteredStudents);
        } else {
            setStudentRecords([]);
        }
    }, [selectedClass, attendanceDate]);
    
    // Effect for staff records
     useEffect(() => {
        const allStaff = getStaff();
        const allStaffAttendance = getStaffAttendanceRecords();

        const filteredStaffRecords = allStaff.map(staff => {
            const record = allStaffAttendance.find(rec => rec.staff_id === staff.staff_id && format(new Date(rec.date), 'yyyy-MM-dd') === format(attendanceDate, 'yyyy-MM-dd'));
            return {
                id: staff.staff_id,
                name: `${staff.first_name} ${staff.last_name}`,
                status: record?.status || 'N/A'
            };
        });
        setStaffRecords(filteredStaffRecords);
    }, [attendanceDate]);

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'Present': return 'secondary';
            case 'Absent': return 'destructive';
            case 'Late': return 'default';
            case 'Excused': return 'outline';
            case 'On Leave': return 'outline';
            default: return 'outline';
        }
    }

    return (
        <ProtectedRoute allowedRoles={['Admin', 'Headmaster']}>
             <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Attendance History</h1>
                    <p className="text-muted-foreground">
                        Review past attendance records for students and staff.
                    </p>
                </div>
                <Tabs defaultValue="students">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="students">Students</TabsTrigger>
                        <TabsTrigger value="staff">Staff</TabsTrigger>
                    </TabsList>
                    <TabsContent value="students" asChild>
                        <Card>
                            <CardHeader>
                                <CardTitle>Student Attendance</CardTitle>
                                <CardDescription>Select a class and date to view records.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                                        <SelectTrigger className="w-full md:w-[200px]">
                                            <SelectValue placeholder="Select Class" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn("w-full md:w-[240px] justify-start text-left font-normal", !attendanceDate && "text-muted-foreground")}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {attendanceDate ? format(attendanceDate, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={attendanceDate}
                                                onSelect={(date) => setAttendanceDate(date || new Date())}
                                                disabled={(date) => date > new Date()}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                {selectedClass && (
                                     <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Student Name</TableHead>
                                                    <TableHead className="text-right">Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {studentRecords.length > 0 ? studentRecords.map(record => (
                                                    <TableRow key={record.id}>
                                                        <TableCell className="font-medium">{record.name}</TableCell>
                                                        <TableCell className="text-right">
                                                            <Badge variant={getStatusVariant(record.status) as any}>{record.status}</Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                )) : (
                                                    <TableRow>
                                                        <TableCell colSpan={2} className="h-24 text-center">
                                                            No students in this class or no records for this date.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="staff" asChild>
                        <Card>
                             <CardHeader>
                                <CardTitle>Staff Attendance</CardTitle>
                                <CardDescription>Select a date to view records.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-4">
                                     <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn("w-full md:w-[240px] justify-start text-left font-normal", !attendanceDate && "text-muted-foreground")}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {attendanceDate ? format(attendanceDate, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={attendanceDate}
                                                onSelect={(date) => setAttendanceDate(date || new Date())}
                                                disabled={(date) => date > new Date()}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                 <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Staff Name</TableHead>
                                                    <TableHead className="text-right">Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {staffRecords.length > 0 ? staffRecords.map(record => (
                                                    <TableRow key={record.id}>
                                                        <TableCell className="font-medium">{record.name}</TableCell>
                                                        <TableCell className="text-right">
                                                            <Badge variant={getStatusVariant(record.status) as any}>{record.status}</Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                )) : (
                                                    <TableRow>
                                                        <TableCell colSpan={2} className="h-24 text-center">
                                                           No records found for this date.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
             </div>
        </ProtectedRoute>
    );
}

