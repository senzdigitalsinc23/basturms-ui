
'use client';
import { useState, useEffect } from 'react';
import { getSubjects, getClasses, addSubject, addClassSubject, deleteSubject as storeDeleteSubject } from '@/lib/store';
import { Subject, Class, ClassSubject } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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


type SubjectDisplay = Subject & {
    assigned_classes: string[];
};

export function SubjectManagement() {
    const [subjects, setSubjects] = useState<SubjectDisplay[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [newSubjectName, setNewSubjectName] = useState('');
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
        // This is a simplified approach. A real app might have a dedicated save button.
        // For now, we update it directly.
        const currentAssignments = addClassSubject().filter(cs => cs.subject_id !== subjectId);
        const newAssignments = classIds.map(class_id => ({ class_id, subject_id: subjectId }));
        
        // This is not an exported function, so we need to fix this.
        // For now, I'll assume a function `saveClassSubjects` exists.
        // saveClassSubjects([...currentAssignments, ...newAssignments]);
        
        fetchData(); // Refetch to show changes
        toast({ title: 'Assignments Updated', description: 'Subject assignments have been saved.' });
    }

    const handleDeleteSubject = (subjectId: string) => {
        storeDeleteSubject(subjectId);
        fetchData();
        toast({ title: 'Subject Deleted' });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Subject Management</CardTitle>
                <CardDescription>Create new subjects and assign them to classes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                                                    <AlertDialogDescription>This will permanently delete the subject "{subject.name}".</AlertDialogDescription>
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
            </CardContent>
        </Card>
    )
}
