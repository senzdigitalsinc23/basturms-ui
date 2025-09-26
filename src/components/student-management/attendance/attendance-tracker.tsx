
'use client';
import { useState, useEffect } from 'react';
import { getClasses, getStudentProfiles, addAttendanceRecord, getStudentProfileById, addAuditLog } from '@/lib/store';
import { Class, StudentProfile, AttendanceRecord } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Loader2, Save } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, subDays } from 'date-fns';

type StudentForAttendance = {
    id: string;
    name: string;
    status: AttendanceRecord['status'];
};

export function AttendanceTracker() {
    const [classes, setClasses] = useState<Class[]>([]);
    const [selectedClass, setSelectedClass] = useState<string | undefined>();
    const [attendanceDate, setAttendanceDate] = useState<Date>(new Date());
    const [students, setStudents] = useState<StudentForAttendance[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        setClasses(getClasses());
    }, []);

    useEffect(() => {
        if (selectedClass) {
            const allProfiles = getStudentProfiles();
            const filteredStudents = allProfiles
                .filter(p => p.admissionDetails.class_assigned === selectedClass && p.admissionDetails.admission_status === 'Admitted')
                .map(p => {
                    const todaysRecord = p.attendanceRecords?.find(rec => format(new Date(rec.date), 'yyyy-MM-dd') === format(attendanceDate, 'yyyy-MM-dd'));
                    return {
                        id: p.student.student_no,
                        name: `${p.student.first_name} ${p.student.last_name}`,
                        status: todaysRecord?.status || 'Present'
                    };
                });
            setStudents(filteredStudents);
        } else {
            setStudents([]);
        }
    }, [selectedClass, attendanceDate]);

    const handleStatusChange = (studentId: string, status: AttendanceRecord['status']) => {
        setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status } : s));
    };

    const handleSaveAttendance = async () => {
        if (!user || !selectedClass) return;
        
        setIsLoading(true);

        let successCount = 0;
        for (const student of students) {
            try {
                const record: AttendanceRecord = {
                    date: attendanceDate.toISOString(),
                    status: student.status,
                };
                // This is not efficient, but it's the only way with the current store API
                addAttendanceRecord(student.id, record, user.id);
                successCount++;
            } catch (error) {
                console.error(`Failed to save attendance for ${student.name}`, error);
            }
        }
        
        setIsLoading(false);

        if (successCount > 0) {
            toast({
                title: "Attendance Saved",
                description: `Attendance for ${successCount} student(s) has been saved successfully.`
            });
             const className = classes.find(c => c.id === selectedClass)?.name || 'Unknown Class';
             const studentStatuses = students.map(s => `${s.name}: ${s.status}`).join(', ');
             const logDetails = `Saved attendance for ${className} on ${format(attendanceDate, 'PPP')}. Details: ${studentStatuses}`;
            addAuditLog({
                user: user.email,
                name: user.name,
                action: 'Save Attendance',
                details: logDetails,
            });
        } else {
             toast({
                variant: 'destructive',
                title: "Save Failed",
                description: `Could not save any attendance records.`
            });
        }
    };
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Student Attendance Register</CardTitle>
                <CardDescription>Select a class and date to mark student attendance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                        <SelectTrigger className="w-[200px]">
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
                                className={cn("w-[240px] justify-start text-left font-normal", !attendanceDate && "text-muted-foreground")}
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
                                disabled={(date) =>
                                    date > new Date() || date < subDays(new Date(), 2)
                                }
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
                                    <TableHead className="text-right">Attendance Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.length > 0 ? students.map(student => (
                                    <TableRow key={student.id}>
                                        <TableCell className="font-medium">{student.name}</TableCell>
                                        <TableCell className="text-right">
                                             <RadioGroup
                                                value={student.status}
                                                onValueChange={(status) => handleStatusChange(student.id, status as AttendanceRecord['status'])}
                                                className="flex justify-end gap-4"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Present" id={`${student.id}-present`} />
                                                    <Label htmlFor={`${student.id}-present`}>Present</Label>
                                                </div>
                                                 <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Absent" id={`${student.id}-absent`} />
                                                    <Label htmlFor={`${student.id}-absent`}>Absent</Label>
                                                </div>
                                                 <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Late" id={`${student.id}-late`} />
                                                    <Label htmlFor={`${student.id}-late`}>Late</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Excused" id={`${student.id}-excused`} />
                                                    <Label htmlFor={`${student.id}-excused`}>Excused</Label>
                                                </div>
                                            </RadioGroup>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                     <TableRow>
                                        <TableCell colSpan={2} className="h-24 text-center">
                                            No students found in this class.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
            {selectedClass && students.length > 0 && (
                <CardFooter className="justify-end">
                    <Button onClick={handleSaveAttendance} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" />
                        Save Attendance
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}
