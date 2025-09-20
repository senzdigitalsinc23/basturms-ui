'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthLog } from '@/lib/types';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export const columns: ColumnDef<AuthLog>[] = [
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
      return <div className="font-medium">{format(date, 'PPpp')}</div>;
    },
  },
  {
    accessorKey: 'email',
    header: 'User Email',
  },
  {
    accessorKey: 'event',
    header: 'Event',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const variant = status === 'Success' ? 'secondary' : 'destructive';
      return <Badge variant={variant as any}>{status}</Badge>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
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
