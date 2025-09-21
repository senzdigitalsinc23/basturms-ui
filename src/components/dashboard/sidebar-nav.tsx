
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
  Laptop,
  PenSquare,
  BookCopy,
  ChevronDown,
  Building2,
  Calendar,
  Megaphone,
  Fingerprint,
  Bell,
  CalendarCheck,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Role } from '@/lib/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import React from 'react';

const SidebarAccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionTrigger>,
  React.ComponentPropsWithoutRef<typeof AccordionTrigger>
>(({ className, children, ...props }, ref) => (
  <AccordionTrigger
    ref={ref}
    className={cn(
      'flex w-full items-center gap-2 rounded-md p-2 text-left text-base font-normal text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:outline-none h-auto justify-start',
      className
    )}
    {...props}
  >
    {children}
  </AccordionTrigger>
));
SidebarAccordionTrigger.displayName = AccordionTrigger.displayName;

const SidebarAccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionContent>,
  React.ComponentPropsWithoutRef<typeof AccordionContent>
>(({ className, children, ...props }, ref) => (
  <AccordionContent
    ref={ref}
    className={cn('overflow-hidden text-sm transition-all', className)}
    {...props}
  >
    <div className="pl-8 flex flex-col gap-1 py-1">{children}</div>
  </AccordionContent>
));
SidebarAccordionContent.displayName = AccordionContent.displayName;

type NavItem = {
  href?: string;
  label: string;
  icon: React.ElementType;
  items?: Omit<NavItem, 'items' | 'icon'>[];
};

const menuItems: Record<Role, NavItem[]> = {
  Admin: [
    { href: '/dashboard/admin', label: 'Dashboard', icon: LayoutDashboard },
    {
      label: 'Student Management',
      icon: GraduationCap,
      items: [
        { href: '/student-management/students', label: 'Students' },
        { href: '/student-management/promotions', label: 'Promotion/Graduation' },
        { href: '/student-management/add', label: 'Add Student' },
        { href: '/student-management/attendance', label: 'Student Register' },
        { href: '/#', label: 'Classes' },
      ],
    },
     {
      label: 'Staff Management',
      icon: BookUser,
      items: [
        { href: '/staff-management', label: 'Staff List' },
        { href: '/staff-management/add', label: 'Add Staff' },
        { href: '/staff-management/attendance', label: 'Staff Attendance' },
      ]
    },
    { href: '/users', label: 'User Management', icon: Users },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/#', label: 'Attendance', icon: Calendar },
    { href: '/#', label: 'Timetable', icon: Calendar },
    {
      label: 'Announcements',
      icon: Megaphone,
      items: [{ href: '/#', label: 'Generate Notice' }],
    },
     {
      label: 'Logs',
      icon: History,
      items: [
        { href: '/audit-logs', label: 'Audit Logs' },
        { href: '/auth-logs', label: 'Authentication Logs' },
      ],
    },
  ],
  Teacher: [
    { href: '/dashboard/teacher', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/#', label: 'My Students', icon: Users },
    { href: '/#', label: 'Grades', icon: GraduationCap },
  ],
  Student: [
    { href: '/dashboard/student', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/#', label: 'My Courses', icon: BookCopy },
    { href: '/#', label: 'My Grades', icon: GraduationCap },
    { href: '/#', label: 'Assignments', icon: PenSquare },
  ],
  Parent: [
    { href: '/dashboard/parent', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/#', label: 'Child Grades', icon: GraduationCap },
  ],
  Headmaster: [
    { href: '/dashboard/headmaster', label: 'Dashboard', icon: LayoutDashboard },
     {
      label: 'Staff Management',
      icon: BookUser,
      items: [
        { href: '/staff-management', label: 'Staff List' },
        { href: '/staff-management/add', label: 'Add Staff' },
        { href: '/staff-management/attendance', label: 'Staff Attendance' },
      ]
    },
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
    {
      href: '/dashboard/procurement-manager',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    { href: '/#', label: 'Purchase Orders', icon: Truck },
    { href: '/#', label: 'Suppliers', icon: Building },
  ],
  'Stores Manager': [
    {
      href: '/dashboard/stores-manager',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
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
  const formattedRole = role.toLowerCase().replace(/\s/g, '-');
  return [
    {
      href: `/dashboard/${formattedRole}`,
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
  ];
};

export function SidebarNav() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const navItems = user ? getRoleNavItems(user.role) : [];

  return (
    <Sidebar
      collapsible="icon"
      variant="sidebar"
      className="border-r"
    >
        <SidebarHeader>
            <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
                <Building2 className="h-6 w-6 text-primary"/>
                <span className="hidden group-data-[state=expanded]:inline">Metoxi</span>
            </Link>
        </SidebarHeader>
      <SidebarContent className="p-2">
        <Accordion type="multiple" className="w-full" defaultValue={['item-0', 'item-1']}>
          {navItems.map((item, index) =>
            item.items ? (
              <AccordionItem value={`item-${index}`} key={index} className="border-b-0">
                <SidebarAccordionTrigger>
                  <item.icon className="h-5 w-5" />
                  <span className="text-base hidden group-data-[state=expanded]:inline">{item.label}</span>
                </SidebarAccordionTrigger>
                <SidebarAccordionContent>
                  {item.items.map((subItem) => (
                    <SidebarMenuButton
                      key={subItem.label}
                      as={Link}
                      href={subItem.href || '#'}
                      className="h-auto justify-start p-2 text-base font-normal"
                      isActive={pathname === subItem.href}
                      variant="ghost"
                    >
                      <span className="hidden group-data-[state=expanded]:inline">{subItem.label}</span>
                    </SidebarMenuButton>
                  ))}
                </SidebarAccordionContent>
              </AccordionItem>
            ) : (
              <SidebarMenuButton
                key={item.label}
                as={Link}
                href={item.href || '#'}
                className="h-auto justify-start p-2 text-base"
                isActive={pathname === item.href}
                variant={pathname === item.href ? 'default' : 'ghost'}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-base hidden group-data-[state=expanded]:inline">{item.label}</span>
              </SidebarMenuButton>
            )
          )}
        </Accordion>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              as={Link}
              href="#"
              tooltip={{ children: 'Settings', side: 'right' }}
              variant="ghost"
            >
              <Settings />
              <span className="hidden group-data-[state=expanded]:inline">Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout} tooltip={{ children: 'Logout', side: 'right' }} variant="ghost">
              <LogOut />
              <span className="hidden group-data-[state=expanded]:inline">Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
