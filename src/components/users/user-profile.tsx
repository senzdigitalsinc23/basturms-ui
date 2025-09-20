'use client';

import { User } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '../ui/button';
import { Pencil } from 'lucide-react';

export function UserProfile({ user }: { user: User }) {
  const userInitials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('');

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
           <Button variant="outline" size="sm">
                <Pencil className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
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
            <p>
                <Badge variant={user.status === 'active' ? 'secondary' : 'destructive'}>
                    {user.status}
                </Badge>
            </p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Super Admin</p>
            <p className="font-semibold">{user.is_super_admin ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
