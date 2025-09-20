
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Role } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { TriangleAlert } from 'lucide-react';
import { Button } from './ui/button';
import Link from 'next/link';

export function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: Role[];
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const isAuthorized = user && allowedRoles.includes(user.role);

  useEffect(() => {
    // This effect is mainly for the case where a user logs out on a protected page
    // or their session becomes invalid. The initial redirect is handled by the layout.
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);


  if (isLoading || !user) {
    // Show a loading skeleton that matches the page structure
    return <div className="p-8">
      <div className="space-y-4">
        <div className="h-8 w-1/4 bg-muted animate-pulse rounded-md" />
        <div className="h-4 w-1/2 bg-muted animate-pulse rounded-md" />
        <div className="mt-8 border rounded-lg p-4">
          <div className="h-10 bg-muted animate-pulse rounded-md mb-4" />
          <div className="h-10 bg-muted animate-pulse rounded-md mb-2" />
          <div className="h-10 bg-muted animate-pulse rounded-md mb-2" />
          <div className="h-10 bg-muted animate-pulse rounded-md mb-2" />
        </div>
      </div>
    </div>;
  }
  
  if (!isAuthorized) {
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
                    <p className="text-muted-foreground mb-6">You do not have permission to view this page. Your role is '{user.role}', but this page requires one of the following roles: {allowedRoles.join(', ')}.</p>
                    <Button asChild size="sm">
                        <Link href="/dashboard">Return to Dashboard</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
  }

  return <>{children}</>;
}
