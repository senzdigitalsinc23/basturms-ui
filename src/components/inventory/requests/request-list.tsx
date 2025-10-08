

'use client';

import { DepartmentRequest, DepartmentRequestStatus } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { CheckCircle, Clock, Truck, User, XCircle, Ban } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";


type RequestListProps = {
    title: string;
    requests: DepartmentRequest[];
    canApprove?: boolean;
    canServe?: boolean;
    onUpdateStatus?: (requestId: string, status: DepartmentRequestStatus, data?: { quantity?: number, comments?: string }) => void;
};

const statusConfig: Record<DepartmentRequestStatus, { color: string; icon: React.ElementType }> = {
    Pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    Approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    Rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
    Served: { color: 'bg-blue-100 text-blue-800', icon: Truck },
    'Not Served': { color: 'bg-gray-100 text-gray-800', icon: Ban },
};

function StatusDialog({ 
    open, 
    onOpenChange, 
    request, 
    action, 
    onConfirm 
}: { 
    open: boolean, 
    onOpenChange: (open: boolean) => void, 
    request: DepartmentRequest | null, 
    action: 'Approve' | 'Serve',
    onConfirm: (quantity: number) => void 
}) {
    const [quantity, setQuantity] = useState<number | ''>('');
    
    if (!request) return null;

    const maxQuantity = action === 'Approve' ? request.quantity_requested : (request.quantity_approved || request.quantity_requested);

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Request {action}</AlertDialogTitle>
                    <AlertDialogDescription>
                        Please confirm the quantity for this action.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity to {action.toLowerCase()}</Label>
                    <Input 
                        id="quantity"
                        type="number"
                        defaultValue={maxQuantity}
                        max={maxQuantity}
                        min={1}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                    />
                    <p className="text-sm text-muted-foreground">
                        Max available to {action.toLowerCase()}: {maxQuantity}
                    </p>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onConfirm(Number(quantity) || maxQuantity)}>Confirm</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export function RequestList({ title, requests, canApprove, canServe, onUpdateStatus }: RequestListProps) {
    const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
    const [isServeDialogOpen, setIsServeDialogOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<DepartmentRequest | null>(null);
    const { user } = useAuth();
    const isAdmin = user?.role === 'Admin' || user?.role === 'Headmaster';


    const handleActionClick = (req: DepartmentRequest, action: 'Approve' | 'Serve') => {
        setSelectedRequest(req);
        if (action === 'Approve') {
            setIsApproveDialogOpen(true);
        } else {
            setIsServeDialogOpen(true);
        }
    };

    const handleConfirmApproval = (quantity: number) => {
        if (selectedRequest && onUpdateStatus) {
            onUpdateStatus(selectedRequest.id, 'Approved', { quantity });
        }
        setIsApproveDialogOpen(false);
        setSelectedRequest(null);
    };

    const handleConfirmServe = (quantity: number) => {
        if (selectedRequest && onUpdateStatus) {
            onUpdateStatus(selectedRequest.id, 'Served', { quantity });
        }
        setIsServeDialogOpen(false);
        setSelectedRequest(null);
    };

    const handleSimpleStatusUpdate = (reqId: string, status: 'Rejected' | 'Not Served') => {
        if(onUpdateStatus) {
            onUpdateStatus(reqId, status);
        }
    }
    
    const showApprovalActions = canApprove || isAdmin;
    const showServeActions = canServe || isAdmin;


    return (
        <>
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Asset</TableHead>
                                <TableHead>Qty Req.</TableHead>
                                {(showApprovalActions || showServeActions) && <TableHead>Qty Appr.</TableHead>}
                                {showServeActions && <TableHead>Qty Served</TableHead>}
                                <TableHead>Requester</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {requests.length > 0 ? requests.map(req => {
                                const StatusIcon = statusConfig[req.status].icon;
                                return (
                                <TableRow key={req.id}>
                                    <TableCell className="font-medium">{req.asset_name}</TableCell>
                                    <TableCell>{req.quantity_requested}</TableCell>
                                    {(showApprovalActions || showServeActions) && <TableCell>{req.quantity_approved || '-'}</TableCell>}
                                    {showServeActions && <TableCell>{req.quantity_served || '-'}</TableCell>}
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            {req.requested_by_name}
                                        </div>
                                    </TableCell>
                                    <TableCell>{req.department}</TableCell>
                                    <TableCell>{format(new Date(req.request_date), 'PPP')}</TableCell>
                                    <TableCell>
                                        <Badge className={statusConfig[req.status].color}>
                                            <StatusIcon className="mr-1 h-3 w-3" />
                                            {req.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {showApprovalActions && req.status === 'Pending' && (
                                            <div className="flex gap-2 justify-end">
                                                <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50" onClick={() => handleActionClick(req, 'Approve')}>Approve</Button>
                                                <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50" onClick={() => handleSimpleStatusUpdate(req.id, 'Rejected')}>Reject</Button>
                                            </div>
                                        )}
                                         {showServeActions && req.status === 'Approved' && (
                                             <div className="flex gap-2 justify-end">
                                                <Button size="sm" variant="outline" onClick={() => handleActionClick(req, 'Serve')}>
                                                    <Truck className="mr-2 h-4 w-4" /> Mark as Served
                                                </Button>
                                                <Button size="sm" variant="destructive" onClick={() => handleSimpleStatusUpdate(req.id, 'Not Served')}>Not Served</Button>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )}) : (
                                <TableRow>
                                    <TableCell colSpan={showApprovalActions || showServeActions ? 9 : 7} className="h-24 text-center">
                                        No requests found in this category.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
        <StatusDialog 
            open={isApproveDialogOpen}
            onOpenChange={setIsApproveDialogOpen}
            request={selectedRequest}
            action="Approve"
            onConfirm={handleConfirmApproval}
        />
         <StatusDialog 
            open={isServeDialogOpen}
            onOpenChange={setIsServeDialogOpen}
            request={selectedRequest}
            action="Serve"
            onConfirm={handleConfirmServe}
        />
        </>
    );
}
