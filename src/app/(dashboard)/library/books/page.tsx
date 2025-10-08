'use client';
import { BookManagement } from '@/components/library/book-management';
import { ProtectedRoute } from '@/components/protected-route';

export default function LibraryBooksPage() {
  return (
    <ProtectedRoute allowedRoles={['Admin', 'Librarian']}>
      <BookManagement />
    </ProtectedRoute>
  );
}
