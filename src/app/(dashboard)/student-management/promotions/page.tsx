'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getClasses, getStudentProfiles, addAuditLog } from '@/lib/store';
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
    const searchParams = useSearchParams();
    const preselectedClass = searchParams.get('classId');

    const [classes, setClasses] = useState<Class[]>([]);
    const [fromClass, setFromClass] = useState<string | undefined>(preselectedClass || undefined);
    const [toClass, setToClass] = useState<string | undefined>();
    const [studentsInClass, setStudentsInClass] = useState<StudentForPromotion[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<Record<string, boolean>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSpecialPromotion, setIsSpecialPromotion] = useState(false);
    const [specialPromotionReason, setSpecialPromotionReason] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const { user } = useAuth();
    const { toast } = useToast();

    const FINAL_CLASS_ID = 'jhs3'; // Assuming this is the final class before graduation

    useEffect(() => {
        const allClasses = getClasses();
        setClasses(allClasses);
    }, []);

    useEffect(() => {
        async function fetchStudents() {
            if (fromClass && classes.length > 0) {
                console.log(`Debug: Promotions fetch started for class ${fromClass}, user ${user?.id}`);
                // Fetch students with specific filters for better accuracy and performance
                try {
                    const { students: allStudentProfiles } = await getStudentProfiles(1, 1000, '', 'Admitted', user?.id, fromClass);
                    console.log(`Debug: Profiles returned from API: ${allStudentProfiles.length}`);

                    const selectedClassObj = classes.find(c => String(c.id) === String(fromClass));
                    console.log(`Debug: Selected Class Object:`, selectedClassObj);

                    const classMap = new Map(classes.map(c => [String(c.id), c.name]));
                    const filteredStudents = allStudentProfiles
                        .filter(p => {
                            if (!p || !p.admissionDetails) {
                                console.log("Debug: Profile or admissionDetails missing", p);
                                return false;
                            }

                            // Check match against both numeric ID and class code (class_id)
                            const classMatch = selectedClassObj && (
                                String(p.admissionDetails.class_assigned) === String(selectedClassObj.id) ||
                                String(p.admissionDetails.class_assigned) === String(selectedClassObj.class_id)
                            );

                            const statusMatch = p.admissionDetails.admission_status === 'Admitted' || p.admissionDetails.admission_status === 'Active';

                            if (!classMatch || !statusMatch) {
                                // console.log(`Debug: Student ${p.student?.student_no} excluded. ClassMatch: ${classMatch} (Student class: ${p.admissionDetails.class_assigned}), StatusMatch: ${statusMatch}`);
                            }
                            return classMatch && statusMatch;
                        })
                        .map(p => ({
                            id: p.student.student_no,
                            name: `${p.student.first_name}${p.student.other_name ? ' ' + p.student.other_name : ''} ${p.student.last_name}`,
                            currentClass: classMap.get(String(p.admissionDetails.class_assigned)) || 'N/A'
                        }));

                    console.log(`Debug: Final filtered students for display: ${filteredStudents.length}`);
                    setStudentsInClass(filteredStudents);
                    setSelectedStudents({}); // Reset selection when class changes
                } catch (error) {
                    console.error("Debug: Error in fetchStudents:", error);
                }
            } else {
                setStudentsInClass([]);
            }
        }
        fetchStudents();
    }, [fromClass, classes, user?.id]);

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
        console.log('Promotion button clicked', { fromClass, toClass, count: studentIdsToPromote.length, isSpecialPromotion });

        if (!user) {
            console.log('Early return: no user');
            return;
        }
        if (!fromClass) {
            console.log('Early return: no fromClass');
            return;
        }
        if (!toClass) {
            console.log('Early return: no toClass');
            return;
        }
        if (studentIdsToPromote.length === 0) {
            console.log('Early return: no students selected');
            return;
        }
        if (isSpecialPromotion && !specialPromotionReason) {
            toast({
                variant: 'destructive',
                title: 'Reason Required',
                description: `A reason must be provided for a special promotion.`,
            });
            console.log('Early return: special promotion requires reason');
            return;
        }

        setIsLoading(true);

        try {
            const token = localStorage.getItem('campusconnect_token');
            const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'devKey123';
            const baseUri = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1/8000/api/v1';

            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            let endpoint: string;
            let payload: any;

            if (isSpecialPromotion) {
                endpoint = '/api/promotions/special';
                if (studentIdsToPromote.length === 1) {
                    payload = {
                        student_no: studentIdsToPromote[0],
                        target_class_id: toClass,
                        remarks: specialPromotionReason,
                    };
                } else {
                    const studentsObj: Record<string, { student_no: string }> = {};
                    studentIdsToPromote.forEach((sno, idx) => {
                        studentsObj[String(idx + 1)] = { student_no: sno };
                    });
                    payload = {
                        students: studentsObj,
                        target_class_id: toClass,
                        remarks: specialPromotionReason,
                    };
                }
            } else {
                endpoint = "/api/promotions/normal";

                if (studentIdsToPromote.length === 1) {
                    payload = { student_no: studentIdsToPromote[0] };
                } else {
                    const studentsObj: Record<string, { student_no: string }> = {};
                    studentIdsToPromote.forEach((sno, idx) => {
                        studentsObj[String(idx + 1)] = { student_no: sno };
                    });
                    payload = { students: studentsObj };
                }
            }

            const csrfToken = localStorage.getItem('csrf_token') || '';
            console.log('Promotion request', csrfToken);

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-API-KEY': apiKey,
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify(payload),
            });

            const responseBody = await res.json().catch(() => ({}));
            console.log('Promotion response', res.status, responseBody);

            if (!res.ok) {
                throw new Error(responseBody?.message || `Promotion failed: ${res.status} ${res.statusText}`);
            }

            fetchStudentData();

            setIsLoading(false);
            // Keep fromClass and toClass selected to allow consecutive promotions
            setSelectedStudents({});
            setIsSpecialPromotion(false);
            setSpecialPromotionReason('');

            if (responseBody.success) {
                const promotedCount = responseBody?.data?.promoted_count ?? studentIdsToPromote.length;
                toast({
                    title: 'Promotion Successful',
                    description: `${promotedCount} student(s) have been promoted.`,
                });
            }else {
                let messages = responseBody.message.map(m => {
                    return m.message
                });

                console.log(messages);
                
                toast({
                    variant: 'destructive',
                    title: 'Promotion Failed',
                    description: messages,
                })
            }

            addAuditLog({
                user: user.email,
                name: user.name,
                action: isSpecialPromotion ? 'Special Promotion' : 'Promote Students',
                details: `${isSpecialPromotion ? 'Special' : 'Standard'} promotion performed from ${fromClass} to ${toClass} for ${studentIdsToPromote.length} student(s). ${isSpecialPromotion ? `Reason: ${specialPromotionReason}` : ''}`,
            });
        } catch (err: any) {
            console.error('Promotion error', err);
            setErrorMessage(err.message || 'Unable to promote students.');
            setIsLoading(false);
        }
    }

    const handleGraduation = async () => {
        console.log('Graduation button clicked', { fromClass, count: studentIdsToPromote.length });

        if (!user) {
            console.log('Early return: no user');
            return;
        }
        if (studentIdsToPromote.length === 0) {
            console.log('Early return: no students selected');
            return;
        }

        setIsLoading(true);

        try {
            const token = localStorage.getItem('campusconnect_token');
            const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'devKey123';

            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const endpoint = '/api/promotions/graduate';
            let payload: any;

            if (studentIdsToPromote.length === 1) {
                payload = { student_no: studentIdsToPromote[0] };
            } else {
                const studentsObj: Record<string, { student_no: string }> = {};
                studentIdsToPromote.forEach((sno, idx) => {
                    studentsObj[String(idx + 1)] = { student_no: sno };
                });
                payload = { students: studentsObj };
            }

            console.log('Graduation request', endpoint, payload);
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-API-KEY': apiKey,
                },
                body: JSON.stringify(payload),
            });

            const responseBody = await res.json().catch(() => ({}));
            console.log('Graduation response', res.status, responseBody);

            if (!res.ok) {
                throw new Error(responseBody?.message || `Graduation failed: ${res.status} ${res.statusText}`);
            }

            fetchStudentData();

            setIsLoading(false);
            // Keep fromClass selected to allow consecutive graduations
            setSelectedStudents({});

            const graduatedCount = responseBody?.data?.graduated_count ?? studentIdsToPromote.length;
            toast({
                title: 'Graduation Successful',
                description: `${graduatedCount} student(s) have been marked as graduated.`,
            });

            addAuditLog({
                user: user.email,
                name: user.name,
                action: 'Graduate Students',
                details: `Graduated ${studentIdsToPromote.length} student(s) from class ID ${fromClass}.`,
            });
        } catch (err: any) {
            console.error('Graduation error', err);
            setErrorMessage(err.message || 'Unable to graduate students.');
            setIsLoading(false);
        }
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
                                        <Button disabled={isGraduationDisabled} size="sm" onClick={() => console.log('Graduation button clicked (trigger)', { fromClass, count: studentIdsToPromote.length })}>
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
                                            <AlertDialogAction asChild>
                                                <Button onClick={() => { console.log('Confirm graduation clicked'); handleGraduation(); }}>Proceed</Button>
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            ) : (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button disabled={isPromotionDisabled} size="sm" onClick={() => console.log('Promotion button clicked (trigger)', { fromClass, toClass, count: studentIdsToPromote.length, isSpecialPromotion })}>
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
                                            <AlertDialogAction asChild>
                                                <Button onClick={() => { console.log('Confirm promotion clicked'); handlePromotion(); }}>Confirm</Button>
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </CardFooter>
                    </Card>
                )}

                <AlertDialog open={!!errorMessage} onOpenChange={() => setErrorMessage(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Error</AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogDescription className="max-h-96 overflow-y-auto whitespace-pre-wrap break-words">
                            {errorMessage}
                        </AlertDialogDescription>
                        <AlertDialogFooter>
                            <AlertDialogAction onClick={() => setErrorMessage(null)}>Close</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </ProtectedRoute>
    );
}
