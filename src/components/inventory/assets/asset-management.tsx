
'use client';
import { useState, useEffect } from 'react';
import {
  getAssets,
  saveAssets,
  addAuditLog,
  getUsers,
} from '@/lib/store';
import { Asset, AssetCategory, AssetCondition, AssetStatus, ALL_ASSET_CATEGORIES, ALL_ASSET_CONDITIONS, ALL_ASSET_STATUSES } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon, PlusCircle, Trash2, Edit } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DataTable } from './data-table';
import { columns } from './columns';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


const assetSchema = z.object({
  name: z.string().min(1, 'Asset name is required.'),
  category: z.enum(ALL_ASSET_CATEGORIES, { required_error: 'Category is required.'}),
  purchaseDate: z.date({ required_error: 'Purchase date is required.' }),
  purchaseCost: z.coerce.number().min(0, 'Cost cannot be negative.'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1.'),
  condition: z.enum(ALL_ASSET_CONDITIONS, { required_error: 'Condition is required.' }),
  currentLocation: z.string().min(1, 'Location is required.'),
});

type AssetFormValues = z.infer<typeof assetSchema>;

function AssetForm({ onSave, existingAsset, isEditMode }: { onSave: (data: AssetFormValues) => void; existingAsset?: Asset | null; isEditMode: boolean }) {
  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetSchema),
    defaultValues: isEditMode && existingAsset ? {
        ...existingAsset,
        purchaseDate: new Date(existingAsset.purchaseDate),
    } : {
        name: '',
        purchaseDate: new Date(),
        purchaseCost: 0,
        quantity: 1,
        currentLocation: 'Main Store',
    },
  });

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSave)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Asset Name</FormLabel><FormControl><Input placeholder="e.g., Dell Latitude 5490" {...field} /></FormControl><FormMessage/></FormItem>
                )}/>
                <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem><FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a category..." /></SelectTrigger></FormControl>
                        <SelectContent>{ALL_ASSET_CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent></Select>
                    <FormMessage/></FormItem>
                )}/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField control={form.control} name="purchaseDate" render={({ field }) => (
                    <FormItem className="flex flex-col"><FormLabel>Purchase Date</FormLabel>
                        <Popover><PopoverTrigger asChild>
                            <FormControl><Button variant="outline" className={cn('pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                                {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>} <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button></FormControl>
                        </PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover>
                    <FormMessage/></FormItem>
                )}/>
                 <FormField control={form.control} name="purchaseCost" render={({ field }) => (
                    <FormItem><FormLabel>Purchase Cost</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage/></FormItem>
                )}/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="quantity" render={({ field }) => (
                    <FormItem><FormLabel>Quantity</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage/></FormItem>
                )}/>
                <FormField control={form.control} name="condition" render={({ field }) => (
                    <FormItem><FormLabel>Condition</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a condition..." /></SelectTrigger></FormControl>
                        <SelectContent>{ALL_ASSET_CONDITIONS.map(con => <SelectItem key={con} value={con}>{con}</SelectItem>)}</SelectContent></Select>
                    <FormMessage/></FormItem>
                )}/>
            </div>
            <FormField control={form.control} name="currentLocation" render={({ field }) => (
                <FormItem><FormLabel>Current Location</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
            )}/>
            <DialogFooter>
                <Button type="submit">{isEditMode ? 'Save Changes' : 'Add Asset'}</Button>
            </DialogFooter>
        </form>
    </Form>
  )
}


export function AssetManagement() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    setAssets(getAssets());
  }, []);

  const handleSaveAsset = (values: AssetFormValues) => {
    if (!user) return;
    const allAssets = getAssets();
    let updatedAssets;
    
    if (editingAsset) {
        updatedAssets = allAssets.map(asset => asset.id === editingAsset.id ? {
            ...editingAsset,
            ...values,
            purchaseDate: values.purchaseDate.toISOString()
        } : asset);
    } else {
        const newAsset: Asset = {
            id: `ASSET-${Date.now()}`,
            ...values,
            purchaseDate: values.purchaseDate.toISOString(),
            status: 'In Stock',
            logs: []
        };
        updatedAssets = [...allAssets, newAsset];
    }
    
    saveAssets(updatedAssets);
    setAssets(updatedAssets);
    addAuditLog({ user: user.email, name: user.name, action: editingAsset ? 'Update Asset' : 'Create Asset', details: `Saved asset: ${values.name}`});
    toast({ title: `Asset ${editingAsset ? 'Updated' : 'Created'}` });
    setIsFormOpen(false);
    setEditingAsset(null);
  };
  
  const handleOpenForm = (asset?: Asset) => {
    setEditingAsset(asset || null);
    setIsFormOpen(true);
  }

  const handleDelete = (assetId: string) => {
    if (!user) return;
    const allAssets = getAssets();
    const assetToDelete = allAssets.find(a => a.id === assetId);
    const updatedAssets = allAssets.filter(a => a.id !== assetId);
    saveAssets(updatedAssets);
    setAssets(updatedAssets);
    addAuditLog({ user: user.email, name: user.name, action: 'Delete Asset', details: `Deleted asset: ${assetToDelete?.name}` });
    toast({ title: 'Asset Deleted', variant: 'destructive'});
  }
  
  const handleBulkDelete = (assetIds: string[]) => {
     if (!user) return;
     const allAssets = getAssets();
     const updatedAssets = allAssets.filter(a => !assetIds.includes(a.id));
     saveAssets(updatedAssets);
     setAssets(updatedAssets);
     addAuditLog({ user: user.email, name: user.name, action: 'Bulk Delete Assets', details: `Deleted ${assetIds.length} assets.`});
     toast({ title: 'Assets Deleted', description: `${assetIds.length} assets have been removed.`, variant: 'destructive'});
  }

  return (
    <>
      <DataTable
        columns={columns({ onEdit: handleOpenForm, onDelete: handleDelete })}
        data={assets}
        onAdd={() => handleOpenForm()}
        onBulkDelete={handleBulkDelete}
      />
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingAsset ? 'Edit' : 'Add New'} Asset</DialogTitle>
            <DialogDescription>Fill in the details of the school asset below.</DialogDescription>
          </DialogHeader>
          <AssetForm onSave={handleSaveAsset} existingAsset={editingAsset} isEditMode={!!editingAsset} />
        </DialogContent>
      </Dialog>
    </>
  );
}

