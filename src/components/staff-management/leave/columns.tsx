
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown, CheckCircle2, XCircle, Clock, MessageSquare, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent
} from '@/components/ui/dropdown-menu';
import { LeaveRequest, LeaveStatus, ALL_LEAVE_STATUSES } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { format, formatDistanceToNowStrict } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

type ColumnsProps = {
    onUpdateStatus: (leaveId: string, status: LeaveStatus, comments: string) => void;
};

const statusColors: Record<LeaveStatus, string> = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Approved: 'bg-green-100 text-green-800',
    Rejected: 'bg-red-100 text-red-800',
};

const statusIcons: Record<LeaveStatus, React.ElementType> = {
    Pending: Clock,
    Approved: CheckCircle2,
    Rejected: XCircle,
}

export const columns = ({ onUpdateStatus }: ColumnsProps): ColumnDef<LeaveRequest>[] => [
    {
        accessorKey: 'staff_name',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Staff Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
    },
    {
        accessorKey: 'leave_type',
        header: 'Leave Type',
        cell: ({ row }) => <Badge variant="outline">{row.original.leave_type}</Badge>,
        filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
        accessorKey: 'start_date',
        header: 'Start Date',
        cell: ({ row }) => format(new Date(row.original.start_date), 'do MMM, yyyy')
    },
     {
        accessorKey: 'end_date',
        header: 'End Date',
        cell: ({ row }) => format(new Date(row.original.end_date), 'do MMM, yyyy')
    },
    {
        id: 'duration',
        header: 'Duration',
        cell: ({ row }) => formatDistanceToNowStrict(new Date(row.original.start_date), {
            unit: 'day',
            addSuffix: false
        })
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.original.status;
            const Icon = statusIcons[status];
            return (
                <Badge className={statusColors[status]}>
                    <Icon className="mr-1 h-3 w-3" />
                    {status}
                </Badge>
            );
        },
        filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
        id: 'actions',
        cell: function Cell({ row }) {
            const request = row.original;
            const [isAlertOpen, setIsAlertOpen] = useState(false);
            const [action, setAction] = useState<LeaveStatus | null>(null);
            const [comments, setComments] = useState('');

            const handleAction = (status: LeaveStatus) => {
                setAction(status);
                setIsAlertOpen(true);
            };

            const handleConfirm = () => {
                if (action) {
                    onUpdateStatus(request.id, action, comments);
                    setIsAlertOpen(false);
                    setComments('');
                    setAction(null);
                }
            };
            
            return (
                 <div className="text-right">
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem disabled={request.status !== 'Pending'} onClick={() => handleAction('Approved')}>
                           <CheckCircle2 className="mr-2 h-4 w-4" /> Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled={request.status !== 'Pending'} onClick={() => handleAction('Rejected')} className="text-destructive focus:text-destructive">
                           <XCircle className="mr-2 h-4 w-4" /> Reject
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>

                     <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Confirm Leave {action}</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to {action?.toLowerCase()} this leave request for {request.staff_name}?
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="grid gap-2">
                                <Label htmlFor="comments">Comments (Optional)</Label>
                                <Textarea 
                                    id="comments" 
                                    placeholder="Add any comments for the staff member..."
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                />
                            </div>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleConfirm}>Confirm</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            );
        },
  },
];
