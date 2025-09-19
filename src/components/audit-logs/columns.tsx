'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuditLog } from '@/lib/types';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export const columns: ColumnDef<AuditLog>[] = [
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
    accessorKey: 'details',
    header: 'Details',
    cell: ({ row }) => {
      const details = row.getValue('details') as string;
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
            <div className="space-y-4">
                <pre className="p-4 bg-muted rounded-md text-sm whitespace-pre-wrap break-words">
                    {details}
                </pre>
            </div>
          </DialogContent>
        </Dialog>
      );
    },
  },
];
