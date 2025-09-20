

'use client';

import { useState, useEffect } from 'react';
import { getClasses, getStudentProfiles, promoteStudents, graduateStudents, addAuditLog } from '@/lib/store';
import { Class, StudentProfile } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { ProtectedRoute } from '@/components/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowRight, GraduationCap, Info, Loader2, ChevronsRight } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type StudentForPromotion = {
    id: string;
    name: string;
    currentClass: string;
}

export default function PromotionsPage() {
    const [classes, setClasses] = useState<Class[]>([]);
    const [fromClass, setFromClass] = useState<string | undefined>();
    const [toClass, setToClass] = useState<string | undefined>();
    const [studentsInClass, setStudentsInClass] = useState<StudentForPromotion[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<Record<string, boolean>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSpecialPromotion, setIsSpecialPromotion] = useState(false);
    const [specialPromotionReason, setSpecialPromotionReason] = useState('');
    
    const { user } = useAuth();
    const { toast } = useToast();

    const FINAL_CLASS_ID = 'jhs3'; // Assuming this is the final class before graduation

    useEffect(() => {
        const allClasses = getClasses();
        setClasses(allClasses);
    }, []);

    useEffect(() => {
        if (fromClass) {
            const allStudentProfiles = getStudentProfiles();
            const classMap = new Map(classes.map(c => [c.id, c.name]));
            const filteredStudents = allStudentProfiles
                .filter(p => p.admissionDetails.class_assigned === fromClass && p.admissionDetails.admission_status === 'Admitted')
                .map(p => ({
                    id: p.student.student_no,
                    name: `${p.student.first_name} ${p.student.last_name}`,
                    currentClass: classMap.get(p.admissionDetails.class_assigned) || 'N/A'
                }));
            setStudentsInClass(filteredStudents);
            setSelectedStudents({}); // Reset selection when class changes
        } else {
            setStudentsInClass([]);
        }
    }, [fromClass, classes]);

    const isAllSelected = studentsInClass.length > 0 && Object.keys(selectedStudents).length === studentsInClass.length && Object.keys(selectedStudents).length === studentsInClass.length;

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const newSelection = studentsInClass.reduce((acc, student) => {
                acc[student.id] = true;
                return acc;
            }, {} as Record<string, boolean>);
            setSelectedStudents(newSelection);
        } else {
            setSelectedStudents({});
        }
    }

    const handleSelectSingle = (studentId: string, checked: boolean) => {
        const newSelection = { ...selectedStudents };
        if (checked) {
            newSelection[studentId] = true;
        } else {
            delete newSelection[studentId];
        }
        setSelectedStudents(newSelection);
    }
    
    const studentIdsToPromote = Object.keys(selectedStudents).filter(id => selectedStudents[id]);
    
    const fromClassIndex = classes.findIndex(c => c.id === fromClass);
    const expectedToClass = classes[fromClassIndex + 1];

    const isInvalidStandardPromotion = !isSpecialPromotion && toClass && expectedToClass && toClass !== expectedToClass.id;
    
    const fetchStudentData = () => {
        // This function re-triggers the useEffect that depends on fromClass
        // by resetting the value, which will then be set again, causing a refresh.
        const currentFrom = fromClass;
        setFromClass(undefined);
        setTimeout(() => setFromClass(currentFrom), 0);
    }

    const handlePromotion = async () => {
        if (!user || !fromClass || !toClass || studentIdsToPromote.length === 0) return;
        if (isSpecialPromotion && !specialPromotionReason) {
             toast({
                variant: 'destructive',
                title: 'Reason Required',
                description: `A reason must be provided for a special promotion.`,
            });
            return;
        }

        setIsLoading(true);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const updatedCount = promoteStudents(studentIdsToPromote, toClass, user.id);
        
        fetchStudentData(); // Re-fetch students after promotion

        setIsLoading(false);
        setFromClass(undefined);
        setToClass(undefined);
        setSelectedStudents({});
        setIsSpecialPromotion(false);
        setSpecialPromotionReason('');

        toast({
            title: 'Promotion Successful',
            description: `${updatedCount} student(s) have been promoted.`,
        });

        addAuditLog({
            user: user.email,
            name: user.name,
            action: isSpecialPromotion ? 'Special Promotion' : 'Promote Students',
            details: `Promoted ${updatedCount} students from class ID ${fromClass} to ${toClass}. ${isSpecialPromotion ? `Reason: ${specialPromotionReason}` : ''}`,
        });
    }

    const handleGraduation = async () => {
        if (!user || studentIdsToPromote.length === 0) return;
        
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        const updatedCount = graduateStudents(studentIdsToPromote, user.id);
        
        fetchStudentData(); // Re-fetch students after graduation

        setIsLoading(false);
        setFromClass(undefined);
        setSelectedStudents({});

        toast({
            title: 'Graduation Successful',
            description: `${updatedCount} student(s) have been marked as graduated.`,
        });

        addAuditLog({
            user: user.email,
            name: user.name,
            action: 'Graduate Students',
            details: `Graduated ${updatedCount} students from class ID ${fromClass}.`,
        });
    }
    
    let isPromotionDisabled = isLoading || !fromClass || !toClass || studentIdsToPromote.length === 0 || fromClass === toClass || isInvalidStandardPromotion;
    if (isSpecialPromotion) {
        isPromotionDisabled = isLoading || !fromClass || !toClass || studentIdsToPromote.length === 0 || fromClass === toClass || !specialPromotionReason;
    }
    
    const isGraduationDisabled = isLoading || !fromClass || fromClass !== FINAL_CLASS_ID || studentIdsToPromote.length === 0;

    return (
        <ProtectedRoute allowedRoles={['Admin']}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Student Promotion &amp; Graduation</h1>
                    <p className="text-muted-foreground">
                        Manage student progression to the next class or graduation.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>1. Select Classes &amp; Options</CardTitle>
                        <CardDescription>Choose the class to promote from, the class to promote to, and any special options.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-3 items-center gap-4">
                            <Select value={fromClass} onValueChange={setFromClass}>
                                <SelectTrigger>
                                    <SelectValue placeholder="From Class" />
                                </SelectTrigger>
                                <SelectContent>
                                    {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            
                            {fromClass !== FINAL_CLASS_ID && (
                                <>
                                    <div className="flex justify-center">
                                        {isSpecialPromotion ? <ChevronsRight className="h-6 w-6 text-primary" /> : <ArrowRight className="h-6 w-6 text-muted-foreground" />}
                                    </div>
                                    <Select value={toClass} onValueChange={setToClass} disabled={!fromClass}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="To Class" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {classes.filter(c => {
                                                if (!fromClass) return true;
                                                if (isSpecialPromotion) return c.id !== fromClass;
                                                return expectedToClass ? c.id === expectedToClass.id : c.id !== fromClass;
                                            }).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </>
                            )}
                             {fromClass === FINAL_CLASS_ID && (
                                <div className="md:col-span-2 flex items-center justify-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-md">
                                    <GraduationCap className="h-8 w-8 text-blue-600" />
                                    <p className="font-medium text-blue-800">This is the final class. Selected students will be moved to the graduation workflow.</p>
                                </div>
                            )}
                        </div>
                         {(fromClass && fromClass === toClass) && (
                            <Alert variant="destructive" className="mt-4">
                                <Info className="h-4 w-4" />
                                <AlertTitle>Invalid Selection</AlertTitle>
                                <AlertDescription>
                                    "From" and "To" classes cannot be the same for promotion.
                                </AlertDescription>
                            </Alert>
                        )}
                        {isInvalidStandardPromotion && (
                            <Alert variant="destructive" className="mt-4">
                                <Info className="h-4 w-4" />
                                <AlertTitle>Invalid Promotion Sequence</AlertTitle>
                                <AlertDescription>
                                    Standard promotion must be to the next sequential class. For class jumps, please use the "Special Promotion" option.
                                </AlertDescription>
                            </Alert>
                        )}
                        <div className="flex items-center space-x-2 mt-4">
                            <Checkbox id="special-promotion" checked={isSpecialPromotion} onCheckedChange={(checked) => setIsSpecialPromotion(!!checked)} disabled={!fromClass || fromClass === FINAL_CLASS_ID} />
                            <Label htmlFor="special-promotion" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Special Promotion (Allow Class Jump)
                            </Label>
                        </div>
                        {isSpecialPromotion && fromClass && (
                            <div className="mt-4 space-y-2">
                                <Label htmlFor="special-promotion-reason">Reason for Special Promotion</Label>
                                <Textarea id="special-promotion-reason" value={specialPromotionReason} onChange={(e) => setSpecialPromotionReason(e.target.value)} placeholder="e.g., Student has shown exceptional academic performance and is ready for an advanced class." />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {fromClass && (
                    <Card>
                        <CardHeader>
                            <CardTitle>2. Select Students</CardTitle>
                            <CardDescription>Select the students you want to promote or graduate from <span className="font-bold">{classes.find(c => c.id === fromClass)?.name}</span>.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[50px]">
                                                <Checkbox
                                                    checked={isAllSelected}
                                                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                                    aria-label="Select all"
                                                />
                                            </TableHead>
                                            <TableHead>Student ID</TableHead>
                                            <TableHead>Student Name</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {studentsInClass.length > 0 ? (
                                            studentsInClass.map(student => (
                                                <TableRow key={student.id}>
                                                    <TableCell>
                                                        <Checkbox
                                                            checked={!!selectedStudents[student.id]}
                                                            onCheckedChange={(checked) => handleSelectSingle(student.id, !!checked)}
                                                            aria-label={`Select ${student.name}`}
                                                        />
                                                    </TableCell>
                                                    <TableCell>{student.id}</TableCell>
                                                    <TableCell>{student.name}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={3} className="h-24 text-center">
                                                    No active students found in this class.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                        <CardFooter className="justify-end gap-2">
                             {fromClass === FINAL_CLASS_ID ? (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button disabled={isGraduationDisabled} size="sm">
                                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            <GraduationCap className="mr-2 h-4 w-4" />
                                            Graduate Selected ({studentIdsToPromote.length})
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure you want to graduate these students?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will change the status of {studentIdsToPromote.length} student(s) to "Graduated". This action can be reversed manually but should be performed with care.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleGraduation}>Proceed</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                             ) : (
                                 <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button disabled={isPromotionDisabled} size="sm">
                                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            {isSpecialPromotion && <ChevronsRight className="mr-2 h-4 w-4" />}
                                            Promote Selected ({studentIdsToPromote.length})
                                        </Button>
                                    </AlertDialogTrigger>
                                     <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Confirm Promotion</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                You are about to promote {studentIdsToPromote.length} student(s) from <span className="font-bold">{classes.find(c => c.id === fromClass)?.name}</span> to <span className="font-bold">{classes.find(c => c.id === toClass)?.name}</span>. Please confirm.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handlePromotion}>Confirm</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                             )}
                        </CardFooter>
                    </Card>
                )}
            </div>
        </ProtectedRoute>
    );
}
