'use client';
import { useState, useEffect } from 'react';
import {
  getAssets,
  saveAssets,
  addAuditLog,
} from '@/lib/store';
import { Asset, AssetCategory, AssetStatus, ALL_ASSET_CATEGORIES, ALL_ASSET_STATUSES } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { DataTable } from './data-table';
import { columns } from './columns';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '../ui/calendar';

const assetSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Asset name is required.'),
  category: z.enum(ALL_ASSET_CATEGORIES),
  purchaseDate: z.date({ required_error: 'Purchase date is required.'}),
  purchaseCost: z.coerce.number().min(0, 'Cost must be a positive number.'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1.'),
  status: z.enum(ALL_ASSET_STATUSES),
  currentLocation: z.string().min(1, 'Location is required.'),
  condition: z.enum(['New', 'Good', 'Fair', 'Poor']),
});

type AssetFormValues = z.infer<typeof assetSchema>;

function AssetForm({ onSave, existingAsset }: { onSave: (data: any) => void; existingAsset?: Asset | null }) {
  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetSchema),
    defaultValues: existingAsset
      ? { ...existingAsset, purchaseDate: new Date(existingAsset.purchaseDate) }
      : {
          name: '',
          category: 'IT Equipment',
          purchaseDate: new Date(),
          purchaseCost: 0,
          quantity: 1,
          status: 'In Stock',
          currentLocation: 'Main Store',
          condition: 'Good',
        },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
        <FormField name="name" control={form.control} render={({ field }) => (
          <FormItem><FormLabel>Asset Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
        )} />
        <div className="grid grid-cols-2 gap-4">
          <FormField name="category" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent>{ALL_ASSET_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><FormMessage/></FormItem>
          )} />
          <FormField name="purchaseDate" control={form.control} render={({ field }) => (
            <FormItem className="flex flex-col"><FormLabel>Purchase Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, 'PPP') : 'Pick a date'}<CalendarIcon className="ml-auto h-4 w-4 opacity-50"/></Button></FormControl></PopoverTrigger><PopoverContent><Calendar mode="single" selected={field.value} onSelect={field.onChange}/></PopoverContent></Popover><FormMessage/></FormItem>
          )} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField name="purchaseCost" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>Purchase Cost</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage/></FormItem>
          )} />
           <FormField name="quantity" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>Quantity</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage/></FormItem>
          )} />
        </div>
         <FormField name="currentLocation" control={form.control} render={({ field }) => (
          <FormItem><FormLabel>Current Location</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
        )} />
        <DialogFooter>
          <Button type="submit">Save Asset</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export function AssetManagement() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchData = () => {
    setAssets(getAssets());
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveAsset = (data: AssetFormValues) => {
    if (!user) return;
    const allAssets = getAssets();
    let updatedAssets;
    let action: 'created' | 'updated' = 'created';

    if (editingAsset) {
      action = 'updated';
      updatedAssets = allAssets.map(asset =>
        asset.id === editingAsset.id ? { ...asset, ...data, purchaseDate: data.purchaseDate.toISOString() } : asset
      );
    } else {
      const newAsset: Asset = {
        ...data,
        id: `ASSET-${Date.now()}`,
        purchaseDate: data.purchaseDate.toISOString(),
        logs: [{
            date: new Date().toISOString(),
            type: 'Status Change',
            details: `Asset created with status: ${data.status}`,
            recorded_by: user.id
        }]
      };
      updatedAssets = [...allAssets, newAsset];
    }

    saveAssets(updatedAssets);
    fetchData();
    
    addAuditLog({
      user: user.email,
      name: user.name,
      action: `Asset ${action}`,
      details: `${data.name} was ${action}.`,
    });
    
    toast({ title: 'Asset Saved', description: `Asset record has been ${action}.` });
    setIsFormOpen(false);
    setEditingAsset(null);
  };
  
  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setIsFormOpen(true);
  };

  const handleDelete = (assetId: string) => {
    if (!user) return;
    const allAssets = getAssets();
    const assetToDelete = allAssets.find(a => a.id === assetId);
    if (!assetToDelete) return;

    const newAssets = allAssets.filter(asset => asset.id !== assetId);
    saveAssets(newAssets);
    fetchData();
    
    addAuditLog({
        user: user.email,
        name: user.name,
        action: 'Delete Asset',
        details: `Deleted asset: ${assetToDelete.name}`
    });

    toast({ title: 'Asset Deleted' });
  };

  return (
    <>
      <DataTable
        columns={columns({ onEdit: handleEdit, onDelete: handleDelete })}
        data={assets}
        onAdd={() => {
          setEditingAsset(null);
          setIsFormOpen(true);
        }}
      />
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAsset ? 'Edit' : 'Add New'} Asset</DialogTitle>
          </DialogHeader>
          <AssetForm onSave={handleSaveAsset} existingAsset={editingAsset} />
        </DialogContent>
      </Dialog>
    </>
  );
}
