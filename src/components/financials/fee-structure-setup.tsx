
'use client';
import { useState, useEffect } from 'react';
import { getFeeStructures, saveFeeStructures, addAuditLog } from '@/lib/store';
import { FeeStructureItem, ALL_SCHOOL_LEVELS, SchoolLevel } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Trash2, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '../ui/checkbox';
import { Separator } from '../ui/separator';

export function FeeStructureSetup() {
    const [feeItems, setFeeItems] = useState<FeeStructureItem[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentItem, setCurrentItem] = useState<FeeStructureItem | null>(null);
    
    const initialFormState = {
        name: '',
        description: '',
        isMiscellaneous: false,
        levelAmounts: ALL_SCHOOL_LEVELS.reduce((acc, level) => ({ ...acc, [level]: 0 }), {})
    };

    const [formState, setFormState] = useState(initialFormState);
    const { user } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        setFeeItems(getFeeStructures());
    }, []);

    const openForm = (item: FeeStructureItem | null) => {
        setIsEditMode(!!item);
        setCurrentItem(item);
        setFormState(item ? {
             name: item.name,
             description: item.description || '',
             isMiscellaneous: !!item.isMiscellaneous,
             levelAmounts: { ...initialFormState.levelAmounts, ...item.levelAmounts }
        } : initialFormState);
        setIsFormOpen(true);
    };

    const handleAmountChange = (level: SchoolLevel, value: string) => {
        const amount = Number(value);
        setFormState(prev => ({
            ...prev,
            levelAmounts: {
                ...prev.levelAmounts,
                [level]: isNaN(amount) ? 0 : amount
            }
        }));
    }

    const handleSubmit = () => {
        if (!user) return;
        if (!formState.name.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Fee item name cannot be empty.' });
            return;
        }

        let updatedItems: FeeStructureItem[];
        let action: 'Create' | 'Update';

        if (isEditMode && currentItem) {
            action = 'Update';
            updatedItems = feeItems.map(item =>
                item.id === currentItem.id ? { ...item, ...formState } : item
            );
        } else {
            action = 'Create';
            const newItem: FeeStructureItem = {
                id: `fee_${Date.now()}`,
                ...formState,
            };
            updatedItems = [...feeItems, newItem];
        }

        saveFeeStructures(updatedItems);
        setFeeItems(updatedItems);
        setIsFormOpen(false);

        addAuditLog({
            user: user.email,
            name: user.name,
            action: `${action} Fee Item`,
            details: `${action}d fee item: ${formState.name}`
        });

        toast({
            title: `Fee Item ${isEditMode ? 'Updated' : 'Added'}`,
            description: `"${formState.name}" has been successfully saved.`
        });
    };

    const handleDelete = (itemId: string) => {
        if (!user) return;
        const itemToDelete = feeItems.find(item => item.id === itemId);
        if (!itemToDelete) return;

        const updatedItems = feeItems.filter(item => item.id !== itemId);
        saveFeeStructures(updatedItems);
        setFeeItems(updatedItems);

        addAuditLog({
            user: user.email,
            name: user.name,
            action: 'Delete Fee Item',
            details: `Deleted fee item: ${itemToDelete.name}`
        });

        toast({ title: 'Fee Item Deleted', description: `"${itemToDelete.name}" has been removed.` });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={() => openForm(null)} size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Fee Item
                </Button>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fee Name</TableHead>
                            <TableHead>Type</TableHead>
                            {ALL_SCHOOL_LEVELS.map(level => <TableHead key={level}>{level}</TableHead>)}
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {feeItems.map(item => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 text-xs rounded-full ${item.isMiscellaneous ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                                        {item.isMiscellaneous ? 'Miscellaneous' : 'Standard'}
                                    </span>
                                </TableCell>
                                {ALL_SCHOOL_LEVELS.map(level => (
                                    <TableCell key={level}>
                                        {item.levelAmounts[level]?.toLocaleString() ?? 'N/A'}
                                    </TableCell>
                                ))}
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => openForm(item)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-destructive hover:text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{isEditMode ? 'Edit' : 'Add'} Fee Item</DialogTitle>
                        <DialogDescription>
                            {isEditMode ? 'Update the details and amounts for this billable item.' : 'Create a new billable item and set its price for each school level.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
                        <div className="space-y-2">
                            <Label htmlFor="name">Fee Name</Label>
                            <Input id="name" value={formState.name} onChange={(e) => setFormState({ ...formState, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input id="description" value={formState.description} onChange={(e) => setFormState({ ...formState, description: e.target.value })} />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="isMiscellaneous" checked={formState.isMiscellaneous} onCheckedChange={(checked) => setFormState({ ...formState, isMiscellaneous: !!checked })}/>
                            <Label htmlFor="isMiscellaneous">Mark as Miscellaneous Item</Label>
                        </div>
                        <Separator />
                        <h4 className="font-semibold text-md">Set Amounts per School Level</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {ALL_SCHOOL_LEVELS.map(level => (
                                <div key={level} className="space-y-2">
                                    <Label htmlFor={`amount-${level}`}>{level}</Label>
                                    <Input 
                                        id={`amount-${level}`} 
                                        type="number" 
                                        value={formState.levelAmounts[level] || ''}
                                        onChange={e => handleAmountChange(level, e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
