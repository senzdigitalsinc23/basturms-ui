

'use client';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  ColumnFiltersState,
  getSortedRowModel,
  SortingState,
  getFacetedRowModel,
  getFacetedUniqueValues,
  RowSelectionState,
  PaginationState,
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
import { Label } from '../ui/label';
import React, { useEffect, useRef, useState } from 'react';
import { StudentDisplay } from './student-management';
import { FilePlus, PlusCircle, Upload, Download, Calendar as CalendarIcon, X, ChevronLeft, ChevronRight, ChevronsUpDown, Trash2, FileDown, FileBadge, FileText, Loader2, RefreshCw } from 'lucide-react';
import { DataTableFacetedFilter } from '../users/data-table-faceted-filter';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ALL_ADMISSION_STATUSES, AdmissionStatus, Class } from '@/lib/types';
import { ExportFieldSelector } from './export-field-selector';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { DateRange } from 'react-day-picker';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';

interface StudentDataTableProps {
  columns: ColumnDef<StudentDisplay>[];
  data: StudentDisplay[];
  classes: Class[];
  onImport: (file: File) => void;
  onBulkUpdateStatus: (studentIds: string[], status: AdmissionStatus) => void;
  onBulkDelete: (studentIds: string[]) => void;
  onExportExcel: (selectedIds: string[], fieldIds: string[]) => void;
  onExportPDF: (fieldIds: string[], selectedIds: string[]) => void;
  onRefresh: () => void;
  pagination: PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
  pageCount: number;
  totalRecords: number;
  isLoading: boolean;
  isImportLoading?: boolean;
  isSuperAdmin?: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter?: string;
  setStatusFilter?: (status: string | undefined) => void;
  dateRange?: { from?: Date; to?: Date };
  setDateRange?: (range: { from?: Date; to?: Date } | undefined) => void;
}

const statusOptions = ALL_ADMISSION_STATUSES.map(status => ({
  value: status,
  label: status
}));


export function StudentDataTable({
  columns,
  data,
  classes,
  onImport,
  onBulkUpdateStatus,
  onBulkDelete,
  onExportExcel,
  onExportPDF,
  onRefresh,
  pagination,
  setPagination,
  pageCount,
  totalRecords,
  isLoading,
  isImportLoading = false,
  isSuperAdmin = false,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  dateRange: propDateRange,
  setDateRange: setPropDateRange,
}: StudentDataTableProps) {
  const { toast } = useToast();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [date, setDate] = useState<DateRange | undefined>(propDateRange ? { from: propDateRange.from, to: propDateRange.to } : undefined)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportMode, setExportMode] = useState<'excel' | 'pdf'>('excel');


  const table = useReactTable({
    data,
    columns,
    pageCount: pageCount,
    onPaginationChange: setPagination,
    manualPagination: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onRowSelectionChange: setRowSelection,
    manualFiltering: true, // Server-side filtering
    state: {
      sorting,
      columnFilters,
      rowSelection,
      pagination,
    },
  });

  // Use a ref to track if we're updating from user action to prevent loops
  const isUserUpdateRef = React.useRef(false);

  // Sync local date state with prop only when prop changes externally (not from user action)
  useEffect(() => {
    // Skip if this update came from user action
    if (isUserUpdateRef.current) {
      isUserUpdateRef.current = false;
      return;
    }

    // Compare dates properly to avoid infinite loops
    const datesEqual = (d1: Date | undefined, d2: Date | undefined): boolean => {
      if (!d1 && !d2) return true;
      if (!d1 || !d2) return false;
      return d1.getTime() === d2.getTime();
    };

    const propFrom = propDateRange?.from;
    const propTo = propDateRange?.to;
    const localFrom = date?.from;
    const localTo = date?.to;

    const areEqual = datesEqual(propFrom, localFrom) && datesEqual(propTo, localTo);

    // Only update if they're actually different
    if (!areEqual) {
      if (propDateRange) {
        setDate({ from: propDateRange.from, to: propDateRange.to });
      } else {
        setDate(undefined);
      }
    }
  }, [propDateRange]);

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedStudentIds = selectedRows.map(row => row.original.student_id);

  useEffect(() => {
    const statusColumn = table.getColumn('status');
    if (!statusColumn) return;
    const desiredValue = statusFilter ? [statusFilter] : undefined;
    const currentValue = statusColumn.getFilterValue() as string[] | undefined;
    const isSame =
      (!desiredValue && !currentValue) ||
      (desiredValue &&
        currentValue &&
        desiredValue.length === currentValue.length &&
        desiredValue.every((value, index) => value === currentValue[index]));
    if (!isSame) {
      statusColumn.setFilterValue(desiredValue);
    }
  }, [statusFilter, table]);

  const isFiltered = table.getState().columnFilters.length > 0;
  const isDateFiltered = !!date;

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.name.toLowerCase().endsWith('.csv')) {
        toast({
          variant: 'destructive',
          title: 'Invalid File Type',
          description: 'Please select a CSV file.',
        });
        return;
      }

      setSelectedFile(file);
      setIsConfirmDialogOpen(true);

      // Clear the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleConfirmImport = async () => {
    if (selectedFile) {
      await onImport(selectedFile);
      setSelectedFile(null);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = [
      'enrollment_date', 'class_assigned', 'admission_status', 'first_name', 'last_name', 'other_name', 'dob', 'gender', 'nhis_number',
      'email', 'phone', 'country', 'city', 'hometown', 'residence', 'house_no', 'gps_no',
      'guardian_name', 'guardian_phone', 'guardian_email', 'guardian_relationship',
      'father_name', 'father_phone', 'father_email',
      'mother_name', 'mother_phone', 'mother_email',
      'emergency_name', 'emergency_phone', 'emergency_relationship'
    ];
    const csv = Papa.unparse([headers]);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'student_upload_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmBulkDelete = () => {
    onBulkDelete(selectedStudentIds);
    table.resetRowSelection();
    setIsDeleteAlertOpen(false);
  }

  const handleBulkStatusUpdate = (status: AdmissionStatus) => {
    onBulkUpdateStatus(selectedStudentIds, status);
    table.resetRowSelection();
  }

  const bulkGenerateUrl = `/id-cards?type=student&ids=${encodeURIComponent(JSON.stringify(selectedStudentIds))}`;
  const bulkGenerateReportUrl = `/student-management/reports?student_ids=${encodeURIComponent(JSON.stringify(selectedStudentIds))}`;


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-headline">Student List</h1>
          <p className="text-muted-foreground">Manage and view the list of all students.</p>
        </div>
        <div className="flex items-center gap-2">
          <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleFileUpload} />

          <Button variant="outline" size="sm" onClick={handleDownloadTemplate}><FileDown className="mr-2 h-4 w-4" /> CSV Template</Button>

          <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button variant="outline" className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200" onClick={handleImportClick} size="sm"><Upload className="mr-2 h-4 w-4" /> Import</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200" size="sm">
                <Download className="mr-2 h-4 w-4" /> Export <ChevronsUpDown className="ml-2 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => { setExportMode('excel'); setIsExportDialogOpen(true); }}>
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setExportMode('pdf'); setIsExportDialogOpen(true); }}>
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button asChild size="sm">
            <Link href="/student-management/add">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Student
            </Link>
          </Button>
        </div>
      </div>
      <ExportFieldSelector
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        title={exportMode === 'excel' ? 'Export to Excel' : 'Export to PDF'}
        description={exportMode === 'excel' ? 'Select columns for your Excel spreadsheet.' : 'Select columns for your PDF report.'}
        buttonLabel={exportMode === 'excel' ? 'Export Excel' : 'Export PDF'}
        onExport={(fields) => {
          if (exportMode === 'excel') {
            onExportExcel(selectedStudentIds, fields);
          } else {
            onExportPDF(fields, selectedStudentIds);
          }
        }}
      />
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Search by name, ID, class or email..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
            className="h-8 w-[150px] lg:w-[250px]"
          />
          {table.getColumn("status") && (
            <DataTableFacetedFilter
              column={table.getColumn("status")}
              title="Status"
              options={statusOptions}
              value={statusFilter ? [statusFilter] : []}
              onValueChange={(values) => {
                const status = values.length > 0 ? values[0] : undefined;
                if (setStatusFilter) {
                  setStatusFilter(status);
                }
                table.getColumn("status")?.setFilterValue(values.length > 0 ? values : undefined);
              }}
            />
          )}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[300px] justify-start text-left font-normal h-8",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4" align="start">
              <div className="space-y-4">
                {/* Manual date entry */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="from-date" className="text-sm font-medium">From</Label>
                    <Input
                      id="from-date"
                      type="date"
                      value={date?.from ? format(date.from, 'yyyy-MM-dd') : ''}
                      onChange={(e) => {
                        const selectedDate = e.target.value ? new Date(e.target.value) : undefined;
                        isUserUpdateRef.current = true;
                        const newDate = {
                          from: selectedDate,
                          to: date?.to
                        };
                        setDate(newDate);
                        if (setPropDateRange) {
                          setPropDateRange(newDate.from || newDate.to ? newDate : undefined);
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="to-date" className="text-sm font-medium">To</Label>
                    <Input
                      id="to-date"
                      type="date"
                      value={date?.to ? format(date.to, 'yyyy-MM-dd') : ''}
                      onChange={(e) => {
                        const selectedDate = e.target.value ? new Date(e.target.value) : undefined;
                        isUserUpdateRef.current = true;
                        const newDate = {
                          from: date?.from,
                          to: selectedDate
                        };
                        setDate(newDate);
                        if (setPropDateRange) {
                          setPropDateRange(newDate.from || newDate.to ? newDate : undefined);
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Calendar picker */}
                <div className="border-t pt-4">
                  <Calendar
                    initialFocus
                    mode="range"
                    selected={date}
                    onSelect={(newDate) => {
                      isUserUpdateRef.current = true; // Mark as user update
                      // Ensure from date is not after to date
                      if (newDate?.from && newDate?.to && newDate.from > newDate.to) {
                        // If from is after to, swap them
                        setDate({ from: newDate.to, to: newDate.from });
                        if (setPropDateRange) {
                          setPropDateRange({ from: newDate.to, to: newDate.from });
                        }
                      } else {
                        setDate(newDate);
                        // Update parent immediately when user selects a date
                        if (setPropDateRange) {
                          setPropDateRange(newDate ? { from: newDate.from, to: newDate.to } : undefined);
                        }
                      }
                    }}
                    numberOfMonths={2}
                    captionLayout="dropdown-buttons"
                    fromYear={1990}
                    toYear={new Date().getFullYear()}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
          {(isFiltered || isDateFiltered || searchTerm || statusFilter) && (
            <Button
              variant="ghost"
              onClick={() => {
                table.resetColumnFilters();
                setSearchTerm('');
                setDate(undefined);
                if (setStatusFilter) {
                  setStatusFilter(undefined);
                }
                // Also reset the parent date range
                if (setPropDateRange) {
                  setPropDateRange(undefined);
                }
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
                <DropdownMenuItem asChild>
                  <Link href={bulkGenerateUrl}>
                    <FileBadge className="mr-2 h-4 w-4" /> Generate ID Cards
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={bulkGenerateReportUrl}>
                    <FileText className="mr-2 h-4 w-4" /> Generate Report Cards
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setExportMode('excel'); setIsExportDialogOpen(true); }}>
                  Export Selected (Excel)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setExportMode('pdf'); setIsExportDialogOpen(true); }}>
                  Export Selected (PDF)
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Change Status</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {ALL_ADMISSION_STATUSES
                      .filter(status => {
                        // Hide status if all selected students already have this status
                        const allHaveThisStatus = selectedRows.length > 0 &&
                          selectedRows.every(row => row.original.status === status);
                        return !allHaveThisStatus;
                      })
                      .map(status => (
                        <DropdownMenuItem
                          key={status}
                          onClick={() => handleBulkStatusUpdate(status)}
                        >
                          {status}
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                {isSuperAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete Selected
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the selected student profiles.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleConfirmBulkDelete}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex justify-center items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <p>Loading students...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
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
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">
            Page {pagination.pageIndex + 1} of {pageCount || 1}
          </span>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">Rows:</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                setPagination(prev => ({ pageIndex: 0, pageSize: Number(value) }));
              }}
            >
              <SelectTrigger className="h-8 w-[80px]">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 50, 100].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
                <SelectItem value={totalRecords.toString()}>All</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex - 1 }))}
              disabled={pagination.pageIndex === 0}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex + 1 }))}
              disabled={pagination.pageIndex >= pageCount - 1}
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Student Import</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to import students from "{selectedFile?.name}"?
              This will upload the CSV file to the server for processing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isImportLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmImport} disabled={isImportLoading}>
              {isImportLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                'Import Students'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
