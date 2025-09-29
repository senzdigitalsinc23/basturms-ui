
'use client';
import { useState, useEffect } from 'react';
import { getAssignmentActivities, addAssignmentActivity, deleteAssignmentActivity, getClasses, getClassAssignmentActivities, saveClassAssignmentActivities } from '@/lib/store';
import { AssignmentActivity, Class, ClassAssignmentActivity } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { MultiSelectPopover } from '../subjects/multi-select-popover';

type ActivityDisplay = AssignmentActivity & {
    assigned_classes: string[];
};

export function AssignmentActivityManagement() {
    const [activities, setActivities] = useState<ActivityDisplay[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [newActivityName, setNewActivityName] = useState('');
    const [newActivityCount, setNewActivityCount] = useState(1);
    const [newActivityWeight, setNewActivityWeight] = useState(20);
    const { toast } = useToast();

    const fetchData = () => {
        const allActivities = getAssignmentActivities();
        const allClassActivities = getClassAssignmentActivities();
        const allClasses = getClasses();
        setClasses(allClasses);

        const uniqueActivities = [...new Map(allActivities.map(item => [item.id, item])).values()];

        const displayData = uniqueActivities.map(activity => {
            const assigned = allClassActivities
                .filter(ca => ca.activity_id === activity.id)
                .map(ca => ca.class_id);
            return { ...activity, assigned_classes: assigned };
        });
        setActivities(displayData);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddActivity = () => {
        if (!newActivityName.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Activity name cannot be empty.' });
            return;
        }
        addAssignmentActivity({ name: newActivityName, expected_per_term: newActivityCount, weight: newActivityWeight });
        fetchData();
        setNewActivityName('');
        setNewActivityCount(1);
        setNewActivityWeight(20);
        toast({ title: 'Activity Added', description: `"${newActivityName}" has been added.` });
    };
    
    const handleAssignmentChange = (activityId: string, classIds: string[]) => {
        const currentAssignments = getClassAssignmentActivities();
        const otherActivityAssignments = currentAssignments.filter(ca => ca.activity_id !== activityId);
        const newAssignments = classIds.map(class_id => ({ class_id, activity_id: activityId }));
        saveClassAssignmentActivities([...otherActivityAssignments, ...newAssignments]);
        fetchData();
        toast({ title: 'Assignments Updated', description: 'Activity assignments have been saved.' });
    }

    const handleDeleteActivity = (activityId: string) => {
        deleteAssignmentActivity(activityId);
        fetchData();
        toast({ title: 'Activity Deleted' });
    }

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
                    onChange={(e) => setNewActivityCount(Number(e.target.value))}
                    className="w-full md:w-48"
                />
                 <Input 
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Weight (%)"
                    value={newActivityWeight}
                    onChange={(e) => setNewActivityWeight(Number(e.target.value))}
                    className="w-full md:w-48"
                />
                <Button onClick={handleAddActivity} className="w-full md:w-auto"><PlusCircle className="mr-2 h-4 w-4" /> Add</Button>
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
                                <TableCell className="font-medium">{activity.name}</TableCell>
                                <TableCell>{activity.expected_per_term}</TableCell>
                                <TableCell>{activity.weight}%</TableCell>
                                <TableCell>
                                    <MultiSelectPopover 
                                        title="Classes"
                                        options={classes.map(c => ({ value: c.id, label: c.name }))}
                                        selectedValues={activity.assigned_classes}
                                        onChange={(values) => handleAssignmentChange(activity.id, values)}
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
                                                <AlertDialogDescription>This will permanently delete the activity "{activity.name}" and all its assignments.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteActivity(activity.id)}>Delete</AlertDialogAction>
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
