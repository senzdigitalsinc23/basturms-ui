'use client';

import { useAuth } from '@/hooks/use-auth';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/dashboard/sidebar-nav';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';

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
      const roleDashboard = `/dashboard/${user.role.toLowerCase().replace(/\s/g, '-')}`;
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
      <div className="sm:ml-[var(--sidebar-width-icon)]">
        <SidebarInset>
          <DashboardHeader />
          <main className="flex-1 p-4 md:p-6 lg:p-8 bg-background">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
