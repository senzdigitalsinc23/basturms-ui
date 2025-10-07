
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
  Plane,
  FileBadge,
  Library,
  BookMarked,
  Landmark,
  Clipboard,
  FileText,
  Trophy,
  WalletCards,
  MessageSquare,
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
import React, { useEffect, useState } from 'react';
import { getSchoolProfile } from '@/lib/store';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

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
      label: 'Academics',
      icon: BookMarked,
      items: [
        { href: '/academics/calendar', label: 'Academic Calendar' },
        { href: '/academics/classes', label: 'Class Subjects' },
        { href: '/academics/ranking', label: 'Ranking' },
        { href: '/academics/grading', label: 'Score Entry' },
        { href: '/academics/settings', label: 'Academic Settings' },
        { href: '/academics/timetable', label: 'Timetable' },
        { href: '/academics/lesson-notes', label: 'Lesson Notes' },
      ],
    },
    {
      label: 'Student Management',
      icon: GraduationCap,
      items: [
        { href: '/student-management/students', label: 'Students' },
        { href: '/student-management/promotions', label: 'Promotion/Graduation' },
        { href: '/student-management/reports', label: 'Report Generation' },
        { href: '/student-management/add', label: 'Add Student' },
      ],
    },
     {
      label: 'Staff Management',
      icon: BookUser,
      items: [
        { href: '/staff-management', label: 'Staff List' },
        { href: '/staff-management/add', label: 'Add Staff' },
        { href: '/staff-management/assignments', label: 'Assign Class/Subjects' },
        { href: '/staff-management/leave', label: 'Leave Management' },
        { href: '/staff-management/performance', label: 'Performance' },
      ]
    },
    {
        href: '/parent-management',
        label: 'Parent Management',
        icon: Users,
    },
    {
      label: 'Financial Management',
      icon: Landmark,
      items: [
        { href: '/financials/fee-setup', label: 'Fee Setup' },
        { href: '/financials/bill-preparation', label: 'Bill Preparation' },
        { href: '/financials/fee-collection', label: 'Collections' },
        { href: '/financials/payroll', label: 'Payroll' },
        { href: '/financials/reports', label: 'Reports' },
      ],
    },
    { href: '/expenses', label: 'Expense Management', icon: WalletCards },
    {
      label: 'Extra Curricular',
      icon: Library,
      items: [
        { href: '/extra-curricular/clubs', label: 'Clubs & Societies' },
        { href: '/extra-curricular/sports', label: 'Sports Teams' },
      ],
    },
    {
      label: 'Communications',
      icon: MessageSquare,
      items: [
        { href: '/communications', label: 'Announcements & Messages' },
      ],
    },
     {
      label: 'Attendance',
      icon: CalendarCheck,
      items: [
          { href: '/student-management/attendance', label: 'Student Register' },
          { href: '/staff-management/attendance', label: 'Staff Register' },
          { href: '/attendance/history', label: 'Attendance History' },
      ]
    },
     {
      label: 'Logs',
      icon: History,
      items: [
        { href: '/audit-logs', label: 'Audit Logs' },
        { href: '/auth-logs', label: 'Authentication Logs' },
      ],
    },
     { 
        label: 'Settings', 
        icon: Settings,
        items: [
          { href: '/settings', label: 'System Settings' },
          { href: '/users', label: 'User Management' },
        ]
    },
  ],
  Teacher: [
    { href: '/dashboard/teacher', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/staff-management/me', label: 'My Profile', icon: BookUser },
    { href: '/attendance/my-classes', label: 'Student Attendance', icon: CalendarCheck },
    { href: '/attendance/history', label: 'Attendance History', icon: History },
    { href: '/academics/grading', label: 'Grading & Scores', icon: PenSquare },
    { href: '/my-classes', label: 'My Classes & Students', icon: Users },
    { href: '/student-management/reports', label: 'Report Generation', icon: FileText },
    { href: '/academics/lesson-notes', label: 'Lesson Notes', icon: Clipboard },
    {
      label: 'Communications',
      icon: MessageSquare,
      items: [
        { href: '/communications', label: 'Announcements & Messages' },
      ],
    },
    { href: '/academics/calendar', label: 'Academic Calendar', icon: Calendar },
  ],
  Student: [
    { href: '/dashboard/student', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/#', label: 'My Courses', icon: BookCopy },
    { href: '/#', label: 'My Grades', icon: GraduationCap },
    { href: '/financials/history', label: 'My Financials', icon: Landmark },
    { href: '/#', label: 'Assignments', icon: PenSquare },
    { href: '/academics/calendar', label: 'Academic Calendar', icon: Calendar },
  ],
  Parent: [
    { href: '/dashboard/parent', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/financials/history', label: 'Child Financials', icon: Landmark },
    { href: '/#', label: 'Child Grades', icon: GraduationCap },
     { href: '/academics/calendar', label: 'Academic Calendar', icon: Calendar },
  ],
  Headmaster: [
    { href: '/dashboard/headmaster', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/staff-management/me', label: 'My Profile', icon: BookUser },
     {
      label: 'Staff Management',
      icon: BookUser,
      items: [
        { href: '/staff-management', label: 'Staff List' },
        { href: '/staff-management/add', label: 'Add Staff' },
        { href: '/staff-management/assignments', label: 'Assign Class/Subjects' },
        { href: '/staff-management/attendance', label: 'Staff Attendance' },
        { href: '/staff-management/leave', label: 'Leave Management' },
        { href: '/staff-management/performance', label: 'Performance' },
      ]
    },
    { href: '/#', label: 'Curriculum', icon: BookUser },
    { href: '/academics/calendar', label: 'Academic Calendar', icon: Calendar },
  ],
  Librarian: [
    { href: '/dashboard/librarian', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/staff-management/me', label: 'My Profile', icon: BookUser },
    { href: '/#', label: 'Book Catalogue', icon: Book },
    { href: '/#', label: 'Checkouts', icon: History },
  ],
  Security: [
    { href: '/dashboard/security', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/staff-management/me', label: 'My Profile', icon: BookUser },
    { href: '/#', label: 'Campus Alerts', icon: Shield },
    { href: '/#', label: 'Visitor Logs', icon: BookUser },
  ],
  'Procurement Manager': [
    {
      href: '/dashboard/procurement-manager',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    { href: '/staff-management/me', label: 'My Profile', icon: BookUser },
    { href: '/#', label: 'Purchase Orders', icon: Truck },
    { href: '/#', label: 'Suppliers', icon: Building },
  ],
  'Stores Manager': [
    {
      href: '/dashboard/stores-manager',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    { href: '/staff-management/me', label: 'My Profile', icon: BookUser },
    { href: '/#', label: 'Inventory', icon: Warehouse },
    { href: '/#', label: 'Requisitions', icon: History },
  ],
  Proprietor: [
    { href: '/dashboard/proprietor', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/staff-management/me', label: 'My Profile', icon: BookUser },
    { href: '/#', label: 'Financials', icon: Briefcase },
    { href: '/#', label: 'School Analytics', icon: History },
  ],
  'I.T Manager': [
    { href: '/dashboard/i.t-manager', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/staff-management/me', label: 'My Profile', icon: BookUser },
    { href: '/#', label: 'System Status', icon: Laptop },
    { href: '/#', label: 'User Support', icon: Users },
  ],
  'I.T Support': [
    { href: '/dashboard/i.t-support', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/staff-management/me', label: 'My Profile', icon: BookUser },
    { href: '/#', label: 'Open Tickets', icon: Laptop },
    { href: '/#', label: 'Knowledge Base', icon: Book },
  ],
   Accountant: [
    { href: '/dashboard/accountant', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/staff-management/me', label: 'My Profile', icon: BookUser },
    { href: '/financials/bill-preparation', label: 'Bill Preparation' },
    { href: '/financials/fee-collection', label: 'Collections' },
    { href: '/financials/payroll', label: 'Payroll' },
    { href: '/financials/reports', label: 'Reports' },
    { href: '/expenses', label: 'Expense Management', icon: WalletCards },
  ],
  Guest: [
    { href: '/dashboard/guest', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/settings', label: 'Backup & Recovery', icon: History }
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
  const [schoolName, setSchoolName] = useState('Metoxi');
  const [schoolLogo, setSchoolLogo] = useState<string | undefined>('/placeholder-logo.png');
  const [activeAccordionItem, setActiveAccordionItem] = useState<string | undefined>();

  const navItems = user ? getRoleNavItems(user.role) : [];

  useEffect(() => {
    const activeItem = navItems.findIndex(item => item.items?.some(subItem => pathname.startsWith(subItem.href || '---')));
    if (activeItem !== -1) {
      setActiveAccordionItem(`item-${activeItem}`);
    }
  }, [pathname, navItems]);

  const updateSchoolProfile = () => {
    const profile = getSchoolProfile();
    if (profile) {
      setSchoolName(profile.schoolName || 'Metoxi');
      setSchoolLogo(profile.logo);
    }
  };

  useEffect(() => {
    updateSchoolProfile();
    window.addEventListener('schoolProfileUpdated', updateSchoolProfile);
    return () => {
      window.removeEventListener('schoolProfileUpdated', updateSchoolProfile);
    };
  }, []);

  return (
    <Sidebar
      collapsible="icon"
      variant="sidebar"
      className="border-r print:hidden"
    >
        <SidebarHeader>
            <Link href="/dashboard" className="flex items-center gap-3 font-bold text-lg">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={schoolLogo} alt={schoolName} />
                  <AvatarFallback>{schoolName.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="hidden group-data-[state=expanded]:inline">{schoolName}</span>
            </Link>
        </SidebarHeader>
      <SidebarContent className="p-2">
        <Accordion type="single" collapsible className="w-full" value={activeAccordionItem} onValueChange={setActiveAccordionItem}>
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
