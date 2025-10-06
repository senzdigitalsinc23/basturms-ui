
'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getAnnouncements, addAnnouncement, deleteAnnouncement, Announcement, Audience } from '@/lib/store';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { PlusCircle, Trash2, Edit, Megaphone, Users, User, GraduationCap } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';

const announcementSchema = z.object({
  title: z.string().min(3, 'Title is required.'),
  content: z.string().min(10, 'Content is required.'),
  audience: z.enum(['All School', 'Teachers', 'Parents', 'Students']),
});

type AnnouncementFormValues = z.infer<typeof announcementSchema>;

export function AnnouncementManagement() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const canCreate = user?.role === 'Admin' || user?.role === 'Headmaster';

  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
  });

  useEffect(() => {
    setAnnouncements(getAnnouncements());
  }, []);

  const handleOpenForm = (announcement: Announcement | null = null) => {
    setEditingAnnouncement(announcement);
    form.reset(announcement ? {
      title: announcement.title,
      content: announcement.content,
      audience: announcement.audience,
    } : {
      title: '',
      content: '',
      audience: 'All School',
    });
    setIsFormOpen(true);
  };

  const handleSave = (values: AnnouncementFormValues) => {
    if (!user) return;
    addAnnouncement({ ...values, author_id: user.id }, editingAnnouncement?.id);
    setAnnouncements(getAnnouncements());
    toast({ title: `Announcement ${editingAnnouncement ? 'Updated' : 'Posted'}` });
    setIsFormOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteAnnouncement(id);
    setAnnouncements(getAnnouncements());
    toast({ title: 'Announcement Deleted', variant: 'destructive' });
  };
  
  const getAudienceIcon = (audience: Audience) => {
    switch (audience) {
      case 'All School': return <Users className="h-4 w-4" />;
      case 'Teachers': return <User className="h-4 w-4" />;
      case 'Parents': return <Users className="h-4 w-4" />;
      case 'Students': return <GraduationCap className="h-4 w-4" />;
    }
  }

  return (
    <div className="space-y-6">
      {canCreate && (
        <div className="flex justify-end">
            <Button onClick={() => handleOpenForm()}>
            <PlusCircle className="mr-2" /> Create Announcement
            </Button>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {announcements.map(announcement => (
          <Card key={announcement.id} className="flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                         <Badge variant="secondary" className="mb-2 inline-flex items-center gap-1.5">
                            {getAudienceIcon(announcement.audience)}
                            {announcement.audience}
                        </Badge>
                        <CardTitle>{announcement.title}</CardTitle>
                    </div>
                    <Megaphone className="h-6 w-6 text-muted-foreground" />
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground">{announcement.content}</p>
            </CardContent>
            <div className="p-4 border-t flex justify-between items-center text-xs text-muted-foreground">
                <div>
                    <p>By {announcement.author_name}</p>
                    <p>{formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}</p>
                </div>
                {(user?.id === announcement.author_id || user?.role === 'Admin') && (
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenForm(announcement)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(announcement.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                )}
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAnnouncement ? 'Edit' : 'Create'} Announcement</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
              <FormField name="title" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="content" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Content</FormLabel><FormControl><Textarea {...field} rows={5} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="audience" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Audience</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>{['All School', 'Teachers', 'Parents', 'Students'].map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                </Select><FormMessage /></FormItem>
              )} />
              <DialogFooter>
                <Button type="submit">Post Announcement</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
