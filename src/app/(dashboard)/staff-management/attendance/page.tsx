
'use client';
import { ProtectedRoute } from '@/components/protected-route';
import { getStaff, addAuditLog } from '@/lib/store';
import { Staff, AttendanceRecord } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Loader2, Save } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, subDays } from 'date-fns';
import { useState, useEffect } from 'react';

type StaffForAttendance = {
    id: string;
    name: string;
    status: AttendanceRecord['status'];
};

export default function StaffAttendancePage() {
    const [allStaff, setAllStaff] = useState<StaffForAttendance[]>([]);
    const [attendanceDate, setAttendanceDate] = useState<Date>(new Date());
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        const staffList = getStaff();
        setAllStaff(staffList.map(s => ({
            id: s.staff_id,
            name: `${s.first_name} ${s.last_name}`,
            // In a real app, you would fetch existing records for the date
            status: 'Present' 
        })));
    }, [attendanceDate]);

    const handleStatusChange = (staffId: string, status: AttendanceRecord['status']) => {
        setAllStaff(prev => prev.map(s => s.id === staffId ? { ...s, status } : s));
    };

    const handleSaveAttendance = () => {
        if (!user) return;
        setIsLoading(true);

        // In a real app, this would be a single API call.
        // Here we're just logging it.
        const staffStatuses = allStaff.map(s => `${s.name}: ${s.status}`).join(', ');
        const logDetails = `Saved staff attendance for ${format(attendanceDate, 'PPP')}. Details: ${staffStatuses}`;

        addAuditLog({
            user: user.email,
            name: user.name,
            action: 'Save Staff Attendance',
            details: logDetails,
        });

        setTimeout(() => {
            setIsLoading(false);
            toast({
                title: "Staff Attendance Saved",
                description: `Attendance for ${allStaff.length} staff members has been recorded.`
            });
        }, 1000);
    }


  return (
    <ProtectedRoute allowedRoles={['Admin', 'Headmaster']}>
        <Card>
            <CardHeader>
                <CardTitle>Staff Attendance Register</CardTitle>
                <CardDescription>Select a date to mark attendance for all staff members.</CardDescription>
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
                                disabled={(date) =>
                                    date > new Date() || date < subDays(new Date(), 2)
                                }
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
                                <TableHead className="text-right">Attendance Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {allStaff.length > 0 ? allStaff.map(staff => (
                                <TableRow key={staff.id}>
                                    <TableCell className="font-medium">{staff.name}</TableCell>
                                    <TableCell className="text-right">
                                            <RadioGroup
                                            value={staff.status}
                                            onValueChange={(status) => handleStatusChange(staff.id, status as AttendanceRecord['status'])}
                                            className="flex justify-end gap-2 md:gap-4 flex-wrap"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Present" id={`${staff.id}-present`} />
                                                <Label htmlFor={`${staff.id}-present`}>Present</Label>
                                            </div>
                                                <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Absent" id={`${staff.id}-absent`} />
                                                <Label htmlFor={`${staff.id}-absent`}>Absent</Label>
                                            </div>
                                                <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Late" id={`${staff.id}-late`} />
                                                <Label htmlFor={`${staff.id}-late`}>On Leave</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Excused" id={`${staff.id}-excused`} />
                                                <Label htmlFor={`${staff.id}-excused`}>Excused</Label>
                                            </div>
                                        </RadioGroup>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                    <TableRow>
                                    <TableCell colSpan={2} className="h-24 text-center">
                                        No staff found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
            <CardFooter className="justify-end">
                <Button onClick={handleSaveAttendance} disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    Save Attendance
                </Button>
            </CardFooter>
        </Card>
    </ProtectedRoute>
  );
}
