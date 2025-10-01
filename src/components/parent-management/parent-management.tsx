'use client';
import { useState, useEffect } from 'react';
import { getStudentProfiles, getClasses } from '@/lib/store';
import { StudentProfile, Class } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MessageSquare, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';

type ParentDisplay = {
    guardian_name: string;
    guardian_phone: string;
    guardian_email?: string;
    students: {
        id: string;
        name: string;
        className: string;
    }[];
};

export function ParentManagement() {
    const [parents, setParents] = useState<ParentDisplay[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);

    useEffect(() => {
        const studentProfiles = getStudentProfiles();
        const classData = getClasses();
        setClasses(classData);
        const classMap = new Map(classData.map(c => [c.id, c.name]));

        const parentMap = new Map<string, ParentDisplay>();

        studentProfiles.forEach(profile => {
            const guardianKey = profile.guardianInfo.guardian_phone; // Using phone as a unique key for guardians
            if (!guardianKey) return;

            let parentEntry = parentMap.get(guardianKey);

            if (!parentEntry) {
                parentEntry = {
                    guardian_name: profile.guardianInfo.guardian_name,
                    guardian_phone: profile.guardianInfo.guardian_phone,
                    guardian_email: profile.guardianInfo.guardian_email,
                    students: []
                };
            }

            parentEntry.students.push({
                id: profile.student.student_no,
                name: `${profile.student.first_name} ${profile.student.last_name}`,
                className: classMap.get(profile.admissionDetails.class_assigned) || 'N/A'
            });

            parentMap.set(guardianKey, parentEntry);
        });

        setParents(Array.from(parentMap.values()));

    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Parents & Guardians List</CardTitle>
                <CardDescription>A centralized list of all parents and guardians linked to students.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Parent/Guardian Name</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Children/Wards</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {parents.map(parent => (
                                <TableRow key={parent.guardian_phone}>
                                    <TableCell className="font-medium">{parent.guardian_name}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{parent.guardian_phone}</span>
                                            <span className="text-xs text-muted-foreground">{parent.guardian_email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            {parent.students.map(student => (
                                                <Badge key={student.id} variant="secondary" className="font-normal">
                                                    {student.name} ({student.className})
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem>
                                                    <MessageSquare className="mr-2 h-4 w-4" />
                                                    Send Message
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
