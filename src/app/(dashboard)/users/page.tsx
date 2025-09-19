import { ProtectedRoute } from '@/components/protected-route';
import { UserManagement } from '@/components/users/user-management';

export default function UsersPage() {
  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">User Management</h1>
          <p className="text-muted-foreground">
            Create, view, update, and delete user accounts.
          </p>
        </div>
        <UserManagement />
      </div>
    </ProtectedRoute>
  );
}
