'use client';
import { useState, useEffect } from 'react';
import { getClasses, getSubjects, addClassSubject, saveClassSubjects, addAuditLog } from '@/lib/store';
import { Class, Subject, ClassSubject } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';


export function ClassManagement() {
    const [classes, setClasses] = useState<Class[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [classSubjects, setClassSubjects] = useState<ClassSubject[]>([]);
    const [selectedClass, setSelectedClass] = useState<string | undefined>();
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
    const { user } = useAuth();
    const { toast } = useToast();

    const fetchData = () => {
        setClasses(getClasses());
        setSubjects(getSubjects());
        setClassSubjects(addClassSubject());
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedClass) {
            const subjectsForClass = classSubjects
                .filter(cs => cs.class_id === selectedClass)
                .map(cs => cs.subject_id);
            setSelectedSubjects(subjectsForClass);
        } else {
            setSelectedSubjects([]);
        }
    }, [selectedClass, classSubjects]);

    const handleSave = () => {
        if (!selectedClass || !user) return;

        // Remove all assignments for the selected class
        const otherClassAssignments = classSubjects.filter(cs => cs.class_id !== selectedClass);

        // Add the new assignments for the selected class
        const newAssignmentsForClass = selectedSubjects.map(subject_id => ({ class_id: selectedClass, subject_id }));
        
        const newClassSubjects = [...otherClassAssignments, ...newAssignmentsForClass];
        saveClassSubjects(newClassSubjects);
        fetchData(); // Refetch all data

        toast({
            title: 'Assignments Saved',
            description: `Subject assignments for ${classes.find(c => c.id === selectedClass)?.name} have been updated.`
        });
        
        addAuditLog({
            user: user.email,
            name: user.name,
            action: 'Update Class Assignments',
            details: `Updated subject assignments for class ID ${selectedClass}.`
        })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Subjects by Class</CardTitle>
                <CardDescription>Select a class to view and edit its assigned subjects.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Select a Class</label>
                        <Select onValueChange={setSelectedClass} value={selectedClass}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a class..." />
                            </SelectTrigger>
                            <SelectContent>
                                {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedClass && (
                         <div className="space-y-2">
                            <label className="text-sm font-medium">Assign Subjects</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                    variant="outline"
                                    role="combobox"
                                    className="w-full justify-between h-auto"
                                    >
                                    <div className="flex gap-1 flex-wrap">
                                        {selectedSubjects.length > 0 ? (
                                            selectedSubjects.map(value => {
                                                const option = subjects.find(o => o.id === value);
                                                return <Badge variant="secondary" key={value}>{option?.name || value}</Badge>;
                                            })
                                        ) : `Select subjects...`}
                                    </div>
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search subjects..." />
                                        <CommandList>
                                            <CommandEmpty>No results found.</CommandEmpty>
                                            <CommandGroup>
                                            {subjects.map(option => {
                                                const isSelected = selectedSubjects.includes(option.id);
                                                return (
                                                    <CommandItem
                                                        key={option.id}
                                                        onSelect={() => {
                                                            const newSelection = isSelected
                                                                ? selectedSubjects.filter(v => v !== option.id)
                                                                : [...selectedSubjects, option.id];
                                                            setSelectedSubjects(newSelection);
                                                        }}
                                                    >
                                                        <Check className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
                                                        {option.name}
                                                    </CommandItem>
                                                );
                                            })}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    )}
                </div>
            </CardContent>
            {selectedClass && (
                <CardFooter className="justify-end">
                    <Button onClick={handleSave}>Save Assignments</Button>
                </CardFooter>
            )}
        </Card>
    )
}
