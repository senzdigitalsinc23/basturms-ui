
'use client';
import { User } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '../ui/button';
import { Pencil, KeyRound, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { UserForm } from './user-form';
import { useAuth } from '@/hooks/use-auth';
import { updateUser as storeUpdateUser, addAuditLog, changePassword, resetPassword, getStaff } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { ResetPasswordForm } from './reset-password-form';
import { Input } from '../ui/input';

export function UserProfile({ user: initialUser }: { user: User }) {
  const [user, setUser] = useState(initialUser);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userInitials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('');

  const handleUpdate = (values: Partial<User>) => {
    if (!currentUser) return;
    const updated = storeUpdateUser({ ...user, ...values });
    setUser(updated);
    addAuditLog({
      user: currentUser.email,
      name: currentUser.name,
      action: 'Update User Profile',
      details: `User ${currentUser.name} updated profile for ${user.name}.`,
    });
    toast({
        title: 'Profile Updated',
        description: 'The user profile has been successfully updated.',
    });
    setIsEditOpen(false);
  };
  
  const handlePasswordChange = (values: {currentPassword?: string, newPassword: string}): boolean => {
    if (!currentUser) return false;

    let success = false;
    // If user is changing their own password
    if (currentUser.id === user.id && values.currentPassword) {
        success = changePassword(user.id, values.currentPassword, values.newPassword);
    } 
    // If an admin is resetting a password
    else if (currentUser.role === 'Admin' && currentUser.id !== user.id) {
        success = resetPassword(user.id, values.newPassword);
    }
    
    if (success) {
        toast({ title: 'Password Updated', description: 'Your password has been changed successfully.' });
        addAuditLog({
          user: currentUser.email,
          name: currentUser.name,
          action: 'Change Password',
          details: `Password changed for user ${user.name}.`,
        });
        setIsPasswordOpen(false);
        return true;
    } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to update password. Please check your current password and try again.' });
        return false;
    }
  }

  const handleSignatureUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const signatureDataUrl = reader.result as string;
        handleUpdate({ signature: signatureDataUrl });
        toast({ title: "Signature Updated", description: "Your signature has been uploaded." });
      };
      reader.readAsDataURL(file);
    }
  };


  const isOwner = currentUser?.id === user.id;
  const isAdmin = currentUser?.role === 'Admin';


  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-6">
          <Avatar className="h-24 w-24 border-4 border-background shadow-md">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback className="text-3xl">{userInitials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-3xl font-bold font-headline">{user.name}</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">{user.role}</CardDescription>
          </div>
          <div className="flex flex-col gap-2">
            {isAdmin && (
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                                <Pencil className="mr-2 h-4 w-4" /> Edit Profile
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Profile</DialogTitle>
                            <DialogDescription>Update personal information.</DialogDescription>
                        </DialogHeader>
                        <UserForm isEditMode defaultValues={user} onSubmit={handleUpdate} staffList={getStaff()} />
                    </DialogContent>
                </Dialog>
            )}
             {isOwner && (
                 <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
                    <DialogTrigger asChild>
                        <Button variant="secondary" size="sm">
                            <KeyRound className="mr-2 h-4 w-4" /> Change Password
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Change Password</DialogTitle>
                            <DialogDescription>Update your account password.</DialogDescription>
                        </DialogHeader>
                        <ResetPasswordForm onSubmit={handlePasswordChange} />
                    </DialogContent>
                </Dialog>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-muted-foreground">Email</p>
            <p className="font-semibold">{user.email}</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Username</p>
            <p className="font-semibold">{user.username}</p>
          </div>
           <div>
            <p className="font-medium text-muted-foreground">Account Status</p>
            <div>
                <Badge variant={user.status === 'active' ? 'secondary' : 'destructive'}>
                    {user.status}
                </Badge>
            </div>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Super Admin</p>
            <p className="font-semibold">{user.is_super_admin ? 'Yes' : 'No'}</p>
          </div>
        </div>
        
        {isOwner && (
            <div>
                <p className="font-medium text-muted-foreground">My Signature</p>
                <div className="mt-2 flex items-center gap-4 p-4 border rounded-md">
                    {user.signature ? (
                        <img src={user.signature} alt="User signature" className="h-16 w-auto bg-gray-100 p-2 rounded-md" />
                    ) : (
                        <div className="h-16 flex items-center justify-center text-muted-foreground text-sm">No signature uploaded.</div>
                    )}
                    <Button variant="outline" size="sm" onClick={handleSignatureUploadClick}>
                        <Upload className="mr-2 h-4 w-4" />
                        {user.signature ? 'Change Signature' : 'Upload Signature'}
                    </Button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/png" onChange={handleFileChange} />
                </div>
            </div>
        )}

      </CardContent>
    </Card>
  );
}
