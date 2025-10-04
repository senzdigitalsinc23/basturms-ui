
'use client';
import { useState, useEffect } from 'react';
import { getClasses, getStudentProfiles, getAcademicYears, calculateStudentReport, StudentReport, saveStudentReport, getStudentReport, getStaffAppointmentHistory, getStaff, getUserById } from '@/lib/store';
import { Class, StudentProfile, AcademicYear, Term } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReportCard } from './report-card';
import { Loader2, Printer, Pencil, FileSignature } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

type ReportEditorProps = {
    reportData: StudentReport | null;
    onSave: (updatedReport: StudentReport) => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

function ReportEditor({ reportData, onSave, open, onOpenChange }: ReportEditorProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    
    const [conduct, setConduct] = useState('');
    const [talentAndInterest, setTalentAndInterest] = useState('');
    const [classTeacherRemarks, setClassTeacherRemarks] = useState('');
    const [headTeacherRemarks, setHeadTeacherRemarks] = useState('');
    const [appendTeacherSig, setAppendTeacherSig] = useState(false);
    const [appendHeadSig, setAppendHeadSig] = useState(false);

    const isTeacher = user?.role === 'Teacher';
    const isAdmin = user?.role === 'Admin' || user?.role === 'Headmaster';
    
    useEffect(() => {
        if (reportData) {
            setConduct(reportData.conduct);
            setTalentAndInterest(reportData.talentAndInterest);
            setClassTeacherRemarks(reportData.classTeacherRemarks);
            setHeadTeacherRemarks(reportData.headTeacherRemarks);
            setAppendTeacherSig(!!reportData.classTeacherSignature);
            setAppendHeadSig(!!reportData.headTeacherSignature);
        }
    }, [reportData]);

    const handleSave = () => {
        if (!reportData || !user) return;

        const classTeacher = getStaff().find(s => s.staff_id === reportData.classTeacherId);
        const headTeacher = getStaff().find(s => s.roles.includes('Headmaster'));
        const headTeacherUser = headTeacher ? getUserById(headTeacher.user_id) : null;
        const classTeacherUser = classTeacher ? getUserById(classTeacher.user_id) : null;

        if (appendTeacherSig && !classTeacherUser?.signature) {
            toast({ variant: "destructive", title: "Signature Missing", description: "Class teacher's signature not found on system. Cannot sign report." });
            return;
        }

        if (appendHeadSig && !headTeacherUser?.signature) {
            toast({ variant: "destructive", title: "Signature Missing", description: "Headmaster's signature not found on system. Cannot sign report." });
            return;
        }

        const updatedReport: StudentReport = {
            ...reportData,
            conduct,
            talentAndInterest,
            classTeacherRemarks,
            headTeacherRemarks: isAdmin ? headTeacherRemarks : reportData.headTeacherRemarks,
            classTeacherSignature: appendTeacherSig ? classTeacherUser?.signature || null : null,
            headTeacherSignature: isAdmin && appendHeadSig ? headTeacherUser?.signature || null : reportData.headTeacherSignature,
        };
        
        updatedReport.status = updatedReport.headTeacherSignature ? 'Final' : (updatedReport.classTeacherSignature ? 'Provisional' : reportData.status);
        
        onSave(updatedReport);
    }
    
    if (!reportData) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit Report for {reportData.student.student.first_name}</DialogTitle>
                    <DialogDescription>Add remarks and other details to finalize the report.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto p-2">
                     <div className="p-4 border rounded-md">
                        <h4 className="font-semibold mb-2">Conduct & Attitude</h4>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="conduct">Conduct</Label>
                                <Textarea id="conduct" value={conduct} onChange={(e) => setConduct(e.target.value)} disabled={!isAdmin && !isTeacher} />
                            </div>
                            <div>
                                <Label htmlFor="talent">Talent & Interest</Label>
                                <Textarea id="talent" value={talentAndInterest} onChange={(e) => setTalentAndInterest(e.target.value)} disabled={!isAdmin && !isTeacher} />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border rounded-md">
                        <h4 className="font-semibold mb-2">Class Teacher's Remarks & Signature</h4>
                        <Textarea id="teacher-remarks" value={classTeacherRemarks} onChange={(e) => setClassTeacherRemarks(e.target.value)} disabled={!isAdmin && !isTeacher} />
                         <div className="flex items-center space-x-2 mt-2">
                           <Checkbox id="teacher-signature" checked={appendTeacherSig} onCheckedChange={(checked) => setAppendTeacherSig(!!checked)} disabled={!isAdmin && !isTeacher} />
                           <Label htmlFor="teacher-signature">Append Class Teacher's Signature</Label>
                        </div>
                    </div>

                    {isAdmin && (
                        <div className="p-4 border rounded-md bg-muted/50">
                            <h4 className="font-semibold mb-2">Head Teacher's Remarks & Signature</h4>
                            <Textarea id="head-remarks" value={headTeacherRemarks} onChange={(e) => setHeadTeacherRemarks(e.target.value)} />
                           <div className="flex items-center space-x-2 mt-2">
                               <Checkbox id="head-signature" checked={appendHeadSig} onCheckedChange={(checked) => setAppendHeadSig(!!checked)} />
                               <Label htmlFor="head-signature">Append Head Teacher's Signature & Finalize</Label>
                            </div>
                        </div>
                    )}
                </div>
                <Button onClick={handleSave}>Save Report</Button>
            </DialogContent>
        </Dialog>
    );
}

export function ReportCardGenerator() {
    const { user } = useAuth();
    const [allClasses, setAllClasses] = useState<Class[]>([]);
    const [teacherClasses, setTeacherClasses] = useState<Class[]>([]);
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
    const [activeTerm, setActiveTerm] = useState<{ value: string; label: string } | null>(null);
    const [selectedClass, setSelectedClass] = useState<string | undefined>();
    const [selectedTerm, setSelectedTerm] = useState<string | undefined>();
    const [studentReports, setStudentReports] = useState<StudentReport[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const [editingReport, setEditingReport] = useState<StudentReport | null>(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [selectedReports, setSelectedReports] = useState<Record<string, boolean>>({});
    const [isBulkSignAlertOpen, setIsBulkSignAlertOpen] = useState(false);

    useEffect(() => {
        const classes = getClasses();
        setAllClasses(classes);
        if (user?.role === 'Admin' || user?.role === 'Headmaster') {
            setTeacherClasses(classes);
        } else if (user?.role === 'Teacher') {
            const staffList = getStaff();
            const currentTeacher = staffList.find(s => s.user_id === user.id);
            if (currentTeacher) {
                const appointments = getStaffAppointmentHistory();
                const latestAppointment = appointments
                    .filter(a => a.staff_id === currentTeacher.staff_id)
                    .sort((a,b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime())[0];
                if (latestAppointment?.class_assigned) {
                    const assignedClasses = classes.filter(c => latestAppointment.class_assigned?.includes(c.id));
                    setTeacherClasses(assignedClasses);
                }
            }
        }
        
        const years = getAcademicYears();
        setAcademicYears(years);

        const activeYear = years.find(y => y.status === 'Active');
        if (activeYear) {
            const currentActiveTerm = activeYear.terms.find(t => t.status === 'Active');
            if (currentActiveTerm) {
                const termValue = `${currentActiveTerm.name} ${activeYear.year}`;
                setActiveTerm({ value: termValue, label: `${currentActiveTerm.name} (${activeYear.year})` });
                setSelectedTerm(termValue);
            }
        }
    }, [user]);

    const handleGenerateReports = () => {
        if (!selectedClass || !selectedTerm) {
            toast({ variant: 'destructive', title: 'Selection Required', description: 'Please select both a class and a term.' });
            return;
        }
        if (selectedTerm !== activeTerm?.value) {
            toast({ variant: 'destructive', title: 'Term Not Active', description: 'Report cards can only be generated for the current active term.' });
            return;
        }

        setIsLoading(true);
        const allStudentsInClass = getStudentProfiles().filter(p => p.admissionDetails.class_assigned === selectedClass);
        const skippedStudents: string[] = [];

        const reports = allStudentsInClass.map(student => {
            const isFeeDefaulter = (student.financialDetails?.account_balance || 0) < 0;
            if ((user?.role === 'Teacher' && isFeeDefaulter) && !(user?.role === 'Admin' || user?.role === 'Headmaster')) {
                skippedStudents.push(`${student.student.first_name} ${student.student.last_name}`);
                return null;
            }

            const existingReport = getStudentReport(student.student.student_no, selectedTerm);
            if (existingReport) return existingReport;
            
            return calculateStudentReport(student.student.student_no, selectedTerm, allStudentsInClass);
        }).filter((report): report is StudentReport => report !== null);
        
        if (skippedStudents.length > 0) {
            toast({
                variant: 'destructive',
                title: 'Students Skipped',
                description: `Reports for the following students were not generated due to outstanding fees: ${skippedStudents.join(', ')}`
            });
        }

        setStudentReports(reports);
        setSelectedReports({});
        setIsLoading(false);
    };

    const handleSaveAndCloseEditor = (updatedReport: StudentReport) => {
        saveStudentReport(updatedReport);
        setStudentReports(prevReports => 
            prevReports.map(r => r.student.student.student_no === updatedReport.student.student.student_no ? updatedReport : r)
        );
        toast({ title: 'Report Updated', description: `Report for ${updatedReport.student.student.first_name} has been saved.`});
        setIsEditorOpen(false);
        setEditingReport(null);
    };

    const handleBulkSign = () => {
        if (!user) return;
        
        const currentUserSignature = getUserById(user.id)?.signature;

        if (!currentUserSignature) {
            toast({ variant: 'destructive', title: 'Signature Not Found', description: 'Please upload your signature in your user profile to sign reports.' });
            setIsBulkSignAlertOpen(false);
            return;
        }
        
        const updatedReports = studentReports.map(report => {
            if (user.role === 'Admin' || user.role === 'Headmaster') {
                return { ...report, headTeacherSignature: currentUserSignature, status: 'Final' as const };
            }
            if (user.role === 'Teacher') {
                return { ...report, classTeacherSignature: currentUserSignature, status: 'Provisional' as const };
            }
            return report;
        });

        updatedReports.forEach(saveStudentReport);
        setStudentReports(updatedReports);
        toast({ title: "Bulk Sign Successful", description: `${updatedReports.length} reports have been signed.` });
        setIsBulkSignAlertOpen(false);
    };

    const handlePrintSelected = async () => {
        const reportIdsToPrint = Object.keys(selectedReports).filter(key => selectedReports[key]);
        if (reportIdsToPrint.length === 0) {
            toast({ variant: 'destructive', title: 'No Reports Selected', description: 'Please select at least one report to print.' });
            return;
        }

        setIsLoading(true);
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        for (let i = 0; i < reportIdsToPrint.length; i++) {
            const reportId = reportIdsToPrint[i];
            const cardElement = document.getElementById(`report-card-${reportId}`);
            if (cardElement) {
                const canvas = await html2canvas(cardElement, { scale: 2 });
                const imgData = canvas.toDataURL('image/png');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const ratio = canvas.width / canvas.height;
                const width = pdfWidth - 20;
                const height = width / ratio;
                
                if (i > 0) {
                    pdf.addPage();
                }
                pdf.addImage(imgData, 'PNG', 10, 10, width, height < pdfHeight - 20 ? height : pdfHeight - 20);
            }
        }
        
        pdf.save('selected_report_cards.pdf');
        setIsLoading(false);
    };

    const handleSelectReport = (studentId: string, checked: boolean) => {
        setSelectedReports(prev => ({...prev, [studentId]: checked}));
    }
    
    const handleSelectAll = (checked: boolean) => {
        if(checked) {
            const newSelection = studentReports.reduce((acc, report) => {
                acc[report.student.student.student_no] = true;
                return acc;
            }, {} as Record<string, boolean>);
            setSelectedReports(newSelection);
        } else {
            setSelectedReports({});
        }
    }
    
    const isAllSelected = studentReports.length > 0 && Object.values(selectedReports).every(v => v) && Object.keys(selectedReports).length === studentReports.length;

    const handleEditClick = (report: StudentReport) => {
        setEditingReport(report);
        setIsEditorOpen(true);
    };
    
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Generate Reports</CardTitle>
                    <CardDescription>Select a class and a term to generate report cards for all students in that class.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row items-center gap-4">
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                        <SelectTrigger className="w-full sm:w-[200px]">
                            <SelectValue placeholder="Select Class" />
                        </SelectTrigger>
                        <SelectContent>
                            {teacherClasses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={selectedTerm} onValueChange={setSelectedTerm} disabled={!activeTerm}>
                        <SelectTrigger className="w-full sm:w-[200px]">
                            <SelectValue placeholder="Select Term" />
                        </SelectTrigger>
                        <SelectContent>
                            {activeTerm ? (
                                <SelectItem value={activeTerm.value}>{activeTerm.label}</SelectItem>
                            ) : (
                                <SelectItem value="disabled" disabled>No active term</SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                    <Button onClick={handleGenerateReports} disabled={isLoading || !selectedTerm}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Generate Reports
                    </Button>
                    {studentReports.length > 0 && (
                         <div className="flex-1 flex justify-end gap-2">
                             <AlertDialog open={isBulkSignAlertOpen} onOpenChange={setIsBulkSignAlertOpen}>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline"><FileSignature className="mr-2 h-4 w-4" /> Sign All</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Confirm Bulk Signature</AlertDialogTitle>
                                        <AlertDialogDescription>Are you sure you want to append your signature to all {studentReports.length} generated reports? This action cannot be undone.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleBulkSign}>Confirm & Sign</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialog>
                            </AlertDialog>
                            <Button variant="secondary" onClick={handlePrintSelected} disabled={isLoading}>
                                <Printer className="mr-2 h-4 w-4" />
                                Print Selected ({Object.values(selectedReports).filter(Boolean).length})
                            </Button>
                         </div>
                    )}
                </CardContent>
            </Card>

            {studentReports.length > 0 && (
                <div>
                     <div className="flex items-center space-x-2 py-4">
                        <Checkbox 
                            id="select-all-reports" 
                            checked={isAllSelected} 
                            onCheckedChange={(checked) => handleSelectAll(!!checked)}
                        />
                        <Label htmlFor="select-all-reports">Select All ({studentReports.length})</Label>
                    </div>
                    <div className="space-y-8">
                        {studentReports.map(report => (
                            <div key={report.student.student.student_no} className="relative group">
                                <div className="absolute top-2 left-2 z-20 flex items-center space-x-2">
                                     <Checkbox 
                                        checked={!!selectedReports[report.student.student.student_no]} 
                                        onCheckedChange={(checked) => handleSelectReport(report.student.student.student_no, !!checked)}
                                        className="bg-white"
                                    />
                                    <Button variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleEditClick(report)}>
                                        <Pencil className="mr-2 h-4 w-4"/> Edit
                                    </Button>
                                </div>
                                <div id={`report-card-${report.student.student.student_no}`}>
                                    <ReportCard reportData={report} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            <ReportEditor 
                reportData={editingReport} 
                onSave={handleSaveAndCloseEditor} 
                open={isEditorOpen} 
                onOpenChange={setIsEditorOpen} 
            />
        </div>
    );
}
