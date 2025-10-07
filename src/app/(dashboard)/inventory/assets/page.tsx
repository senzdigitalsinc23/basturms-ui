
'use client';
import { ProtectedRoute } from '@/components/protected-route';
import { AssetManagement } from '@/components/inventory/assets/asset-management';

export default function AssetsPage() {
  return (
    <ProtectedRoute allowedRoles={['Admin', 'Stores Manager', 'Procurement Manager']}>
      <AssetManagement />
    </ProtectedRoute>
  );
}
