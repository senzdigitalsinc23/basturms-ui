
'use client';
import { useState, useEffect } from 'react';
import { getSubjects, getClasses, addSubject, getClassesSubjects, deleteSubject as storeDeleteSubject, saveClassSubjects } from '@/lib/store';
import { Subject, Class, ClassSubject } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash2, Edit } from 'lucide-react';
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';


type SubjectDisplay = Subject & {
    assigned_classes: string[];
};

export function SubjectManagement() {
    const [subjects, setSubjects] = useState<SubjectDisplay[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [newSubjectCode, setNewSubjectCode] = useState('');
    const [newSubjectName, setNewSubjectName] = useState('');
    const [newSubjectLevel, setNewSubjectLevel] = useState<'Creche' | 'KG' | 'Primary' | 'JHS'>('Primary');
    const [newSubjectCategory, setNewSubjectCategory] = useState<'Core' | 'Elective'>('Core');
    const [newSubjectDescription, setNewSubjectDescription] = useState('');
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
    const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredSubjects, setFilteredSubjects] = useState<SubjectDisplay[]>([]);
    const [dormantSubjects, setDormantSubjects] = useState<Subject[]>([]);
    const [showDormantDialog, setShowDormantDialog] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showInactiveSubjects, setShowInactiveSubjects] = useState(false);
    const [allSubjects, setAllSubjects] = useState<SubjectDisplay[]>([]);
    const [subjectSelection, setSubjectSelection] = useState<Record<string, boolean>>({});
    const [editingSubject, setEditingSubject] = useState<SubjectDisplay | null>(null);
    const [editCode, setEditCode] = useState('');
    const [editName, setEditName] = useState('');
    const [editLevel, setEditLevel] = useState<'Creche' | 'KG' | 'Primary' | 'JHS'>('Primary');
    const [editCategory, setEditCategory] = useState<'Core' | 'Elective'>('Core');
    const [editDescription, setEditDescription] = useState('');
    const { toast } = useToast();
    const { user } = useAuth();

    // Check if user has permission to view inactive subjects
    const canViewInactiveSubjects = () => {
        if (!user) return false;
        const allowedRoles = ['Super Admin', 'Admin', 'IT Staff'];
        return allowedRoles.includes(user.role || '');
    };

    // Fetch all subjects including inactive ones
    const fetchAllSubjects = async () => {
        try {
            const token = localStorage.getItem('campusconnect_token');
            const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'devKey123';
            const csrfToken = localStorage.getItem('csrf_token') || '';


            const subjectsRes = await fetch('/api/academic/subjects/list', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                    'X-API-KEY': apiKey,
                    'X-CSRF-TOKEN': csrfToken,
                },
            });

            if (!subjectsRes.ok) {
                throw new Error(`Failed to fetch all subjects: ${subjectsRes.statusText}`);
            }

            const subjectsResponse = await subjectsRes.json();
            //

            let allSubjectsData: Subject[] = [];
            if (Array.isArray(subjectsResponse.data)) {
                allSubjectsData = subjectsResponse.data.map((item: any) => ({
                    id: item.id || item.subject_id,
                    code: item.code || item.subject_code || item.subject_id || '',
                    name: item.name || item.subject_name,
                    level: item.level || 'Primary',
                    category: item.category || 'Core',
                    description: item.description || '',
                    status: item.status, // Ensure is_active is captured
                }));
            } else if (subjectsResponse.data && Array.isArray(subjectsResponse.data.subjects)) {
                allSubjectsData = subjectsResponse.data.subjects.map((item: any) => ({
                    id: item.id || item.subject_id,
                    code: item.code || item.subject_code || item.subject_id || '',
                    name: item.name || item.subject_name,
                    level: item.level || 'Primary',
                    category: item.category || 'Core',
                    description: item.description || '',
                    status: item.status,
                }));
            }

        } catch (err: any) {
            console.error('Failed to fetch all subjects:', err);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: err.message || 'Failed to load inactive subjects.'
            });
        }
    };

    // Fetch all subjects including inactive ones
    const fetchDormantSubjects = async () => {
        try {
            const token = localStorage.getItem('campusconnect_token');
            const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'devKey123';
            const csrfToken = localStorage.getItem('csrf_token') || '';


            const subjectsRes = await fetch('/api/academic/subjects/list', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                    'X-API-KEY': apiKey,
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    status: 'dormant',
                }),
            });

            if (!subjectsRes.ok) {
                throw new Error(`Failed to fetch all subjects: ${subjectsRes.statusText}`);
            }

            const subjectsResponse = await subjectsRes.json();

            let dormantSubjectsData: Subject[] = [];
            if (Array.isArray(subjectsResponse.data)) {
                dormantSubjectsData = subjectsResponse.data.map((item: any) => ({
                    id: item.id || item.subject_id,
                    code: item.code || item.subject_code || item.subject_id || '',
                    name: item.name || item.subject_name,
                    level: item.level || 'Primary',
                    category: item.category || 'Core',
                    description: item.description || '',
                    status: item.status, // Ensure is_active is captured
                }));
            } else if (subjectsResponse.data && Array.isArray(subjectsResponse.data.subjects)) {
                dormantSubjectsData = subjectsResponse.data.subjects.map((item: any) => ({
                    id: item.id || item.subject_id,
                    code: item.code || item.subject_code || item.subject_id || '',
                    name: item.name || item.subject_name,
                    level: item.level || 'Primary',
                    category: item.category || 'Core',
                    description: item.description || '',
                    status: item.status,
                }));
            }

            const dormant = dormantSubjectsData.filter(sub => sub.status == 'dormant');

            setDormantSubjects(dormant); // Set dormant subjects for the modal
            setShowDormantDialog(true); // Open the dormant subjects modal
        } catch (err: any) {
            console.error('Failed to fetch all subjects:', err);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: err.message || 'Failed to load inactive subjects.'
            });
        }
    };

    // Level to classes mapping
    const getClassesForLevel = (level: 'Creche' | 'KG' | 'Primary' | 'JHS') => {
        // Standardize class names to lowercase for robust matching
        const levelClassMap: Record<string, string[]> = {
            'JHS': ['junior high school 1', 'junior high school 2', 'junior high school 3'],
            'Primary': ['basic 1', 'basic 2', 'basic 3', 'basic 4', 'basic 5', 'basic 6', 'primary 1', 'primary 2', 'primary 3', 'primary 4', 'primary 5', 'primary 6'],
            'KG': ['kindergarten 1', 'kindergarten 2'],
            'Creche': ['nursery 1', 'nursery 2', 'creche']
        };

        const allowedClassNames = levelClassMap[level] || [];
        // Log the actual classes array to inspect its contents
        // );
        return (classes || []).filter(cls => {
            const className = cls.name?.toLowerCase();
            return allowedClassNames.includes(className);
        });
    };

    // Get classes available for bulk assignment (intersection of all selected subjects' levels)
    const getAvailableClassesForBulkAssignment = () => {
        if (selectedSubjects.length === 0) {
            return classes || []; // Show all classes if no subjects selected
        }

        const selectedSubjectObjects = (subjects || []).filter(s => selectedSubjects.includes(s.id));
        if (selectedSubjectObjects.length === 0) {
            return classes || [];
        }

        // Get allowed classes for each selected subject
        const allowedClassesArrays = selectedSubjectObjects.map(subject => getClassesForLevel(subject.level));

        // Find intersection of all allowed classes
        if (allowedClassesArrays.length === 0) return [];

        return allowedClassesArrays[0].filter(cls =>
            allowedClassesArrays.every(arr => arr.some(c => c.id === cls.id))
        );
    };

    const fetchData = async () => {
        try {
            // Fetch subjects from API
            const token = localStorage.getItem('campusconnect_token');
            const subjectsRes = await fetch('/api/academic/subjects/list', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                    'X-API-KEY': process.env.NEXT_PUBLIC_API_KEY || 'devKey123',
                },
            });

            if (!subjectsRes.ok) {
                throw new Error(`Failed to fetch subjects: ${subjectsRes.statusText}`);
            }

            const subjectsResponse = await subjectsRes.json();

            let subjectsData: Subject[] = [];
            if (Array.isArray(subjectsResponse.data)) {
                subjectsData = subjectsResponse.data.map((item: any) => {
                    const mappedSubject = {
                        id: item.id || item.subject_id,
                        code: item.code || item.subject_code || item.subject_id || '',
                        name: item.name || item.subject_name,
                        level: item.level || 'Primary',
                        category: item.category || 'Core',
                        description: item.description || '',
                        status: item.status
                    };
                    // 'from item:', item);
                    return mappedSubject;
                });
            } else if (subjectsResponse.data && Array.isArray(subjectsResponse.data.subjects)) {
                subjectsData = subjectsResponse.data.subjects.map((item: any) => {
                    const mappedSubject = {
                        id: item.id || item.subject_id,
                        code: item.code || item.subject_code || item.subject_id || '',
                        name: item.name || item.subject_name,
                        level: item.level || 'Primary',
                        category: item.category || 'Core',
                        description: item.description || '',
                        status: item.status
                    };
                    //, 'from item:', item);
                    return mappedSubject;
                });
            }

            const active = subjectsData.filter(sub => sub.status == 'active');

            setSubjects(active);
            setFilteredSubjects(active);

            // Fetch classes from API
            const classesRes = await fetch('/api/academic/classes/list', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                    'X-API-KEY': process.env.NEXT_PUBLIC_API_KEY || 'devKey123',
                },
            });

            if (!classesRes.ok) {
                const errorData = await classesRes.json().catch(() => ({}));
                console.error('Failed to fetch classes:', classesRes.statusText, 'Error Data:', errorData);
                throw new Error(errorData.message || `Failed to fetch classes: ${classesRes.statusText}`);
            }

            const classesResponse = await classesRes.json();

            let classesData: Class[] = [];
            if (Array.isArray(classesResponse.data)) {
                classesData = classesResponse.data.map((item: any) => {
                    const mappedClass = {
                        id: item.id || item.class_id,
                        name: item.name || item.class_name,
                    };
                    return mappedClass;
                });
            } else if (classesResponse.data && Array.isArray(classesResponse.data.classes)) {
                classesData = classesResponse.data.classes.map((item: any) => {
                    const mappedClass = {
                        id: item.id || item.class_id,
                        name: item.name || item.class_name,
                    };
                    return mappedClass;
                });
            }

            setClasses(classesData);

        } catch (err: any) {
            console.error('Failed to fetch subjects:', err);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: err.message || 'Failed to load subjects.'
            });

            // Fallback to local storage data
            const allSubjects = getSubjects();
            const allClassSubjects = getClassesSubjects();
            const allClasses = getClasses();
            setClasses(allClasses);

            const displayData = allSubjects.map(subject => {
                const assigned = allClassSubjects
                    .filter(cs => cs.subject_id === subject.id)
                    .map(cs => cs.class_id);
                const fallbackSubject = {
                    ...subject,
                    code: (subject as any).code || (subject as any).subject_code || subject.id || '',
                    level: (subject as any).level || 'Primary',
                    category: (subject as any).category || 'Core',
                    description: (subject as any).description || '',
                    assigned_classes: assigned
                };
                //:', subject);
                return fallbackSubject;
            });
            //);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);



    // Search functionality
    useEffect(() => {
        if (showDormantDialog) {
            setFilteredSubjects(subjects); // Ensure main list shows active subjects
            return;
        }

        if (searchTerm.trim() === '') {
            setFilteredSubjects(subjects);
            setDormantSubjects([]);
        } else {
            const filtered = subjects.filter(subject =>
                subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                subject.code.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredSubjects(filtered);
            setDormantSubjects([]);
        }
    }, [searchTerm, subjects, showDormantDialog]);

    const handleAddSubject = async () => {
        if (!newSubjectCode.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Subject code cannot be empty.' });
            return;
        }
        if (!newSubjectName.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Subject name cannot be empty.' });
            return;
        }
        if (!newSubjectLevel) {
            toast({ variant: 'destructive', title: 'Error', description: 'Subject level is required.' });
            return;
        }
        if (!newSubjectCategory) {
            toast({ variant: 'destructive', title: 'Error', description: 'Subject category is required.' });
            return;
        }

        try {
            const token = localStorage.getItem('campusconnect_token');
            const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'devKey123';
            const csrfToken = localStorage.getItem('csrf_token') || '';

            const res = await fetch('/api/academic/subjects/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                    'X-API-KEY': apiKey,
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({
                    subject_code: newSubjectCode.trim(),
                    subject_name: newSubjectName.trim(),
                    level: newSubjectLevel,
                    category: newSubjectCategory,
                    description: newSubjectDescription.trim()
                }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to create subject: ${res.statusText}`);
            }

            const response = await res.json();

            // Also save to local storage for consistency
            addSubject(newSubjectName);

            if (user) {
                // You might want to add audit logging here if needed
            }

            fetchData();
            setNewSubjectCode('');
            setNewSubjectName('');
            setNewSubjectLevel('Primary');
            setNewSubjectCategory('Core');
            setNewSubjectDescription('');
            toast({ title: 'Subject Added', description: `"${newSubjectName}" has been added.` });
        } catch (err: any) {
            console.error('Failed to create subject:', err);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: err.message || 'Failed to create subject. Please try again.'
            });
        }
    };

    const handleAssignmentChange = (subjectId: string, classIds: string[]) => {
        const currentAssignments = getClassesSubjects();
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

        // Validate that selected classes are appropriate for selected subjects
        const availableClasses = getAvailableClassesForBulkAssignment();
        const invalidClasses = selectedClasses.filter(classId =>
            !availableClasses.some(cls => cls.id === classId)
        );

        if (invalidClasses.length > 0) {
            toast({
                variant: 'destructive',
                title: 'Invalid Assignment',
                description: 'Some selected classes are not appropriate for the selected subjects\' levels.'
            });
            return;
        }

        const currentAssignments = getClassesSubjects();
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

    const handleDeleteSubject = async (subjectId: string) => {
        try {
            const token = localStorage.getItem('campusconnect_token');
            const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'devKey123';
            const csrfToken = localStorage.getItem('csrf_token') || '';

            const res = await fetch('/api/academic/subjects/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                    'X-API-KEY': apiKey,
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({
                    subject_id: subjectId,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to delete subject: ${res.statusText}`);
            }

            const response = await res.json();

            // Also remove from local storage for consistency
            storeDeleteSubject(subjectId);

            if (user) {
                // You might want to add audit logging here if needed
            }

            fetchData();
            toast({ title: 'Subject Deleted', description: 'Subject has been successfully deleted.' });
        } catch (err: any) {
            console.error('Failed to delete subject:', err);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: err.message || 'Failed to delete subject. Please try again.'
            });
        }
    }

    const handleBulkDelete = async () => {
        const subjectsToDelete = Object.keys(subjectSelection).filter(key => subjectSelection[key]);

        if (subjectsToDelete.length === 0) return;

        try {
            const token = localStorage.getItem('campusconnect_token');
            const csrfToken = localStorage.getItem('csrf_token') || '';
            const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'devKey123';

            const res = await fetch('/api/academic/subjects/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                    'X-API-KEY': apiKey,
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({
                    subject_id: subjectsToDelete,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to delete subjects: ${res.statusText}`);
            }

            const response = await res.json();


            // Also remove from local storage for consistency
            subjectsToDelete.forEach(subjectId => storeDeleteSubject(subjectId));

            fetchData();
            setSubjectSelection({});
            toast({
                title: 'Subjects Deleted',
                description: `${subjectsToDelete.length} subject(s) have been successfully deleted.`
            });
        } catch (err: any) {
            console.error('Failed to delete subjects:', err);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: err.message || 'Failed to delete subjects. Please try again.'
            });
        }
    }

    const handleEditSubject = (subject: SubjectDisplay) => {
        setEditingSubject(subject);
        setEditCode(subject.code);
        setEditName(subject.name);
        setEditLevel(subject.level);
        setEditCategory(subject.category);
        setEditDescription(subject.description || '');
    }

    const handleSaveEdit = async () => {
        if (!editingSubject) return;

        if (!editCode.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Subject code cannot be empty.' });
            return;
        }
        if (!editName.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Subject name cannot be empty.' });
            return;
        }
        if (!editLevel) {
            toast({ variant: 'destructive', title: 'Error', description: 'Subject level is required.' });
            return;
        }
        if (!editCategory) {
            toast({ variant: 'destructive', title: 'Error', description: 'Subject category is required.' });
            return;
        }

        try {
            const token = localStorage.getItem('campusconnect_token');
            const csrfToken = localStorage.getItem('csrf_token') || '';
            const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'devKey123';

            const res = await fetch('/api/academic/subjects/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                    'X-API-KEY': apiKey,
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({
                    id: editingSubject.id,
                    subject_code: editCode.trim(),
                    subject_name: editName.trim(),
                    level: editLevel,
                    category: editCategory,
                    description: editDescription.trim(),
                    status: editingSubject.status,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to update subject: ${res.statusText}`);
            }

            const response = await res.json();

            fetchData();
            setEditingSubject(null);
            setEditCode('');
            setEditName('');
            setEditLevel('Primary');
            setEditCategory('Core');
            setEditDescription('');
            toast({ title: 'Subject Updated', description: 'Subject has been successfully updated.' });
        } catch (err: any) {
            console.error('Failed to update subject:', err);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: err.message || 'Failed to update subject. Please try again.'
            });
        }
    }

    const handleActivateDormantSubject = async (id: number, subject_id: string, subjectName: string, description: string, level: string, category: string) => {
        try {
            const token = localStorage.getItem('campusconnect_token');
            const csrfToken = localStorage.getItem('csrf_token') || '';
            const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'devKey123';

            const res = await fetch('/api/academic/subjects/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                    'X-API-KEY': apiKey,
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({
                    id: id, subject_code: subject_id,
                    subject_name: subjectName, description: description,
                    level: level, category: category, status: 'active'
                }),
            });

            const response = await res.json();

            fetchData();
            setShowDormantDialog(false);
            setSearchTerm('');
            toast({ title: 'Subject Activated', description: `${subjectName} has been reactivated.` });
        } catch (err: any) {
            console.error('Failed to activate subject:', err);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: err.message || 'Failed to activate subject. Please try again.'
            });
        }
    }

    return (
        <div className="space-y-6">
            {false && (
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
                                options={(subjects || []).map(s => ({ value: s.id, label: `${s.code} - ${s.name} (${s.level})` }))}
                                selectedValues={selectedSubjects}
                                onChange={setSelectedSubjects}
                            />
                        </div>
                        <div className="flex-1 w-full">
                            <p className="text-sm font-medium mb-2">
                                Assign to Classes
                                {selectedSubjects.length > 0 && (
                                    <span className="text-xs text-muted-foreground ml-2">
                                        (filtered by subject levels)
                                    </span>
                                )}
                            </p>
                            <MultiSelectPopover
                                title="Classes"
                                options={(getAvailableClassesForBulkAssignment() || []).map(c => ({ value: c.id, label: c.name }))}
                                selectedValues={selectedClasses}
                                onChange={setSelectedClasses}
                            />
                            {selectedSubjects.length > 0 && getAvailableClassesForBulkAssignment().length === 0 && (
                                <p className="text-xs text-amber-600 mt-1">
                                    No classes available for the selected subjects' levels
                                </p>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="justify-end">
                        <Button onClick={handleBulkAssign}>Assign Selected</Button>
                    </CardFooter>
                </Card>
            )}

            {false && <Separator />}

            {/* Search and Bulk Actions */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                    <Input
                        placeholder="Search subjects by name or code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                    />
                </div>
                <div className="flex items-center gap-2">
                    {Object.keys(subjectSelection).some(key => subjectSelection[key]) && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Selected ({Object.keys(subjectSelection).filter(key => subjectSelection[key]).length})
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Selected Subjects</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to delete {Object.keys(subjectSelection).filter(key => subjectSelection[key]).length} selected subject(s)?
                                        This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleBulkDelete}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
            </div>

            {/* Dormant Subjects Dialog */}
            <AlertDialog open={showDormantDialog} onOpenChange={setShowDormantDialog}>
                <AlertDialogContent className="max-w-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Dormant Subjects Found</AlertDialogTitle>
                        <AlertDialogDescription>
                            No active subjects match your search. Here are some dormant subjects that match:
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="max-h-60 overflow-y-auto">
                        {dormantSubjects.map(subject => (
                            <div key={subject.id} className="flex items-center justify-between p-3 border rounded-lg mb-2">
                                <div>
                                    <p className="font-medium">{subject.name}</p>
                                    <p className="text-sm text-muted-foreground">Code: {(subject as any).subject_code || subject.id}</p>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={() => handleActivateDormantSubject(subject.id, subject.code, subject.name, subject.description, subject.level, subject.category)}
                                >
                                    Activate
                                </Button>
                            </div>
                        ))}
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => { setShowDormantDialog(false); setSearchTerm(''); }}>
                            Cancel
                        </AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <div className="flex justify-between items-center">
                <h4 className="text-lg font-medium">Subject Management</h4>
                <div className="flex items-center gap-4">
                    {canViewInactiveSubjects() && !showDormantDialog && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchDormantSubjects} // This will now open the modal
                        >
                            Show Dormant Subjects
                        </Button>
                    )}
                    {showDormantDialog && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setShowDormantDialog(false);
                                setFilteredSubjects(subjects); // Reset to active subjects
                            }}
                        >
                            Hide Dormant Subjects
                        </Button>
                    )}
                    <Button onClick={() => setShowCreateModal(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Subject
                    </Button>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">
                                <Checkbox
                                    checked={filteredSubjects.length > 0 && filteredSubjects.every(subject => subjectSelection[subject.id])}
                                    onCheckedChange={(checked) => {
                                        const newSelection: Record<string, boolean> = {};
                                        if (checked) {
                                            filteredSubjects.forEach(subject => {
                                                newSelection[subject.id] = true;
                                            });
                                        }
                                        setSubjectSelection(newSelection);
                                    }}
                                />
                            </TableHead>
                            <TableHead>Subject Code</TableHead>
                            <TableHead>Subject Name</TableHead>
                            <TableHead>Level</TableHead>
                            <TableHead>Category</TableHead>
                            {false && <TableHead>Assigned to Classes</TableHead>}
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(filteredSubjects || []).map(subject => {
                            const isInactive = showInactiveSubjects && !(subjects || []).some(s => s.id === subject.id);
                            return (
                                <TableRow key={subject.id}>
                                    <TableCell>
                                        <Checkbox
                                            checked={subjectSelection[subject.id] || false}
                                            onCheckedChange={(checked) =>
                                                setSubjectSelection(prev => ({
                                                    ...prev,
                                                    [subject.id]: !!checked
                                                }))
                                            }
                                        />
                                    </TableCell>
                                    <TableCell className="font-mono text-sm font-medium">{subject.code}</TableCell>
                                    <TableCell className="font-medium">
                                        {subject.name}
                                        {isInactive && (
                                            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                Inactive
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {subject.level}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${subject.category === 'Core'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {subject.category}
                                        </span>
                                    </TableCell>
                                    {false && (
                                        <TableCell>
                                            <MultiSelectPopover
                                                title="Classes"
                                                options={(getClassesForLevel(subject.level) || []).map(c => ({ value: c.id, label: c.name }))}
                                                selectedValues={subject.assigned_classes || []}
                                                onChange={(values) => handleAssignmentChange(subject.id, values)}
                                            />
                                        </TableCell>
                                    )}
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEditSubject(subject)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
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
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {filteredSubjects.length === 0 && !searchTerm && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                    No subjects found. Click "Add Subject" to create your first subject.
                                </TableCell>
                            </TableRow>
                        )}
                        {filteredSubjects.length === 0 && searchTerm && !showDormantDialog && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                    No subjects match your search.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Edit Subject Dialog */}
            <Dialog open={!!editingSubject} onOpenChange={(open) => !open && setEditingSubject(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Subject</DialogTitle>
                        <DialogDescription>
                            Update the subject details.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Subject Code *</label>
                                <Input
                                    value={editCode}
                                    onChange={(e) => setEditCode(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Subject Name *</label>
                                <Input
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Level *</label>
                                <Select value={editLevel} onValueChange={(value: 'Creche' | 'KG' | 'Primary' | 'JHS') => setEditLevel(value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Creche">Creche</SelectItem>
                                        <SelectItem value="KG">KG</SelectItem>
                                        <SelectItem value="Primary">Primary</SelectItem>
                                        <SelectItem value="JHS">JHS</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Category *</label>
                                <Select value={editCategory} onValueChange={(value: 'Core' | 'Elective') => setEditCategory(value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Core">Core</SelectItem>
                                        <SelectItem value="Elective">Elective</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Textarea
                                placeholder="Optional description of the subject..."
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingSubject(null)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveEdit}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create Subject Modal */}
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create New Subject</DialogTitle>
                        <DialogDescription>
                            Add a new subject to the system with all required details.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Subject Code *</label>
                                <Input
                                    placeholder="e.g., OWOP_PL"
                                    value={newSubjectCode}
                                    onChange={(e) => setNewSubjectCode(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Subject Name *</label>
                                <Input
                                    placeholder="e.g., Our World Our People"
                                    value={newSubjectName}
                                    onChange={(e) => setNewSubjectName(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Level *</label>
                                <Select value={newSubjectLevel} onValueChange={(value: 'Creche' | 'KG' | 'Primary' | 'JHS') => setNewSubjectLevel(value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Creche">Creche</SelectItem>
                                        <SelectItem value="KG">KG</SelectItem>
                                        <SelectItem value="Primary">Primary</SelectItem>
                                        <SelectItem value="JHS">JHS</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Category *</label>
                                <Select value={newSubjectCategory} onValueChange={(value: 'Core' | 'Elective') => setNewSubjectCategory(value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Core">Core</SelectItem>
                                        <SelectItem value="Elective">Elective</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Textarea
                                placeholder="Optional description of the subject..."
                                value={newSubjectDescription}
                                onChange={(e) => setNewSubjectDescription(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                            Cancel
                        </Button>
                        <Button onClick={() => {
                            handleAddSubject();
                            setShowCreateModal(false);
                        }}>
                            Create Subject
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
