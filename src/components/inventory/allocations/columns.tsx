'use client';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown, Trash2, User, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AssetAllocation } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { format } from 'date-fns';

type ColumnsProps = {
    onDelete: (allocationId: string) => void;
};

export const columns = ({ onDelete }: ColumnsProps): ColumnDef<AssetAllocation>[] => [
    {
        accessorKey: 'assetName',
        header: 'Asset',
    },
    {
        accessorKey: 'quantity',
        header: 'Quantity',
    },
    {
        accessorKey: 'allocatedToName',
        header: 'Allocated To',
    },
    {
        accessorKey: 'allocationType',
        header: 'Type',
        cell: ({ row }) => {
            const isStaff = row.original.allocationType === 'Staff';
            return (
                <Badge variant="outline" className="flex items-center gap-1 w-fit">
                    {isStaff ? <User className="h-3 w-3" /> : <Users className="h-3 w-3" />}
                    {row.original.allocationType}
                </Badge>
            )
        }
    },
    {
        accessorKey: 'date',
        header: 'Allocation Date',
        cell: ({ row }) => format(new Date(row.original.date), 'PPP')
    },
    {
        accessorKey: 'condition',
        header: 'Condition',
    },
    {
        id: 'actions',
        cell: function Cell({ row }) {
            const allocation = row.original;
            return (
                 <div className="text-right">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                                <Trash2 className="mr-2 h-4 w-4" /> Recall
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will recall the asset "{allocation.assetName}" from {allocation.allocatedToName} and set its status back to "In Stock".
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDelete(allocation.id)}>Confirm Recall</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            )
        }
    }
];
