
'use client';
import { StudentReport } from "@/lib/store";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function ReportCard({ reportData }: { reportData: StudentReport }) {
    const { student, term, year, nextTermBegins, subjects, attendance, talentAndInterest, conduct, classTeacherRemarks, headTeacherRemarks, status } = reportData;
    const studentName = `${student.student.first_name} ${student.student.last_name}`;
    const initials = studentName.split(' ').map(n => n[0]).join('');

    const isProvisional = status === 'Provisional';

    return (
        <Card className="w-[210mm] min-h-[297mm] mx-auto p-6 report-card relative">
            {isProvisional && (
                <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
                    <p className="text-8xl font-bold text-gray-200/50 transform -rotate-45 select-none">
                        PROVISIONAL REPORT
                    </p>
                </div>
            )}
            <CardContent className="p-4 border-2 border-black h-full flex flex-col relative z-10">
                <div className="text-center mb-4">
                    <h1 className="text-2xl font-bold uppercase">{reportData.schoolProfile?.schoolName || "Metoxi School"}</h1>
                    <h2 className="text-lg font-semibold uppercase">TERMINAL REPORT</h2>
                </div>

                <div className="grid grid-cols-2 gap-x-4 mb-4 text-sm">
                    <div>
                        <p><strong>CLASS:</strong> <span className="uppercase">{reportData.className}</span></p>
                        <p><strong>YEAR:</strong> <span className="uppercase">{year}</span></p>
                        <p><strong>NEXT TERM BEGINS:</strong> <span className="uppercase">{nextTermBegins ? format(new Date(nextTermBegins), 'PPP') : 'TBA'}</span></p>
                    </div>
                    <div className="text-right">
                        <p><strong>TERM:</strong> <span className="uppercase">{term}</span></p>
                        <p><strong>DATE:</strong> <span className="uppercase">{format(new Date(), 'PPP')}</span></p>
                    </div>
                </div>

                <table className="w-full border-collapse border border-black text-sm uppercase">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-black p-1 font-bold">SUBJECT</th>
                            <th className="border border-black p-1 font-bold w-20">Raw SBA (50)</th>
                            <th className="border border-black p-1 font-bold w-20">Raw EXAM (50)</th>
                            <th className="border border-black p-1 font-bold w-20">TOTAL (100)</th>
                            <th className="border border-black p-1 font-bold w-16">GRADE</th>
                            <th className="border border-black p-1 font-bold w-16">POSITION</th>
                            <th className="border border-black p-1 font-bold">REMARKS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subjects.map((subj, index) => (
                            <tr key={index}>
                                <td className="border border-black p-1 font-medium">{subj.subjectName}</td>
                                <td className="border border-black p-1 text-center">{subj.sbaScore.toFixed(1)}</td>
                                <td className="border border-black p-1 text-center">{subj.examScore.toFixed(1)}</td>
                                <td className="border border-black p-1 text-center font-bold">{subj.totalScore}</td>
                                <td className="border border-black p-1 text-center">{subj.grade}</td>
                                <td className="border border-black p-1 text-center">{getOrdinal(subj.position)}</td>
                                <td className="border border-black p-1">{subj.remarks}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                <div className="mt-auto pt-6 text-sm space-y-4 uppercase">
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
