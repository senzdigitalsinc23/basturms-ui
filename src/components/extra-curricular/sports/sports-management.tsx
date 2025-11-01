
'use client';
import { useState, useEffect } from 'react';
import { getSports, saveSports, getStaff, getStudentProfiles, addAuditLog } from '@/lib/store';
import { Sport, Staff, StudentProfile } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Trash2, Edit, Users, User, Trophy } from 'lucide-react';
import { MultiSelectPopover } from '@/components/academics/subjects/multi-select-popover';

function SportForm({ onSave, existingSport, teachers }: { onSave: (sport: Omit<Sport, 'id' | 'student_ids'>) => void, existingSport?: Sport | null, teachers: Staff[] }) {
    const [name, setName] = useState(existingSport?.name || '');
    const [description, setDescription] = useState(existingSport?.description || '');
    const [coachId, setCoachId] = useState(existingSport?.coach_id || '');
    
    const handleSubmit = () => {
        if (name && coachId) {
            onSave({ name, description, coach_id: coachId });
        }
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Team Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="coach">Coach</Label>
                <Select value={coachId} onValueChange={setCoachId}>
                    <SelectTrigger id="coach">
                        <SelectValue placeholder="Select a coach" />
                    </SelectTrigger>
                    <SelectContent>
                        {teachers.map(t => (
                            <SelectItem key={t.staff_id} value={t.staff_id}>{t.first_name} {t.last_name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
             <DialogFooter>
                <Button onClick={handleSubmit}>Save Team</Button>
            </DialogFooter>
        </div>
    );
}


export function SportsManagement() {
    const [sports, setSports] = useState<Sport[]>([]);
    const [teachers, setTeachers] = useState<Staff[]>([]);
    const [students, setStudents] = useState<StudentProfile[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingSport, setEditingSport] = useState<Sport | null>(null);
    const { user } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        async function fetchData() {
            setSports(getSports());
            setTeachers(getStaff().filter(s => s.roles.includes('Teacher')));
            const { students: studentProfiles } = await getStudentProfiles();
            setStudents(studentProfiles);
        }
        fetchData();
    }, []);

    const handleSaveSport = (sportData: Omit<Sport, 'id' | 'student_ids'>) => {
        let updatedSports;
        if (editingSport) {
            updatedSports = sports.map(s => s.id === editingSport.id ? { ...editingSport, ...sportData } : s);
            toast({ title: 'Team Updated' });
        } else {
            const newSport: Sport = { ...sportData, id: `sport_${Date.now()}`, student_ids: [] };
            updatedSports = [...sports, newSport];
            toast({ title: 'Team Created' });
        }
        saveSports(updatedSports);
        setSports(updatedSports);
        setIsFormOpen(false);
        setEditingSport(null);
    };

    const handleDeleteSport = (sportId: string) => {
        const updatedSports = sports.filter(s => s.id !== sportId);
        saveSports(updatedSports);
        setSports(updatedSports);
        toast({ title: 'Team Deleted', variant: 'destructive' });
    };

    const handleMemberChange = (sportId: string, studentIds: string[]) => {
        const updatedSports = sports.map(s => s.id === sportId ? { ...s, student_ids: studentIds } : s);
        saveSports(updatedSports);
        setSports(updatedSports);
        toast({ title: 'Team Members Updated' });
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setEditingSport(null)}><PlusCircle className="mr-2"/> Create Team</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingSport ? 'Edit Team' : 'Create New Sports Team'}</DialogTitle>
                        </DialogHeader>
                        <SportForm onSave={handleSaveSport} existingSport={editingSport} teachers={teachers} />
                    </DialogContent>
                </Dialog>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sports.map(sport => (
                    <Card key={sport.id}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle>{sport.name}</CardTitle>
                                    <CardDescription>{sport.description}</CardDescription>
                                </div>
                                <Trophy className="h-6 w-6 text-primary"/>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="text-sm font-semibold flex items-center gap-2"><User className="h-4 w-4"/> Coach</h4>
                                <p className="text-sm text-muted-foreground">{teachers.find(t => t.staff_id === sport.coach_id)?.first_name} {teachers.find(t => t.staff_id === sport.coach_id)?.last_name}</p>
                            </div>
                             <div>
                                <h4 className="text-sm font-semibold">Team Members ({sport.student_ids.length})</h4>
                                <MultiSelectPopover
                                    title="Students"
                                    options={students.map(s => ({ value: s.student.student_no, label: `${s.student.first_name} ${s.student.last_name}` }))}
                                    selectedValues={sport.student_ids}
                                    onChange={(values) => handleMemberChange(sport.id, values)}
                                />
                            </div>
                        </CardContent>
                        <div className="p-4 border-t flex justify-end gap-2">
                             <Button variant="ghost" size="icon" onClick={() => { setEditingSport(sport); setIsFormOpen(true); }}><Edit className="h-4 w-4" /></Button>
                             <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteSport(sport.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                    </Card>
                ))}
                 {sports.length === 0 && (
                    <div className="col-span-full text-center p-8 text-muted-foreground">
                        No sports teams created yet. Click "Create Team" to get started.
                    </div>
                )}
            </div>
        </div>
    );
}
