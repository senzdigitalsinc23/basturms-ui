

'use client';
import { ProtectedRoute } from '@/components/protected-route';
import { useState, useEffect } from 'react';
import { getStaff, getClasses, getSubjects, getStaffAppointmentHistory, addStaffAppointmentHistory, addAuditLog } from '@/lib/store';
import { Staff, Class, Subject, StaffAppointmentHistory } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, Save, Search } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';


type TeacherAssignments = {
    staff_id: string;
    name: string;
    assigned_classes: string[];
    assigned_subjects: string[];
}

export default function AssignmentsPage() {
    const [teachers, setTeachers] = useState<TeacherAssignments[]>([]);
    const [allClasses, setAllClasses] = useState<Class[]>([]);
    const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { user } = useAuth();
    const { toast } = useToast();

    const fetchData = () => {
        setLoading(true);
        const staff = getStaff().filter(s => s.roles.includes('Teacher'));
        const classes = getClasses();
        const subjects = getSubjects();
        const appointments = getStaffAppointmentHistory();

        const teacherData = staff.map(t => {
            const latestAppointment = appointments
                .filter(a => a.staff_id === t.staff_id)
                .sort((a,b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime())[0];
            
            return {
                staff_id: t.staff_id,
                name: `${t.first_name} ${t.last_name}`,
                assigned_classes: latestAppointment?.class_assigned || [],
                assigned_subjects: latestAppointment?.subjects_assigned || [],
            }
        });

        setTeachers(teacherData);
        setAllClasses(classes);
        setAllSubjects(subjects);
        setLoading(false);
    }
    
    useEffect(() => {
       fetchData();
    }, []);

    const handleAssignmentChange = (teacherId: string, type: 'classes' | 'subjects', values: string[]) => {
        setTeachers(prev => prev.map(t => {
            if (t.staff_id === teacherId) {
                return {
                    ...t,
                    [type === 'classes' ? 'assigned_classes' : 'assigned_subjects']: values,
                }
            }
            return t;
        }));
    }

    const handleSaveChanges = (teacherId: string) => {
        if (!user) return;
        const teacher = teachers.find(t => t.staff_id === teacherId);
        const originalTeacherRecord = getStaff().find(s => s.staff_id === teacherId);

        if (teacher && originalTeacherRecord) {
            const newAppointment: StaffAppointmentHistory = {
                staff_id: teacherId,
                appointment_date: new Date().toISOString(),
                roles: originalTeacherRecord.roles,
                class_assigned: teacher.assigned_classes,
                subjects_assigned: teacher.assigned_subjects,
                appointment_status: 'Appointed', // Assuming we are only dealing with appointed staff here
            };

            addStaffAppointmentHistory(newAppointment);

            addAuditLog({
                user: user.email,
                name: user.name,
                action: 'Update Staff Assignments',
                details: `Updated assignments for ${teacher.name}. Classes: ${teacher.assigned_classes.length}, Subjects: ${teacher.assigned_subjects.length}`,
            });

            toast({
                title: 'Assignments Updated',
                description: `Assignments for ${teacher.name} have been saved.`
            });
        }
    }
    
    const filteredTeachers = teachers.filter(teacher =>
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <ProtectedRoute allowedRoles={['Admin', 'Headmaster']}>
      <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Class & Subject Assignments</CardTitle>
                    <CardDescription>Manage which teachers are assigned to which classes and subjects.</CardDescription>
                </div>
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search by teacher name..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Teacher</TableHead>
                            <TableHead>Assigned Classes</TableHead>
                            <TableHead>Assigned Subjects</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                             <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">Loading teachers...</TableCell>
                            </TableRow>
                        ) : filteredTeachers.length > 0 ? (
                           filteredTeachers.map(teacher => (
                            <TableRow key={teacher.staff_id}>
                                <TableCell className="font-medium">{teacher.name}</TableCell>
                                <TableCell>
                                    <MultiSelectPopover 
                                        title="Classes"
                                        options={allClasses.map(c => ({ value: c.id, label: c.name }))}
                                        selectedValues={teacher.assigned_classes}
                                        onChange={(values) => handleAssignmentChange(teacher.staff_id, 'classes', values)}
                                    />
                                </TableCell>
                                 <TableCell>
                                    <MultiSelectPopover 
                                        title="Subjects"
                                        options={allSubjects.map(s => ({ value: s.id, label: s.name }))}
                                        selectedValues={teacher.assigned_subjects}
                                        onChange={(values) => handleAssignmentChange(teacher.staff_id, 'subjects', values)}
                                    />
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button size="sm" onClick={() => handleSaveChanges(teacher.staff_id)}>
                                        <Save className="mr-2 h-4 w-4"/>
                                        Save
                                    </Button>
                                </TableCell>
                            </TableRow>
                           ))
                        ) : (
                             <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">No teachers found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
    </ProtectedRoute>
  );
}


function MultiSelectPopover({ title, options, selectedValues, onChange }: { 
    title: string;
    options: { value: string; label: string }[];
    selectedValues: string[];
    onChange: (values: string[]) => void;
}) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                variant="outline"
                role="combobox"
                className="w-[350px] justify-between h-auto"
                >
                <div className="flex gap-1 flex-wrap">
                    {selectedValues.length > 0 ? (
                        selectedValues.map(value => {
                            const option = options.find(o => o.value === value);
                            return <Badge variant="secondary" key={value}>{option?.label || value}</Badge>;
                        })
                    ) : `Select ${title}...`}
                     {selectedValues.length > 3 && <Badge variant="outline">+{selectedValues.length - 3} more</Badge>}
                </div>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[350px] p-0">
                <Command>
                    <CommandInput placeholder={`Search ${title}...`} />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup>
                        {options.map(option => {
                            const isSelected = selectedValues.includes(option.value);
                            return (
                                <CommandItem
                                    key={option.value}
                                    onSelect={() => {
                                        const newSelection = isSelected
                                            ? selectedValues.filter(v => v !== option.value)
                                            : [...selectedValues, option.value];
                                        onChange(newSelection);
                                    }}
                                >
                                    <Check className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
                                    {option.label}
                                </CommandItem>
                            );
                        })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
