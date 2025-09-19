'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { getUsers } from '@/lib/store';
import { User } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { formatDistanceToNow } from 'date-fns';

export function RecentUsers() {
  const [recentUsers, setRecentUsers] = useState<User[]>([]);

  useEffect(() => {
    const allUsers = getUsers();
    const sortedUsers = [...allUsers].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setRecentUsers(sortedUsers.slice(0, 5));
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Users</CardTitle>
        <CardDescription>The 5 most recently created user accounts.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {recentUsers.map((user) => (
            <li key={user.id} className="flex items-center justify-between">
              <div className='flex items-center gap-3'>
                <Avatar>
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className='text-right'>
                <Badge variant='outline'>{user.role}</Badge>
                <p className='text-sm text-muted-foreground mt-1'>{formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
