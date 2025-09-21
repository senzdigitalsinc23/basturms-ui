'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getClasses, getStudentProfiles } from '@/lib/store';
import { Class, StudentProfile } from '@/lib/types';
import Link from 'next/link';
import { ArrowRight, GraduationCap, Users } from 'lucide-react';

type PromotionSuggestion = {
    classId: string;
    className: string;
    studentCount: number;
    isGraduation: boolean;
};

const FINAL_CLASS_ID = 'jhs3';

export function PromotionSuggestions() {
    const [suggestions, setSuggestions] = useState<PromotionSuggestion[]>([]);

    useEffect(() => {
        const classes = getClasses();
        const students = getStudentProfiles();
        const studentCountByClass = students.reduce((acc, student) => {
            const classId = student.admissionDetails.class_assigned;
            if (student.admissionDetails.admission_status === 'Admitted') {
                acc[classId] = (acc[classId] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        const promotionSuggestions: PromotionSuggestion[] = classes
            .map(c => ({
                classId: c.id,
                className: c.name,
                studentCount: studentCountByClass[c.id] || 0,
                isGraduation: c.id === FINAL_CLASS_ID,
            }))
            .filter(c => c.studentCount > 0);
        
        setSuggestions(promotionSuggestions);
    }, []);

    if (suggestions.length === 0) {
        return null; // Don't render anything if there are no suggestions
    }

    return (
        <Card id="promotions">
            <CardHeader>
                <CardTitle>Automatic Promotion & Graduation</CardTitle>
                <CardDescription>The following classes have active students and are ready for end-of-year processing.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {suggestions.map(suggestion => (
                        <div key={suggestion.classId} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-4">
                                {suggestion.isGraduation ? <GraduationCap className="h-6 w-6 text-blue-500" /> : <ArrowRight className="h-6 w-6 text-green-500" />}
                                <div>
                                    <h4 className="font-semibold">{suggestion.className}</h4>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Users className="h-4 w-4" />
                                        <span>{suggestion.studentCount} student(s) ready</span>
                                    </div>
                                </div>
                            </div>
                            <Button asChild size="sm">
                                <Link href={`/student-management/promotions?classId=${suggestion.classId}`}>Review List</Link>
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
