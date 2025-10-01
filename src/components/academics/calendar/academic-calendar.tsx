
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { getAcademicYears, getCalendarEvents, addCalendarEvent, CalendarEvent, updateCalendarEvent, deleteCalendarEvent } from '@/lib/store';
import { AcademicYear, Term, CalendarEventCategory } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { startOfMonth, format, isSameDay, isSameMonth } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, PlusCircle, Dot, Edit, Trash2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { DayProps } from 'react-day-picker';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


type Modifier = {
    [key: string]: Date | Date[] | { from: Date; to: Date } | ((date: Date) => boolean);
};

const eventCategoryColors: Record<CalendarEventCategory, string> = {
    'Holiday': 'hsl(var(--destructive))',
    'Exam': 'hsl(var(--primary))',
    'School Event': 'hsl(var(--chart-4))',
    'Other': 'hsl(var(--chart-5))',
};

function EventForm({ onSave, selectedDate, existingEvent }: { onSave: (event: Omit<CalendarEvent, 'id'>, id?: string) => void, selectedDate?: Date, existingEvent?: CalendarEvent | null }) {
    const [title, setTitle] = useState(existingEvent?.title || '');
    const [date, setDate] = useState<Date | undefined>(existingEvent ? new Date(existingEvent.date) : selectedDate);
    const [category, setCategory] = useState<CalendarEventCategory>(existingEvent?.category || 'School Event');

    useEffect(() => {
        if (existingEvent) {
            setTitle(existingEvent.title);
            setDate(new Date(existingEvent.date));
            setCategory(existingEvent.category);
        } else if (selectedDate) {
            setDate(selectedDate);
            setTitle('');
            setCategory('School Event');
        }
    }, [selectedDate, existingEvent]);
    
    const handleSave = () => {
        if (title && date) {
            onSave({ title, date: date.toISOString(), category }, existingEvent?.id);
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
    const [isEventFormOpen, setIsEventFormOpen] = useState(false);
    const [selectedDateForNewEvent, setSelectedDateForNewEvent] = useState<Date | undefined>();
    const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

    const { toast } = useToast();
    const { user } = useAuth();
    
    const fetchData = useCallback(() => {
        const years = getAcademicYears();
        setAcademicYears(years);
        const activeYear = years.find(y => y.status === 'Active') || years[0];
        if (activeYear && !selectedYear) {
            setSelectedYear(activeYear);
            if (activeYear.terms.length > 0) {
              setCurrentMonth(startOfMonth(new Date(activeYear.terms[0].startDate)));
            }
        }
        setEvents(getCalendarEvents());
    }, [selectedYear]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

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
            
            events.forEach(event => {
                const eventDate = new Date(event.date);
                if (isSameMonth(eventDate, currentMonth)) {
                    const eventKey = `event-${event.id}`;
                    newModifiers[eventKey] = eventDate;
                    newModifierStyles[eventKey] = {
                        textDecoration: 'underline',
                        textDecorationColor: eventCategoryColors[event.category],
                    };
                }
            });

            setModifiers(newModifiers);
            setModifierStyles(newModifierStyles);
        }
    }, [selectedYear, yearDateRange, termColorMap, events, currentMonth]);

    const handleYearChange = (yearValue: string) => {
        const year = academicYears.find(y => y.year === yearValue);
        setSelectedYear(year);
        if (year?.terms?.length) {
            setCurrentMonth(startOfMonth(new Date(year.terms[0].startDate)));
        }
    };

    const handleSaveEvent = (eventData: Omit<CalendarEvent, 'id'>, id?: string) => {
        if (!user) return;
        if (id) { // Editing existing event
            updateCalendarEvent(id, eventData, user.id);
            toast({ title: "Event Updated", description: `"${eventData.title}" has been updated.` });
        } else { // Adding new event
            addCalendarEvent(eventData, user.id);
            toast({ title: "Event Added", description: `"${eventData.title}" has been added to the calendar.` });
        }
        fetchData();
        setIsEventFormOpen(false);
        setEditingEvent(null);
    };

    const handleDeleteEvent = (eventId: string) => {
        if (!user) return;
        deleteCalendarEvent(eventId, user.id);
        fetchData();
        toast({ title: "Event Deleted", description: "The event has been removed from the calendar." });
    }

    const handleDayClick = (day: Date, modifiers: { disabled?: boolean }) => {
        if (modifiers.disabled) return;
        setSelectedDateForNewEvent(day);
        setEditingEvent(null);
        setIsEventFormOpen(true);
    };
    
    const handleEditClick = (event: CalendarEvent) => {
        setEditingEvent(event);
        setSelectedDateForNewEvent(undefined);
        setIsEventFormOpen(true);
    }

    const DayContentWithEvents = useCallback((props: DayProps) => {
        const dailyEvents = events.filter(event => isSameDay(new Date(event.date), props.date));
        
        if (dailyEvents.length > 0) {
            return (
                <Tooltip>
                    <TooltipTrigger asChild className="w-full h-full flex items-center justify-center relative">
                         <div>
                            <span>{format(props.date, 'd')}</span>
                            <Dot className="absolute bottom-0 text-primary h-6 w-6 -mb-2" />
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
        return <span>{format(props.date, 'd')}</span>;
    }, [events]);

    const monthlyEvents = useMemo(() => {
        return events
            .filter(event => isSameMonth(new Date(event.date), currentMonth))
            .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [events, currentMonth]);
    
    if (!selectedYear) {
        return <div>Loading academic calendar...</div>;
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <CardTitle>Academic Calendar for {selectedYear.year}</CardTitle>
                        <CardDescription>Click a date to add an event, or manage events on the right.</CardDescription>
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
                        <Button size="sm" onClick={() => { setSelectedDateForNewEvent(new Date()); setEditingEvent(null); setIsEventFormOpen(true); }}><PlusCircle className="mr-2"/> Add Event</Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="grid lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3">
                    <TooltipProvider>
                        <Calendar
                            month={currentMonth}
                            onMonthChange={setCurrentMonth}
                            modifiers={modifiers}
                            modifiersStyles={modifierStyles}
                            numberOfMonths={1}
                            fromMonth={yearDateRange?.from}
                            toMonth={yearDateRange?.to}
                            disabled={!yearDateRange || { before: yearDateRange.from, after: yearDateRange.to }}
                            className="p-0"
                            onDayClick={handleDayClick}
                            components={{
                                DayContent: DayContentWithEvents,
                            }}
                        />
                    </TooltipProvider>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4">
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
                </div>
                <div className="lg:col-span-2">
                    <h3 className="text-lg font-semibold mb-4">Events in {format(currentMonth, 'MMMM yyyy')}</h3>
                     <ScrollArea className="h-96">
                        <div className="space-y-4 pr-4">
                            {monthlyEvents.length > 0 ? monthlyEvents.map(event => (
                                <div key={event.id} className="flex items-start gap-3 group">
                                    <div className="flex flex-col items-center">
                                        <div className="font-bold text-lg">{format(new Date(event.date), 'dd')}</div>
                                        <div className="text-xs text-muted-foreground -mt-1">{format(new Date(event.date), 'MMM')}</div>
                                    </div>
                                    <div className="flex-1 border-l-2 pl-3" style={{borderColor: eventCategoryColors[event.category]}}>
                                        <p className="font-medium">{event.title}</p>
                                        <p className="text-sm text-muted-foreground">{event.category}</p>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditClick(event)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                         <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This will permanently delete the event "{event.title}".</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteEvent(event.id)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-muted-foreground">No events for this month.</p>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </CardContent>
            <Dialog open={isEventFormOpen} onOpenChange={setIsEventFormOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingEvent ? 'Edit Event' : 'Add New Calendar Event'}</DialogTitle>
                        {(selectedDateForNewEvent && !editingEvent) && <DialogDescription>Adding event for {format(selectedDateForNewEvent, 'PPP')}.</DialogDescription>}
                    </DialogHeader>
                    <EventForm onSave={handleSaveEvent} selectedDate={selectedDateForNewEvent} existingEvent={editingEvent} />
                </DialogContent>
            </Dialog>
        </Card>
    );
}
