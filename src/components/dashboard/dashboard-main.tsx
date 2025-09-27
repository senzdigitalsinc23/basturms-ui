'use client';

import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { DashboardHeader } from './dashboard-header';

export function DashboardMain({ children }: { children: React.ReactNode }) {
  const { state } = useSidebar();
  return (
    <div
      className={cn(
        'relative flex min-h-svh flex-1 flex-col bg-background transition-[margin-left] duration-200',
        state === 'expanded'
          ? 'md:ml-[--sidebar-width]'
          : 'md:ml-[--sidebar-width-icon]'
      )}
    >
      <DashboardHeader />
      <main className="flex-1 p-4 md:p-6 bg-card">{children}</main>
    </div>
  );
}
