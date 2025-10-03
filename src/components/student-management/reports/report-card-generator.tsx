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

function ReportEditor({ report, onSave }: { report: StudentReport; onSave: (updatedReport: StudentReport) => void; }) {
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

    return (
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>Edit Report for {report.student.student.first_name}</DialogTitle>
                <DialogDescription>Add remarks and other details to finalize the report.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="conduct">Conduct</Label>
                        <Textarea id="conduct" value={conduct} onChange={(e) => setConduct(e.target.value)} disabled={!isTeacher} />
                    </div>
                    <div>
                        <Label htmlFor="talent">Talent & Interest</Label>
                        <Textarea id="talent" value={talentAndInterest} onChange={(e) => setTalentAndInterest(e.target.value)} disabled={!isTeacher} />
                    </div>
                </div>
                <div>
                    <Label htmlFor="teacher-remarks">Class Teacher's Remarks</Label>
                    <Textarea id="teacher-remarks" value={classTeacherRemarks} onChange={(e) => setClassTeacherRemarks(e.target.value)} disabled={!isTeacher} />
                </div>
                {isAdmin && (
                    <div>
                        <Label htmlFor="head-remarks">Head Teacher's Remarks</Label>
                        <Textarea id="head-remarks" value={headTeacherRemarks} onChange={(e) => setHeadTeacherRemarks(e.target.value)} />
                    </div>
                )}
            </div>
            <Button onClick={handleSave}>Save Report</Button>
        </DialogContent>
    )
}

export function ReportCardGenerator() {
    const { user } = useAuth();
    const [classes, setClasses] = useState<Class[]>([]);
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
    const [allTerms, setAllTerms] = useState<{ value: string; label: string }[]>([]);
    const [selectedClass, setSelectedClass] = useState<string | undefined>();
    const [selectedTerm, setSelectedTerm] = useState<string | undefined>();
    const [studentReports, setStudentReports] = useState<StudentReport[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        setClasses(getClasses());
        const years = getAcademicYears();
        setAcademicYears(years);
        
        const terms = years.flatMap(year => 
            year.terms.map(term => ({
                value: `${term.name} ${year.year}`,
                label: `${term.name} (${year.year})`
            }))
        );
        setAllTerms(terms);
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
        setIsLoading(false);
    };

    const handleSaveAndCloseEditor = (updatedReport: StudentReport) => {
        saveStudentReport(updatedReport);
        // Update the local state to reflect the change immediately
        setStudentReports(prevReports => 
            prevReports.map(r => r.student.student.student_no === updatedReport.student.student.student_no ? updatedReport : r)
        );
        toast({ title: 'Report Updated', description: `Report for ${updatedReport.student.student.first_name} has been saved.`});
    };

    const handlePrintAll = async () => {
        setIsLoading(true);
        const pdf = new jsPDF('p', 'mm', 'a4');
        const cardElements = document.querySelectorAll<HTMLElement>('.report-card');

        for (let i = 0; i < cardElements.length; i++) {
            const canvas = await html2canvas(cardElements[i], { scale: 2 });
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
        
        pdf.save('report_cards.pdf');
        setIsLoading(false);
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
                            {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                        <SelectTrigger className="w-full sm:w-[200px]">
                            <SelectValue placeholder="Select Term" />
                        </SelectTrigger>
                        <SelectContent>
                            {allTerms.map(term => <SelectItem key={term.value} value={term.value}>{term.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Button onClick={handleGenerateReports} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Generate Reports
                    </Button>
                    {studentReports.length > 0 && (
                        <Button variant="secondary" onClick={handlePrintAll} disabled={isLoading}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print All ({studentReports.length})
                        </Button>
                    )}
                </CardContent>
            </Card>

            {studentReports.length > 0 && (
                <div className="space-y-8">
                    {studentReports.map(report => (
                         <Dialog key={report.student.student.student_no}>
                            <div className="relative group">
                                <ReportCard reportData={report} />
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Pencil className="mr-2 h-4 w-4"/> Edit
                                    </Button>
                                </DialogTrigger>
                            </div>
                             <ReportEditor report={report} onSave={handleSaveAndCloseEditor} />
                        </Dialog>
                    ))}
                </div>
            )}
        </div>
    );
}
