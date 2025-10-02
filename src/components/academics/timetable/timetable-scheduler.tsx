
'use client';
import { useState, useEffect } from 'react';
import { getClasses, getSubjects, addClassSubject, getStaff, getStaffAppointmentHistory, saveTimetable, getTimetable } from '@/lib/store';
import { Class, Subject, Staff, StaffAppointmentHistory } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Save, Printer, RefreshCw, Trash2 } from 'lucide-react';
import { getRandomElement } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = [
  '08:00 - 08:40', '08:40 - 09:20', '09:20 - 10:00',
  '10:00 - 10:20', // Break
  '10:20 - 11:00', '11:00 - 11:40', '11:40 - 12:20',
  '12:20 - 13:20', // Lunch Break
  '13:20 - 14:00', '14:00 - 14:40'
];
const LOWER_PRIMARY_IDS = ['nur1', 'nur2', 'kg1', 'kg2', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6'];

export type ScheduleEntry = {
    subjectId: string;
    teacherId: string;
};

export type FullSchedule = Record<string, Record<string, Record<string, ScheduleEntry | null>>>; // classId -> day -> timeSlot -> entry

export function TimetableScheduler() {
    const [classes, setClasses] = useState<Class[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [teachers, setTeachers] = useState<Staff[]>([]);
    const [appointments, setAppointments] = useState<StaffAppointmentHistory[]>([]);
    const [teacherSubjectMap, setTeacherSubjectMap] = useState<Record<string, string[]>>({});
    const [selectedClass, setSelectedClass] = useState<string | undefined>();
    const [fullSchedule, setFullSchedule] = useState<FullSchedule>({});
    const { toast } = useToast();

    useEffect(() => {
        const classData = getClasses();
        const subjectData = getSubjects();
        const staffData = getStaff().filter(s => s.roles.includes('Teacher'));
        const appointmentData = getStaffAppointmentHistory();

        setClasses(classData);
        setSubjects(subjectData);
        setTeachers(staffData);
        setAppointments(appointmentData);

        const newTeacherSubjectMap: Record<string, string[]> = {};
        staffData.forEach(teacher => {
            const latestAppointment = appointmentData
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

    const autoFillSchedule = (classId: string) => {
        const classSubjects = getClassSubjects(classId);
        if (classSubjects.length === 0) return;

        let newScheduleForClass: Record<string, Record<string, ScheduleEntry | null>> = {};
        
        const isLowerPrimary = LOWER_PRIMARY_IDS.includes(classId);
        let classTeacherId: string | undefined;

        if (isLowerPrimary) {
             const classTeacherAppointment = appointments.find(a => a.is_class_teacher_for_class_id === classId);
             classTeacherId = classTeacherAppointment?.staff_id;
        }

        DAYS.forEach(day => {
            newScheduleForClass[day] = {};
            TIME_SLOTS.forEach((slot, index) => {
                if (index === 3 || index === 7) return; // Skip breaks
                
                let assigned = false;
                let subjectsToTry = [...classSubjects].sort(() => Math.random() - 0.5);

                while (subjectsToTry.length > 0 && !assigned) {
                    const randomSubject = subjectsToTry.pop();
                    if (!randomSubject) continue;

                    let teacherToAssignId: string | undefined = classTeacherId;

                    if (!isLowerPrimary || !teacherToAssignId) {
                        const availableTeachers = getAvailableTeachers(day, slot, randomSubject.id, classId);
                        const randomTeacher = getRandomElement(availableTeachers);
                        teacherToAssignId = randomTeacher?.staff_id;
                    }
                    
                    if (!teacherToAssignId && isLowerPrimary) {
                         // Fallback for lower primary if class teacher can't teach a subject
                         const availableTeachers = getAvailableTeachers(day, slot, randomSubject.id, classId);
                         const randomTeacher = getRandomElement(availableTeachers);
                         teacherToAssignId = randomTeacher?.staff_id;
                    }

                    if (teacherToAssignId) {
                         newScheduleForClass[day][slot] = {
                            subjectId: randomSubject.id,
                            teacherId: teacherToAssignId,
                        };
                        assigned = true;
                    }
                }
                
                if (!assigned) {
                    newScheduleForClass[day][slot] = null;
                }
            });
        });

        setFullSchedule(prev => ({
            ...prev,
            [classId]: newScheduleForClass,
        }));
    };
    
     const handleClassChange = (classId: string) => {
        setSelectedClass(classId);
        if (!fullSchedule[classId]) {
            autoFillSchedule(classId);
        }
    };
    
    const handleClearSchedule = () => {
        if (!selectedClass) return;
        
        const newSchedule = { ...fullSchedule };
        delete newSchedule[selectedClass];
        setFullSchedule(newSchedule);

        toast({
            title: "Schedule Cleared",
            description: `The timetable for ${classes.find(c => c.id === selectedClass)?.name} has been cleared.`
        });
    }

    const handleScheduleChange = (day: string, timeSlot: string, field: 'subjectId' | 'teacherId', value: string) => {
        if (!selectedClass) return;

        setFullSchedule(prev => {
            const newSchedule = JSON.parse(JSON.stringify(prev));

            if (!newSchedule[selectedClass]) newSchedule[selectedClass] = {};
            if (!newSchedule[selectedClass][day]) newSchedule[selectedClass][day] = {};
            
            let entry = newSchedule[selectedClass][day][timeSlot];
            if (!entry) {
                entry = { subjectId: '', teacherId: '' };
            }
            
            const isClearing = value === 'none';

            if (isClearing) {
                 newSchedule[selectedClass][day][timeSlot] = null;
            } else {
                 if (field === 'subjectId' && entry.subjectId !== value) {
                    entry.teacherId = '';
                }
                entry[field] = value;
                newSchedule[selectedClass][day][timeSlot] = entry;
            }

            return newSchedule;
        });
    };
    
    const getClassSubjects = (classId: string | undefined): Subject[] => {
        if (!classId) return [];
        const classSubjectLinks = addClassSubject();
        const subjectIds = classSubjectLinks.filter(cs => cs.class_id === classId).map(cs => cs.subject_id);
        return subjects.filter(s => subjectIds.includes(s.id));
    };
    
    const getAvailableTeachers = (day: string, timeSlot: string, subjectId: string | undefined, currentClassId: string): Staff[] => {
        const bookedTeacherIds = new Set<string>();
        
        for (const classId in fullSchedule) {
            if (classId !== currentClassId) {
                const entry = fullSchedule[classId]?.[day]?.[timeSlot];
                if (entry && entry.teacherId) {
                    bookedTeacherIds.add(entry.teacherId);
                }
            }
        }

        let availableTeachers = teachers.filter(t => !bookedTeacherIds.has(t.staff_id));

        if (subjectId) {
            availableTeachers = availableTeachers.filter(t => teacherSubjectMap[t.staff_id]?.includes(subjectId));
        }

        return availableTeachers;
    }

    const classSubjects = getClassSubjects(selectedClass);
    const isLowerPrimary = selectedClass ? LOWER_PRIMARY_IDS.includes(selectedClass) : false;
    const classTeacher = isLowerPrimary ? appointments.find(a => a.is_class_teacher_for_class_id === selectedClass) : null;
    const classTeacherInfo = classTeacher ? teachers.find(t => t.staff_id === classTeacher.staff_id) : null;


    const handleSave = () => {
        saveTimetable(fullSchedule);
        toast({
            title: "Timetable Saved",
            description: "The school timetable has been successfully updated."
        });
    };
    
    const handlePrint = () => {
        window.print();
    };

    return (
        <Card>
            <CardHeader className="print:hidden">
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
                         {selectedClass && (
                            <>
                                <Button onClick={() => autoFillSchedule(selectedClass)} variant="outline" size="sm">
                                    <RefreshCw className="mr-2"/> Autofill
                                </Button>
                                 <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="sm"><Trash2 className="mr-2"/> Clear</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>This will clear the entire timetable for this class. You can use "Autofill" to generate a new one.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleClearSchedule}>Clear Timetable</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </>
                         )}
                        <Button onClick={handlePrint} variant="outline">
                            <Printer className="mr-2" /> Print
                        </Button>
                        <Button onClick={handleSave}>
                            <Save className="mr-2" />
                            Save Timetable
                        </Button>
                     </div>
                </div>
            </CardHeader>
            <CardContent>
                {selectedClass ? (
                    <div id="printable-timetable">
                        <div className="text-center mb-4 hidden print:block">
                            <h1 className="text-2xl font-bold">{classes.find(c => c.id === selectedClass)?.name} - Weekly Timetable</h1>
                        </div>
                        <div className="rounded-md border overflow-x-auto">
                            <Table className="min-w-full">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[150px] font-bold text-black print:text-sm">Time Slot</TableHead>
                                        {DAYS.map(day => <TableHead key={day} className="font-bold text-black print:text-sm">{day}</TableHead>)}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {TIME_SLOTS.map((slot, index) => (
                                        <TableRow key={slot} className={index === 3 || index === 7 ? 'bg-muted/50 print:bg-gray-200' : ''}>
                                            <TableCell className="font-medium print:text-xs">{slot}</TableCell>
                                            {DAYS.map(day => {
                                                if (index === 3) return index === 3 && day === 'Monday' ? <TableCell key={day} rowSpan={1} colSpan={5} className="text-center font-semibold print:text-sm">Short Break</TableCell> : null
                                                if (index === 7) return index === 7 && day === 'Monday' ? <TableCell key={day} rowSpan={1} colSpan={5} className="text-center font-semibold print:text-sm">Lunch Break</TableCell> : null
                                                
                                                if (index === 3 || index === 7) return null;

                                                const currentEntry = fullSchedule[selectedClass]?.[day]?.[slot];
                                                const availableTeachers = getAvailableTeachers(day, slot, currentEntry?.subjectId, selectedClass);

                                                return (
                                                    <TableCell key={day} className="p-1 align-top print:p-1">
                                                        <div className="space-y-1 hidden print:block">
                                                            <p className="font-semibold text-sm">{subjects.find(s => s.id === currentEntry?.subjectId)?.name || '---'}</p>
                                                            <p className="text-xs text-gray-600">{teachers.find(t => t.staff_id === currentEntry?.teacherId)?.first_name || '---'}</p>
                                                        </div>
                                                        <div className="space-y-1 print:hidden">
                                                            <Select
                                                                value={currentEntry?.subjectId || ''}
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
                                                                value={currentEntry?.teacherId || ''}
                                                                onValueChange={(value) => handleScheduleChange(day, slot, 'teacherId', value)}
                                                                disabled={!currentEntry?.subjectId || (isLowerPrimary && !!classTeacher)}
                                                            >
                                                                <SelectTrigger className="h-8 text-xs">
                                                                    <SelectValue placeholder="Teacher" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {isLowerPrimary && classTeacherInfo ? (
                                                                        <SelectItem value={classTeacherInfo.staff_id}>{classTeacherInfo.first_name} {classTeacherInfo.last_name}</SelectItem>
                                                                    ) : (
                                                                        <>
                                                                            {availableTeachers.map(t => <SelectItem key={t.staff_id} value={t.staff_id}>{t.first_name} {t.last_name}</SelectItem>)}
                                                                        </>
                                                                    )}
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
