
'use client';
import { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Asset, ALL_ASSET_CATEGORIES, ALL_ASSET_STATUSES } from '@/lib/types';
import { PlusCircle, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { DataTableFacetedFilter } from '@/components/users/data-table-faceted-filter';

interface DataTableProps {
  columns: ColumnDef<Asset>[];
  data: Asset[];
  onAdd: () => void;
}

const categoryOptions = ALL_ASSET_CATEGORIES.map(c => ({value: c, label: c}));
const statusOptions = ALL_ASSET_STATUSES.map(s => ({value: s, label: s}));

export function DataTable({ columns, data, onAdd }: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    state: { sorting, columnFilters },
  });
  
  const isFiltered = columnFilters.length > 0;

  return (
    <div className="space-y-4">
       <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold font-headline">Asset Register</h1>
                <p className="text-muted-foreground">A complete inventory of all school assets.</p>
            </div>
            <Button size="sm" onClick={onAdd}><PlusCircle className="mr-2 h-4 w-4" /> Add Asset</Button>
        </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
           <Input
                placeholder="Filter by asset name..."
                value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                    table.getColumn("name")?.setFilterValue(event.target.value)
                }
                className="h-8 w-[150px] lg:w-[250px]"
            />
             {table.getColumn("category") && (
                <DataTableFacetedFilter
                column={table.getColumn("category")}
                title="Category"
                options={categoryOptions}
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
                onClick={() => table.resetColumnFilters()}
                className="h-8 px-2 lg:px-3"
                >
                Reset
                <X className="ml-2 h-4 w-4" />
                </Button>
            )}
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No assets found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end py-4">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
