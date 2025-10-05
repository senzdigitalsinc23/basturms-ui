
'use client';
import { useState, useEffect } from 'react';
import { getStudentProfiles, addCommunicationLog } from '@/lib/store';
import { StudentProfile } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { CommunicationInterface } from './communication-interface';

export function StudentCommunication() {
    const [students, setStudents] = useState<StudentProfile[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);

    useEffect(() => {
        setStudents(getStudentProfiles());
    }, []);

    const filteredStudents = students.filter(s =>
        `${s.student.first_name} ${s.student.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.student.student_no.includes(searchQuery)
    );
    
    useEffect(() => {
        if (!selectedStudent && filteredStudents.length > 0) {
            setSelectedStudent(filteredStudents[0]);
        }
    }, [filteredStudents, selectedStudent]);

    return (
        <Card className="grid grid-cols-[300px_1fr] h-[calc(100vh-12rem)]">
            <div className="border-r">
                <div className="p-4 border-b">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search students..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <ScrollArea className="h-[calc(100%-4.5rem)]">
                    {filteredStudents.map(student => (
                        <button
                            key={student.student.student_no}
                            className={`w-full text-left flex items-center gap-3 p-3 hover:bg-muted ${selectedStudent?.student.student_no === student.student.student_no ? 'bg-muted' : ''}`}
                            onClick={() => setSelectedStudent(student)}
                        >
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={student.student.avatarUrl} />
                                <AvatarFallback>{student.student.first_name[0]}{student.student.last_name[0]}</AvatarFallback>
                            </Avatar>
                             <div>
                                <p className="font-semibold text-sm">{student.student.first_name} {student.student.last_name}</p>
                                <p className="text-xs text-muted-foreground">{student.student.student_no}</p>
                            </div>
                        </button>
                    ))}
                </ScrollArea>
            </div>
            <div className="flex flex-col">
                {selectedStudent ? (
                    <CommunicationInterface student={selectedStudent} />
                ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                        <p>Select a student to start communicating.</p>
                    </div>
                )}
            </div>
        </Card>
    );
}
