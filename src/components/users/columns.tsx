'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown, UserX, UserCheck, KeyRound } from 'lucide-react';
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
  DialogTrigger
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
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import { ResetPasswordForm } from './reset-password-form';
import { useToast } from '@/hooks/use-toast';


type ColumnsProps = {
  onUpdate: (user: User) => void;
  onToggleStatus: (userId: string) => void;
  onResetPassword: (userId: string, newPassword: string) => boolean;
};

export const columns = ({
  onUpdate,
  onToggleStatus,
  onResetPassword,
}: ColumnsProps): ColumnDef<User>[] => [
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
        Student: 'outline',
        Parent: 'outline',
        Headmaster: 'default',
        Librarian: 'secondary',
        Security: 'destructive',
      };
      
      const variant = variants[role as keyof typeof variants] || 'outline';

      return <Badge variant={variant as any}>{role}</Badge>;
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
  },
  {
    id: 'actions',
    cell: function Cell({ row }) {
      const user = row.original;
      const { toast } = useToast();
      const [isEditFormOpen, setIsEditFormOpen] = useState(false);
      const [isResetPasswordFormOpen, setIsResetPasswordFormOpen] = useState(false);

      return (
        <div className="text-right">
          <Dialog open={isEditFormOpen} onOpenChange={setIsEditFormOpen}>
            <Dialog open={isResetPasswordFormOpen} onOpenChange={setIsResetPasswordFormOpen}>
              <AlertDialog>
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
                      Edit Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsResetPasswordFormOpen(true)}>
                      <KeyRound className="mr-2 h-4 w-4" />
                      Reset Password
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem
                        className={user.status === 'active' ? 'text-destructive focus:text-destructive' : ''}
                      >
                        {user.status === 'active' ? (
                          <UserX className="mr-2 h-4 w-4" />
                        ) : (
                          <UserCheck className="mr-2 h-4 w-4" />
                        )}
                        <span>{user.status === 'active' ? 'Freeze' : 'Unfreeze'} Account</span>
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogDescription>
                      Make changes to the user's profile.
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
          </Dialog>>
        </div>
      );
    },
  },
];
