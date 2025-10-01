'use client';
import { useState, useEffect } from 'react';
import { getClasses, getSubjects, addClassSubject, getStaff } from '@/lib/store';
import { Class, Subject, Staff } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = [
  '08:00 - 08:40', '08:40 - 09:20', '09:20 - 10:00',
  '10:00 - 10:20', // Break
  '10:20 - 11:00', '11:00 - 11:40', '11:40 - 12:20',
  '12:20 - 13:20', // Lunch Break
  '13:20 - 14:00', '14:00 - 14:40'
];

type ScheduleEntry = {
    subjectId: string;
    teacherId: string;
};

export function TimetableScheduler() {
    const [classes, setClasses] = useState<Class[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [teachers, setTeachers] = useState<Staff[]>([]);
    const [selectedClass, setSelectedClass] = useState<string | undefined>();
    const [schedule, setSchedule] = useState<Record<string, Record<string, ScheduleEntry | null>>>({});

    useEffect(() => {
        setClasses(getClasses());
        setSubjects(getSubjects());
        setTeachers(getStaff().filter(s => s.roles.includes('Teacher')));
    }, []);

    const handleClassChange = (classId: string) => {
        setSelectedClass(classId);
        // Here you would normally load the saved schedule for this class
        // For now, we just reset it
        setSchedule({});
    };

    const handleScheduleChange = (day: string, timeSlot: string, field: 'subjectId' | 'teacherId', value: string) => {
        setSchedule(prev => {
            const newSchedule = { ...prev };
            if (!newSchedule[day]) newSchedule[day] = {};
            if (!newSchedule[day][timeSlot]) newSchedule[day][timeSlot] = { subjectId: '', teacherId: '' };
            
            const entry = newSchedule[day][timeSlot]!;
            entry[field] = value;

            return newSchedule;
        });
    };
    
    const getClassSubjects = () => {
        if (!selectedClass) return [];
        const classSubjectLinks = addClassSubject();
        const subjectIds = classSubjectLinks.filter(cs => cs.class_id === selectedClass).map(cs => cs.subject_id);
        return subjects.filter(s => subjectIds.includes(s.id));
    };

    const classSubjects = getClassSubjects();

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Class Timetable</CardTitle>
                        <CardDescription>Select a class to view or edit its weekly timetable.</CardDescription>
                    </div>
                     <Select onValueChange={handleClassChange} value={selectedClass}>
                        <SelectTrigger className="w-[250px]">
                            <SelectValue placeholder="Select a class..." />
                        </SelectTrigger>
                        <SelectContent>
                            {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                {selectedClass ? (
                    <div className="rounded-md border overflow-x-auto">
                        <Table className="min-w-full">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[150px]">Time Slot</TableHead>
                                    {DAYS.map(day => <TableHead key={day}>{day}</TableHead>)}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {TIME_SLOTS.map((slot, index) => (
                                    <TableRow key={slot} className={index === 3 || index === 7 ? 'bg-muted/50' : ''}>
                                        <TableCell className="font-medium">{slot}</TableCell>
                                        {DAYS.map(day => {
                                            if (index === 3) return index === 3 && day === 'Monday' ? <TableCell key={day} rowSpan={1} colSpan={5} className="text-center font-semibold">Short Break</TableCell> : null
                                            if (index === 7) return index === 7 && day === 'Monday' ? <TableCell key={day} rowSpan={1} colSpan={5} className="text-center font-semibold">Lunch Break</TableCell> : null
                                            
                                            if (index === 3 || index === 7) return null;

                                            return (
                                                <TableCell key={day} className="p-1">
                                                    <div className="space-y-1">
                                                        <Select
                                                            value={schedule[day]?.[slot]?.subjectId || ''}
                                                            onValueChange={(value) => handleScheduleChange(day, slot, 'subjectId', value)}
                                                        >
                                                            <SelectTrigger className="h-8 text-xs">
                                                                <SelectValue placeholder="Subject" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {classSubjects.map(sub => <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>)}
                                                            </SelectContent>
                                                        </Select>
                                                         <Select
                                                            value={schedule[day]?.[slot]?.teacherId || ''}
                                                            onValueChange={(value) => handleScheduleChange(day, slot, 'teacherId', value)}
                                                        >
                                                            <SelectTrigger className="h-8 text-xs">
                                                                <SelectValue placeholder="Teacher" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {teachers.map(t => <SelectItem key={t.staff_id} value={t.staff_id}>{t.first_name} {t.last_name}</SelectItem>)}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </TableCell>
                                            )
                                        })}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-48 text-muted-foreground">
                        <p>Please select a class to start building the timetable.</p>
                    </div>
                )}
                 {selectedClass && (
                    <div className="flex justify-end mt-4">
                        <Button>Save Timetable</Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
