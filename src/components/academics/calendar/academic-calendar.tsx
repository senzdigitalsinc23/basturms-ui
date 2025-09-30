'use client';

import { useState, useEffect } from 'react';
import { getAcademicYears } from '@/lib/store';
import { AcademicYear, Term } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { eachDayOfInterval, startOfMonth } from 'date-fns';

type Modifier = {
    [key: string]: Date | Date[] | { from: Date; to: Date } | ((date: Date) => boolean);
};

export function AcademicCalendar() {
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
    const [selectedYear, setSelectedYear] = useState<AcademicYear | undefined>();
    const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(new Date()));
    const [modifiers, setModifiers] = useState<Modifier>({});
    const [modifierStyles, setModifierStyles] = useState({});

    useEffect(() => {
        const years = getAcademicYears();
        setAcademicYears(years);
        const activeYear = years.find(y => y.status === 'Active') || years[0];
        if (activeYear) {
            setSelectedYear(activeYear);
        }
    }, []);

    useEffect(() => {
        if (selectedYear) {
            const newModifiers: Modifier = {};
            const newModifierStyles: Record<string, React.CSSProperties> = {};
            const termColors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

            selectedYear.terms.forEach((term, index) => {
                const termKey = term.name.replace(/\s+/g, '-').toLowerCase();
                newModifiers[termKey] = {
                    from: new Date(term.startDate),
                    to: new Date(term.endDate)
                };
                newModifierStyles[termKey] = {
                    color: 'white',
                    backgroundColor: termColors[index % termColors.length],
                };
            });
            
            setModifiers(newModifiers);
            setModifierStyles(newModifierStyles);
            
            // Set initial month to the start of the first term of the selected year
            if(selectedYear.terms.length > 0) {
                setCurrentMonth(startOfMonth(new Date(selectedYear.terms[0].startDate)));
            }
        }
    }, [selectedYear]);

    const handleYearChange = (yearValue: string) => {
        const year = academicYears.find(y => y.year === yearValue);
        setSelectedYear(year);
    }
    
    if (!selectedYear) {
        return <div>Loading academic calendar...</div>;
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <CardTitle>Academic Calendar</CardTitle>
                        <CardDescription>Visual representation of the school's academic terms.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Select onValueChange={handleYearChange} value={selectedYear.year}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select Year" />
                            </SelectTrigger>
                            <SelectContent>
                                {academicYears.map(year => (
                                    <SelectItem key={year.year} value={year.year}>{year.year}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button variant="outline" onClick={() => setCurrentMonth(startOfMonth(new Date()))}>Today</Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
                <Calendar
                    month={currentMonth}
                    onMonthChange={setCurrentMonth}
                    modifiers={modifiers}
                    modifiersStyles={modifierStyles}
                    numberOfMonths={3}
                    pagedNavigation
                    className="w-full"
                />
                <div className="flex flex-wrap gap-4 mt-4">
                    {selectedYear.terms.map((term, index) => {
                         const termKey = term.name.replace(/\s+/g, '-').toLowerCase();
                         const style = (modifierStyles as any)[termKey] || {};
                        return (
                            <div key={term.name} className="flex items-center gap-2 text-sm">
                                <span className="h-4 w-4 rounded-full" style={{ backgroundColor: style.backgroundColor }}></span>
                                <span>{term.name}</span>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
