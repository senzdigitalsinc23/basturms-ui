

'use client';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getClasses, getStudentProfiles, getPromotionCriteria, getClassSchoolLevel } from '@/lib/store';
import { Class, StudentProfile, PromotionCriteria, PromotionRule } from '@/lib/types';
import Link from 'next/link';
import { ArrowRight, GraduationCap, Users, RefreshCw } from 'lucide-react';

type PromotionSuggestion = {
    classId: string;
    className: string;
    studentCount: number;
    promotionReadyCount: number;
    isGraduation: boolean;
};

const FINAL_CLASS_ID = 'jhs3';

export function PromotionSuggestions() {
    const [suggestions, setSuggestions] = useState<PromotionSuggestion[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchSuggestions = useCallback(async () => {
        setLoading(true);
        const classes = getClasses();
        const students = await getStudentProfiles();
        const criteria = getPromotionCriteria();
        
        const promotionSuggestions: PromotionSuggestion[] = classes
            .map(c => {
                const studentsInClass = students.filter(s => s.admissionDetails.class_assigned === c.id && s.admissionDetails.admission_status === 'Admitted');
                
                if (studentsInClass.length === 0) return null;

                const schoolLevel = getClassSchoolLevel(c.id);
                const rule = schoolLevel ? criteria[schoolLevel] : null;

                let promotionReadyCount = 0;
                if(rule) {
                    studentsInClass.forEach(student => {
                        const totalScore = student.assignmentScores?.reduce((acc, s) => acc + s.score, 0) || 0;
                        const avgScore = totalScore > 0 ? totalScore / (student.assignmentScores?.length || 1) : 0;
                        
                        if (avgScore < rule.minAverageScore) return;

                        const compulsoryPassed = rule.compulsorySubjects?.every(subId => {
                            const scoresForSub = student.assignmentScores?.filter(s => s.subject_id === subId);
                            if (!scoresForSub || scoresForSub.length === 0) return false;
                            const avgSubScore = scoresForSub.reduce((acc, s) => acc + s.score, 0) / scoresForSub.length;
                            return avgSubScore >= rule.minPassMark;
                        });

                        if (compulsoryPassed === false) return; // Use explicit false check as it can be undefined

                        if (rule.electiveSubjects && rule.minElectivesToPass) {
                            const electivesPassedCount = rule.electiveSubjects.reduce((count, subId) => {
                                const scoresForSub = student.assignmentScores?.filter(s => s.subject_id === subId);
                                if (!scoresForSub || scoresForSub.length === 0) return count;
                                const avgSubScore = scoresForSub.reduce((acc, s) => acc + s.score, 0) / scoresForSub.length;
                                if (avgSubScore >= rule.minPassMark) {
                                    return count + 1;
                                }
                                return count;
                            }, 0);
                            
                            if (electivesPassedCount < rule.minElectivesToPass) return;
                        }

                        promotionReadyCount++;
                    });
                } else {
                    // Fallback if no criteria: all students are ready
                    promotionReadyCount = studentsInClass.length;
                }

                return {
                    classId: c.id,
                    className: c.name,
                    studentCount: studentsInClass.length,
                    promotionReadyCount,
                    isGraduation: c.id === FINAL_CLASS_ID,
                };
            })
            .filter((item): item is PromotionSuggestion => item !== null);
        
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
                    <CardTitle>Automatic Promotion &amp; Graduation</CardTitle>
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
                    <CardTitle>Automatic Promotion &amp; Graduation</CardTitle>
                    <CardDescription>Review classes with students who meet the promotion criteria.</CardDescription>
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
                                            <span>{suggestion.promotionReadyCount} of {suggestion.studentCount} student(s) ready</span>
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
