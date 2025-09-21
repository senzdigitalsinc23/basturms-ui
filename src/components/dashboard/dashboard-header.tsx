
'use client';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from './user-nav';
import { Bell, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { notifications } from '@/lib/notifications';
import Link from 'next/link';

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <div className="flex items-center gap-2 md:hidden">
        <SidebarTrigger />
      </div>
      <div className="flex flex-1 items-center justify-end gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
             <Button variant="ghost" size="icon" className="rounded-full relative">
              <Bell className="h-5 w-5" />
               {notifications.some(n => !n.read) && (
                  <span className="absolute top-1 right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
               )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.map((notification) => (
              <DropdownMenuItem key={notification.id} asChild>
                <Link href={notification.href} className="flex items-start gap-3">
                   <div className={`mt-1 h-2 w-2 rounded-full ${notification.read ? 'bg-transparent' : 'bg-primary'}`} />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">{notification.description}</p>
                  </div>
                </Link>
              </DropdownMenuItem>
            ))}
             <DropdownMenuSeparator />
             <DropdownMenuItem className="justify-center">
                <Check className="mr-2 h-4 w-4" />
                Mark all as read
             </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <UserNav />
      </div>
    </header>
  );
}
