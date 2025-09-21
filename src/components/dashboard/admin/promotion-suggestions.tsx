
'use client';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getClasses, getStudentProfiles } from '@/lib/store';
import { Class } from '@/lib/types';
import Link from 'next/link';
import { ArrowRight, GraduationCap, Users, RefreshCw } from 'lucide-react';

type PromotionSuggestion = {
    classId: string;
    className: string;
    studentCount: number;
    isGraduation: boolean;
};

const FINAL_CLASS_ID = 'jhs3';

export function PromotionSuggestions() {
    const [suggestions, setSuggestions] = useState<PromotionSuggestion[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchSuggestions = useCallback(() => {
        setLoading(true);
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
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchSuggestions();
    }, [fetchSuggestions]);
    
    const handleRefresh = () => {
        fetchSuggestions();
    }

    if (suggestions.length === 0 && !loading) {
        return (
             <Card id="promotions">
                <CardHeader>
                    <CardTitle>Automatic Promotion & Graduation</CardTitle>
                    <CardDescription>The following classes have active students and are ready for end-of-year processing.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-muted-foreground py-4">
                        <p>No classes with active students are currently pending promotion or graduation.</p>
                        <Button variant="outline" size="sm" onClick={handleRefresh} className="mt-4">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Check for Updates
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card id="promotions">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Automatic Promotion & Graduation</CardTitle>
                    <CardDescription>The following classes have active students and are ready for end-of-year processing.</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </CardHeader>
            <CardContent>
                 {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <RefreshCw className="h-6 w-6 text-muted-foreground animate-spin" />
                    </div>
                ) : (
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
                )}
            </CardContent>
        </Card>
    );
}
