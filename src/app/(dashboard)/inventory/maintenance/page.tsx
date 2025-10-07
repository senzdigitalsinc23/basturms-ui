
'use client';
import { ProtectedRoute } from '@/components/protected-route';
import { AssetMaintenance } from '@/components/inventory/maintenance/asset-maintenance';

export default function MaintenancePage() {
  return (
    <ProtectedRoute allowedRoles={['Admin', 'Stores Manager']}>
      <AssetMaintenance />
    </ProtectedRoute>
  );
}
