'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown, UserX, UserCheck, KeyRound, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { User, Role } from '@/lib/types';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { UserForm } from './user-form';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { ResetPasswordForm } from './reset-password-form';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Checkbox } from '../ui/checkbox';


type ColumnsProps = {
  onUpdate: (user: User) => void;
  onToggleStatus: (userId: string) => void;
  onResetPassword: (userId: string, newPassword: string) => boolean;
  onDelete: (userId: string) => void;
};

export const columns = ({
  onUpdate,
  onToggleStatus,
  onResetPassword,
  onDelete,
}: ColumnsProps): ColumnDef<User>[] => [
   {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
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
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const user = row.original;
      const userInitials = user.name
        .split(' ')
        .map((n) => n[0])
        .join('');
      return (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{user.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
      const role = row.getValue('role') as Role;
      const variants = {
        Admin: 'default',
        Teacher: 'secondary',
        Student: 'secondary',
        Parent: 'outline',
        Headmaster: 'destructive',
        Librarian: 'secondary',
        Security: 'destructive',
      };
      
      const variant = variants[role as keyof typeof variants] || 'outline';

      return <Badge variant={variant as any}>{role}</Badge>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <Badge variant={status === 'active' ? 'secondary' : 'destructive'}>
          {status}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id: 'actions',
    cell: function Cell({ row }) {
      const user = row.original;
      const { toast } = useToast();
      const { user: currentUser } = useAuth();
      const [isEditFormOpen, setIsEditFormOpen] = useState(false);
      const [isResetPasswordFormOpen, setIsResetPasswordFormOpen] = useState(false);
      const [isFreezeAlertOpen, setIsFreezeAlertOpen] = useState(false);
      const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);


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
                <DropdownMenuItem onClick={() => setIsEditFormOpen(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsResetPasswordFormOpen(true)}>
                  <KeyRound className="mr-2 h-4 w-4" />
                  Reset Password
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setIsFreezeAlertOpen(true)}
                    className={user.status === 'active' ? 'text-destructive focus:text-destructive' : ''}
                  >
                    {user.status === 'active' ? (
                      <UserX className="mr-2 h-4 w-4" />
                    ) : (
                      <UserCheck className="mr-2 h-4 w-4" />
                    )}
                    <span>{user.status === 'active' ? 'Freeze' : 'Unfreeze'} Account</span>
                  </DropdownMenuItem>
                   {currentUser?.is_super_admin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setIsDeleteAlertOpen(true)} className="text-destructive focus:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete User
                      </DropdownMenuItem>
                    </>
                   )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={isEditFormOpen} onOpenChange={setIsEditFormOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                    <DialogTitle>Edit User Profile</DialogTitle>
                    <DialogDescription>
                        Make changes to {user.name}'s profile here.
                    </DialogDescription>
                    </DialogHeader>
                    <UserForm
                    isEditMode={true}
                    defaultValues={user}
                    onSubmit={(values) => {
                        onUpdate({ ...user, ...values });
                        setIsEditFormOpen(false);
                    }}
                    />
                </DialogContent>
            </Dialog>
            
            <Dialog open={isResetPasswordFormOpen} onOpenChange={setIsResetPasswordFormOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                    <DialogTitle>Reset Password</DialogTitle>
                    <DialogDescription>
                        Enter a new password for {user.name}.
                    </DialogDescription>
                    </DialogHeader>
                    <ResetPasswordForm 
                    onSubmit={(values) => {
                        const success = onResetPassword(user.id, values.password);
                        if (success) {
                        toast({
                            title: 'Password Reset',
                            description: `Password for ${user.name} has been reset successfully.`,
                        });
                        setIsResetPasswordFormOpen(false);
                        } else {
                        toast({
                            variant: 'destructive',
                            title: 'Error',
                            description: 'Failed to reset password.',
                        });
                        }
                    }} 
                    />
                </DialogContent>
            </Dialog>

            <AlertDialog open={isFreezeAlertOpen} onOpenChange={setIsFreezeAlertOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will {user.status === 'active' ? 'freeze' : 'unfreeze'} the user's account.
                      Frozen accounts cannot be used to log in.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onToggleStatus(user.id)}>
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to delete this user?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the user account for {user.name}.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(user.id)}>
                      Delete User
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
      );
    },
  },
];
