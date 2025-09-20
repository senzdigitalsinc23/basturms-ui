'use client';

import { useAuth } from '@/hooks/use-auth';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/dashboard/sidebar-nav';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

function DashboardMain({ children }: { children: React.ReactNode }) {
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    } else if (
      !isLoading &&
      user &&
      (pathname === '/dashboard' || pathname === '/dashboard/')
    ) {
      const roleDashboard = `/dashboard/${user.role
        .toLowerCase()
        .replace(/\s/g, '-')}`;
      router.replace(roleDashboard);
    }
  }, [isLoading, user, router, pathname]);

  if (
    isLoading ||
    !user ||
    pathname === '/dashboard' ||
    pathname === '/dashboard/'
  ) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex items-center space-x-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <SidebarNav />
      <DashboardMain>{children}</DashboardMain>
    </SidebarProvider>
  );
}
