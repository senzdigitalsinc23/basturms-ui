
'use client';
import { useState, useEffect } from 'react';
import { getClubs, saveClubs, getStaff, getStudentProfiles, addAuditLog } from '@/lib/store';
import { Club, Staff, StudentProfile } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Trash2, Edit, Users, User } from 'lucide-react';
import { MultiSelectPopover } from '@/components/academics/subjects/multi-select-popover';

function ClubForm({ onSave, existingClub, teachers }: { onSave: (club: Omit<Club, 'id' | 'student_ids'>) => void, existingClub?: Club | null, teachers: Staff[] }) {
    const [name, setName] = useState(existingClub?.name || '');
    const [description, setDescription] = useState(existingClub?.description || '');
    const [teacherId, setTeacherId] = useState(existingClub?.teacher_id || '');
    
    const handleSubmit = () => {
        if (name && teacherId) {
            onSave({ name, description, teacher_id: teacherId });
        }
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Club Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="teacher">Teacher-in-charge</Label>
                <Select value={teacherId} onValueChange={setTeacherId}>
                    <SelectTrigger id="teacher">
                        <SelectValue placeholder="Select a teacher" />
                    </SelectTrigger>
                    <SelectContent>
                        {teachers.map(t => (
                            <SelectItem key={t.staff_id} value={t.staff_id}>{t.first_name} {t.last_name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
             <DialogFooter>
                <Button onClick={handleSubmit}>Save Club</Button>
            </DialogFooter>
        </div>
    );
}


export function ClubManagement() {
    const [clubs, setClubs] = useState<Club[]>([]);
    const [teachers, setTeachers] = useState<Staff[]>([]);
    const [students, setStudents] = useState<StudentProfile[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingClub, setEditingClub] = useState<Club | null>(null);
    const { user } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        setClubs(getClubs());
        setTeachers(getStaff().filter(s => s.roles.includes('Teacher')));
        setStudents(getStudentProfiles());
    }, []);

    const handleSaveClub = (clubData: Omit<Club, 'id' | 'student_ids'>) => {
        let updatedClubs;
        if (editingClub) {
            updatedClubs = clubs.map(c => c.id === editingClub.id ? { ...editingClub, ...clubData } : c);
            toast({ title: 'Club Updated' });
        } else {
            const newClub: Club = { ...clubData, id: `club_${Date.now()}`, student_ids: [] };
            updatedClubs = [...clubs, newClub];
            toast({ title: 'Club Created' });
        }
        saveClubs(updatedClubs);
        setClubs(updatedClubs);
        setIsFormOpen(false);
        setEditingClub(null);
    };

    const handleDeleteClub = (clubId: string) => {
        const updatedClubs = clubs.filter(c => c.id !== clubId);
        saveClubs(updatedClubs);
        setClubs(updatedClubs);
        toast({ title: 'Club Deleted', variant: 'destructive' });
    };

    const handleMemberChange = (clubId: string, studentIds: string[]) => {
        const updatedClubs = clubs.map(c => c.id === clubId ? { ...c, student_ids: studentIds } : c);
        saveClubs(updatedClubs);
        setClubs(updatedClubs);
        toast({ title: 'Members Updated' });
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setEditingClub(null)}><PlusCircle className="mr-2"/> Create Club</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingClub ? 'Edit Club' : 'Create New Club'}</DialogTitle>
                        </DialogHeader>
                        <ClubForm onSave={handleSaveClub} existingClub={editingClub} teachers={teachers} />
                    </DialogContent>
                </Dialog>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clubs.map(club => (
                    <Card key={club.id}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle>{club.name}</CardTitle>
                                    <CardDescription>{club.description}</CardDescription>
                                </div>
                                <Users className="h-6 w-6 text-primary"/>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="text-sm font-semibold flex items-center gap-2"><User className="h-4 w-4"/> Teacher-in-charge</h4>
                                <p className="text-sm text-muted-foreground">{teachers.find(t => t.staff_id === club.teacher_id)?.first_name} {teachers.find(t => t.staff_id === club.teacher_id)?.last_name}</p>
                            </div>
                             <div>
                                <h4 className="text-sm font-semibold">Members ({club.student_ids.length})</h4>
                                <MultiSelectPopover
                                    title="Students"
                                    options={students.map(s => ({ value: s.student.student_no, label: `${s.student.first_name} ${s.student.last_name}` }))}
                                    selectedValues={club.student_ids}
                                    onChange={(values) => handleMemberChange(club.id, values)}
                                />
                            </div>
                        </CardContent>
                        <div className="p-4 border-t flex justify-end gap-2">
                             <Button variant="ghost" size="icon" onClick={() => { setEditingClub(club); setIsFormOpen(true); }}><Edit className="h-4 w-4" /></Button>
                             <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteClub(club.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
