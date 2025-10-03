'use client';
import { StudentReport } from "@/lib/store";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ReportCard({ reportData }: { reportData: StudentReport }) {
    const { student, term, year, nextTermBegins, subjects, attendance, talentAndInterest, conduct, classTeacherRemarks, headTeacherRemarks } = reportData;
    const studentName = `${student.student.first_name} ${student.student.last_name}`;
    const initials = studentName.split(' ').map(n => n[0]).join('');

    return (
        <Card className="w-[210mm] min-h-[297mm] mx-auto p-6 report-card">
            <CardContent className="p-4 border-2 border-black h-full flex flex-col">
                <div className="text-center mb-4">
                    <h1 className="text-2xl font-bold">{reportData.schoolProfile?.schoolName || "Metoxi School"}</h1>
                    <h2 className="text-lg font-semibold">TERMINAL REPORT</h2>
                </div>

                <div className="grid grid-cols-2 gap-x-4 mb-4 text-sm">
                    <div>
                        <p><strong>CLASS:</strong> {reportData.className}</p>
                        <p><strong>YEAR:</strong> {year}</p>
                        <p><strong>NEXT TERM BEGINS:</strong> {nextTermBegins ? format(new Date(nextTermBegins), 'PPP') : 'TBA'}</p>
                    </div>
                    <div className="text-right">
                        <p><strong>TERM:</strong> {term}</p>
                        <p><strong>DATE:</strong> {format(new Date(), 'PPP')}</p>
                    </div>
                </div>

                <table className="w-full border-collapse border border-black text-sm">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-black p-1 font-bold">SUBJECT</th>
                            <th className="border border-black p-1 font-bold w-20">SBA SCORE (50)</th>
                            <th className="border border-black p-1 font-bold w-20">EXAM SCORE (50)</th>
                            <th className="border border-black p-1 font-bold w-20">TOTAL SCORE (100)</th>
                            <th className="border border-black p-1 font-bold w-16">GRADE</th>
                            <th className="border border-black p-1 font-bold w-16">POSITION</th>
                            <th className="border border-black p-1 font-bold">REMARKS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subjects.map((subj, index) => (
                            <tr key={index}>
                                <td className="border border-black p-1 font-medium">{subj.subjectName}</td>
                                <td className="border border-black p-1 text-center">{subj.sbaScore}</td>
                                <td className="border border-black p-1 text-center">{subj.examScore}</td>
                                <td className="border border-black p-1 text-center font-bold">{subj.totalScore}</td>
                                <td className="border border-black p-1 text-center">{subj.grade}</td>
                                <td className="border border-black p-1 text-center">{subj.position}</td>
                                <td className="border border-black p-1">{subj.remarks}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                <div className="mt-auto pt-6 text-sm space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                        <p><strong>ATTENDANCE:</strong> {attendance.daysAttended} OUT OF A TOTAL OF {attendance.totalDays}</p>
                        <p><strong>TALENT AND INTEREST:</strong> {talentAndInterest}</p>
                     </div>
                     <p><strong>CONDUCT:</strong> {conduct}</p>
                     <p><strong>CLASS TEACHER'S REMARKS:</strong> {classTeacherRemarks}</p>
                     <p><strong>HEAD TEACHER'S REMARKS:</strong> {headTeacherRemarks}</p>

                     <div className="flex justify-between pt-8">
                        <div>
                            <div className="border-t-2 border-dotted border-black w-48 mt-8"></div>
                            <p className="text-center">Class Teacher's Signature</p>
                        </div>
                         <div>
                            <div className="border-t-2 border-dotted border-black w-48 mt-8"></div>
                            <p className="text-center">Head Teacher's Signature</p>
                        </div>
                     </div>
                </div>

            </CardContent>
        </Card>
    );
}
