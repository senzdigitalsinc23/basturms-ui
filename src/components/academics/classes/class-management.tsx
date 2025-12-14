'use client';
import { useState, useEffect } from 'react';
import { getClasses, getSubjects, saveClassSubjects, addAuditLog, fetchClassesFromApi, fetchSubjectsFromApi, fetchClassSubjectAssignmentsFromApi } from '@/lib/store';
import { Class, Subject, ClassSubject, ClassSubjectAssignment } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, ChevronsUpDown, PlusCircle } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, Edit } from 'lucide-react';


const formSchema = z.object({
    id: z.string().optional(), // Added for edit operations
    class_id: z.string().optional(),
    name: z.string().optional(),
});

export function ClassManagement() {
    const [classes, setClasses] = useState<Class[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [classSubjects, setClassSubjects] = useState<ClassSubject[]>([]);
    const [classSubjectAssignments, setClassSubjectAssignments] = useState<ClassSubjectAssignment[]>([]);
    const [selectedClass, setSelectedClass] = useState<string | undefined>();
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
    const [isCreateClassOpen, setIsCreateClassOpen] = useState(false);
    const [isEditClassOpen, setIsEditClassOpen] = useState(false);
    const [editingClass, setEditingClass] = useState<Class | null>(null);
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
    const [isViewDormantClassesOpen, setIsViewDormantClassesOpen] = useState(false);
    const [dormantClasses, setDormantClasses] = useState<Class[]>([]);
    const [dormantClassRowSelection, setDormantClassRowSelection] = useState<Record<string, boolean>>({});
    const [isAssignedSubjectsModalOpen, setIsAssignedSubjectsModalOpen] = useState(false);
    const [currentClassAssignments, setCurrentClassAssignments] = useState<ClassSubjectAssignment[]>([]);
    const { user } = useAuth();
    const { toast } = useToast();
    const [assignedSubjectRowSelection, setAssignedSubjectRowSelection] = useState<Record<string, boolean>>({});

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            class_id: "",
        },
    });

    const editForm = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: "",
            name: "",
            class_id: "",
        },
    });

    const fetchData = async () => {
        const fetchedClasses = await fetchClassesFromApi();
        const fetchedSubjects = await fetchSubjectsFromApi();
        const fetchedClassSubjectAssignments = await fetchClassSubjectAssignmentsFromApi();
        setClasses(fetchedClasses);
        setSubjects(fetchedSubjects);
        setClassSubjectAssignments(fetchedClassSubjectAssignments);
        // setClassSubjects(addClassSubject());
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        
        if (selectedClass) {
            const subjectsForClass = classSubjectAssignments
                .filter(cs => cs.class_id === selectedClass)
                .map(cs => cs.subject_id);

            setSelectedSubjects(subjectsForClass);
        } else {
            setSelectedSubjects([]);
        }
    }, [selectedClass, classSubjectAssignments]);

    const availableSubjects = subjects.filter(subject => {
        
        const assignedToClass = classSubjectAssignments.some(cs => cs.subject_id === subject.id && cs.class_id === selectedClass);

        
        return assignedToClass || selectedClass === undefined; 
    })

    
    

    const handleSave = () => {
        if (!selectedClass || !user) return;

        // Remove all assignments for the selected class
        const otherClassAssignments = classSubjectAssignments.filter(cs => cs.class_id !== selectedClass);

        // Add the new assignments for the selected class
        const newAssignmentsForClass = selectedSubjects.map(subject_id => ({ class_id: selectedClass, subject_id }));
        
        const newClassSubjects = [...otherClassAssignments, ...newAssignmentsForClass];
        saveClassSubjects(newClassSubjects);
        fetchData(); // Refetch all data

        toast({
            title: 'Assignments Saved',
            description: `Subject assignments for ${classes.find(c => c.id === selectedClass)?.name} have been updated.`
        });
        
        addAuditLog({
            user: user.email,
            name: user.name,
            action: 'Update Class Assignments',
            details: `Updated subject assignments for class ID ${selectedClass}.`
        })
    }

    const handleCreateClass = async (values: z.infer<typeof formSchema>) => {
        try {
            const token = localStorage.getItem('campusconnect_token');
            const res = await fetch('/api/academic/classes/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                    'X-API-KEY': process.env.NEXT_PUBLIC_API_KEY || 'devKey123',
                },
                body: JSON.stringify({ class_name: values.name, class_id: values.class_id }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to create class: ${res.statusText}`);
            }

            const response = await res.json();
            toast({ title: 'Class Created', description: `Class ${values.name} has been created.` });
            setIsCreateClassOpen(false);
            form.reset();
            fetchData(); // Refresh data after creation
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Failed to create class. Please try again.',
            });
        }
    };

    const fetchDormantClasses = async () => {
        try {
            const token = localStorage.getItem('campusconnect_token');
            const res = await fetch('/api/academic/classes/list', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                    'X-API-KEY': process.env.NEXT_PUBLIC_API_KEY || 'devKey123',
                },
                body: JSON.stringify({ status: "inactive" }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to fetch dormant classes: ${res.statusText}`);
            }

            const response = await res.json();
            
            if (response.success && Array.isArray(response.data)) {
                setDormantClasses(response.data);
            } else {
                setDormantClasses([]);
            }
            setIsViewDormantClassesOpen(true);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Failed to fetch dormant classes. Please try again.',
            });
        }
    };

    const handleEditClass = (cls: Class) => {
        setEditingClass(cls);
        editForm.setValue('id', cls.id);
        editForm.setValue('name', cls.name);
        editForm.setValue('class_id', cls.class_id || '');
        setIsEditClassOpen(true);
    };

    const handleUpdateClass = async (values: z.infer<typeof formSchema>) => {
        if (!editingClass || !user) return;
        try {
            const token = localStorage.getItem('campusconnect_token');
            
            const res = await fetch(`/api/academic/classes/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                    'X-API-KEY': process.env.NEXT_PUBLIC_API_KEY || 'devKey123',
                },
                body: JSON.stringify({ id: editingClass.id, class_name: values.name, class_id: values.class_id }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to update class: ${res.statusText}`);
            }

            const response = await res.json();
            toast({ title: 'Class Updated', description: `Class ${values.name} has been updated.` });
            setIsEditClassOpen(false);
            setEditingClass(null);
            fetchData(); // Refresh data after update

            addAuditLog({
                user: user?.email || '',
                name: user?.name || '',
                action: 'Update Class',
                details: `Updated class ID ${editingClass.id} name to ${values.name}.`
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Failed to update class. Please try again.',
            });
        }
    };

    const handleDeleteClass = async (classId: string) => {
        try {
            const token = localStorage.getItem('campusconnect_token');
            const res = await fetch(`/api/academic/classes/delete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                    'X-API-KEY': process.env.NEXT_PUBLIC_API_KEY || 'devKey123',
                },
                body: JSON.stringify({ class_ids: [classId] }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                
                throw new Error(errorData.message || `Failed to delete class: ${res.statusText}`);
            }

            const response = await res.json();
            
            toast({ title: 'Class Deleted', description: `Class has been deleted.` });
            setIsEditClassOpen(false);
            fetchData(); // Refresh data after deletion

            addAuditLog({
                user: user?.email || '',
                name: user?.name || '',
                action: 'Delete Class',
                details: `Deleted class ID ${classId}.`
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Failed to delete class. Please try again.',
            });
        }
    };

    const handleBulkDeleteClasses = async () => {
        const classIdsToDelete = Object.keys(rowSelection).filter(id => rowSelection[id]);

        
        if (classIdsToDelete.length === 0) return;

        try {
            const token = localStorage.getItem('campusconnect_token');
            const res = await fetch('/api/academic/classes/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                    'X-API-KEY': process.env.NEXT_PUBLIC_API_KEY || 'devKey123',
                },
                body: JSON.stringify({ class_ids: classIdsToDelete }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to delete classes: ${res.statusText}`);
            }

            const response = await res.json();
            
            toast({ title: 'Classes Deleted', description: `Selected classes have been deleted.` });
            setRowSelection({}); // Clear selection after bulk delete
            fetchData(); // Refresh data after bulk deletion

            addAuditLog({
                user: user?.email || '',
                name: user?.name || '',
                action: 'Bulk Delete Classes',
                details: `Deleted ${classIdsToDelete.length} classes.`
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Failed to delete classes. Please try again.',
            });
        }
    };

    const isAllSelected = classes.length > 0 && Object.keys(rowSelection).length === classes.length;

    const handleActivateClass = async (id: string,  classId: string, className: string) => {
        
        try {
            const token = localStorage.getItem('campusconnect_token');
            const res = await fetch('/api/academic/classes/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                    'X-API-KEY': process.env.NEXT_PUBLIC_API_KEY || 'devKey123',
                },
                body: JSON.stringify({ id: id, class_id: classId, class_name: className, status: "active" }),
            });

            const response = await res.json();
            console.log(response);
            

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to activate class: ${res.statusText}`);
            }

            toast({ title: 'Class Activated', description: `Class has been activated.` });
            setIsViewDormantClassesOpen(false);
            fetchData(); // Refresh all data
            setDormantClassRowSelection({});
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Failed to activate class. Please try again.',
            });
        }
    };

    const handleBulkActivateClasses = async () => {
        const classIdsToActivate = Object.keys(dormantClassRowSelection).filter(id => dormantClassRowSelection[id]);

        if (classIdsToActivate.length === 0) return;

        try {
            const token = localStorage.getItem('campusconnect_token');
            const res = await fetch('/api/academic/classes/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                    'X-API-KEY': process.env.NEXT_PUBLIC_API_KEY || 'devKey123',
                },
                body: JSON.stringify({ id: classIdsToActivate }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to activate classes: ${res.statusText}`);
            }

            const response = await res.json();

            console.log(response);
            
            toast({ title: 'Classes Activated', description: `Selected dormant classes have been activated.` });
            setIsViewDormantClassesOpen(false);
            setDormantClassRowSelection({}); // Clear selection after bulk activation
            fetchData(); // Refresh all data

            addAuditLog({
                user: user?.email || '',
                name: user?.name || '',
                action: 'Bulk Activate Classes',
                details: `Activated ${classIdsToActivate.length} dormant classes.`
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Failed to activate classes. Please try again.',
            });
        }
    };

    const handleViewAssignedSubjects = async (cls: Class) => {
        // Fetch assignments specifically for the selected class
        const assignments = await fetchClassSubjectAssignmentsFromApi(true, cls.class_id);
        setCurrentClassAssignments(assignments.filter(assignment => assignment.is_active));
        setIsAssignedSubjectsModalOpen(true);
    };

    const handleUnassignSubject = async (assignmentId: string) => {
        if (!user) {
            toast({ title: "Error", description: "You must be logged in to unassign subjects.", variant: "destructive" });
            return;
        }

        try {
            // Optimistically update the UI
            setClassSubjectAssignments(prev => prev.filter(assignment => assignment.id !== assignmentId));
            setCurrentClassAssignments(prev => prev.filter(assignment => assignment.id !== assignmentId));

            const token = localStorage.getItem('campusconnect_token');
            const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'devKey123';

            const response = await fetch(`/api/academic/class-subjects/unassign/${assignmentId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-API-KEY': apiKey,
                    'X-User-ID': user.id,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to unassign subject');
            }

            toast({ title: "Success", description: "Subject unassigned successfully." });
            await addAuditLog({ user: user.email, name: user.name, action: 'Unassign Subject', details: `Unassigned subject from class (Assignment ID: ${assignmentId})` });
        } catch (error) {
            console.error("Error unassigning subject:", error);
            toast({ title: "Error", description: "Failed to unassign subject.", variant: "destructive" });
            // Revert optimistic update if API call fails
            fetchData();
        }
    };

    const handleBulkUnassignSubjects = async () => {
        if (!user) {
            toast({ title: "Error", description: "You must be logged in to unassign subjects.", variant: "destructive" });
            return;
        }

        const selectedAssignmentIds = Object.keys(assignedSubjectRowSelection).filter(id => assignedSubjectRowSelection[id]);

        if (selectedAssignmentIds.length === 0) {
            toast({ title: "Info", description: "No subjects selected for unassignment." });
            return;
        }

        try {
            // Optimistically update the UI
            setClassSubjectAssignments(prev => prev.filter(assignment => !selectedAssignmentIds.includes(assignment.id)));
            setCurrentClassAssignments(prev => prev.filter(assignment => !selectedAssignmentIds.includes(assignment.id)));
            setAssignedSubjectRowSelection({});

            const token = localStorage.getItem('campusconnect_token');
            const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'devKey123';

            const response = await fetch('/api/academic/class-subjects/bulk-unassign', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-API-KEY': apiKey,
                    'X-User-ID': user.id,
                },
                body: JSON.stringify({ assignment_ids: selectedAssignmentIds })
            });

            if (!response.ok) {
                throw new Error('Failed to bulk unassign subjects');
            }

            toast({ title: "Success", description: "Selected subjects unassigned successfully." });
            await addAuditLog({ user: user.email, name: user.name, action: 'Bulk Unassign Subjects', details: `Bulk unassigned subjects from class (Assignment IDs: ${selectedAssignmentIds.join(', ')})` });
        } catch (error) {
            console.error("Error bulk unassigning subjects:", error);
            toast({ title: "Error", description: "Failed to bulk unassign subjects.", variant: "destructive" });
            // Revert optimistic update if API call fails
            fetchData();
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Classes</CardTitle>
                <CardDescription>Create, edit, and delete classes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                        {Object.keys(rowSelection).length > 0 && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Selected ({Object.keys(rowSelection).length})
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>This will permanently delete the selected classes. This action cannot be undone.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleBulkDeleteClasses}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                         {user?.role === 'Admin' || user?.is_super_admin || user?.role === 'I.T Manager' ? (
                            <Button variant="outline" size="sm" onClick={fetchDormantClasses}>
                                View Dormant Classes
                            </Button>
                        ) : null}
                    </div>
                    <Dialog open={isCreateClassOpen} onOpenChange={setIsCreateClassOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm"><PlusCircle className="mr-2" /> Create Class</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Class</DialogTitle>
                                <DialogDescription>Enter the details for the new class.</DialogDescription>
                            </DialogHeader>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(handleCreateClass)} className="space-y-4">
                                    <FormField control={form.control} name="class_id" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Class ID</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., B1" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="name" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Class Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Basic 1" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <DialogFooter>
                                        <Button type="submit">Create Class</Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="rounded-md border mt-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">
                                    <Checkbox
                                        checked={classes.length > 0 && Object.keys(rowSelection).length === classes.length}
                                        onCheckedChange={checked => {
                                            const newRowSelection: Record<string, boolean> = {};
                                            if (checked) {
                                                classes.forEach(cls => {
                                                    if (cls.id) newRowSelection[cls.id] = true;
                                                });
                                            }
                                            setRowSelection(newRowSelection);
                                        }}
                                    />
                                </TableHead>
                                <TableHead>Class Name</TableHead>
                                <TableHead className="w-[50px]">Active</TableHead>
                                <TableHead className="min-w-[150px]">Assigned Subjects</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {classes.map((cls) => {
                                const assignedSubjects = classSubjectAssignments.filter(
                                    (assignment) => assignment.class_id === cls.class_id && assignment.is_active
                                ).map(assignment => assignment.subject_name);
                                return (
                                    <TableRow key={cls.class_id} data-state={rowSelection[cls.class_id as string] && "selected"}>
                                        <TableCell>
                                            <Checkbox
                                                checked={rowSelection[cls.class_id as string] || false}
                                                onCheckedChange={checked => setRowSelection(prev => ({
                                                    ...prev,
                                                    [cls.class_id as string]: !!checked
                                                }))}
                                                aria-label="Select row"
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">{cls.name}</TableCell>
                                        <TableCell>{cls.is_active ? "Yes" : "No"}</TableCell>
                                        <TableCell>
                                            {assignedSubjects.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {assignedSubjects.map(subjectName => (
                                                        <Badge key={subjectName} variant="secondary">{subjectName}</Badge>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">No subjects assigned</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEditClass(cls)}
                                                className="mr-2"
                                            >
                                                <Edit className="mr-2 h-4 w-4" /> Edit
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleViewAssignedSubjects(cls)}
                                            >
                                                View Assigned Subjects
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
                
            </CardContent>
            
            <Dialog open={isEditClassOpen} onOpenChange={setIsEditClassOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Class</DialogTitle>
                        <DialogDescription>Edit the name of the class.</DialogDescription>
                    </DialogHeader>
                    <Form {...editForm}>
                        <form onSubmit={editForm.handleSubmit(handleUpdateClass)} className="space-y-4">
                            <FormField control={editForm.control} name="class_id" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Class ID</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., B1" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={editForm.control} name="name" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Class Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <DialogFooter>
                                <Button type="submit">Save Changes</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
            <Dialog open={isViewDormantClassesOpen} onOpenChange={setIsViewDormantClassesOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Dormant Classes</DialogTitle>
                        <DialogDescription>List of inactive classes. You can activate them here.</DialogDescription>
                    </DialogHeader>
                    <div className="rounded-md border mt-4 max-h-[80vh] overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">
                                        <Checkbox
                                            checked={dormantClasses.length > 0 && Object.keys(dormantClassRowSelection).length === dormantClasses.length}
                                            onCheckedChange={checked => {
                                                const newRowSelection: Record<string, boolean> = {};
                                                if (checked) {
                                                    dormantClasses.forEach(cls => {
                                                        if (cls.id) newRowSelection[cls.id] = true;
                                                    });
                                                }
                                                setDormantClassRowSelection(newRowSelection);
                                            }}
                                        />
                                    </TableHead>
                                    <TableHead>Class ID</TableHead>
                                    <TableHead>Class Name</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {dormantClasses.length > 0 ? (
                                    dormantClasses.map(cls => (
                                        <TableRow key={cls.id}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={dormantClassRowSelection[cls.id] || false}
                                                    onCheckedChange={checked => setDormantClassRowSelection(prev => ({ ...prev, [cls.id]: !!checked }))}
                                                />
                                            </TableCell>
                                            <TableCell>{cls.class_id}</TableCell>
                                            <TableCell>{cls.class_name}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="outline" size="sm" onClick={() => handleActivateClass(cls.id, cls.class_id, cls.class_name)}>
                                                    Activate
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                                            No dormant classes found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    {Object.keys(dormantClassRowSelection).length > 0 && (
                        <DialogFooter className="mt-4">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button size="sm">
                                        Activate Selected ({Object.keys(dormantClassRowSelection).length})
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>This will activate the selected classes.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleBulkActivateClasses}>Activate</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </DialogFooter>
                    )}
                </DialogContent>
            </Dialog>
            <Dialog open={isAssignedSubjectsModalOpen} onOpenChange={setIsAssignedSubjectsModalOpen}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Assigned Subjects for Class</DialogTitle>
                        <DialogDescription>
                            View and manage subjects assigned to this class.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {currentClassAssignments.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Subject Name</TableHead>
                                        <TableHead>Academic Year</TableHead>
                                        <TableHead>Semester</TableHead>
                                        <TableHead>Assigned Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentClassAssignments.map((assignment) => (
                                        <TableRow key={assignment.id}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={assignedSubjectRowSelection[assignment.id] || false}
                                                    onCheckedChange={checked => setAssignedSubjectRowSelection(prev => ({
                                                        ...prev,
                                                        [assignment.id]: !!checked
                                                    }))}
                                                />
                                            </TableCell>
                                            <TableCell>{assignment.subject_name}</TableCell>
                                            <TableCell>{assignment.academic_year}</TableCell>
                                            <TableCell>{assignment.semester}</TableCell>
                                            <TableCell>{new Date(assignment.assigned_date).toLocaleDateString()}</TableCell>
                                            <TableCell>{assignment.is_active ? "Active" : "Inactive"}</TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleUnassignSubject(assignment.id)}
                                                >
                                                    Unassign
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p>No subjects assigned to this class.</p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAssignedSubjectsModalOpen(false)}>Close</Button>
                        {currentClassAssignments.length > 0 && (
                            <Button variant="destructive" onClick={handleBulkUnassignSubjects}>
                                Unassign Selected ({Object.keys(assignedSubjectRowSelection).filter(id => assignedSubjectRowSelection[id]).length})
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    )
}
