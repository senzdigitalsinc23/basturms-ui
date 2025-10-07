'use client';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown, Trash2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Asset, AssetStatus, AssetCategory } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

type ColumnsProps = {
    onEdit: (asset: Asset) => void;
    onDelete: (assetId: string) => void;
};

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(amount);

const statusColors: Record<AssetStatus, string> = {
    'In Stock': 'bg-blue-100 text-blue-800',
    'Allocated': 'bg-green-100 text-green-800',
    'In Repair': 'bg-yellow-100 text-yellow-800',
    'Disposed': 'bg-red-100 text-red-800',
};


export const columns = ({ onEdit, onDelete }: ColumnsProps): ColumnDef<Asset>[] => [
    {
        accessorKey: 'name',
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                Asset Name <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => <div className="font-medium">{row.original.name}</div>
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
        cell: ({ row }) => {
            const status = row.original.status;
            return <Badge className={`${statusColors[status]} border-none`}>{status}</Badge>;
        },
        filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
        accessorKey: 'currentLocation',
        header: 'Location',
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
                            <DropdownMenuItem onClick={() => onDelete(asset.id)} className="text-destructive focus:text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    }
];
