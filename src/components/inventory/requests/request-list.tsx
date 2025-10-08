'use client';

import { DepartmentRequest, DepartmentRequestStatus } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { CheckCircle, Clock, Truck, User, XCircle } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";


type RequestListProps = {
    title: string;
    requests: DepartmentRequest[];
    canApprove?: boolean;
    canServe?: boolean;
    onUpdateStatus?: (requestId: string, status: DepartmentRequestStatus) => void;
};

const statusConfig: Record<DepartmentRequestStatus, { color: string; icon: React.ElementType }> = {
    Pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    Approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    Rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
    Served: { color: 'bg-blue-100 text-blue-800', icon: Truck },
};


export function RequestList({ title, requests, canApprove, canServe, onUpdateStatus }: RequestListProps) {

    return (
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
                                <TableHead>Qty</TableHead>
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
                                        {canApprove && req.status === 'Pending' && onUpdateStatus && (
                                            <div className="flex gap-2 justify-end">
                                                <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50" onClick={() => onUpdateStatus(req.id, 'Approved')}>Approve</Button>
                                                <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50" onClick={() => onUpdateStatus(req.id, 'Rejected')}>Reject</Button>
                                            </div>
                                        )}
                                         {canServe && req.status === 'Approved' && onUpdateStatus && (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                     <Button size="sm" variant="outline">
                                                        <Truck className="mr-2 h-4 w-4" /> Mark as Served
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Confirm Service</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This will mark the request for {req.quantity_requested} of "{req.asset_name}" as served and deduct the quantity from stock. This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => onUpdateStatus(req.id, 'Served')}>Confirm</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )}) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        No requests found in this category.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
