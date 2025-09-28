'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getUserById } from '@/lib/store';
import { User } from '@/lib/types';
import { UserProfile } from '@/components/users/user-profile';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const [profile, setProfile] = useState<User | null>(null);
  const { user: currentUser, isLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!currentUser) {
        router.replace('/login');
        return;
    }

    if (userId) {
      const userProfile = getUserById(userId);
      setProfile(userProfile || null);
    }
    setLoading(false);
  }, [userId, isLoading, currentUser, router]);

  if (loading || isLoading) {
      return (
        <div className="p-8">
            <div className="space-y-4">
                <div className="h-8 w-1/4 bg-muted animate-pulse rounded-md" />
                <div className="h-4 w-1/2 bg-muted animate-pulse rounded-md" />
                <div className="mt-8 border rounded-lg p-4 max-w-2xl mx-auto">
                    <div className="h-24 bg-muted animate-pulse rounded-md mb-4" />
                    <div className="h-10 bg-muted animate-pulse rounded-md mb-2" />
                    <div className="h-10 bg-muted animate-pulse rounded-md mb-2" />
                </div>
            </div>
        </div>
      );
  }

  const isOwner = currentUser?.id === userId;
  const isAdmin = currentUser?.role === 'Admin';
  
  if (!profile) {
      return <p>User not found.</p>;
  }

  if (!isOwner && !isAdmin) {
      return (
        <div className="flex items-center justify-center flex-1 h-full">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="mx-auto bg-destructive/10 p-3 rounded-full">
                        <TriangleAlert className="h-8 w-8 text-destructive"/>
                    </div>
                    <CardTitle className="mt-4">Access Denied</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-6">You do not have permission to view this profile.</p>
                    <Button asChild size="sm">
                        <Link href="/dashboard">Return to Dashboard</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">User Profile</h1>
          <p className="text-muted-foreground">
            View and manage user profile information.
          </p>
        </div>
        <UserProfile user={profile} />
      </div>
  );
}
