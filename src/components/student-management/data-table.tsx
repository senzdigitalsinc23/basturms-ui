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
import { useEffect, useRef, useState } from 'react';
import { StudentDisplay } from './student-management';
import { FilePlus, PlusCircle, Upload, Download, Calendar as CalendarIcon, X, ChevronLeft, ChevronRight, ChevronsUpDown } from 'lucide-react';
import { DataTableFacetedFilter } from '../users/data-table-faceted-filter';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import Papa from 'papaparse';
import { ImportPreviewDialog } from './import-preview-dialog';
import { ALL_ADMISSION_STATUSES, Class } from '@/lib/types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { DateRange } from 'react-day-picker';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { StudentForm } from './student-form';


interface StudentDataTableProps {
  columns: ColumnDef<StudentDisplay>[];
  data: StudentDisplay[];
  classes: Class[];
  onImport: (data: any[]) => void;
  onAdd: (profile: any) => void;
}

const statusOptions = ALL_ADMISSION_STATUSES.map(status => ({
    value: status,
    label: status
}));


export function StudentDataTable({ columns, data, classes, onImport, onAdd }: StudentDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [date, setDate] = useState<DateRange | undefined>()
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
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
    state: {
      sorting,
      columnFilters,
      globalFilter
    },
  });

  useEffect(() => {
    if (date?.from && date?.to) {
        table.getColumn('admission_date')?.setFilterValue([date.from.toISOString(), date.to.toISOString()]);
    } else {
        table.getColumn('admission_date')?.setFilterValue(undefined);
    }
  }, [date, table]);

  const isFiltered = table.getState().columnFilters.length > 0 || !!globalFilter;
  const isDateFiltered = !!date;

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setPreviewData(results.data);
          setIsPreviewOpen(true);
           if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        },
        error: (error: any) => {
          console.error("Error parsing CSV:", error);
        }
      });
    }
  };

  const handleConfirmImport = () => {
    onImport(previewData);
    setIsPreviewOpen(false);
    setPreviewData([]);
  };

  const handleDownloadTemplate = () => {
    const headers = [
      'enrollment_date', 'class_assigned', 'admission_status', 'first_name', 'last_name', 'other_name', 'dob', 'gender',
      'email', 'phone', 'country_id', 'city', 'hometown', 'residence',
      'guardian_name', 'guardian_phone', 'guardian_email', 'guardian_relationship',
      'emergency_name', 'emergency_phone', 'emergency_email', 'emergency_relationship'
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

  const handleExportCSV = () => {
    const dataToExport = table.getFilteredRowModel().rows.map(row => row.original);
    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'students.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const dataColumns = columns.filter(col => col.id !== 'select' && col.id !== 'actions' && col.accessorKey);
    
    const headers = dataColumns.map(col => {
        // A simple way to get header text, might need adjustment for complex headers
        const header = col.header;
        if(typeof header === 'string') return header;
        // Fallback for function headers - might need a better mapping
        return col.id || '';
    });

    const body = table.getFilteredRowModel().rows.map(row => {
        return dataColumns.map(col => {
             const accessor = col.accessorKey as keyof StudentDisplay;
             let cellValue = row.original[accessor] as any;
             if (col.id === 'admission_date' && typeof cellValue === 'string') {
                 return format(new Date(cellValue), 'yyyy-MM-dd');
             }
             return cellValue;
        });
    });

    autoTable(doc, {
        head: [headers],
        body: body,
    });
    doc.save('students.pdf');
  };


  return (
    <div className="space-y-4">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold font-headline">Student List</h1>
                <p className="text-muted-foreground">Manage and view the list of all students.</p>
            </div>
            <div className="flex items-center gap-2">
                 <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleFileUpload} />
                 <Button variant="outline" onClick={handleDownloadTemplate}><FilePlus className="mr-2 h-4 w-4" /> Template</Button>
                 <Button variant="outline" className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200" onClick={handleImportClick}><Upload className="mr-2 h-4 w-4" /> Import</Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200">
                      <Download className="mr-2 h-4 w-4" /> Export <ChevronsUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={handleExportCSV}>Export as CSV</DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportPDF}>Export as PDF</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                 <Dialog open={isAddFormOpen} onOpenChange={setIsAddFormOpen}>
                    <DialogTrigger asChild>
                        <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Student</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Add New Student</DialogTitle>
                            <DialogDescription>
                                Fill in the details to create a new student profile.
                            </DialogDescription>
                        </DialogHeader>
                        <StudentForm
                            classes={classes}
                            onSubmit={(values) => {
                                onAdd(values);
                                setIsAddFormOpen(false);
                            }}
                        />
                    </DialogContent>
                </Dialog>
            </div>
        </div>

        <div className="flex items-center justify-between gap-2">
            <div className="flex flex-1 items-center space-x-2">
                <Input
                    placeholder="Search by name or ID..."
                    value={globalFilter ?? ''}
                    onChange={(event) =>
                        setGlobalFilter(event.target.value)
                    }
                    className="h-8 w-[150px] lg:w-[250px]"
                />
                {table.getColumn("status") && (
                    <DataTableFacetedFilter
                    column={table.getColumn("status")}
                    title="Status"
                    options={statusOptions}
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
                    <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                    />
                    </PopoverContent>
                </Popover>
                {(isFiltered || isDateFiltered) && (
                    <Button
                    variant="ghost"
                    onClick={() => {
                        table.resetColumnFilters();
                        setGlobalFilter('');
                        setDate(undefined);
                    }}
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
                Showing {table.getRowModel().rows.length > 0 ? table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1 : 0} to {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of {table.getFilteredRowModel().rows.length} students
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
        <ImportPreviewDialog 
            isOpen={isPreviewOpen}
            onClose={() => setIsPreviewOpen(false)}
            onConfirm={handleConfirmImport}
            data={previewData}
        />
    </div>
  );
}
