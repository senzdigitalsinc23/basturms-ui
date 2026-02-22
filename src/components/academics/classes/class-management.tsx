'use client';
import { useState, useEffect } from 'react';
import { getClasses, getSubjects, saveClassSubjects, addAuditLog, fetchClassesFromApi, fetchSubjectsFromApi, fetchClassSubjectAssignmentsFromApi, fetchClassActivitiesApi } from '@/lib/store';
import { Class, Subject, ClassSubject, ClassSubjectAssignment, AssignmentActivity } from '@/lib/types';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


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
    const [isClassActivitiesModalOpen, setIsClassActivitiesModalOpen] = useState(false);
    const [currentClassActivities, setCurrentClassActivities] = useState<AssignmentActivity[]>([]);
    const [isAssignSubjectsModalOpen, setIsAssignSubjectsModalOpen] = useState(false);
    const [availableSubjectsForAssignment, setAvailableSubjectsForAssignment] = useState<Subject[]>([]);
    const [selectedClassForAssignment, setSelectedClassForAssignment] = useState<Class | null>(null);
    const [subjectsToAssignSelection, setSubjectsToAssignSelection] = useState<Record<string, boolean>>({});
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

    const csrfToken = localStorage.getItem('csrf_token') || '';

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
        const fetchedAssignments = await fetchClassSubjectAssignmentsFromApi(true);


        //console.log('fetchsubjects: ', fetchedSubjects);
        setClasses(fetchedClasses);
        setSubjects(fetchedSubjects);
        setClassSubjectAssignments(fetchedAssignments);

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
                    'X-CSRF-TOKEN': csrfToken
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
                    'X-CSRF-TOKEN': csrfToken
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
                    'X-CSRF-TOKEN': csrfToken
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
                    'X-CSRF-TOKEN': csrfToken
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
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({ class_ids: classIdsToDelete }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to delete classes: ${res.statusText}`);
            }

            const response = await res.json();

            //console.log('response', response);

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

    const handleActivateClass = async (id: string, classId: string, className: string) => {

        try {
            const token = localStorage.getItem('campusconnect_token');
            const res = await fetch('/api/academic/classes/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                    'X-API-KEY': process.env.NEXT_PUBLIC_API_KEY || 'devKey123',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({ id: id, class_id: classId, class_name: className, status: "active" }),
            });

            const response = await res.json();
            //console.log(response);


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
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({ id: classIdsToActivate }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to activate classes: ${res.statusText}`);
            }

            const response = await res.json();

            //console.log(response);

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

        // Fetch assignments specifically for the selected class
        const assignments = await fetchClassSubjectAssignmentsFromApi(true, cls.id);

        setCurrentClassAssignments(assignments.filter(assignment => assignment.is_active));
        setIsAssignedSubjectsModalOpen(true);
    };

    const handleViewClassActivities = async (cls: Class) => {
        const activities = await fetchClassActivitiesApi(cls.id);
        setCurrentClassActivities(activities);
        setIsClassActivitiesModalOpen(true);
        setSelectedClassForAssignment(cls); // Reusing this for the modal title context
    };


    const handleUnassignSubject = async (assignmentId: string) => {
        if (!user) {
            toast({ title: "Error", description: "You must be logged in to unassign subjects.", variant: "destructive" });
            return;
        }

        try {
            // Find the assignment to get class_id and subject_id
            const assignment = currentClassAssignments.find(assignment => assignment.id === assignmentId);
            if (!assignment) {
                throw new Error('Assignment not found');
            }

            // Optimistically update the UI
            setClassSubjectAssignments(prev => prev.filter(assignment => assignment.id !== assignmentId));
            setCurrentClassAssignments(prev => prev.filter(assignment => assignment.id !== assignmentId));

            const token = localStorage.getItem('campusconnect_token');
            const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'devKey123';

            const response = await fetch('/api/academic/class-subjects/bulk-unassign', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-API-KEY': apiKey,
                    'X-User-ID': user.id,
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({
                    class_id: assignment.class_id,
                    subject_ids: [assignment.subject_id]
                })
            });

            if (!response.ok) {
                throw new Error('Failed to unassign subject');
            }

            toast({ title: "Success", description: "Subject unassigned successfully." });
            await addAuditLog({ user: user.email, name: user.name, action: 'Unassign Subject', details: `Unassigned subject from class (Assignment ID: ${assignmentId})` });
        } catch (error) {
            //console.error("Error unassigning subject:", error);
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


        const selectedAssignmentIds = Object.keys(assignedSubjectRowSelection).filter(subject_id => assignedSubjectRowSelection[subject_id]);
        //console.log("Selected Assignment IDs: ", assignedSubjectRowSelection);
        if (selectedAssignmentIds.length === 0) {
            toast({ title: "Info", description: "No subjects selected for unassignment." });
            return;
        }

        try {
            // Get the selected assignments to extract class_id and subject_ids
            const selectedAssignments = currentClassAssignments.filter(assignment => selectedAssignmentIds.includes(assignment.subject_id));

            if (selectedAssignments.length === 0) {
                toast({ title: "Error", description: "Selected assignments not found.", variant: "destructive" });
                return;
            }

            // Extract class_id (should be the same for all assignments in this modal)
            const class_id = selectedAssignments[0].class_id;
            // Extract subject_ids from selected assignments
            const subject_ids = selectedAssignments.map(assignment => assignment.subject_id);

            //console.log("Selected Assignments: ", selectedAssignments);
            //console.log("Class ID: ", class_id);
            //console.log("Subject IDs: ", subject_ids);

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
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({ class_id, subject_ids })
            });


            const responseJson = await response.json();

            //console.log("Response: ", responseJson);

            if (!response.ok) {
                throw new Error('Failed to bulk unassign subjects');
            }

            toast({ title: "Success", description: "Selected subjects unassigned successfully." });
            await addAuditLog({ user: user.email, name: user.name, action: 'Bulk Unassign Subjects', details: `Bulk unassigned subjects from class (Class ID: ${class_id}, Subject IDs: ${subject_ids.join(', ')})` });
        } catch (error) {
            console.error("Error bulk unassigning subjects:", error);
            toast({ title: "Error", description: "Failed to bulk unassign subjects.", variant: "destructive" });
            // Revert optimistic update if API call fails
            fetchData();
        }
    };

    const handleOpenAssignSubjects = async (cls: Class) => {
        setSelectedClassForAssignment(cls);

        // Fetch all active subjects
        const allSubjects = await fetchSubjectsFromApi(true);

        // Get currently assigned subjects for this class
        const currentAssignments = await fetchClassSubjectAssignmentsFromApi(true, cls.id);
        const assignedSubjectIds = currentAssignments
            .filter(assignment => assignment.is_active)
            .map(assignment => assignment.subject_id);

        // Helper to determine class level
        const getClassLevel = (name: string): string => {
            const lowerName = name.toLowerCase();
            if (lowerName.includes('jhs') || lowerName.includes('junior high')) return 'JHS';
            if (lowerName.includes('kindergarten') || lowerName.includes('kg')) return 'KG';
            if (lowerName.includes('nursery') || lowerName.includes('creche')) return 'Creche';
            return 'Primary'; // Default to Primary
        };

        const classLevel = getClassLevel(cls.name);

        // Filter to show only active unassigned subjects that match the class level
        const unassignedSubjects = allSubjects.filter(subject =>
            !assignedSubjectIds.includes(subject.id) &&
            subject.is_active &&
            (subject.level === classLevel || !subject.level)
        );

        setAvailableSubjectsForAssignment(unassignedSubjects);
        setSubjectsToAssignSelection({});
        setIsAssignSubjectsModalOpen(true);
    };

    const handleAssignSubjects = async () => {
        if (!user || !selectedClassForAssignment) {
            toast({ title: "Error", description: "Missing required information.", variant: "destructive" });
            return;
        }

        const selectedSubjectIds = Object.keys(subjectsToAssignSelection).filter(id => subjectsToAssignSelection[id]);

        if (selectedSubjectIds.length === 0) {
            toast({ title: "Info", description: "No subjects selected for assignment." });
            return;
        }

        try {
            const token = localStorage.getItem('campusconnect_token');
            const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'devKey123';

            const payload = {
                class_id: [selectedClassForAssignment.id],
                subject_id: selectedSubjectIds
            };

            //console.log('Assigning subjects - Payload:', payload);

            const response = await fetch('/api/academic/class-subjects/assign', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-API-KEY': apiKey,
                    'X-User-ID': user.id,
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify(payload)
            });

            const responseJson = await response.json();
            //console.log("Assign Response: ", responseJson);

            if (!response.ok) {
                throw new Error(responseJson.message || 'Failed to assign subjects');
            }

            toast({ title: "Success", description: `Successfully assigned ${selectedSubjectIds.length} subject(s) to ${selectedClassForAssignment.name}.` });
            await addAuditLog({
                user: user.email,
                name: user.name,
                action: 'Assign Subjects to Class',
                details: `Assigned ${selectedSubjectIds.length} subjects to class ${selectedClassForAssignment.name} (ID: ${selectedClassForAssignment.id})`
            });

            // Close modal and refresh data
            setIsAssignSubjectsModalOpen(false);
            setSubjectsToAssignSelection({});
            fetchData();
        } catch (error: any) {
            console.error("Error assigning subjects:", error);
            toast({ title: "Error", description: error.message || "Failed to assign subjects.", variant: "destructive" });
        }
    };

    const handleAssignSingleSubject = async (subjectId: string) => {
        if (!user || !selectedClassForAssignment) {
            toast({ title: "Error", description: "Missing required information.", variant: "destructive" });
            return;
        }

        try {
            const token = localStorage.getItem('campusconnect_token');
            const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'devKey123';

            const payload = {
                class_id: [selectedClassForAssignment.id],
                subject_id: [subjectId]
            };

            //console.log('Assigning single subject - Payload:', payload);

            const response = await fetch('/api/academic/class-subjects/assign', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-API-KEY': apiKey,
                    'X-User-ID': user.id,
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify(payload)
            });

            const responseJson = await response.json();
            //console.log("Assign Single Subject Response: ", responseJson);

            if (!response.ok) {
                throw new Error(responseJson.message || 'Failed to assign subject');
            }

            const subjectName = availableSubjectsForAssignment.find(s => s.id === subjectId)?.name || 'Subject';
            toast({ title: "Success", description: `Successfully assigned ${subjectName} to ${selectedClassForAssignment.name}.` });
            await addAuditLog({
                user: user.email,
                name: user.name,
                action: 'Assign Subject to Class',
                details: `Assigned ${subjectName} to class ${selectedClassForAssignment.name} (ID: ${selectedClassForAssignment.id})`
            });

            // Refresh the available subjects list
            await handleOpenAssignSubjects(selectedClassForAssignment);
        } catch (error: any) {
            console.error("Error assigning subject:", error);
            toast({ title: "Error", description: error.message || "Failed to assign subject.", variant: "destructive" });
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
                                {/* <TableHead className="min-w-[150px]">Assigned Subjects</TableHead> */}
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {classes.map((cls) => {

                                {/* console.log("Current class assignment: ", classSubjectAssignments) */ }
                                // console.log(`Debug: Checking class: ${cls.name} (id: ${cls.id}, class_id: ${cls.class_id})`);
                                // if (classSubjectAssignments.length > 0) {
                                //    console.log(`Debug: Sample assignment class_id: ${classSubjectAssignments[0].class_id}`);
                                // }

                                const assignedSubjects = classSubjectAssignments.filter(
                                    (assignment) => (assignment.class_id === cls.id || assignment.class_id === cls.class_id) && assignment.is_active
                                ).map(assignment => assignment.subject_name);

                                return (
                                    <TableRow key={cls.id} data-state={rowSelection[cls.id] && "selected"}>
                                        <TableCell>
                                            <Checkbox
                                                checked={rowSelection[cls.id] || false}
                                                onCheckedChange={checked => setRowSelection(prev => ({
                                                    ...prev,
                                                    [cls.id]: !!checked
                                                }))}
                                                aria-label="Select row"
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger className="cursor-help text-left w-full hover:underline decoration-dotted underline-offset-4">
                                                        {cls.name}
                                                    </TooltipTrigger>
                                                    <TooltipContent side="right" className="max-w-[300px]">

                                                        {assignedSubjects.length > 0 ? (
                                                            <div className="space-y-2">
                                                                <p className="font-semibold border-b pb-1">Assigned Subjects:</p>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {assignedSubjects.map(subjectName => (
                                                                        <Badge key={subjectName} variant="secondary" className="text-xs bg-secondary/50 border-secondary-foreground/20">
                                                                            {subjectName}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <p className="text-muted-foreground italic">No subjects assigned</p>
                                                        )}
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </TableCell>
                                        {/* <TableCell>
                                            {assignedSubjects.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {assignedSubjects.map(subjectName => (
                                                        <Badge key={subjectName} variant="secondary">{subjectName}</Badge>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">No subjects assigned</span>
                                            )}
                                        </TableCell> */}
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
                                                onClick={() => handleOpenAssignSubjects(cls)}
                                                className="mr-2"
                                            >
                                                Assign Subjects
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleViewAssignedSubjects(cls)}
                                                className="mr-2"
                                            >
                                                View Assigned Subjects
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleViewClassActivities(cls)}
                                            >
                                                View Activities
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
                                        <TableHead className="w-[50px]">Select</TableHead>
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
                        {false && currentClassAssignments.length > 0 && (
                            <Button variant="destructive" onClick={handleBulkUnassignSubjects}>
                                Unassign Selected ({Object.keys(assignedSubjectRowSelection).filter(subject_id => assignedSubjectRowSelection[subject_id]).length})
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Assign Subjects Modal */}
            <Dialog open={isAssignSubjectsModalOpen} onOpenChange={setIsAssignSubjectsModalOpen}>
                <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Assign Subjects to {selectedClassForAssignment?.name}</DialogTitle>
                        <DialogDescription>
                            Select subjects to assign to this class. Only unassigned subjects are shown.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 overflow-y-auto">
                        {availableSubjectsForAssignment.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">
                                            <Checkbox
                                                checked={
                                                    availableSubjectsForAssignment.length > 0 &&
                                                    Object.keys(subjectsToAssignSelection).length === availableSubjectsForAssignment.length &&
                                                    Object.values(subjectsToAssignSelection).every(v => v)
                                                }
                                                onCheckedChange={checked => {
                                                    const newSelection: Record<string, boolean> = {};
                                                    if (checked) {
                                                        availableSubjectsForAssignment.forEach(subject => {
                                                            newSelection[subject.id] = true;
                                                        });
                                                    }
                                                    setSubjectsToAssignSelection(newSelection);
                                                }}
                                            />
                                        </TableHead>
                                        <TableHead>Subject Name</TableHead>
                                        <TableHead>Subject Code</TableHead>
                                        <TableHead>Level</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {availableSubjectsForAssignment.map((subject) => (
                                        //console.log(subject),
                                        <TableRow key={subject.id}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={subjectsToAssignSelection[subject.id] || false}
                                                    onCheckedChange={checked => setSubjectsToAssignSelection(prev => ({
                                                        ...prev,
                                                        [subject.id]: !!checked
                                                    }))}
                                                />
                                            </TableCell>
                                            <TableCell>{subject.name}</TableCell>
                                            <TableCell>{subject.code || 'N/A'}</TableCell>
                                            <TableCell>{subject.level || 'N/A'}</TableCell>
                                            <TableCell>{subject.category || 'N/A'}</TableCell>
                                            <TableCell className="text-right">
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                        >
                                                            Assign
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Confirm Assignment</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to assign "{subject.name}" to {selectedClassForAssignment?.name}?
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleAssignSingleSubject(subject.id)}>
                                                                Confirm
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-center text-muted-foreground py-4">
                                All subjects have been assigned to this class.
                            </p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAssignSubjectsModalOpen(false)}>Close</Button>
                        {availableSubjectsForAssignment.length > 0 && Object.keys(subjectsToAssignSelection).filter(id => subjectsToAssignSelection[id]).length > 0 && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button>
                                        Assign Selected ({Object.keys(subjectsToAssignSelection).filter(id => subjectsToAssignSelection[id]).length})
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Confirm Bulk Assignment</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to assign {Object.keys(subjectsToAssignSelection).filter(id => subjectsToAssignSelection[id]).length} subject(s) to {selectedClassForAssignment?.name}?
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleAssignSubjects}>
                                            Confirm
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* View Class Activities Modal */}
            <Dialog open={isClassActivitiesModalOpen} onOpenChange={setIsClassActivitiesModalOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Activities for {selectedClassForAssignment?.name}</DialogTitle>
                        <DialogDescription>
                            List of activities assigned to this class.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {currentClassActivities.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Activity Name</TableHead>
                                        <TableHead>Expected Per Term</TableHead>
                                        <TableHead>Weight</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentClassActivities.map((activity) => (
                                        <TableRow key={activity.id}>
                                            <TableCell>{activity.act_name || activity.name}</TableCell>
                                            <TableCell>{activity.expected_per_term}</TableCell>
                                            <TableCell>{activity.weight}%</TableCell>
                                            <TableCell>
                                                <Badge variant={activity.is_active ? "default" : "secondary"}>
                                                    {activity.is_active ? "Active" : "Inactive"}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-center text-muted-foreground py-4">No activities found for this class.</p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsClassActivitiesModalOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    )
}
