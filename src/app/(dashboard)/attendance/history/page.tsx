
'use client';
import { useState, useEffect } from 'react';
import { getClasses, getStudentProfiles, getStaff, getStaffAttendanceRecords, getRoles, getStaffAppointmentHistory } from '@/lib/store';
import { Class, StudentProfile, Staff, StaffAttendanceRecord, StudentAttendanceRecord, Role } from '@/lib/types';
import { ProtectedRoute } from '@/components/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Search } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DateRange } from 'react-day-picker';
import { useAuth } from '@/hooks/use-auth';

type StudentAttendanceHistory = {
    id: string;
    name: string;
    status: StudentAttendanceRecord['status'];
}

type StaffAttendanceHistory = {
    id: string;
    name: string;
    status: StaffAttendanceRecord['status'];
    roles: Role[];
}

export default function AttendanceHistoryPage() {
    const { user } = useAuth();
    const [allClasses, setAllClasses] = useState<Class[]>([]);
    const [teacherClasses, setTeacherClasses] = useState<Class[]>([]);
    const [selectedClass, setSelectedClass] = useState<string | undefined>();
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
    });
    const [studentSearch, setStudentSearch] = useState('');
    const [staffSearch, setStaffSearch] = useState('');
    const [selectedRole, setSelectedRole] = useState<string | undefined>('All');
    
    const [studentRecords, setStudentRecords] = useState<StudentAttendanceHistory[]>([]);
    const [staffRecords, setStaffRecords] = useState<StaffAttendanceHistory[]>([]);
    const [allStaffRoles, setAllStaffRoles] = useState<string[]>([]);
    
    useEffect(() => {
        const classesData = getClasses();
        setAllClasses(classesData);
        if (user?.role === 'Admin' || user?.role === 'Headmaster') {
            setTeacherClasses(classesData);
        } else if (user?.role === 'Teacher') {
            const staffList = getStaff();
            const currentTeacher = staffList.find(s => s.user_id === user.id);
            if (currentTeacher) {
                const appointments = getStaffAppointmentHistory();
                const teacherAppointments = appointments
                    .filter(a => a.staff_id === currentTeacher.staff_id)
                    .sort((a,b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime());
                
                const allAssignedClasses = new Set<string>();
                teacherAppointments.forEach(app => {
                    app.class_assigned?.forEach(classId => allAssignedClasses.add(classId));
                });

                if (allAssignedClasses.size > 0) {
                    const assignedClasses = classesData.filter(c => allAssignedClasses.has(c.id));
                    setTeacherClasses(assignedClasses);
                    if (assignedClasses.length > 0) {
                        setSelectedClass(assignedClasses[0].id);
                    }
                }
            }
        }
        const roles = getRoles().map(r => r.name).filter(r => r !== 'Student' && r !== 'Parent');
        setAllStaffRoles(roles);
    }, [user]);

    useEffect(() => {
        if (selectedClass && dateRange?.from) {
            const allProfiles = getStudentProfiles();
            const filteredStudents = allProfiles
                .filter(p => p.admissionDetails.class_assigned === selectedClass)
                .map(p => {
                    const record = p.attendanceRecords?.find(rec => format(new Date(rec.date), 'yyyy-MM-dd') === format(dateRange.from!, 'yyyy-MM-dd'));
                    return {
                        id: p.student.student_no,
                        name: `${p.student.first_name} ${p.student.last_name}`,
                        status: record?.status || 'N/A'
                    };
                })
                .filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase()));
            setStudentRecords(filteredStudents);
        } else {
            setStudentRecords([]);
        }
    }, [selectedClass, dateRange, studentSearch]);
    
     useEffect(() => {
        if (dateRange?.from) {
            const allStaff = getStaff();
            const allStaffAttendance = getStaffAttendanceRecords();

            let filteredStaffRecords = allStaff.map(staff => {
                const record = allStaffAttendance.find(rec => rec.staff_id === staff.staff_id && format(new Date(rec.date), 'yyyy-MM-dd') === format(dateRange.from!, 'yyyy-MM-dd'));
                return {
                    id: staff.staff_id,
                    name: `${staff.first_name} ${staff.last_name}`,
                    status: record?.status || 'N/A',
                    roles: staff.roles || []
                };
            }).filter(s => s.name.toLowerCase().includes(staffSearch.toLowerCase()));

            if (selectedRole && selectedRole !== 'All') {
                filteredStaffRecords = filteredStaffRecords.filter(s => s.roles.includes(selectedRole as Role));
            }

            setStaffRecords(filteredStaffRecords);
        }
    }, [dateRange, staffSearch, selectedRole]);

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
    
    const handleDatePreset = (preset: 'this_month' | 'last_month' | 'this_year') => {
        const now = new Date();
        if (preset === 'this_month') {
            setDateRange({ from: startOfMonth(now), to: endOfMonth(now) });
        } else if (preset === 'last_month') {
            const lastMonth = subDays(now, 30);
            setDateRange({ from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) });
        } else if (preset === 'this_year') {
            setDateRange({ from: startOfYear(now), to: endOfYear(now) });
        }
    };


    return (
        <ProtectedRoute allowedRoles={['Admin', 'Headmaster', 'Teacher']}>
             <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Attendance History</h1>
                    <p className="text-muted-foreground">
                        Review past attendance records for students and staff.
                    </p>
                </div>
                 <div className="flex items-center gap-4">
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn("w-full md:w-[280px] justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange?.from ? (
                                    dateRange.to ? (
                                        `${format(dateRange.from, "LLL dd, y")} - ${format(dateRange.to, "LLL dd, y")}`
                                    ) : (
                                        format(dateRange.from, "LLL dd, y")
                                    )
                                ) : (
                                    <span>Pick a date range</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                             <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={dateRange?.from}
                                selected={dateRange}
                                onSelect={setDateRange}
                                numberOfMonths={2}
                                disabled={(date) => date > new Date() || date < subDays(new Date(), 365)}
                            />
                        </PopoverContent>
                    </Popover>
                    <Select onValueChange={handleDatePreset}>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Select a preset" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="this_month">This Month</SelectItem>
                            <SelectItem value="last_month">Last Month</SelectItem>
                            <SelectItem value="this_year">This Year</SelectItem>
                        </SelectContent>
                    </Select>
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
                                            {teacherClasses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                     <div className="relative flex-1">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="search"
                                            placeholder="Search by student name..."
                                            className="pl-8 w-full"
                                            value={studentSearch}
                                            onChange={(e) => setStudentSearch(e.target.value)}
                                        />
                                    </div>
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
                                <CardDescription>Select a date and role to view records.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-4">
                                      <div className="relative flex-1">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="search"
                                            placeholder="Search by staff name..."
                                            className="pl-8 w-full"
                                            value={staffSearch}
                                            onChange={(e) => setStaffSearch(e.target.value)}
                                        />
                                    </div>
                                    <Select value={selectedRole} onValueChange={setSelectedRole} disabled={user?.role === 'Teacher'}>
                                        <SelectTrigger className="w-full md:w-[200px]">
                                            <SelectValue placeholder="Filter by Role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="All">All Roles</SelectItem>
                                            {allStaffRoles.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
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
