
'use client';
import { useState, useEffect } from 'react';
import { getSubjects, getClasses, addSubject, addClassSubject, deleteSubject as storeDeleteSubject, saveClassSubjects } from '@/lib/store';
import { Subject, Class, ClassSubject } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Trash2 } from 'lucide-react';
import { MultiSelectPopover } from './multi-select-popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';


type SubjectDisplay = Subject & {
    assigned_classes: string[];
};

export function SubjectManagement() {
    const [subjects, setSubjects] = useState<SubjectDisplay[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [newSubjectName, setNewSubjectName] = useState('');
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
    const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
    const { toast } = useToast();
    const { user } = useAuth();

    const fetchData = () => {
        const allSubjects = getSubjects();
        const allClassSubjects = addClassSubject();
        const allClasses = getClasses();
        setClasses(allClasses);

        const displayData = allSubjects.map(subject => {
            const assigned = allClassSubjects
                .filter(cs => cs.subject_id === subject.id)
                .map(cs => cs.class_id);
            return { ...subject, assigned_classes: assigned };
        });
        setSubjects(displayData);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddSubject = () => {
        if (!newSubjectName.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Subject name cannot be empty.' });
            return;
        }
        addSubject(newSubjectName);
        fetchData();
        setNewSubjectName('');
        toast({ title: 'Subject Added', description: `"${newSubjectName}" has been added.` });
    };

    const handleAssignmentChange = (subjectId: string, classIds: string[]) => {
        const currentAssignments = addClassSubject();
        // Remove all existing assignments for the current subject
        const otherSubjectAssignments = currentAssignments.filter(cs => cs.subject_id !== subjectId);
        // Create new assignment entries for the current subject
        const newAssignmentsForCurrentSubject = classIds.map(class_id => ({ class_id, subject_id: subjectId }));

        saveClassSubjects([...otherSubjectAssignments, ...newAssignmentsForCurrentSubject]);
        
        fetchData(); // Refetch to show changes
        toast({ title: 'Assignments Updated', description: 'Subject assignments have been saved.' });
    }
    
    const handleBulkAssign = () => {
        if (selectedSubjects.length === 0 || selectedClasses.length === 0) {
            toast({
                variant: 'destructive',
                title: 'Selection Required',
                description: 'Please select at least one subject and one class.'
            });
            return;
        }

        const currentAssignments = addClassSubject();
        const newAssignments: ClassSubject[] = [];

        selectedSubjects.forEach(subjectId => {
            selectedClasses.forEach(classId => {
                // Avoid adding duplicates
                if (!currentAssignments.some(a => a.subject_id === subjectId && a.class_id === classId)) {
                    newAssignments.push({ subject_id: subjectId, class_id: classId });
                }
            });
        });
        
        // Combine existing assignments with new ones, ensuring no duplicates overall
        const combinedAssignments = [...currentAssignments, ...newAssignments];
        const uniqueAssignments = Array.from(new Set(combinedAssignments.map(a => JSON.stringify(a)))).map(s => JSON.parse(s));

        saveClassSubjects(uniqueAssignments);
        fetchData();

        toast({
            title: 'Bulk Assign Successful',
            description: `${selectedSubjects.length} subject(s) assigned to ${selectedClasses.length} class(es).`
        });
        
        // Reset selections
        setSelectedSubjects([]);
        setSelectedClasses([]);
    }

    const handleDeleteSubject = (subjectId: string) => {
        storeDeleteSubject(subjectId);
        fetchData();
        toast({ title: 'Subject Deleted' });
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Bulk Assign Subjects to Classes</CardTitle>
                    <CardDescription>Select multiple subjects and assign them to multiple classes at once.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 w-full">
                        <p className="text-sm font-medium mb-2">Subjects to Assign</p>
                        <MultiSelectPopover 
                            title="Subjects"
                            options={subjects.map(s => ({ value: s.id, label: s.name }))}
                            selectedValues={selectedSubjects}
                            onChange={setSelectedSubjects}
                        />
                    </div>
                    <div className="flex-1 w-full">
                        <p className="text-sm font-medium mb-2">Assign to Classes</p>
                        <MultiSelectPopover 
                            title="Classes"
                            options={classes.map(c => ({ value: c.id, label: c.name }))}
                            selectedValues={selectedClasses}
                            onChange={setSelectedClasses}
                        />
                    </div>
                </CardContent>
                <CardFooter className="justify-end">
                    <Button onClick={handleBulkAssign}>Assign Selected</Button>
                </CardFooter>
            </Card>

            <Separator />
            
            <h4 className="text-lg font-medium">Individual Subject Management</h4>
            <div className="flex items-center gap-2">
                <Input 
                    placeholder="Enter new subject name..."
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSubject()}
                />
                <Button onClick={handleAddSubject}><PlusCircle className="mr-2 h-4 w-4" /> Add Subject</Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Subject Name</TableHead>
                            <TableHead>Assigned to Classes</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {subjects.map(subject => (
                            <TableRow key={subject.id}>
                                <TableCell className="font-medium">{subject.name}</TableCell>
                                <TableCell>
                                    <MultiSelectPopover 
                                        title="Classes"
                                        options={classes.map(c => ({ value: c.id, label: c.name }))}
                                        selectedValues={subject.assigned_classes}
                                        onChange={(values) => handleAssignmentChange(subject.id, values)}
                                    />
                                </TableCell>
                                <TableCell className="text-right">
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>This will permanently delete the subject "{subject.name}" and all its assignments.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteSubject(subject.id)}>Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
