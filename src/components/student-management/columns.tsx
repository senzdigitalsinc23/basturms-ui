
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown, Pencil, UserX, Eye, ChevronsUpDown, ArrowLeft, FileBadge } from 'lucide-react';
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
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { StudentDisplay } from './student-management';
import { format } from 'date-fns';
import { AdmissionStatus, ALL_ADMISSION_STATUSES } from '@/lib/types';
import Link from 'next/link';


type ColumnsProps = {
    onUpdateStatus: (studentId: string, status: AdmissionStatus) => void;
};

const statusColors: Record<AdmissionStatus, string> = {
    Admitted: 'bg-green-100 text-green-800',
    Pending: 'bg-yellow-100 text-yellow-800',
    Withdrawn: 'bg-red-100 text-red-800',
    Graduated: 'bg-blue-100 text-blue-800',
    Suspended: 'bg-orange-100 text-orange-800',
    Transferred: 'bg-purple-100 text-purple-800',
    Stopped: 'bg-gray-100 text-gray-800',
};


export const columns = ({ onUpdateStatus }: ColumnsProps): ColumnDef<StudentDisplay>[] => [
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
        accessorKey: 'student_id',
        header: 'Student ID',
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
            const student = row.original;
            return (
                <Link href={`/student-management/students/${student.student_id}`} className="font-medium text-primary hover:underline">
                    {student.name}
                </Link>
            )
        }
    },
    {
        accessorKey: 'class_name',
        header: 'Class',
        cell: ({ row }) => {
            const className = row.getValue('class_name') as string;
            return <Badge variant="outline" className="font-normal">{className}</Badge>;
        }
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.getValue('status') as AdmissionStatus;
            const colorClass = statusColors[status] || 'bg-gray-100 text-gray-800';
            return <Badge variant="outline" className={`${colorClass} border-none`}>{status}</Badge>;
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
    },
    {
        accessorKey: 'admission_date',
        header: 'Admission Date',
        cell: ({ row }) => {
            const dateValue = row.getValue('admission_date') as string;
            if (!dateValue) return 'N/A';
            const date = new Date(dateValue);
            if (isNaN(date.getTime())) {
                return 'Invalid Date';
            }
            return <div>{format(date, "MMMM do, yyyy")}</div>;
        },
        filterFn: (row, id, value) => {
            const dateValue = row.getValue(id) as string;
            if (!dateValue) return false;
            const date = new Date(dateValue);
            if (isNaN(date.getTime())) return false;
            
            const [from, to] = value as [string, string];
            return date >= new Date(from) && date <= new Date(to);
        }
    },
    {
        id: 'actions',
        cell: function Cell({ row }) {
        const student = row.original;
        const generateUrl = `/id-cards?type=student&ids=${encodeURIComponent(JSON.stringify([student.student_id]))}`;


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
                        <Link href={`/student-management/students/${student.student_id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Profile
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={generateUrl}>
                            <FileBadge className="mr-2 h-4 w-4" />
                            Generate ID Card
                        </Link>
                    </DropdownMenuItem>
                     <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <ChevronsUpDown className="mr-2 h-4 w-4" />
                            Change Status
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                            {ALL_ADMISSION_STATUSES.map(status => (
                                <DropdownMenuItem 
                                    key={status}
                                    onClick={() => onUpdateStatus(student.student_id, status)}
                                    disabled={student.status === status}
                                >
                                    {status}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive focus:text-destructive">
                        <UserX className="mr-2 h-4 w-4" />
                        Suspend
                    </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
            </div>
        );
        },
  },
];
