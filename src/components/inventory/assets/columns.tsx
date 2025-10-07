
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown, Trash2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Asset, AssetStatus, AssetCondition } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { format } from 'date-fns';

type ColumnsProps = {
    onEdit: (asset: Asset) => void;
    onDelete: (assetId: string) => void;
};

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(amount);

export const columns = ({ onEdit, onDelete }: ColumnsProps): ColumnDef<Asset>[] => [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
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
        accessorKey: 'name',
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                Name <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
    },
    {
        accessorKey: 'category',
        header: 'Category',
        filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
        accessorKey: 'purchaseCost',
        header: 'Cost',
        cell: ({ row }) => formatCurrency(row.original.purchaseCost),
    },
     {
        accessorKey: 'purchaseDate',
        header: 'Purchase Date',
        cell: ({ row }) => format(new Date(row.original.purchaseDate), 'PPP'),
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <Badge variant="secondary">{row.original.status}</Badge>,
        filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
        accessorKey: 'condition',
        header: 'Condition',
        filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
        id: 'actions',
        cell: function Cell({ row }) {
            const asset = row.original;
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
                            <DropdownMenuItem onClick={() => onEdit(asset)}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will permanently delete the asset "{asset.name}".
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => onDelete(asset.id)}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        }
    }
];
