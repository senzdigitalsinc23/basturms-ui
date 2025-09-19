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
  Shield,
  Book,
  Building,
  Truck,
  Warehouse,
  Briefcase,
  Laptop
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
  Headmaster: [
      { href: '/dashboard/headmaster', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/#', label: 'Staff', icon: Users },
      { href: '/#', label: 'Curriculum', icon: BookUser },
  ],
  Librarian: [
      { href: '/dashboard/librarian', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/#', label: 'Book Catalogue', icon: Book },
      { href: '/#', label: 'Checkouts', icon: History },
  ],
  Security: [
      { href: '/dashboard/security', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/#', label: 'Campus Alerts', icon: Shield },
      { href: '/#', label: 'Visitor Logs', icon: BookUser },
  ],
  'Procurement Manager': [
      { href: '/dashboard/procurement-manager', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/#', label: 'Purchase Orders', icon: Truck },
      { href: '/#', label: 'Suppliers', icon: Building },
  ],
  'Stores Manager': [
      { href: '/dashboard/stores-manager', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/#', label: 'Inventory', icon: Warehouse },
      { href: '/#', label: 'Requisitions', icon: History },
  ],
  Proprietor: [
      { href: '/dashboard/proprietor', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/#', label: 'Financials', icon: Briefcase },
      { href: '/#', label: 'School Analytics', icon: History },
  ],
  'I.T Manager': [
      { href: '/dashboard/i.t-manager', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/#', label: 'System Status', icon: Laptop },
      { href: '/#', label: 'User Support', icon: Users },
  ],
  'I.T Support': [
      { href: '/dashboard/i.t-support', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/#', label: 'Open Tickets', icon: Laptop },
      { href: '/#', label: 'Knowledge Base', icon: Book },
  ],
};

const getRoleNavItems = (role: Role) => {
    const roleKey = role as keyof typeof menuItems;
    if (menuItems[roleKey]) {
        return menuItems[roleKey]!;
    }
    // Fallback for roles without explicit menu items
    const formattedRole = role.toLowerCase().replace(/\s/g, '-');
    return [
        { href: `/dashboard/${formattedRole}`, label: 'Dashboard', icon: LayoutDashboard },
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
