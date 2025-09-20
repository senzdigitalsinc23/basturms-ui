'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getUserById } from '@/lib/store';
import { User } from '@/lib/types';
import { ProtectedRoute } from '@/components/protected-route';
import { UserProfile } from '@/components/users/user-profile';
import { useAuth } from '@/hooks/use-auth';

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const [profile, setProfile] = useState<User | null>(null);
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      const userProfile = getUserById(userId);
      setProfile(userProfile || null);
    }
    setLoading(false);
  }, [userId]);

  const isOwner = currentUser?.id === userId;
  const isAdmin = currentUser?.role === 'Admin';
  
  const allowedRoles: User['role'][] = ['Admin'];
  // The user should be able to view their own profile regardless of role.
  // We handle this logic inside the ProtectedRoute's rendered output.
  const canView = isOwner || isAdmin;


  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">User Profile</h1>
          <p className="text-muted-foreground">
            View and manage user profile information.
          </p>
        </div>
        {loading && <p>Loading profile...</p>}
        {!loading && profile && canView && <UserProfile user={profile} />}
        {!loading && !profile && <p>User not found.</p>}
        {!loading && profile && !canView && (
            <p>You do not have permission to view this profile.</p>
        )}
      </div>
    </ProtectedRoute>
  );
}
