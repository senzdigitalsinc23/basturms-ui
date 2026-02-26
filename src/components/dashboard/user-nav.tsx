
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';
import { LogOut, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { fetchUserProfileViaApi } from '@/lib/store';

export function UserNav() {
  const { user, logout } = useAuth();
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>('');

  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const result = await fetchUserProfileViaApi();
        if (result.success && result.data?.profile_picture?.url) {
          setProfilePictureUrl(result.data.profile_picture.url);
        }
      } catch (error) {
        console.error('Error fetching profile picture for header:', error);
      }
    };

    if (user) {
      fetchProfilePicture();
      
      // Listen for profile picture update events
      const handleProfileUpdate = () => {
        fetchProfilePicture();
      };
      
      window.addEventListener('profilePictureUpdated', handleProfileUpdate);
      
      // Set up an interval to refresh the profile picture every 30 seconds
      const interval = setInterval(fetchProfilePicture, 30000);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('profilePictureUpdated', handleProfileUpdate);
      };
    }
  }, [user]);

  if (!user) {
    return null;
  }
  
  const userInitials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('');

  // Use the fetched profile picture URL, fallback to user.avatarUrl
  const avatarUrl = profilePictureUrl || user.avatarUrl;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage 
              src={avatarUrl} 
              alt={`@${user.name}`}
            />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={`/users/${user.id}`}>
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
