'use client';
import { useState, useEffect } from 'react';
import {
  getAssets,
  getStaff,
  getClasses,
  getAssetAllocations,
  saveAssetAllocations,
  addAssetAllocation as storeAddAssetAllocation,
  saveAssets,
  addAuditLog,
} from '@/lib/store';
import { Asset, Staff, Class, AssetAllocation, AssetCondition, ALL_ASSET_CONDITIONS, DepartmentRequest } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';

const allocationSchema = z.object({
  assetId: z.string().min(1, 'Please select an asset.'),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  allocationType: z.enum(['Staff', 'Class', 'Department']),
  allocatedToId: z.string().min(1, 'Please select who to allocate to.'),
  condition: z.enum(ALL_ASSET_CONDITIONS),
  notes: z.string().optional(),
});

type AllocationFormValues = z.infer<typeof allocationSchema>;

const departmentOptions = ['Headmasters office', 'Kitchen', 'Account'];

function AllocationForm({
  assets,
  staff,
  classes,
  onSave,
}: {
  assets: Asset[];
  staff: Staff[];
  classes: Class[];
  onSave: (data: AllocationFormValues) => void;
}) {
  const form = useForm<AllocationFormValues>({
    resolver: zodResolver(allocationSchema),
    defaultValues: {
        allocationType: 'Class',
        condition: 'Good',
        quantity: 1,
    }
  });

  const allocationType = form.watch('allocationType');
  const selectedAssetId = form.watch('assetId');
  const selectedAsset = assets.find(a => a.id === selectedAssetId);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
        <FormField
          control={form.control}
          name="assetId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Asset to Allocate</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an available asset..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {assets.filter(a => a.status === 'In Stock' && a.quantity > 0).map(asset => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.name} ({asset.id}) - In Stock: {asset.quantity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Quantity to Allocate</FormLabel>
                    <FormControl>
                        <Input type="number" {...field} min={1} max={selectedAsset?.quantity || 1} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="allocationType"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Allocate To</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                        <SelectItem value="Class">Class</SelectItem>
                        <SelectItem value="Staff">Staff Member</SelectItem>
                        <SelectItem value="Department">Department</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="allocatedToId"
            render={({ field }) => (
                <FormItem>
                <FormLabel>{allocationType}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl>
                    <SelectContent>
                        {allocationType === 'Class' && classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        {allocationType === 'Staff' && staff.map(s => <SelectItem key={s.staff_id} value={s.staff_id}>{`${s.first_name} ${s.last_name}`}</SelectItem>)}
                        {allocationType === 'Department' && departmentOptions.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
          control={form.control}
          name="condition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Condition on Allocation</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>{ALL_ASSET_CONDITIONS.map(con => <SelectItem key={con} value={con}>{con}</SelectItem>)}</SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl><Textarea placeholder="Any notes about this allocation..." {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
        <DialogFooter>
          <Button type="submit">Allocate Asset</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}


export function AssetAllocations() {
  const [allocations, setAllocations] = useState<AssetAllocation[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchData = () => {
    setAllocations(getAssetAllocations());
    setAssets(getAssets());
    setStaff(getStaff());
    setClasses(getClasses());
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  const handleSaveAllocation = (values: AllocationFormValues) => {
    if (!user) return;
    
    const asset = assets.find(a => a.id === values.assetId);
    if (!asset) {
        toast({ variant: 'destructive', title: 'Error', description: 'Selected asset not found.'});
        return;
    }

    if (values.quantity > asset.quantity) {
        toast({ variant: 'destructive', title: 'Error', description: `Cannot allocate ${values.quantity} items. Only ${asset.quantity} available in stock.`});
        return;
    }
    
    let allocatedToName: string;
    if (values.allocationType === 'Class') {
        allocatedToName = classes.find(c => c.id === values.allocatedToId)?.name || 'Unknown Class';
    } else if (values.allocationType === 'Staff') {
        const staffMember = staff.find(s => s.staff_id === values.allocatedToId);
        allocatedToName = staffMember ? `${staffMember.first_name} ${staffMember.last_name}` : 'Unknown Staff';
    } else { // Department
        allocatedToName = values.allocatedToId;
    }

    const newAllocation = storeAddAssetAllocation({ ...values, assetName: asset.name, allocatedToName });

    // Update asset status and location
    asset.quantity -= values.quantity;
    if (asset.quantity <= 0) {
        asset.status = 'Allocated';
    }

    asset.logs.push({
        date: new Date().toISOString(),
        type: 'Status Change',
        details: `Allocated ${values.quantity} of ${asset.name} to ${allocatedToName}. Condition: ${values.condition}. Notes: ${values.notes || 'N/A'}`,
        recorded_by: user.id
    });
    
    const updatedAssets = getAssets().map(a => a.id === asset.id ? asset : a);
    saveAssets(updatedAssets);
    
    fetchData();
    setIsFormOpen(false);
    toast({ title: 'Asset Allocated', description: `${values.quantity} of ${asset.name} has been allocated successfully.` });
    addAuditLog({
        user: user.email, name: user.name,
        action: 'Allocate Asset', details: `Allocated ${values.quantity} of ${asset.name} to ${allocatedToName}`
    });
  }

  const handleDeleteAllocation = (allocationId: string) => {
    const allocations = getAssetAllocations();
    const allocationToDelete = allocations.find(a => a.id === allocationId);
    if (!allocationToDelete) return;

    // Update the asset's status back to 'In Stock'
    const allAssets = getAssets();
    const asset = allAssets.find(a => a.id === allocationToDelete.assetId);
    if (asset && user) {
        asset.quantity += allocationToDelete.quantity;
        asset.status = 'In Stock';
        asset.logs.push({
            date: new Date().toISOString(),
            type: 'Status Change',
            details: `Recalled ${allocationToDelete.quantity} of ${asset.name} from ${allocationToDelete.allocatedToName}`,
            recorded_by: user.id
        });
        saveAssets(allAssets);
    }

    const updatedAllocations = allocations.filter(a => a.id !== allocationId);
    saveAssetAllocations(updatedAllocations);
    fetchData();
    toast({ title: 'Allocation Recalled', variant: 'destructive' });
  }

  return (
    <>
      <DataTable
        columns={columns({ onDelete: handleDeleteAllocation })}
        data={allocations}
        onAdd={() => setIsFormOpen(true)}
      />
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Allocate New Asset</DialogTitle>
            <DialogDescription>Assign an available asset to a class, department or staff member.</DialogDescription>
          </DialogHeader>
          <AllocationForm 
            assets={assets}
            staff={staff}
            classes={classes}
            onSave={handleSaveAllocation}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
