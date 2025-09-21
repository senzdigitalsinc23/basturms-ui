

'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown, Eye, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Role, EmploymentStatus, ALL_EMPLOYMENT_STATUSES } from '@/lib/types';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { StaffDisplay } from './staff-management';
import Link from 'next/link';
import { format } from 'date-fns';
import { Checkbox } from '../ui/checkbox';


type ColumnsProps = {
    // onUpdateStatus: (userId: string, status: 'active' | 'frozen') => void;
};

const statusColors: Record<EmploymentStatus, string> = {
    Active: 'bg-green-100 text-green-800',
    'On-leave': 'bg-yellow-100 text-yellow-800',
    Inactive: 'bg-red-100 text-red-800',
};

export const columns = ({ }: ColumnsProps): ColumnDef<StaffDisplay>[] => [
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
            const user = row.original.user;
            const userInitials = user.name
                .split(' ')
                .map((n) => n[0])
                .join('');
            return (
                 <Link href={`/staff-management/${row.original.staff_id}`} className="flex items-center gap-3 group">
                    <Avatar>
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium group-hover:text-primary group-hover:underline">{user.name}</span>
                </Link>
            );
        },
    },
    {
        accessorKey: 'role',
        header: 'Role',
        accessorFn: row => row.user.role,
        cell: ({ row }) => {
            const role = row.getValue('role') as Role;
            return <Badge variant="outline">{role}</Badge>;
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
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
            const staff = row.original;
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
                            <Link href={`/staff-management/${staff.staff_id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Profile
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
  },
];
