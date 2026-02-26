'use client';
import { User } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '../ui/button';
import { Pencil, KeyRound, Upload, Camera, Loader2 } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { UserForm } from './user-form';
import { useAuth } from '@/hooks/use-auth';
import { addAuditLog, getStaff, changePasswordViaApi, uploadFileViaApi, updateUserProfileViaApi, fetchUserProfileViaApi } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { ResetPasswordForm } from './reset-password-form';

export function UserProfile({ user: initialUser }: { user: User }) {
  const [user, setUser] = useState(initialUser);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Fetch user profile from API
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const result = await fetchUserProfileViaApi();
        if (result.success && result.data) {
          // Map API response to User type
          const profileData = result.data;
          
          const mappedUser: User = {
            id: profileData.id?.toString() || user.id,
            user_id: profileData.user_id || user.user_id,
            name: profileData.full_name || profileData.username || user.name,
            username: profileData.username || user.username,
            email: profileData.email || user.email,
            phone: profileData.phone || user.phone,
            role: profileData.role_name || user.role,
            role_id: profileData.role_id?.toString() || user.role_id,
            avatarUrl: profileData.profile_picture?.url || '',
            signature: profileData.signature?.url || profileData.signature_url || user.signature,
            is_super_admin: profileData.is_super_admin || false,
            status: profileData.status || 'active',
            created_at: profileData.created_at || user.created_at,
            updated_at: profileData.updated_at || user.updated_at,
          };
          
          setUser(mappedUser);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load profile data. Using cached data.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const userInitials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('');

  const handleUpdate = async (values: Partial<User>) => {
    if (!currentUser) return;
    
    try {
      // Call the API to update the profile
      const result = await updateUserProfileViaApi(
        values.username || user.username,
        values.email || user.email
      );

      if (result.success) {
        // Refetch the profile to get the latest data
        const profileResult = await fetchUserProfileViaApi();
        if (profileResult.success && profileResult.data) {
          const profileData = profileResult.data;
          const mappedUser: User = {
            id: profileData.id?.toString() || user.id,
            user_id: profileData.user_id || user.user_id,
            name: profileData.full_name || profileData.username || user.name,
            username: profileData.username || user.username,
            email: profileData.email || user.email,
            phone: profileData.phone || user.phone,
            role: profileData.role_name || user.role,
            role_id: profileData.role_id?.toString() || user.role_id,
            avatarUrl: profileData.profile_picture?.url || '',
            signature: profileData.signature?.url || profileData.signature_url || user.signature,
            is_super_admin: profileData.is_super_admin || false,
            status: profileData.status || 'active',
            created_at: profileData.created_at || user.created_at,
            updated_at: profileData.updated_at || user.updated_at,
          };
          setUser(mappedUser);
          
          // Update session storage if this is the current user
          if (currentUser.id === user.id || currentUser?.user_id === user.user_id) {
            localStorage.setItem('campusconnect_session', JSON.stringify(mappedUser));
            // Notify auth context about the session update
            window.dispatchEvent(new Event('userSessionUpdated'));
          }
        }
        
        addAuditLog({
          user: currentUser.email,
          name: currentUser.name,
          action: 'Update User Profile',
          details: `User ${currentUser.name} updated profile for ${user.name}.`,
        });
        
        toast({
          title: 'Profile Updated',
          description: result.message || 'The user profile has been successfully updated.',
        });
        setIsEditOpen(false);
      } else {
        toast({
          variant: 'destructive',
          title: 'Update Failed',
          description: result.message || 'Failed to update user profile. Please try again.',
        });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'Failed to update user profile. Please try again.',
      });
    }
  };

  const handlePasswordChange = async (values: { currentPassword?: string, newPassword: string, confirmPassword: string }): Promise<boolean> => {
    if (!currentUser) return false;

    try {
      // Use the API endpoint to change password
      const result = await changePasswordViaApi(
        currentUser.user_id || currentUser.id,
        values.newPassword,
        values.confirmPassword
      );

      if (result.success) {
        toast({
          title: 'Password Updated',
          description: result.message || 'Your password has been changed successfully.'
        });
        addAuditLog({
          user: currentUser.email,
          name: currentUser.name,
          action: 'Change Password',
          details: `Password changed for user ${user.name}.`,
        });
        setIsPasswordOpen(false);
        return true;
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message || 'Failed to update password. Please try again.'
        });
        return false;
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred while changing password.'
      });
      return false;
    }
  }

  const handleSignatureUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async (file: File, docType: 'profile_picture' | 'signature') => {
    try {
      // Use user_id or id for the doc_id
      const docId = user.user_id || user.id;
      
      const result = await uploadFileViaApi(file, docId, docType);

      if (result.success) {
        // Refetch the profile to get the updated picture URL
        const profileResult = await fetchUserProfileViaApi();
        
        if (profileResult.success && profileResult.data) {
          const profileData = profileResult.data;
          const mappedUser: User = {
            id: profileData.id?.toString() || user.id,
            user_id: profileData.user_id || user.user_id,
            name: profileData.full_name || profileData.username || user.name,
            username: profileData.username || user.username,
            email: profileData.email || user.email,
            phone: profileData.phone || user.phone,
            role: profileData.role_name || user.role,
            role_id: profileData.role_id?.toString() || user.role_id,
            avatarUrl: profileData.profile_picture?.url || '',
            signature: result.url && docType === 'signature' ? result.url : (profileData.signature_url || user.signature),
            is_super_admin: profileData.is_super_admin || false,
            status: profileData.status || 'active',
            created_at: profileData.created_at || user.created_at,
            updated_at: profileData.updated_at || user.updated_at,
          };
          
          setUser(mappedUser);
          
          // Update session storage if this is the current user
          if (currentUser?.id === user.id || currentUser?.user_id === user.user_id) {
            localStorage.setItem('campusconnect_session', JSON.stringify(mappedUser));
            // Notify auth context about the session update
            window.dispatchEvent(new Event('userSessionUpdated'));
          }
          
          // Dispatch event to update header avatar
          if (docType === 'profile_picture') {
            window.dispatchEvent(new Event('profilePictureUpdated'));
          }
          
          toast({
            title: "Upload Successful",
            description: `Your ${docType === 'profile_picture' ? 'profile picture' : 'signature'} has been updated.`
          });
        } else {
          toast({
            variant: 'destructive',
            title: 'Upload Failed',
            description: 'Failed to refresh profile data after upload.'
          });
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Upload Failed',
          description: result.message || 'Failed to upload file.'
        });
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: error.message || 'An error occurred during upload.'
      });
    }
  };


  const isOwner = currentUser?.id === user.id || currentUser?.user_id === user.user_id;
  const isAdmin = currentUser?.role === 'Admin';

  if (isLoading) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading profile...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-6">
          <div className="relative group">
            <Avatar className="h-24 w-24 border-4 border-background shadow-md">
              <AvatarImage 
                src={user.avatarUrl} 
                alt={user.name}
              />
              <AvatarFallback className="text-3xl">{userInitials}</AvatarFallback>
            </Avatar>
            {isOwner && (
              <>
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Change profile picture"
                >
                  <Camera className="h-6 w-6" />
                </button>
                <input
                  type="file"
                  ref={avatarInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(file, 'profile_picture');
                  }}
                />
              </>
            )}
          </div>
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
            <p className="font-medium text-muted-foreground">Full Name</p>
            <p className="font-semibold">{user.name}</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Username</p>
            <p className="font-semibold">{user.username}</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Email</p>
            <p className="font-semibold">{user.email}</p>
          </div>
          {user.phone && (
            <div>
              <p className="font-medium text-muted-foreground">Phone Number</p>
              <p className="font-semibold">{user.phone}</p>
            </div>
          )}
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
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(file, 'signature');
                }}
              />
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
