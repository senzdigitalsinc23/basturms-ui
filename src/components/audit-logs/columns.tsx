'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuditLog } from '@/lib/types';
import { format } from 'date-fns';

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
        return <div>{format(date, "PPpp")}</div>;
    }
  },
  {
    accessorKey: 'user',
    header: 'User',
  },
  {
    accessorKey: 'action',
    header: 'Action',
  },
  {
    accessorKey: 'details',
    header: 'Details',
    cell: ({ row }) => {
        return <div className="max-w-xs truncate">{row.getValue('details')}</div>
    }
  },
];
