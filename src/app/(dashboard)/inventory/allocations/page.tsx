
'use client';
import { ProtectedRoute } from '@/components/protected-route';
import { AssetAllocations } from '@/components/inventory/allocations/asset-allocations';

export default function AllocationsPage() {
  return (
    <ProtectedRoute allowedRoles={['Admin', 'Stores Manager']}>
        <AssetAllocations />
    </ProtectedRoute>
  );
}
