'use client';
import { useState, useEffect } from 'react';
import { getClasses, getSubjects, addClassSubject, getStaff, getStaffAppointmentHistory, saveTimetable, getTimetable } from '@/lib/store';
import { Class, Subject, Staff, StaffAppointmentHistory } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = [
  '08:00 - 08:40', '08:40 - 09:20', '09:20 - 10:00',
  '10:00 - 10:20', // Break
  '10:20 - 11:00', '11:00 - 11:40', '11:40 - 12:20',
  '12:20 - 13:20', // Lunch Break
  '13:20 - 14:00', '14:00 - 14:40'
];

export type ScheduleEntry = {
    subjectId: string;
    teacherId: string;
};

export type FullSchedule = Record<string, Record<string, Record<string, ScheduleEntry | null>>>; // classId -> day -> timeSlot -> entry

export function TimetableScheduler() {
    const [classes, setClasses] = useState<Class[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [teachers, setTeachers] = useState<Staff[]>([]);
    const [teacherSubjectMap, setTeacherSubjectMap] = useState<Record<string, string[]>>({});
    const [selectedClass, setSelectedClass] = useState<string | undefined>();
    const [fullSchedule, setFullSchedule] = useState<FullSchedule>({});
    const { toast } = useToast();

    useEffect(() => {
        const classData = getClasses();
        const subjectData = getSubjects();
        const staffData = getStaff().filter(s => s.roles.includes('Teacher'));
        const appointments = getStaffAppointmentHistory();

        setClasses(classData);
        setSubjects(subjectData);
        setTeachers(staffData);

        const newTeacherSubjectMap: Record<string, string[]> = {};
        staffData.forEach(teacher => {
            const latestAppointment = appointments
                .filter(a => a.staff_id === teacher.staff_id)
                .sort((a,b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime())[0];
            if (latestAppointment && latestAppointment.subjects_assigned) {
                newTeacherSubjectMap[teacher.staff_id] = latestAppointment.subjects_assigned;
            } else {
                newTeacherSubjectMap[teacher.staff_id] = [];
            }
        });
        setTeacherSubjectMap(newTeacherSubjectMap);
        
        setFullSchedule(getTimetable());

    }, []);

    const handleClassChange = (classId: string) => {
        setSelectedClass(classId);
    };

    const handleScheduleChange = (day: string, timeSlot: string, field: 'subjectId' | 'teacherId', value: string) => {
        if (!selectedClass) return;

        setFullSchedule(prev => {
            const newSchedule = JSON.parse(JSON.stringify(prev)); // Deep copy

            if (!newSchedule[selectedClass]) newSchedule[selectedClass] = {};
            if (!newSchedule[selectedClass][day]) newSchedule[selectedClass][day] = {};
            
            let entry = newSchedule[selectedClass][day][timeSlot];
            if (!entry) {
                entry = { subjectId: '', teacherId: '' };
            }

            // If subject is changed, reset teacher
            if (field === 'subjectId' && entry.subjectId !== value) {
                entry.teacherId = '';
            }
            
            entry[field] = value;

            newSchedule[selectedClass][day][timeSlot] = entry;

            return newSchedule;
        });
    };
    
    const getClassSubjects = (classId: string | undefined): Subject[] => {
        if (!classId) return [];
        const classSubjectLinks = addClassSubject();
        const subjectIds = classSubjectLinks.filter(cs => cs.class_id === classId).map(cs => cs.subject_id);
        return subjects.filter(s => subjectIds.includes(s.id));
    };
    
    const getAvailableTeachers = (day: string, timeSlot: string, subjectId: string | undefined): Staff[] => {
        const bookedTeacherIds = new Set<string>();
        
        // Find all teachers booked at this exact time slot in other classes
        for (const classId in fullSchedule) {
            if (classId !== selectedClass) {
                const entry = fullSchedule[classId]?.[day]?.[timeSlot];
                if (entry && entry.teacherId) {
                    bookedTeacherIds.add(entry.teacherId);
                }
            }
        }

        let availableTeachers = teachers.filter(t => !bookedTeacherIds.has(t.staff_id));

        // If a subject is selected, further filter by teachers who teach that subject
        if (subjectId) {
            availableTeachers = availableTeachers.filter(t => teacherSubjectMap[t.staff_id]?.includes(subjectId));
        }

        return availableTeachers;
    }

    const classSubjects = getClassSubjects(selectedClass);

    const handleSave = () => {
        saveTimetable(fullSchedule);
        toast({
            title: "Timetable Saved",
            description: "The school timetable has been successfully updated."
        });
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Class Timetable</CardTitle>
                        <CardDescription>Select a class to view or edit its weekly timetable.</CardDescription>
                    </div>
                     <div className="flex items-center gap-2">
                        <Select onValueChange={handleClassChange} value={selectedClass}>
                            <SelectTrigger className="w-[250px]">
                                <SelectValue placeholder="Select a class..." />
                            </SelectTrigger>
                            <SelectContent>
                                {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Button onClick={handleSave}>
                            <Save className="mr-2" />
                            Save Timetable
                        </Button>
                     </div>
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

                                            const currentEntry = fullSchedule[selectedClass]?.[day]?.[slot];
                                            const availableTeachers = getAvailableTeachers(day, slot, currentEntry?.subjectId);

                                            return (
                                                <TableCell key={day} className="p-1">
                                                    <div className="space-y-1">
                                                        <Select
                                                            value={currentEntry?.subjectId || ''}
                                                            onValueChange={(value) => handleScheduleChange(day, slot, 'subjectId', value)}
                                                        >
                                                            <SelectTrigger className="h-8 text-xs">
                                                                <SelectValue placeholder="Subject" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="">None</SelectItem>
                                                                {classSubjects.map(sub => <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>)}
                                                            </SelectContent>
                                                        </Select>
                                                         <Select
                                                            value={currentEntry?.teacherId || ''}
                                                            onValueChange={(value) => handleScheduleChange(day, slot, 'teacherId', value)}
                                                            disabled={!currentEntry?.subjectId}
                                                        >
                                                            <SelectTrigger className="h-8 text-xs">
                                                                <SelectValue placeholder="Teacher" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                 <SelectItem value="">None</SelectItem>
                                                                {availableTeachers.map(t => <SelectItem key={t.staff_id} value={t.staff_id}>{t.first_name} {t.last_name}</SelectItem>)}
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
            </CardContent>
        </Card>
    );
}
