

'use client';
import { useState, useEffect } from 'react';
import { getClasses, getStudentProfiles, getAcademicYears, calculateStudentReport, StudentReport, saveStudentReport, getStudentReport } from '@/lib/store';
import { Class, StudentProfile, AcademicYear, Term } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReportCard } from './report-card';
import { Loader2, Printer, Pencil } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

function ReportEditor({ report, onSave, open, onOpenChange }: { report: StudentReport; onSave: (updatedReport: StudentReport) => void; open: boolean; onOpenChange: (open: boolean) => void; }) {
    const { user } = useAuth();
    const [conduct, setConduct] = useState(report.conduct);
    const [talentAndInterest, setTalentAndInterest] = useState(report.talentAndInterest);
    const [classTeacherRemarks, setClassTeacherRemarks] = useState(report.classTeacherRemarks);
    const [headTeacherRemarks, setHeadTeacherRemarks] = useState(report.headTeacherRemarks);

    const isTeacher = user?.role === 'Teacher';
    const isAdmin = user?.role === 'Admin' || user?.role === 'Headmaster';

    const handleSave = () => {
        const updatedReport: StudentReport = {
            ...report,
            conduct,
            talentAndInterest,
            classTeacherRemarks,
            headTeacherRemarks: isAdmin ? headTeacherRemarks : report.headTeacherRemarks,
            status: isAdmin && headTeacherRemarks ? 'Final' : 'Provisional'
        };
        onSave(updatedReport);
    }
    
    useEffect(() => {
        if(open) {
            setConduct(report.conduct);
            setTalentAndInterest(report.talentAndInterest);
            setClassTeacherRemarks(report.classTeacherRemarks);
            setHeadTeacherRemarks(report.headTeacherRemarks);
        }
    }, [open, report]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit Report for {report.student.student.first_name}</DialogTitle>
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
                        <h4 className="font-semibold mb-2">Class Teacher's Remarks</h4>
                        <Textarea id="teacher-remarks" value={classTeacherRemarks} onChange={(e) => setClassTeacherRemarks(e.target.value)} disabled={!isAdmin && !isTeacher} />
                    </div>

                    {isAdmin && (
                        <div className="p-4 border rounded-md bg-muted/50">
                            <h4 className="font-semibold mb-2">Head Teacher's Remarks</h4>
                            <Textarea id="head-remarks" value={headTeacherRemarks} onChange={(e) => setHeadTeacherRemarks(e.target.value)} />
                        </div>
                    )}
                </div>
                <Button onClick={handleSave}>Save Report</Button>
            </DialogContent>
        </Dialog>
    )
}

export function ReportCardGenerator() {
    const { user } = useAuth();
    const [classes, setClasses] = useState<Class[]>([]);
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

    useEffect(() => {
        setClasses(getClasses());
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
    }, []);

    const handleGenerateReports = () => {
        if (!selectedClass || !selectedTerm) {
            toast({ variant: 'destructive', title: 'Selection Required', description: 'Please select both a class and a term.' });
            return;
        }
        setIsLoading(true);
        const classStudents = getStudentProfiles().filter(p => p.admissionDetails.class_assigned === selectedClass);
        const allStudentsInClass = getStudentProfiles().filter(p => p.admissionDetails.class_assigned === selectedClass);

        const reports = classStudents.map(student => {
             const existingReport = getStudentReport(student.student.student_no, selectedTerm);
             if (existingReport) return existingReport;
            
             return calculateStudentReport(student.student.student_no, selectedTerm, allStudentsInClass);
        }).filter((report): report is StudentReport => report !== null);
        
        setStudentReports(reports);
        setSelectedReports({});
        setIsLoading(false);
    };

    const handleSaveAndCloseEditor = (updatedReport: StudentReport) => {
        saveStudentReport(updatedReport);
        // Update the local state to reflect the change immediately
        setStudentReports(prevReports => 
            prevReports.map(r => r.student.student.student_no === updatedReport.student.student.student_no ? updatedReport : r)
        );
        toast({ title: 'Report Updated', description: `Report for ${updatedReport.student.student.first_name} has been saved.`});
        setIsEditorOpen(false);
        setEditingReport(null);
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
                const width = pdfWidth - 20; // with margin
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
    
    const isAllSelected = studentReports.length > 0 && Object.keys(selectedReports).length === studentReports.length;

    
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
                            {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
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
                        <Button variant="secondary" onClick={handlePrintSelected} disabled={isLoading}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print Selected ({Object.values(selectedReports).filter(Boolean).length})
                        </Button>
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
                        <Label htmlFor="select-all-reports">Select All</Label>
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
                                    <Dialog onOpenChange={(open) => {
                                        if (open) setEditingReport(report);
                                        setIsEditorOpen(open);
                                    }}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Pencil className="mr-2 h-4 w-4"/> Edit
                                            </Button>
                                        </DialogTrigger>
                                    </Dialog>
                                </div>
                                <div id={`report-card-${report.student.student.student_no}`}>
                                    <ReportCard reportData={report} />
                                </div>
                            </div>
                        ))}
                        {editingReport && <ReportEditor report={editingReport} onSave={handleSaveAndCloseEditor} open={isEditorOpen} onOpenChange={setIsEditorOpen} />}
                    </div>
                </div>
            )}
        </div>
    );
}
