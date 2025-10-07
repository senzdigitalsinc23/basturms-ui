
'use client';
import { useState, useEffect } from 'react';
import { getAssets, saveAssets, addAuditLog, getUsers } from '@/lib/store';
import { Asset, AssetLog, User } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Wrench } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const logSchema = z.object({
  assetId: z.string().min(1, 'Please select an asset.'),
  type: z.enum(['Maintenance', 'Depreciation', 'Status Change']),
  details: z.string().min(1, 'Details are required.'),
  cost: z.coerce.number().optional(),
});

type LogFormValues = z.infer<typeof logSchema>;

function MaintenanceLogForm({
  assets,
  onSave,
  defaultAssetId,
}: {
  assets: Asset[];
  onSave: (data: LogFormValues) => void;
  defaultAssetId?: string;
}) {
  const form = useForm<LogFormValues>({
    resolver: zodResolver(logSchema),
    defaultValues: {
        assetId: defaultAssetId || '',
        type: 'Maintenance',
        cost: 0,
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
        <FormField
          control={form.control}
          name="assetId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Asset</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select an asset..." /></SelectTrigger></FormControl>
                <SelectContent>
                  {assets.map(asset => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.name} ({asset.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Log Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                    <SelectContent>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Depreciation">Depreciation</SelectItem>
                        <SelectItem value="Status Change">Status Change</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
             <FormField
            control={form.control}
            name="cost"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Cost (if any)</FormLabel>
                <FormControl><Input type="number" {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
            control={form.control}
            name="details"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Details</FormLabel>
                <FormControl><Textarea placeholder="Describe the maintenance or log entry..." {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )}
        />
        <DialogFooter>
          <Button type="submit">Add Log Entry</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}


export function AssetMaintenance() {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedAssetForLog, setSelectedAssetForLog] = useState<string | undefined>();
    const { user } = useAuth();
    const { toast } = useToast();

    const fetchData = () => {
        setAssets(getAssets());
        setUsers(getUsers());
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddLog = (values: LogFormValues) => {
        if (!user) return;
        const allAssets = getAssets();
        const assetIndex = allAssets.findIndex(a => a.id === values.assetId);

        if (assetIndex === -1) {
            toast({ variant: 'destructive', title: 'Asset not found.' });
            return;
        }

        const newLog: AssetLog = {
            date: new Date().toISOString(),
            type: values.type,
            details: values.details,
            cost: values.cost,
            recorded_by: user.id
        };

        const updatedAsset = allAssets[assetIndex];
        updatedAsset.logs.push(newLog);

        saveAssets(allAssets);
        fetchData();
        
        toast({ title: 'Log Added', description: `A new maintenance log for ${updatedAsset.name} has been added.` });
        addAuditLog({ user: user.email, name: user.name, action: 'Add Asset Log', details: `Added ${values.type} log for ${updatedAsset.name}: ${values.details}` });
        
        setIsFormOpen(false);
    }
    
    const getUserName = (id: string) => users.find(u => u.id === id)?.name || id;

    return (
        <Card>
            <CardHeader>
                 <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Asset Maintenance & Logs</CardTitle>
                        <CardDescription>View and manage maintenance history for all school assets.</CardDescription>
                    </div>
                    <Button size="sm" onClick={() => setIsFormOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Log Entry
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    {assets.map(asset => (
                        <AccordionItem value={asset.id} key={asset.id}>
                            <AccordionTrigger>
                                <div className="flex items-center gap-4">
                                    <Wrench className="h-5 w-5 text-primary" />
                                    <div>
                                        <div className="font-semibold">{asset.name} <span className="text-xs font-mono text-muted-foreground">({asset.id})</span></div>
                                        <div className="text-sm text-muted-foreground">{asset.logs.length} log(s)</div>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-4 pl-4 border-l-2 ml-2">
                                     <Button variant="outline" size="sm" onClick={() => { setSelectedAssetForLog(asset.id); setIsFormOpen(true);}}>
                                        <PlusCircle className="mr-2 h-4 w-4" /> Add Log for this Asset
                                    </Button>
                                    {asset.logs.length > 0 ? (
                                        asset.logs.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((log, index) => (
                                            <div key={index} className="p-3 bg-muted/50 rounded-md">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-semibold">{log.type}</p>
                                                        <p className="text-sm">{log.details}</p>
                                                        {log.cost && <p className="text-sm font-bold">Cost: GHS {log.cost.toFixed(2)}</p>}
                                                    </div>
                                                    <div className="text-right text-xs text-muted-foreground">
                                                        <p>{format(new Date(log.date), 'PPP')}</p>
                                                        <p>By: {getUserName(log.recorded_by)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No maintenance logs for this asset yet.</p>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
                 <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Maintenance Log</DialogTitle>
                        </DialogHeader>
                        <MaintenanceLogForm assets={assets} onSave={handleAddLog} defaultAssetId={selectedAssetForLog}/>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
