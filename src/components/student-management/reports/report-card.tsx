

'use client';
import { StudentReport } from "@/lib/store";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const getOrdinal = (n: number) => {
    if(!n) return 'N/A';
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function ReportCard({ reportData }: { reportData: StudentReport }) {
    const { student, term, year, nextTermBegins, subjects, attendance, talentAndInterest, conduct, classTeacherRemarks, headTeacherRemarks, status, classTeacherSignature, headTeacherSignature } = reportData;
    const studentName = `${student.student.first_name} ${student.student.last_name}`;
    const initials = studentName.split(' ').map(n => n[0]).join('');

    const isProvisional = status === 'Provisional' || (!classTeacherSignature && !headTeacherSignature);
    const isEndorsed = !!headTeacherSignature;
    const reportDate = format(new Date(), 'PPP');
    const reportTerm = `${term}, ${year}`;


    return (
        <Card className="w-[210mm] min-h-[297mm] mx-auto p-6 report-card relative font-sans">
            
             <CardContent className="p-4 border-2 border-black h-full flex flex-col relative">
                {(classTeacherSignature || headTeacherSignature) && (
                     <div className="absolute inset-0 flex items-center justify-center z-0">
                        <p className="text-8xl font-bold text-gray-200/50 -rotate-45 select-none">{isEndorsed ? 'ENDORSED' : 'PROVISIONAL'}</p>
                    </div>
                )}
               
                <div className="relative z-10">
                    <div className="text-center mb-4">
                        <h1 className="text-2xl font-bold uppercase">{reportData.schoolProfile?.schoolName || "Metoxi School"}</h1>
                        <h2 className="text-lg font-semibold uppercase">TERMINAL REPORT</h2>
                    </div>

                    <div className="flex justify-between items-start mb-4 text-sm uppercase">
                        <div className="space-y-1">
                            <p><strong>NAME:</strong> {studentName}</p>
                            <p><strong>STUDENT ID:</strong> {student.student.student_no}</p>
                            <p><strong>CLASS:</strong> {reportData.className}</p>
                        </div>
                        <div className="text-right space-y-1">
                            <p><strong>TERM:</strong> {reportTerm}</p>
                            <p><strong>DATE:</strong> {reportDate}</p>
                            <p><strong>NEXT TERM BEGINS:</strong> {nextTermBegins ? format(new Date(nextTermBegins), 'PPP') : 'TBA'}</p>
                        </div>
                    </div>

                    <table className="w-full border-collapse border border-black text-sm uppercase">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-black p-1 font-bold">SUBJECT</th>
                                <th className="border border-black p-1 font-bold w-[70px]">RAW SBA SCORE</th>
                                <th className="border border-black p-1 font-bold w-[60px]">SBA (40%)</th>
                                <th className="border border-black p-1 font-bold w-[70px]">RAW EXAM SCORE</th>
                                <th className="border border-black p-1 font-bold w-[60px]">EXAM (60%)</th>
                                <th className="border border-black p-1 font-bold w-[60px]">TOTAL (100)</th>
                                <th className="border border-black p-1 font-bold w-[50px]">GRADE</th>
                                <th className="border border-black p-1 font-bold w-[60px]">POSITION</th>
                                <th className="border border-black p-1 font-bold">REMARKS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subjects.map((subj, index) => (
                                <tr key={index}>
                                    <td className="border border-black p-1 font-medium">{subj.subjectName}</td>
                                    <td className="border border-black p-1 text-center">{subj.rawSbaScore?.toFixed(1)}</td>
                                    <td className="border border-black p-1 text-center">{subj.sbaScore?.toFixed(1)}</td>
                                    <td className="border border-black p-1 text-center">{subj.rawExamScore?.toFixed(1)}</td>
                                    <td className="border border-black p-1 text-center">{subj.examScore?.toFixed(1)}</td>
                                    <td className="border border-black p-1 text-center font-bold">{subj.totalScore}</td>
                                    <td className="border border-black p-1 text-center">{subj.grade}</td>
                                    <td className="border border-black p-1 text-center">{getOrdinal(subj.position)}</td>
                                    <td className="border border-black p-1">{subj.remarks}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                <div className="mt-auto pt-6 text-sm space-y-4 uppercase relative z-10">
                     <div className="flex justify-between items-start">
                        <p><strong>ATTENDANCE:</strong> {attendance.daysAttended} OUT OF A TOTAL OF {attendance.totalDays}</p>
                        <p><strong>TALENT AND INTEREST:</strong> {talentAndInterest}</p>
                     </div>
                     <p><strong>CONDUCT:</strong> {conduct}</p>
                     <p><strong>CLASS TEACHER'S REMARKS:</strong> {classTeacherRemarks}</p>
                     <p><strong>HEAD TEACHER'S REMARKS:</strong> {headTeacherRemarks}</p>

                     <div className="flex justify-between pt-16">
                        <div className="text-center">
                            {classTeacherSignature ? <img src={classTeacherSignature} alt="Teacher's Signature" className="h-12 mx-auto" /> : <div className="h-12"></div>}
                            <div className="border-t-2 border-dotted border-black w-48 mt-2"></div>
                            <p>Class Teacher's Signature</p>
                        </div>
                         <div className="text-center">
                            {headTeacherSignature ? <img src={headTeacherSignature} alt="Head's Signature" className="h-12 mx-auto" /> : <div className="h-12"></div>}
                            <div className="border-t-2 border-dotted border-black w-48 mt-2"></div>
                            <p>Head Teacher's Signature</p>
                        </div>
                     </div>
                </div>

            </CardContent>
        </Card>
    );
}
