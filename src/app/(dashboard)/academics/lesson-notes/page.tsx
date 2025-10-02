
'use client';
import { ProtectedRoute } from '@/components/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2, FileText, Download } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useState, useEffect, useRef } from 'react';

type LessonNote = {
    id: string;
    title: string;
    description: string;
    file: string; // data URL
    fileName: string;
    fileType: string;
    uploadedAt: string;
    authorId: string;
    authorName: string;
};

const LESSON_NOTES_KEY = 'campusconnect_lesson_notes';

const getLessonNotes = (): LessonNote[] => {
    if (typeof window === 'undefined') return [];
    const notes = localStorage.getItem(LESSON_NOTES_KEY);
    return notes ? JSON.parse(notes) : [];
};

const saveLessonNotes = (notes: LessonNote[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LESSON_NOTES_KEY, JSON.stringify(notes));
};


const formSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  description: z.string().optional(),
  file: z.any().refine(file => file?.[0], 'File is required.'),
});

export default function LessonNotesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [lessonNotes, setLessonNotes] = useState<LessonNote[]>([]);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const fetchNotes = () => {
    const allNotes = getLessonNotes();
    if(user?.role === 'Teacher') {
        setLessonNotes(allNotes.filter(n => n.authorId === user.id));
    } else {
        setLessonNotes(allNotes);
    }
  }

  useEffect(() => {
    fetchNotes();
  }, [user]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    const file = values.file[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const newNote: LessonNote = {
        id: `note_${Date.now()}`,
        title: values.title,
        description: values.description || '',
        file: reader.result as string,
        fileName: file.name,
        fileType: file.type,
        uploadedAt: new Date().toISOString(),
        authorId: user.id,
        authorName: user.name,
      };
      
      const allNotes = getLessonNotes();
      saveLessonNotes([...allNotes, newNote]);
      fetchNotes();

      toast({ title: 'Lesson Note Uploaded', description: `"${values.title}" has been saved.` });
      form.reset();
    };
  };
  
  const handleDelete = (noteId: string) => {
    const allNotes = getLessonNotes();
    const updatedNotes = allNotes.filter(n => n.id !== noteId);
    saveLessonNotes(updatedNotes);
    fetchNotes();
    toast({ title: 'Lesson Note Deleted', variant: 'destructive'});
  }
  
  const handleDownload = (fileDataUrl: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = fileDataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ProtectedRoute allowedRoles={['Admin', 'Teacher']}>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Upload Lesson Note</CardTitle>
              <CardDescription>Fill the form to upload a new note.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" {...form.register('title')} />
                    {form.formState.errors.title && <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea id="description" {...form.register('description')} />
                </div>
                <div className="space-y-2">
                     <Label htmlFor="file">File</Label>
                     <Input id="file" type="file" {...form.register('file')} />
                     {form.formState.errors.file && <p className="text-sm text-destructive">{(form.formState.errors.file as any).message}</p>}
                </div>
                <Button type="submit" className="w-full">
                  <PlusCircle className="mr-2" /> Upload Note
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>My Uploaded Notes</CardTitle>
                    <CardDescription>A list of all your uploaded lesson notes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {lessonNotes.length > 0 ? lessonNotes.map(note => (
                            <div key={note.id} className="flex items-start gap-4 border p-4 rounded-md">
                                <FileText className="h-6 w-6 text-primary mt-1"/>
                                <div className="flex-1">
                                    <h4 className="font-semibold">{note.title}</h4>
                                    <p className="text-sm text-muted-foreground">{note.description}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {user?.role === 'Admin' && `By: ${note.authorName} | `}
                                        Uploaded on {new Date(note.uploadedAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" onClick={() => handleDownload(note.file, note.fileName)}>
                                        <Download className="h-4 w-4"/>
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(note.id)}>
                                        <Trash2 className="h-4 w-4"/>
                                    </Button>
                                </div>
                            </div>
                        )) : (
                            <p className="text-center text-muted-foreground py-8">You have not uploaded any lesson notes yet.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
