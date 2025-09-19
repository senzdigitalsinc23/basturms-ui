'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  History,
  GraduationCap,
  BookUser,
  LogOut,
  Settings,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Role } from '@/lib/types';

const menuItems: Partial<Record<Role, { href: string; label: string; icon: React.ElementType }[]>> = {
  Admin: [
    { href: '/dashboard/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/users', label: 'User Management', icon: Users },
    { href: '/audit-logs', label: 'Audit Logs', icon: History },
  ],
  Teacher: [
    { href: '/dashboard/teacher', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/#', label: 'My Students', icon: Users },
    { href: '/#', label: 'Grades', icon: GraduationCap },
  ],
  Parent: [
    { href: '/dashboard/parent', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/#', label: 'Child Grades', icon: GraduationCap },
  ],
};

const getRoleNavItems = (role: Role) => {
    // Directly check if the role exists as a key in menuItems
    if (role in menuItems && menuItems[role]) {
        return menuItems[role]!;
    }
    // Default for other roles not explicitly defined in menuItems
    return [
        { href: `/dashboard/${role.toLowerCase()}`, label: 'Dashboard', icon: LayoutDashboard },
    ];
}


export function SidebarNav() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const navItems = user ? getRoleNavItems(user.role) : [];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <GraduationCap className="w-8 h-8 text-sidebar-primary" />
          <span className="text-lg font-headline font-semibold text-sidebar-foreground">
            CampusConnect
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={`${item.href}-${item.label}`}>
              <SidebarMenuButton
                as={Link}
                href={item.href}
                isActive={pathname === item.href}
                tooltip={{ children: item.label, side: 'right' }}
              >
                <item.icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              as={Link}
              href="#"
              tooltip={{ children: 'Settings', side: 'right' }}
            >
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout} tooltip={{ children: 'Logout', side: 'right' }}>
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
