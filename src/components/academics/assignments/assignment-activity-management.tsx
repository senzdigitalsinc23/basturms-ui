
'use client';
import { useState, useEffect } from 'react';
import { fetchAssignmentActivitiesFromApi, addAssignmentActivityApi, deleteAssignmentActivityApi, getClasses, getClassAssignmentActivities, saveClassAssignmentActivities, updateAssignmentActivityApi, activateAssignmentActivityApi, softDeleteAssignmentActivityApi, assignActivityToClassApi, unassignActivityFromClassApi, fetchClassesFromApi } from '@/lib/store';
import { AssignmentActivity, Class } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Trash2, Edit, ShieldAlert, RefreshCcw, Trash } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { MultiSelectPopover } from '../subjects/multi-select-popover';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

type ActivityDisplay = AssignmentActivity & {
    assigned_classes: string[];
};

export function AssignmentActivityManagement() {
    const [activities, setActivities] = useState<ActivityDisplay[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [newActivityName, setNewActivityName] = useState('');
    const [newActivityCount, setNewActivityCount] = useState(1);
    const [newActivityWeight, setNewActivityWeight] = useState(20);
    const [isStandalone, setIsStandalone] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingActivity, setEditingActivity] = useState<AssignmentActivity | null>(null);
    const [editFormState, setEditFormState] = useState({ name: '', expected_per_term: 1, weight: 20, is_standalone: 0 });
    const [isDisabledViewOpen, setIsDisabledViewOpen] = useState(false);
    const [disabledActivities, setDisabledActivities] = useState<ActivityDisplay[]>([]);

    const { toast } = useToast();
    const { user } = useAuth();

    const fetchData = async () => {
        const [allActivities, allClasses] = await Promise.all([
            fetchAssignmentActivitiesFromApi(true),
            fetchClassesFromApi()
        ]);

        // Ensure classes have string IDs
        const normalizedClasses = allClasses.map(c => ({
            ...c,
            id: String(c.id),
            class_id: c.class_id ? String(c.class_id) : undefined
        }));
        setClasses(normalizedClasses);

        const uniqueActivities = [...new Map(allActivities.map(item => [item.id, item])).values()];
        const processedData = uniqueActivities.map(activity => ({
            ...activity,
            assigned_classes: (activity.assigned_classes || []).map(id => String(id))
        })) as ActivityDisplay[];

        setActivities(processedData.filter(a => a.is_active !== false));
        setDisabledActivities(processedData.filter(a => a.is_active === false));
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddActivity = async () => {
        if (!newActivityName.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Activity name cannot be empty.' });
            return;
        }

        const activityData: Omit<AssignmentActivity, 'id'> = {
            name: newActivityName,
            act_name: newActivityName,
            expected_per_term: newActivityCount,
            weight: newActivityWeight,
            academic_year: user?.academic_year?.toString() || '',
            term: user?.academic_term?.toString() || '',
            added_by: user?.email || user?.username || '',
            is_standalone: isStandalone ? 1 : 0
        };

        const result = await addAssignmentActivityApi(activityData, user?.email);

        await fetchData();
        setNewActivityName('');
        setNewActivityCount(1);
        setNewActivityWeight(20);
        setIsStandalone(false);

        if (result) {
            toast({ title: 'Activity Added', description: `"${newActivityName}" has been added via API.` });
        } else {
            toast({ title: 'Activity Added (Local)', description: `"${newActivityName}" added locally (API issue).` });
        }
    };

    const handleAssignmentChange = async (activity: ActivityDisplay, classIds: string[]) => {
        const activityCurrentClasses = activity.assigned_classes || [];

        // Identify new assignments (added in UI)
        const added = classIds.filter(id => !activityCurrentClasses.includes(id));
        // Identify unassignments (removed in UI)
        const removed = activityCurrentClasses.filter(id => !classIds.includes(id));

        const commonPayload = {
            act_id: activity.activity_id || '',
            academic_year: user?.academic_year?.toString(),
            term: user?.academic_term?.toString()
        };

        // Process additions
        for (const class_id of added) {
            await assignActivityToClassApi({ ...commonPayload, class_id });
        }

        // Process removals
        for (const class_id of removed) {
            await unassignActivityFromClassApi({ ...commonPayload, class_id });
        }

        // Update local storage for immediate UI reflection and fallback
        const currentAssignments = getClassAssignmentActivities();
        const otherActivityAssignments = currentAssignments.filter((ca: any) => ca.activity_id !== activity.id);
        const newAssignments = classIds.map(class_id => ({ class_id, activity_id: activity.id }));
        saveClassAssignmentActivities([...otherActivityAssignments, ...newAssignments]);

        await fetchData();
        toast({ title: 'Assignments Updated', description: 'Activity assignments have been synchronized with the API.' });
    }

    const handleDeleteActivity = async (activity: ActivityDisplay) => {
        const result = await softDeleteAssignmentActivityApi(activity.id, activity.activity_id || '', activity.academic_year, activity.term);
        await fetchData();
        if (result) {
            toast({ title: 'Activity Disabled', description: `"${activity.name}" has been moved to disabled activities.` });
        } else {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to disable activity.' });
        }
    }

    const handleOpenEditDialog = (activity: AssignmentActivity) => {
        setEditingActivity(activity);
        setEditFormState({
            name: activity.name,
            expected_per_term: activity.expected_per_term,
            weight: activity.weight,
            is_standalone: activity.is_standalone || 0
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdateActivity = async () => {
        if (!editingActivity || !editFormState.name.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Activity name cannot be empty.' });
            return;
        }

        const updatedData: Partial<AssignmentActivity> = {
            name: editFormState.name,
            act_name: editFormState.name,
            expected_per_term: editFormState.expected_per_term,
            weight: editFormState.weight,
            is_standalone: editFormState.is_standalone,
            academic_year: editingActivity.academic_year || user?.academic_year?.toString() || '',
            term: editingActivity.term || user?.academic_term?.toString() || ''
        };

        const result = await updateAssignmentActivityApi(editingActivity.id, editingActivity.activity_id || '', updatedData);

        await fetchData();
        if (result) {
            toast({ title: 'Activity Updated', description: `"${editFormState.name}" updated via API.` });
        } else {
            toast({ title: 'Activity Updated (Local)', description: `"${editFormState.name}" updated locally.` });
        }
        setIsEditDialogOpen(false);
        setEditingActivity(null);
    };

    const handleReactivateActivity = async (activity: ActivityDisplay) => {
        const result = await activateAssignmentActivityApi(activity.id, activity.activity_id || '');
        await fetchData();
        if (result) {
            toast({ title: 'Activity Reactivated', description: `"${activity.name}" is now active.` });
        } else {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to reactivate activity.' });
        }
    };

    const handlePermanentDelete = async (activity: ActivityDisplay) => {
        if (!user?.is_super_admin) {
            toast({ variant: 'destructive', title: 'Permission Denied', description: 'Only super admins can permanently delete activities.' });
            return;
        }
        const result = await deleteAssignmentActivityApi(activity.id, activity.activity_id || '', activity.academic_year, activity.term);
        await fetchData();
        if (result) {
            toast({ title: 'Permanent Delete Successful', description: `"${activity.name}" has been removed from the system.` });
        } else {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to permanently delete activity.' });
        }
    };


    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center gap-2">
                <Input
                    placeholder="Enter new activity name..."
                    value={newActivityName}
                    onChange={(e) => setNewActivityName(e.target.value)}
                />
                <Input
                    type="number"
                    min="1"
                    placeholder="Expected per term"
                    value={newActivityCount}
                    onChange={(e) => setNewActivityCount(Number(e.target.value) || 1)}
                    className="w-full md:w-48"
                />
                <Input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Weight (%)"
                    value={newActivityWeight}
                    onChange={(e) => setNewActivityWeight(Number(e.target.value) || 0)}
                    className="w-full md:w-48"
                />
                <div className="flex items-center space-x-2 bg-muted/50 px-3 py-2 rounded-md border min-w-[140px]">
                    <Checkbox
                        id="is-standalone"
                        checked={isStandalone}
                        onCheckedChange={(checked) => setIsStandalone(!!checked)}
                    />
                    <Label htmlFor="is-standalone" className="text-sm cursor-pointer whitespace-nowrap">Standalone</Label>
                </div>
                <Button onClick={handleAddActivity} className="w-full md:w-auto"><PlusCircle className="mr-2 h-4 w-4" /> Add</Button>
                <Button variant="outline" onClick={() => setIsDisabledViewOpen(true)} className="w-full md:w-auto ml-auto">
                    <ShieldAlert className="mr-2 h-4 w-4 text-amber-600" />
                    Disabled Activities ({disabledActivities.length})
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Activity Name</TableHead>
                            <TableHead>Expected Per Term</TableHead>
                            <TableHead>Weight (%)</TableHead>
                            <TableHead>Assigned to Classes</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {activities.map(activity => (
                            <TableRow key={activity.id}>
                                <TableCell className="font-medium">
                                    {activity.name}
                                    {activity.is_standalone === 1 && (
                                        <div className="text-[10px] text-primary font-bold uppercase mt-1">Standalone</div>
                                    )}
                                </TableCell>
                                <TableCell>{activity.expected_per_term}</TableCell>
                                <TableCell>{activity.weight}%</TableCell>
                                <TableCell>
                                    <MultiSelectPopover
                                        title="Classes"
                                        options={classes.map(c => ({ value: c.id, class_id: c.class_id, label: c.name }))}
                                        selectedValues={activity.assigned_classes}
                                        onChange={(values) => handleAssignmentChange(activity, values)}
                                    />
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(activity)}>
                                        <Edit className="h-4 w-4 text-blue-600" />
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
                                                <AlertDialogDescription>This will disable the activity "{activity.name}" and move it to the disabled list. It will no longer appear in active assignments.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteActivity(activity)}>Disable</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Activity</DialogTitle>
                        <DialogDescription>Update the details for "{editingActivity?.name}".</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Activity Name</Label>
                            <Input id="edit-name" value={editFormState.name} onChange={(e) => setEditFormState({ ...editFormState, name: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-count">Expected Per Term</Label>
                                <Input id="edit-count" type="number" min="1" value={editFormState.expected_per_term} onChange={(e) => setEditFormState({ ...editFormState, expected_per_term: Number(e.target.value) || 1 })} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-weight">Weight (%)</Label>
                                <Input id="edit-weight" type="number" min="0" max="100" value={editFormState.weight} onChange={(e) => setEditFormState({ ...editFormState, weight: Number(e.target.value) || 0 })} />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 pt-2">
                            <Checkbox
                                id="edit-standalone"
                                checked={editFormState.is_standalone === 1}
                                onCheckedChange={(checked) => setEditFormState({ ...editFormState, is_standalone: checked ? 1 : 0 })}
                            />
                            <Label htmlFor="edit-standalone" className="text-sm cursor-pointer">Standalone Activity (Subject Independent)</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdateActivity}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={isDisabledViewOpen} onOpenChange={setIsDisabledViewOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Disabled Activities</DialogTitle>
                        <DialogDescription>List of inactive activities that can be reactivated or permanently deleted.</DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[60vh] overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Activity Name</TableHead>
                                    <TableHead>Academic Session</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {disabledActivities.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">No disabled activities found.</TableCell>
                                    </TableRow>
                                ) : (
                                    disabledActivities.map(activity => (
                                        <TableRow key={activity.id}>
                                            <TableCell className="font-medium">{activity.name}</TableCell>
                                            <TableCell>{activity.academic_year} - {activity.term}</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button size="sm" variant="outline" onClick={() => handleReactivateActivity(activity)}>
                                                    <RefreshCcw className="mr-2 h-4 w-4 text-green-600" />
                                                    Activate
                                                </Button>
                                                {user?.is_super_admin && (
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10">
                                                                <Trash className="mr-2 h-4 w-4" />
                                                                Permanent Delete
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Permanent Deletion</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This action cannot be undone. This will permanently remove "{activity.name}" from the database.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handlePermanentDelete(activity)}>Permanently Delete</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    )
}
