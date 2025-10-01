
'use client';

import { useState, useEffect, useMemo } from 'react';
import { getAcademicYears, getCalendarEvents, addCalendarEvent, CalendarEvent } from '@/lib/store';
import { AcademicYear, Term, CalendarEventCategory } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { startOfMonth, format, isSameDay } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, PlusCircle, Dot, ArrowLeft, ArrowRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

type Modifier = {
    [key: string]: Date | Date[] | { from: Date; to: Date } | ((date: Date) => boolean);
};

const eventCategoryColors: Record<CalendarEventCategory, string> = {
    'Holiday': 'hsl(var(--destructive))',
    'Exam': 'hsl(var(--primary))',
    'School Event': 'hsl(var(--chart-4))',
    'Other': 'hsl(var(--chart-5))',
};

function AddEventForm({ onSave }: { onSave: (event: Omit<CalendarEvent, 'id'>) => void }) {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState<Date | undefined>();
    const [category, setCategory] = useState<CalendarEventCategory>('School Event');
    
    const handleSave = () => {
        if (title && date) {
            onSave({ title, date: date.toISOString(), category });
        }
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="title">Event Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, 'PPP') : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={setDate} captionLayout="dropdown-buttons" fromYear={new Date().getFullYear()} toYear={new Date().getFullYear() + 5} initialFocus /></PopoverContent>
                </Popover>
            </div>
            <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={(value: CalendarEventCategory) => setCategory(value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {Object.keys(eventCategoryColors).map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <DialogFooter>
                <Button onClick={handleSave} disabled={!title || !date}>Save Event</Button>
            </DialogFooter>
        </div>
    );
}


export function AcademicCalendar() {
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
    const [selectedYear, setSelectedYear] = useState<AcademicYear | undefined>();
    const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(new Date()));
    const [modifiers, setModifiers] = useState<Modifier>({});
    const [modifierStyles, setModifierStyles] = useState({});
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [isAddEventOpen, setIsAddEventOpen] = useState(false);
    const { toast } = useToast();
    const { user } = useAuth();
    
    const fetchData = () => {
        const years = getAcademicYears();
        setAcademicYears(years);
        const activeYear = years.find(y => y.status === 'Active') || years[0];
        if (activeYear) {
            setSelectedYear(activeYear);
        }
        setEvents(getCalendarEvents());
    };

    useEffect(() => {
        fetchData();
    }, []);

    const { yearDateRange, termColorMap } = useMemo(() => {
        if (!selectedYear?.terms?.length) {
            return { yearDateRange: undefined, termColorMap: new Map() };
        }

        const dates = selectedYear.terms.flatMap(term => [new Date(term.startDate), new Date(term.endDate)]);
        const from = dates.reduce((a, b) => (a < b ? a : b));
        const to = dates.reduce((a, b) => (a > b ? a : b));
        
        const termColors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];
        const colorMap = new Map(selectedYear.terms.map((term, index) => [term.name, termColors[index % termColors.length]]));

        return { yearDateRange: { from, to }, termColorMap: colorMap };
    }, [selectedYear]);

    useEffect(() => {
        if (selectedYear) {
            const newModifiers: Modifier = {};
            const newModifierStyles: Record<string, React.CSSProperties> = {};
            
            selectedYear.terms.forEach((term) => {
                const termKey = `term-${term.name.replace(/\s/g, '-')}`;
                newModifiers[termKey] = {
                    from: new Date(term.startDate),
                    to: new Date(term.endDate)
                };
                newModifierStyles[termKey] = {
                    color: 'white',
                    backgroundColor: termColorMap.get(term.name),
                };
            });
            
            setModifiers(newModifiers);
            setModifierStyles(newModifierStyles);
            
            if(yearDateRange?.from) {
                setCurrentMonth(startOfMonth(yearDateRange.from));
            }
        }
    }, [selectedYear, yearDateRange, termColorMap]);

    const handleYearChange = (yearValue: string) => {
        const year = academicYears.find(y => y.year === yearValue);
        setSelectedYear(year);
    };

    const handleAddEvent = (event: Omit<CalendarEvent, 'id'>) => {
        if (!user) return;
        addCalendarEvent(event, user.id);
        fetchData(); // Refetch all data
        setIsAddEventOpen(false);
        toast({
            title: "Event Added",
            description: `"${event.title}" has been added to the calendar.`
        });
    };

    const eventsByDay = (day: Date) => {
        return events.filter(event => isSameDay(new Date(event.date), day));
    };
    
    if (!selectedYear) {
        return <div>Loading academic calendar...</div>;
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <CardTitle>Academic Calendar for {selectedYear.year}</CardTitle>
                        <CardDescription>Visual representation of the school's academic terms and events.</CardDescription>
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
                        <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm"><PlusCircle className="mr-2"/> Add Event</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add New Calendar Event</DialogTitle>
                                </DialogHeader>
                                <AddEventForm onSave={handleAddEvent} />
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
                <TooltipProvider>
                    <Calendar
                        month={currentMonth}
                        onMonthChange={setCurrentMonth}
                        modifiers={modifiers}
                        modifiersStyles={modifierStyles}
                        numberOfMonths={3}
                        pagedNavigation
                        fromMonth={yearDateRange?.from}
                        toMonth={yearDateRange?.to}
                        disabled={!yearDateRange || { before: yearDateRange.from, after: yearDateRange.to }}
                        className="w-full"
                        components={{
                            DayContent: ({ date, ...props }) => {
                                const dailyEvents = eventsByDay(date);
                                if (dailyEvents.length > 0) {
                                    return (
                                        <Tooltip>
                                            <TooltipTrigger className="w-full h-full flex items-center justify-center relative">
                                                <div {...props.props} className="relative w-full h-full flex items-center justify-center">
                                                    <span>{format(date, 'd')}</span>
                                                    <Dot className="absolute bottom-0 text-primary h-6 w-6" />
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <div className="space-y-1">
                                                    {dailyEvents.map(event => (
                                                        <div key={event.id} className="flex items-center gap-2">
                                                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: eventCategoryColors[event.category] }} />
                                                            <p>{event.title}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    );
                                }
                                return <div {...props.props}>{format(date, 'd')}</div>
                            }
                        }}
                    />
                </TooltipProvider>
                <div className="flex flex-wrap gap-4 mt-4">
                    {selectedYear.terms.map((term) => (
                        <div key={term.name} className="flex items-center gap-2 text-sm">
                            <span className="h-4 w-4 rounded-sm" style={{ backgroundColor: termColorMap.get(term.name) }}></span>
                            <span>{term.name}</span>
                        </div>
                    ))}
                    {Object.entries(eventCategoryColors).map(([category, color]) => (
                        <div key={category} className="flex items-center gap-2 text-sm">
                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }}></div>
                            <span>{category}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
