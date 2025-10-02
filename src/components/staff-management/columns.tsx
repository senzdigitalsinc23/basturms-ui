

'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown, Eye, Trash2, Pencil, UserCheck, UserX, FileBadge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Role, EmploymentStatus, Staff } from '@/lib/types';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { StaffDisplay } from './staff-management';
import Link from 'next/link';
import { format } from 'date-fns';
import { Checkbox } from '../ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';


type ColumnsProps = {
    onEdit: (staff: Staff) => void;
    onDelete: (staffId: string) => void;
    onToggleStatus: (staffId: string) => void;
};

const statusColors: Record<EmploymentStatus, string> = {
    Active: 'bg-green-100 text-green-800',
    'On-leave': 'bg-yellow-100 text-yellow-800',
    Inactive: 'bg-red-100 text-red-800',
};

export const columns = ({ onEdit, onDelete, onToggleStatus }: ColumnsProps): ColumnDef<StaffDisplay>[] => [
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
        accessorKey: 'staff_id',
        header: 'Staff ID',
        accessorFn: row => row.staff_id,
    },
    {
        accessorKey: 'name',
        header: ({ column }) => {
        return (
            <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        );
        },
        cell: ({ row }) => {
            const staffMember = row.original.staff;
            const user = row.original.user;
            const name = `${staffMember.first_name} ${staffMember.last_name}`;
            const userInitials = name
                .split(' ')
                .map((n) => n[0])
                .join('');
            return (
                 <Link href={`/staff-management/${row.original.staff_id}`} className="flex items-center gap-3 group">
                    <Avatar>
                        <AvatarImage src={user?.avatarUrl} alt={name} />
                        <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium group-hover:text-primary group-hover:underline">{name}</span>
                </Link>
            );
        },
    },
    {
        accessorKey: 'roles',
        header: 'Roles',
        accessorFn: row => (row.roles || []).join(', '),
        cell: ({ row }) => {
            const roles = row.original.roles;
            return <div className="flex flex-wrap gap-1">
                {(roles || []).map(role => <Badge key={role} variant="outline">{role}</Badge>)}
            </div>;
        },
        filterFn: (row, id, value) => {
            const roles = row.original.roles || [];
            return (value as string[]).some(val => roles.includes(val as Role));
        },
    },
    {
        accessorKey: 'status',
        header: 'Status',
        accessorFn: row => row.status,
        cell: ({ row }) => {
            const status = row.getValue('status') as EmploymentStatus;
            const colorClass = statusColors[status] || 'bg-gray-100 text-gray-800';
            return <Badge className={`${colorClass} border-none`}>{status}</Badge>;
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
    },
    {
        accessorKey: 'joining_date',
        header: 'Joining Date',
        accessorFn: row => row.joining_date,
        cell: ({ row }) => {
            const date = row.getValue('joining_date') as string;
            return date ? <div>{format(new Date(date), "MMMM do, yyyy")}</div> : 'N/A';
        },
    },
    {
        id: 'actions',
        cell: function Cell({ row }) {
            const staffDisplay = row.original;
            const generateUrl = `/id-cards?type=staff&ids=${encodeURIComponent(JSON.stringify([staffDisplay.staff_id]))}`;
            
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
                        <DropdownMenuItem asChild>
                            <Link href={`/staff-management/${staffDisplay.staff_id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Profile
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(staffDisplay.staff)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Staff
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                           <Link href={generateUrl}>
                                <FileBadge className="mr-2 h-4 w-4" />
                                Generate ID Card
                           </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onToggleStatus(staffDisplay.staff_id)}>
                            {staffDisplay.status === 'Active' ? <UserX className="mr-2 h-4 w-4" /> : <UserCheck className="mr-2 h-4 w-4" />}
                            {staffDisplay.status === 'Active' ? 'Deactivate' : 'Activate'} Staff
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Staff
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                             <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently delete the staff member and their associated user account. This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => onDelete(staffDisplay.staff_id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
  },
];
