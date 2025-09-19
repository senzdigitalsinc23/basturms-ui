'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const notices = [
  {
    title: 'Mid-term Exam Schedule',
    date: '2024-09-15',
    audience: 'Students',
    variant: 'outline',
  },
  {
    title: 'Parent-Teacher Meeting',
    date: '2024-09-12',
    audience: 'Parents',
    variant: 'secondary',
  },
  {
    title: 'Annual Sports Day',
    date: '2024-09-10',
    audience: 'All School',
    variant: 'default',
  },
  {
    title: 'Staff Meeting',
    date: '2024-09-08',
    audience: 'Teachers',
    variant: 'destructive',
  },
];

export function RecentNotices() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Notices</CardTitle>
        <CardDescription>Important announcements for the school community.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {notices.map((notice) => (
            <li key={notice.title} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{notice.title}</p>
                <p className="text-sm text-muted-foreground">{notice.date}</p>
              </div>
              <Badge variant={notice.variant as any}>{notice.audience}</Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
