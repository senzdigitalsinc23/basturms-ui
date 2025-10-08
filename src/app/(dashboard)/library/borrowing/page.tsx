'use client';
import { BorrowingManagement } from '@/components/library/borrowing-management';
import { ProtectedRoute } from '@/components/protected-route';

export default function BorrowingPage() {
  return (
    <ProtectedRoute allowedRoles={['Admin', 'Librarian']}>
      <BorrowingManagement />
    </ProtectedRoute>
  );
}
