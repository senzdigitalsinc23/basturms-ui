'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuditLog } from '@/lib/types';
import { format } from 'date-fns';
import { Checkbox } from '../ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';


type ColumnsProps = {
  isSuperAdmin: boolean;
  onDelete: (logId: string) => void;
};


export const columns = ({ isSuperAdmin, onDelete }: ColumnsProps): ColumnDef<AuditLog>[] => {
  const columnDefs: ColumnDef<AuditLog>[] = [
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
    accessorKey: 'timestamp',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Timestamp
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue('timestamp'));
      return <div>{format(date, 'PPpp')}</div>;
    },
  },
  {
    accessorKey: 'name',
    header: 'User',
  },
  {
    accessorKey: 'user',
    header: 'User Email',
  },
  {
    accessorKey: 'action',
    header: 'Action',
  },
  {
    accessorKey: 'clientInfo',
    header: 'Client Info',
    cell: ({ row }) => {
        const info = row.getValue('clientInfo') as string || 'N/A';
        const shortInfo = info.split(') ').pop()?.split(' ')[0] || info;
        return <div className="max-w-[150px] truncate" title={info}>{shortInfo}</div>;
    }
  },
  {
    accessorKey: 'details',
    header: 'Details',
    cell: ({ row }) => {
      const details = row.getValue('details') as string;
      const clientInfo = row.original.clientInfo;
      return (
        <Dialog>
          <DialogTrigger asChild>
            <div className="max-w-xs truncate cursor-pointer hover:underline">
              {details}
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Log Details</DialogTitle>
              <DialogDescription>
                Full details for the selected log entry.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 text-sm">
                <div>
                    <h4 className="font-semibold mb-1">Details</h4>
                    <pre className="p-4 bg-muted rounded-md whitespace-pre-wrap break-words">
                        {details}
                    </pre>
                </div>
                 {clientInfo && <div>
                    <h4 className="font-semibold mb-1">Client Info</h4>
                    <pre className="p-4 bg-muted rounded-md whitespace-pre-wrap break-words">
                        {clientInfo}
                    </pre>
                </div>}
            </div>
          </DialogContent>
        </Dialog>
      );
    },
  },
];

  if (isSuperAdmin) {
    columnDefs.push({
      id: 'actions',
      cell: ({ row }) => {
        const log = row.original;
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
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Log
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete this log entry. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(log.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    });
  }

  return columnDefs;
};
