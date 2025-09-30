'use client';

import { useState, useEffect } from 'react';
import { getAcademicYears } from '@/lib/store';
import { AcademicYear, Term } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const statusStyles: Record<Term['status'], string> = {
    'Active': 'bg-green-100 text-green-800 border-green-200',
    'Upcoming': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Completed': 'bg-gray-100 text-gray-800 border-gray-200',
};

const statusIcons: Record<Term['status'], React.ElementType> = {
    'Active': CheckCircle,
    'Upcoming': Clock,
    'Completed': CheckCircle,
};

export function AcademicCalendar() {
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);

    useEffect(() => {
        const years = getAcademicYears();
        setAcademicYears(years);
    }, []);

    return (
        <div className="space-y-8">
            {academicYears.map(year => (
                <Card key={year.year}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Calendar className="h-6 w-6 text-primary" />
                           Academic Year: {year.year}
                           <Badge variant={year.status === 'Active' ? 'default' : 'outline'} className="ml-2">{year.status}</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {year.terms.map(term => {
                                const Icon = statusIcons[term.status];
                                return (
                                    <div key={term.name} className={cn("p-4 border rounded-lg flex items-start gap-4", term.status === 'Active' && 'border-primary bg-primary/5')}>
                                        <div className={cn("p-2 rounded-full", statusStyles[term.status])}>
                                            <Icon className="h-5 w-5"/>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-lg font-semibold">{term.name}</h3>
                                                <Badge className={cn(statusStyles[term.status])}>{term.status}</Badge>
                                            </div>
                                            <div className="text-sm text-muted-foreground mt-1">
                                                <span>{format(new Date(term.startDate), 'do MMMM, yyyy')}</span> - <span>{format(new Date(term.endDate), 'do MMMM, yyyy')}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
