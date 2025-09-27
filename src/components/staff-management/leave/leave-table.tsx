
'use client';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
  ColumnFiltersState,
  getSortedRowModel,
  SortingState,
  getFacetedRowModel,
  getFacetedUniqueValues,
  RowSelectionState,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { LeaveRequest, ALL_LEAVE_TYPES, ALL_LEAVE_STATUSES, LeaveStatus } from '@/lib/types';
import { PlusCircle, X, ChevronsUpDown } from 'lucide-react';
import { DataTableFacetedFilter } from '@/components/users/data-table-faceted-filter';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface DataTableProps {
  columns: ColumnDef<LeaveRequest>[];
  data: LeaveRequest[];
  onOpenRequestForm: () => void;
  onBulkUpdateStatus: (leaveIds: string[], status: LeaveStatus, comments: string) => void;
}

const typeOptions = ALL_LEAVE_TYPES.map(t => ({ value: t, label: t }));
const statusOptions = ALL_LEAVE_STATUSES.map(s => ({ value: s, label: s }));

export function DataTable({ columns, data, onOpenRequestForm, onBulkUpdateStatus }: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<LeaveStatus | null>(null);
  const [bulkComments, setBulkComments] = useState('');

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      rowSelection
    },
  });

  const isFiltered = table.getState().columnFilters.length > 0 || !!globalFilter;
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedLeaveIds = selectedRows.map(row => row.original.id);
  
  const handleBulkAction = (status: LeaveStatus) => {
      setBulkAction(status);
      setIsAlertOpen(true);
  }
  
  const handleConfirmBulkAction = () => {
    if (bulkAction) {
        onBulkUpdateStatus(selectedLeaveIds, bulkAction, bulkComments);
        table.resetRowSelection();
        setIsAlertOpen(false);
        setBulkComments('');
        setBulkAction(null);
    }
  }

  return (
    <div className="space-y-4">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold font-headline">Leave Management</h1>
                <p className="text-muted-foreground">Approve, reject, and manage all staff leave requests.</p>
            </div>
            <Button size="sm" onClick={onOpenRequestForm}>
                <PlusCircle className="mr-2 h-4 w-4" /> Request Leave
            </Button>
        </div>

        <div className="flex items-center justify-between gap-2">
            <div className="flex flex-1 items-center space-x-2">
                <Input
                    placeholder="Search by staff name..."
                    value={globalFilter ?? ''}
                    onChange={(event) => setGlobalFilter(event.target.value)}
                    className="h-8 w-[150px] lg:w-[250px]"
                />
                 {table.getColumn("leave_type") && (
                    <DataTableFacetedFilter
                    column={table.getColumn("leave_type")}
                    title="Leave Type"
                    options={typeOptions}
                    />
                )}
                 {table.getColumn("status") && (
                    <DataTableFacetedFilter
                    column={table.getColumn("status")}
                    title="Status"
                    options={statusOptions}
                    />
                )}
                {isFiltered && (
                    <Button
                    variant="ghost"
                    onClick={() => {
                        table.resetColumnFilters();
                        setGlobalFilter('');
                    }}
                    className="h-8 px-2 lg:px-3"
                    >
                    Reset
                    <X className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>
             {selectedRows.length > 0 && (
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{selectedRows.length} selected</span>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">Bulk Actions <ChevronsUpDown className="ml-2 h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onSelect={() => handleBulkAction('Approved')}>
                                Approve Selected
                            </DropdownMenuItem>
                             <DropdownMenuItem onSelect={() => handleBulkAction('Rejected')} className="text-destructive focus:text-destructive">
                                Reject Selected
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}
        </div>
        <div className="rounded-md border">
            <Table>
            <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                    return (
                        <TableHead key={header.id}>
                        {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                            )}
                        </TableHead>
                    );
                    })}
                </TableRow>
                ))}
            </TableHeader>
            <TableBody>
                {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                        {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                        )}
                        </TableCell>
                    ))}
                    </TableRow>
                ))
                ) : (
                <TableRow>
                    <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                    >
                    No leave requests found.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>
        </div>
        <div className="flex items-center justify-end py-4">
            <div className="flex items-center space-x-2">
                <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                >
                Previous
                </Button>
                <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                >
                Next
                </Button>
            </div>
        </div>
        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Bulk {bulkAction}</AlertDialogTitle>
                    <AlertDialogDescription>
                        You are about to {bulkAction?.toLowerCase()} {selectedLeaveIds.length} leave request(s).
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="grid gap-2">
                    <Label htmlFor="comments">Comments (Optional)</Label>
                    <Textarea 
                        id="comments" 
                        placeholder="Add comments for the staff members..."
                        value={bulkComments}
                        onChange={(e) => setBulkComments(e.target.value)}
                    />
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmBulkAction}>Confirm</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
