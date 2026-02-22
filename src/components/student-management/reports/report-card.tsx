

'use client';
import { StudentReport } from "@/lib/store";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const getOrdinal = (n: number) => {
    if (!n) return 'N/A';
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function ReportCard({ reportData }: { reportData: StudentReport }) {
    const {
        student, term, year, nextTermBegins, subjects, attendance,
        talentAndInterest, conduct, classTeacherRemarks, headTeacherRemarks,
        status, classTeacherSignature, headTeacherSignature,
        class_position, class_size
    } = reportData;
    const studentName = `${student.student.first_name} ${student.student.last_name}`;
    const initials = studentName.split(' ').map(n => n[0]).join('');

    const isProvisional = status === 'Provisional' || (!classTeacherSignature && !headTeacherSignature);
    const isEndorsed = !!headTeacherSignature;
    const reportDate = format(new Date(), 'PPP');
    const reportTerm = `${term}, ${year}`;


    return (
        <Card className="w-[800px] p-0 report-card relative font-sans border-none shadow-none bg-white">

            <CardContent className="p-4 border-2 border-black h-full flex flex-col relative">
                {(classTeacherSignature || headTeacherSignature) && (
                    <div className="absolute inset-0 flex items-center justify-center z-0">
                        <p className="text-8xl font-bold text-gray-200/50 -rotate-45 select-none">{isEndorsed ? 'ENDORSED' : 'PROVISIONAL'}</p>
                    </div>
                )}

                <div className="relative z-10">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold uppercase">{reportData.schoolProfile?.schoolName || "Metoxi School"}</h1>
                        <h2 className="text-lg font-semibold uppercase">TERMINAL REPORT</h2>
                    </div>

                    <div className="flex justify-between items-start mb-6 text-sm uppercase">
                        <div className="space-y-2">
                            <p><strong className="inline-block w-40">NAME:</strong> {studentName}</p>
                            <p><strong className="inline-block w-40">STUDENT ID:</strong> {student.student.student_no}</p>
                            <p><strong className="inline-block w-40">CLASS:</strong> {reportData.className}</p>
                            <p><strong className="inline-block w-40">CLASS POSITION:</strong> {getOrdinal(class_position as number)} OUT OF {class_size || 'N/A'}</p>
                        </div>
                        <div className="space-y-2">
                            <p><strong className="inline-block w-32">TERM:</strong> {reportTerm}</p>
                            <p><strong className="inline-block w-32">DATE:</strong> {reportDate}</p>
                            <p><strong className="inline-block w-32">NEXT TERM BEGINS:</strong> {nextTermBegins ? format(new Date(nextTermBegins), 'PPP') : 'TBA'}</p>
                        </div>
                    </div>

                    <table className="w-full border-collapse border border-black text-sm uppercase mb-6">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-black p-2 font-bold align-middle">SUBJECT</th>
                                <th className="border border-black p-2 font-bold w-[70px] align-middle">SBA (50%)</th>
                                <th className="border border-black p-2 font-bold w-[70px] align-middle">EXAM (50%)</th>
                                <th className="border border-black p-2 font-bold w-[60px] align-middle">TOTAL (100)</th>
                                <th className="border border-black p-2 font-bold w-[50px] align-middle">GRADE</th>
                                <th className="border border-black p-2 font-bold w-[60px] align-middle">POSITION</th>
                                <th className="border border-black p-2 font-bold align-middle">REMARKS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subjects.map((subj, index) => (
                                <tr key={index}>
                                    <td className="border border-black p-2 font-medium align-middle">{subj.subjectName}</td>
                                    <td className="border border-black p-2 text-center align-middle">{subj.sbaScore.toFixed(1)}</td>
                                    <td className="border border-black p-2 text-center align-middle">{subj.examScore.toFixed(1)}</td>
                                    <td className="border border-black p-2 text-center font-bold align-middle">{subj.totalScore}</td>
                                    <td className="border border-black p-2 text-center align-middle">{subj.grade}</td>
                                    <td className="border border-black p-2 text-center align-middle">{getOrdinal(subj.position)}</td>
                                    <td className="border border-black p-2 align-middle">{subj.remarks}</td>
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
