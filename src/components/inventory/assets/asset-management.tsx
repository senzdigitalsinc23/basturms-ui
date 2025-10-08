
'use client';
import { useState, useEffect } from 'react';
import {
  getAssets,
  saveAssets,
  addAuditLog,
  getUsers,
} from '@/lib/store';
import { Asset, AssetCategory, AssetCondition, AssetStatus, ALL_ASSET_CATEGORIES, ALL_ASSET_CONDITIONS, ALL_ASSET_STATUSES, User } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { DataTable } from './data-table';
import { columns } from './columns';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { CalendarIcon, PlusCircle, Trash2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const assetSchema = z.object({
  name: z.string().min(1, "Asset name is required."),
  category: z.enum(ALL_ASSET_CATEGORIES, { required_error: "Please select a category."}),
  purchaseDate: z.date({ required_error: "Purchase date is required."}),
  purchaseCost: z.coerce.number().min(0, "Cost cannot be negative."),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
  status: z.enum(ALL_ASSET_STATUSES),
  currentLocation: z.string().min(1, "Location is required."),
  condition: z.enum(ALL_ASSET_CONDITIONS),
  notes: z.string().optional(),
});

type AssetFormValues = z.infer<typeof assetSchema>;

function AssetForm({ onSave, existingAsset }: { onSave: (data: Omit<Asset, 'id' | 'logs'>) => void; existingAsset?: Asset | null }) {
    const form = useForm<AssetFormValues>({
        resolver: zodResolver(assetSchema),
        defaultValues: existingAsset 
            ? { ...existingAsset, purchaseDate: new Date(existingAsset.purchaseDate) }
            : {
                status: 'In Stock',
                condition: 'New',
                quantity: 1,
                currentLocation: 'Main Store',
              }
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSave)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
                <FormField name="name" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Asset Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                )}/>
                <div className="grid grid-cols-2 gap-4">
                    <FormField name="category" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select category..."/></SelectTrigger></FormControl><SelectContent>{ALL_ASSET_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><FormMessage/></FormItem>
                    )}/>
                    <FormField name="status" control={form.control} render={({ field }) => (
                         <FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select status..."/></SelectTrigger></FormControl><SelectContent>{ALL_ASSET_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><FormMessage/></FormItem>
                    )}/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <FormField name="purchaseDate" control={form.control} render={({ field }) => (
                        <FormItem className="flex flex-col"><FormLabel>Purchase Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}><>{field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover><FormMessage /></FormItem>
                    )}/>
                    <FormField name="purchaseCost" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Purchase Cost (GHS)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage/></FormItem>
                    )}/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <FormField name="quantity" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Quantity</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage/></FormItem>
                    )}/>
                    <FormField name="condition" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Condition</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select condition..."/></SelectTrigger></FormControl><SelectContent>{ALL_ASSET_CONDITIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><FormMessage/></FormItem>
                    )}/>
                </div>
                <FormField name="currentLocation" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Current Location</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                )}/>
                <FormField name="notes" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage/></FormItem>
                )}/>
                <DialogFooter className="pt-4"><Button type="submit">Save Asset</Button></DialogFooter>
            </form>
        </Form>
    )
}


export function AssetManagement() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchData = () => {
    setAssets(getAssets());
    setUsers(getUsers());
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveAsset = (values: Omit<Asset, 'id' | 'logs'>) => {
    if (!user) return;

    let updatedAssets: Asset[];
    let action: 'created' | 'updated' = 'created';
    let assetName = values.name;

    if (editingAsset) {
      action = 'updated';
      assetName = editingAsset.name;
      updatedAssets = assets.map(asset =>
        asset.id === editingAsset.id ? { ...asset, ...values, purchaseDate: values.purchaseDate.toISOString() } : asset
      );
    } else {
      const newAsset: Asset = {
        ...values,
        id: `ASSET-${Date.now()}`,
        purchaseDate: values.purchaseDate.toISOString(),
        logs: [{
            date: new Date().toISOString(),
            type: 'Status Change',
            details: `Asset created with status ${values.status}`,
            recorded_by: user.id
        }]
      };
      updatedAssets = [...assets, newAsset];
    }
    
    saveAssets(updatedAssets);
    fetchData();
    setIsFormOpen(false);
    setEditingAsset(null);

    toast({
        title: `Asset ${action === 'created' ? 'Created' : 'Updated'}`,
        description: `Asset "${assetName}" has been successfully saved.`
    });
    addAuditLog({
        user: user.email, name: user.name,
        action: `Asset ${action}`, details: `Asset: ${assetName}`
    });
  };
  
  const handleDeleteAsset = (assetId: string) => {
    const updatedAssets = assets.filter(asset => asset.id !== assetId);
    saveAssets(updatedAssets);
    fetchData();
    toast({ title: 'Asset Deleted', variant: 'destructive' });
  };
  
  const handleOpenForm = (asset: Asset | null) => {
    setEditingAsset(asset);
    setIsFormOpen(true);
  }

  return (
    <>
      <DataTable
        columns={columns({ onEdit: handleOpenForm, onDelete: handleDeleteAsset })}
        data={assets}
        onAdd={() => handleOpenForm(null)}
      />
       <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{editingAsset ? 'Edit Asset' : 'Create New Asset'}</DialogTitle>
            </DialogHeader>
            <AssetForm onSave={handleSaveAsset} existingAsset={editingAsset}/>
        </DialogContent>
      </Dialog>
    </>
  );
}
