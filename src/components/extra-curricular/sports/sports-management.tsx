
'use client';
import { useState, useEffect } from 'react';
import { getStaff, getStudentProfiles } from '@/lib/store';
import { Staff, StudentProfile, Sport } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';


// Mock functions for sports data, replace with actual store implementation later
const getSports = (): Sport[] => JSON.parse(localStorage.getItem('campusconnect_sports') || '[]');
const saveSports = (sports: Sport[]): void => localStorage.setItem('campusconnect_sports', JSON.stringify(sports));


export function SportsManagement() {
    const [sports, setSports] = useState<Sport[]>([]);
    const [teachers, setTeachers] = useState<Staff[]>([]);
    const [students, setStudents] = useState<StudentProfile[]>([]);
    const { user } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        setSports(getSports());
        setTeachers(getStaff().filter(s => s.roles.includes('Teacher')));
        setStudents(getStudentProfiles());
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Button disabled>
                    <PlusCircle className="mr-2"/> Create Team
                </Button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="md:col-span-2 lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Feature Coming Soon</CardTitle>
                        <CardDescription>
                            This section for managing sports teams is currently under construction. 
                            You will soon be able to create teams, assign coaches, and manage student rosters here.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center h-48 bg-muted rounded-md">
                            <p className="text-muted-foreground">Sports Management Coming Soon</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

