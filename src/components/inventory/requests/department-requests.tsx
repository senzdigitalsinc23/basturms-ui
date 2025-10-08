'use client';
import { useState, useEffect } from 'react';
import { getDepartmentRequests, addDepartmentRequest, updateDepartmentRequestStatus, getAssets, getStaff, getClasses } from '@/lib/store';
import { DepartmentRequest, Asset, Staff, Role, DepartmentRequestStatus, Class } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2, CheckCircle, XCircle, Truck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RequestList } from './request-list';


const requestSchema = z.object({
  asset_id: z.string().min(1, "Please select an asset."),
  quantity_requested: z.coerce.number().min(1, "Quantity must be at least 1."),
  reason: z.string().min(10, "Please provide a reason for your request."),
  department: z.string().min(1, "Department is required."),
});
type RequestFormValues = z.infer<typeof requestSchema>;

function RequestForm({ onSave, assets, classes }: { onSave: (data: RequestFormValues) => void, assets: Asset[], classes: Class[] }) {
    const form = useForm<RequestFormValues>({
        resolver: zodResolver(requestSchema),
        defaultValues: { quantity_requested: 1 }
    });
    
    const departmentOptions = [
        "Headmasters office",
        "Kitchen",
        "Account",
        ...classes.map(c => c.name)
    ];
    
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
                 <FormField
                    control={form.control}
                    name="asset_id"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Item to Request</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select an item..." /></SelectTrigger></FormControl>
                            <SelectContent>
                                {assets.map(asset => (
                                    <SelectItem key={asset.id} value={asset.id} disabled={asset.quantity <= 0}>
                                        {asset.name} (In Stock: {asset.quantity})
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
                        name="quantity_requested"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Quantity</FormLabel>
                                <FormControl><Input type="number" min={1} {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="department"
                        render={({ field }) => (
                             <FormItem>
                                <FormLabel>Department</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select department..." /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {departmentOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                 </div>
                 <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Reason for Request</FormLabel>
                            <FormControl><Textarea placeholder="Please provide a justification for this request..." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <DialogFooter>
                    <Button type="submit">Submit Request</Button>
                </DialogFooter>
            </form>
        </Form>
    );
}

export function DepartmentRequests() {
    const [requests, setRequests] = useState<DepartmentRequest[]>([]);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const { user } = useAuth();
    const { toast } = useToast();

    const isAdmin = user?.role === 'Admin' || user?.role === 'Headmaster';
    const isStoreManager = user?.role === 'Stores Manager';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = () => {
        setRequests(getDepartmentRequests());
        setAssets(getAssets());
        setClasses(getClasses());
    }

    const handleSaveRequest = (data: RequestFormValues) => {
        if(!user) return;
        const asset = assets.find(a => a.id === data.asset_id);
        if(!asset) return;

        addDepartmentRequest({
            ...data,
            requested_by_id: user.id,
            requested_by_name: user.name,
            asset_name: asset.name,
        });

        toast({ title: 'Request Submitted', description: 'Your request has been sent for approval.'});
        setIsFormOpen(false);
        fetchData();
    };
    
    const handleUpdateStatus = (requestId: string, status: DepartmentRequestStatus, data?: { quantity?: number, comments?: string }) => {
        if (!user) return;
        updateDepartmentRequestStatus(requestId, status, user.id, user.name, data);
        toast({ title: 'Request Updated', description: `The request has been ${status.toLowerCase()}.` });
        fetchData();
    };

    const myRequests = requests.filter(r => r.requested_by_id === user?.id);
    const pendingRequests = requests.filter(r => r.status === 'Pending');
    const approvedRequests = requests.filter(r => r.status === 'Approved');
    const allOtherRequests = requests.filter(r => r.requested_by_id !== user?.id);

    return (
         <Tabs defaultValue="my-requests" className="w-full">
            <div className="flex justify-between items-center mb-4">
                <TabsList>
                    <TabsTrigger value="my-requests">My Requests</TabsTrigger>
                    {isAdmin && <TabsTrigger value="pending-approval">Pending Approval</TabsTrigger>}
                    {isStoreManager && <TabsTrigger value="to-be-served">To Be Served</TabsTrigger>}
                    {(isAdmin || isStoreManager) && <TabsTrigger value="history">Full History</TabsTrigger>}
                </TabsList>
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm"><PlusCircle className="mr-2 h-4 w-4" /> New Request</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>New Departmental Request</DialogTitle>
                            <DialogDescription>Request an item from the store. This will be sent to an administrator for approval.</DialogDescription>
                        </DialogHeader>
                        <RequestForm assets={assets} classes={classes} onSave={handleSaveRequest} />
                    </DialogContent>
                </Dialog>
            </div>
            <TabsContent value="my-requests">
                <RequestList title="My Requests" requests={myRequests} />
            </TabsContent>
            {isAdmin && (
                <TabsContent value="pending-approval">
                     <RequestList title="Pending Requests for Approval" requests={pendingRequests} canApprove onUpdateStatus={handleUpdateStatus} />
                </TabsContent>
            )}
             {isStoreManager && (
                <TabsContent value="to-be-served">
                     <RequestList title="Approved Requests to be Served" requests={approvedRequests} canServe onUpdateStatus={handleUpdateStatus} />
                </TabsContent>
            )}
             {(isAdmin || isStoreManager) && (
                <TabsContent value="history">
                     <RequestList title="All Departmental Requests" requests={allOtherRequests} />
                </TabsContent>
             )}
        </Tabs>
    )
}