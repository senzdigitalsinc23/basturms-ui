'use client';
import { useState, useEffect } from 'react';
import { getClasses, getStudentProfiles, getAcademicYears, calculateStudentReport, StudentReport } from '@/lib/store';
import { Class, StudentProfile, AcademicYear, Term } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReportCard } from './report-card';
import { Loader2, Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';

export function ReportCardGenerator() {
    const [classes, setClasses] = useState<Class[]>([]);
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
    const [allTerms, setAllTerms] = useState<{ value: string; label: string }[]>([]);
    const [selectedClass, setSelectedClass] = useState<string | undefined>();
    const [selectedTerm, setSelectedTerm] = useState<string | undefined>();
    const [students, setStudents] = useState<StudentProfile[]>([]);
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
        setStudents(classStudents);

        const reports = classStudents.map(student => {
            return calculateStudentReport(student.student.student_no, selectedTerm);
        }).filter((report): report is StudentReport => report !== null);
        
        setStudentReports(reports);
        setIsLoading(false);
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
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = imgWidth / imgHeight;
            const width = pdfWidth - 20; // with margin
            const height = width / ratio;
            
            if (i > 0) {
                pdf.addPage();
            }
            pdf.addImage(imgData, 'PNG', 10, 10, width, height);
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
                        <ReportCard key={report.student.student.student_no} reportData={report} />
                    ))}
                </div>
            )}
        </div>
    );
}
