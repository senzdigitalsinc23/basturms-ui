

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
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useState } from 'react';
import { StaffDisplay } from './staff-management';
import { PlusCircle, X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { DataTableFacetedFilter } from '../users/data-table-faceted-filter';
import { ALL_ROLES, User, ALL_EMPLOYMENT_STATUSES, Staff } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { AddStaffForm } from './add-staff-form';

interface StaffDataTableProps {
  columns: ColumnDef<StaffDisplay>[];
  data: StaffDisplay[];
  onAdd: (data: any) => void;
  onUpdate: (data: Staff) => void;
}

const roleOptions = ALL_ROLES.filter(r => r !== 'Student' && r !== 'Parent').map(role => ({
    value: role,
    label: role,
}));

const statusOptions = ALL_EMPLOYMENT_STATUSES.map(status => ({
    value: status,
    label: status,
}));


export function StaffDataTable({ columns, data, onAdd, onUpdate }: StaffDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

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
    initialState: {
        pagination: {
            pageSize: 7
        }
    },
    state: {
      sorting,
      columnFilters,
      globalFilter
    },
  });

  const isFiltered = table.getState().columnFilters.length > 0 || !!globalFilter;
  
  const handleAddSubmit = (values: any) => {
    onAdd(values);
    setIsAddFormOpen(false);
  }

  return (
    <div className="space-y-4">
       <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold font-headline">Staff List</h1>
                <p className="text-muted-foreground">Manage all staff members including teachers and administrators.</p>
            </div>
            <div className="flex items-center gap-2">
                <Dialog open={isAddFormOpen} onOpenChange={setIsAddFormOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm">
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Staff
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-4xl">
                        <DialogHeader>
                            <DialogTitle>Add New Staff Member</DialogTitle>
                            <DialogDescription>Fill in all details for the new staff.</DialogDescription>
                        </DialogHeader>
                        <AddStaffForm onSubmit={handleAddSubmit} />
                    </DialogContent>
                </Dialog>
                <Button size="sm" variant="outline">
                    <Download className="mr-2 h-4 w-4" /> Export
                </Button>
            </div>
        </div>

        <div className="flex items-center justify-between gap-2">
            <div className="flex flex-1 items-center space-x-2">
                 {table.getColumn("role") && (
                    <DataTableFacetedFilter
                    column={table.getColumn("role")}
                    title="Role"
                    options={roleOptions}
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
             <div className="flex items-center gap-2">
                <p className="text-sm font-medium">Rows:</p>
                <Select
                    value={`${table.getState().pagination.pageSize}`}
                    onValueChange={(value) => {
                        table.setPageSize(Number(value))
                    }}
                    >
                    <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue placeholder={table.getState().pagination.pageSize} />
                    </SelectTrigger>
                    <SelectContent side="top">
                        {[7, 10, 20, 30, 40, 50].map((pageSize) => (
                        <SelectItem key={pageSize} value={`${pageSize}`}>
                            {pageSize}
                        </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
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
                    <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    >
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
                    No results.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>
        </div>
        <div className="flex items-center justify-between py-4">
            <div className="text-sm text-muted-foreground">
              Showing {table.getRowModel().rows.length > 0 ? table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1 : 0} to {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of {table.getFilteredRowModel().rows.length} staff
            </div>
            <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">
                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
                </span>
                <div className="flex items-center space-x-2">
                    <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Previous
                    </Button>
                    <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    >
                    Next
                    <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    </div>
  );
}
