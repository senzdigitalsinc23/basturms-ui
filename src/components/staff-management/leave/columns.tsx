
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown, CheckCircle2, XCircle, Clock, FileDown, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { LeaveRequest, LeaveStatus } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { format, formatDistanceStrict } from 'date-fns';
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
import { Checkbox } from '@/components/ui/checkbox';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { getSchoolProfile } from '@/lib/store';
import { useAuth } from '@/hooks/use-auth';


type ColumnsProps = {
    onUpdateStatus: (leaveId: string, status: LeaveStatus, comments: string) => void;
    onDelete: (leaveId: string) => void;
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

const handleDownload = (request: LeaveRequest) => {
    const doc = new jsPDF();
    const schoolProfile = getSchoolProfile();
    const schoolName = schoolProfile?.schoolName || 'CampusConnect School';
    
    doc.setFontSize(18);
    doc.text(`${schoolName}`, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.text("Staff Leave Endorsement Form", doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' });

    (doc as any).autoTable({
        startY: 40,
        body: [
            ['Staff Name', request.staff_name],
            ['Staff ID', request.staff_id],
            ['Leave Type', request.leave_type],
            ['Start Date', format(new Date(request.start_date), 'PPP')],
            ['End Date', format(new Date(request.end_date), 'PPP')],
            ['Reason', request.reason],
            ['Status', request.status],
            ['Approved By', request.approver_name || 'N/A'],
            ['Approval Comments', request.comments || 'N/A'],
        ],
        theme: 'grid'
    });

    const finalY = (doc as any).lastAutoTable.finalY;
    doc.setFontSize(12);
    doc.text("Headmaster/Administrator's Endorsement:", 14, finalY + 20);
    doc.line(14, finalY + 40, 100, finalY + 40); // Signature line
    doc.text("Signature & Stamp", 14, finalY + 45);

    doc.save(`Leave_Form_${request.staff_name.replace(' ', '_')}.pdf`);
}

export const columns = ({ onUpdateStatus, onDelete }: ColumnsProps): ColumnDef<LeaveRequest>[] => [
     {
        id: 'select',
        header: ({ table }) => (
        <Checkbox
            checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
        />
        ),
        cell: ({ row }) => (
        <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
        />
        ),
        enableSorting: false,
        enableHiding: false,
    },
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
        cell: ({ row }) => formatDistanceStrict(new Date(row.original.end_date), new Date(row.original.start_date), {
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
            const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
            const [action, setAction] = useState<LeaveStatus | null>(null);
            const [comments, setComments] = useState('');
            const { user } = useAuth();

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
            
            const handleDelete = () => {
                onDelete(request.id);
                setIsDeleteAlertOpen(false);
            }
            
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
                        <DropdownMenuSeparator />
                        <DropdownMenuItem disabled={request.status !== 'Approved'} onClick={() => handleDownload(request)}>
                            <FileDown className="mr-2 h-4 w-4" /> Download Form
                        </DropdownMenuItem>
                         {user?.is_super_admin && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setIsDeleteAlertOpen(true)} className="text-destructive focus:text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Request
                                </DropdownMenuItem>
                            </>
                         )}
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
                    
                    <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete this leave request. This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            );
        },
  },
];
