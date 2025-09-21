
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Role } from '@/lib/types';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { StaffDisplay } from './staff-management';
import Link from 'next/link';
import { format } from 'date-fns';


type ColumnsProps = {
    // onUpdateStatus: (userId: string, status: 'active' | 'frozen') => void;
};

export const columns = ({ }: ColumnsProps): ColumnDef<StaffDisplay>[] => [
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
                <div className="flex items-center gap-3">
                <Avatar>
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{user.name}</span>
                </div>
            );
        },
    },
    {
        accessorKey: 'email',
        header: 'Email',
        accessorFn: row => row.user.email,
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
        accessorKey: 'hire_date',
        header: 'Hire Date',
        accessorFn: row => row.profile?.employmentDetails.hire_date,
        cell: ({ row }) => {
            const date = row.getValue('hire_date') as string;
            return date ? <div>{format(new Date(date), "MMMM do, yyyy")}</div> : 'N/A';
        },
    },
    {
        accessorKey: 'status',
        header: 'Status',
        accessorFn: row => row.user.status,
        cell: ({ row }) => {
            const status = row.getValue('status') as string;
            return (
                <Badge variant={status === 'active' ? 'secondary' : 'destructive'}>
                {status}
                </Badge>
            );
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
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
                            <Link href={`/users/${staff.user.id}`}>
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
