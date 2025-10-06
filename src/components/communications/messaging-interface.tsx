
'use client';
import { useState, useEffect } from 'react';
import { getStudentProfiles, getStaff } from '@/lib/store';
import { StudentProfile, Staff } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { CommunicationInterface } from './communication-interface';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useAuth } from '@/hooks/use-auth';

type SelectedEntity = 
    | { type: 'student'; data: StudentProfile }
    | { type: 'staff'; data: Staff };


export function MessagingInterface() {
    const { user } = useAuth();
    const [students, setStudents] = useState<StudentProfile[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedEntity, setSelectedEntity] = useState<SelectedEntity | null>(null);
    const [activeTab, setActiveTab] = useState('students');

    useEffect(() => {
        setStudents(getStudentProfiles());
        const allStaff = getStaff().filter(s => s.user_id !== user?.id); // Exclude self
        setStaff(allStaff);
    }, [user]);

    const filteredStudents = students.filter(s =>
        `${s.student.first_name} ${s.student.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.student.student_no.includes(searchQuery)
    );

    const filteredStaff = staff.filter(s =>
        `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.staff_id.includes(searchQuery)
    );
    
    const handleSelectEntity = (entity: SelectedEntity) => {
        setSelectedEntity(entity);
        setSearchQuery('');
    }

    return (
        <Card className="grid grid-cols-[300px_1fr] h-[calc(100vh-12rem)]">
            <div className="border-r flex flex-col">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                    <TabsList className="grid grid-cols-2 m-2">
                        <TabsTrigger value="students">Students/Parents</TabsTrigger>
                        <TabsTrigger value="staff">Staff</TabsTrigger>
                    </TabsList>
                    <div className="p-4 border-b border-t">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <ScrollArea className="flex-1">
                        <TabsContent value="students" className="m-0">
                            {filteredStudents.map(student => (
                                <button
                                    key={student.student.student_no}
                                    className={`w-full text-left flex items-center gap-3 p-3 hover:bg-muted ${selectedEntity?.type === 'student' && selectedEntity.data.student.student_no === student.student.student_no ? 'bg-muted' : ''}`}
                                    onClick={() => handleSelectEntity({type: 'student', data: student})}
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
                        </TabsContent>
                        <TabsContent value="staff" className="m-0">
                            {filteredStaff.map(staffMember => (
                                <button
                                    key={staffMember.staff_id}
                                    className={`w-full text-left flex items-center gap-3 p-3 hover:bg-muted ${selectedEntity?.type === 'staff' && selectedEntity.data.staff_id === staffMember.staff_id ? 'bg-muted' : ''}`}
                                    onClick={() => handleSelectEntity({type: 'staff', data: staffMember})}
                                >
                                     <Avatar className="h-9 w-9">
                                        <AvatarFallback>{staffMember.first_name[0]}{staffMember.last_name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold text-sm">{staffMember.first_name} {staffMember.last_name}</p>
                                        <p className="text-xs text-muted-foreground">{staffMember.roles.join(', ')}</p>
                                    </div>
                                </button>
                            ))}
                        </TabsContent>
                    </ScrollArea>
                </Tabs>
            </div>
            <div className="flex flex-col">
                {selectedEntity ? (
                    <CommunicationInterface selectedEntity={selectedEntity} />
                ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                        <p>Select a student or staff member to start communicating.</p>
                    </div>
                )}
            </div>
        </Card>
    );
}
