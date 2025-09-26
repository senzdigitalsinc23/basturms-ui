
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Upload } from 'lucide-react';
import { getSchoolProfile, saveSchoolProfile } from '@/lib/store';
import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

const profileSchema = z.object({
  schoolName: z.string().min(1, 'School name is required'),
  motto: z.string().optional(),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  logo: z.string().optional(),
});

export type SchoolProfileData = z.infer<typeof profileSchema>;

export function SchoolProfileSettings() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<SchoolProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      schoolName: 'Metoxi School',
      motto: 'Excellence and Integrity',
      email: 'info@metoxischool.edu',
      phone: '+233 24 123 4567',
      logo: '/placeholder-logo.png',
    },
  });

  useEffect(() => {
    const profile = getSchoolProfile();
    if (profile) {
      form.reset(profile);
    }
  }, [form]);

  function onSubmit(values: SchoolProfileData) {
    saveSchoolProfile(values);
    window.dispatchEvent(new Event('schoolProfileUpdated'));
    toast({
        title: 'School Profile Updated',
        description: 'Your school\'s information has been saved.',
    });
  }

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue('logo', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center gap-6">
            <div className="relative">
                <Avatar className="h-24 w-24">
                    <AvatarImage src={form.watch('logo')} alt="School Logo" />
                    <AvatarFallback>MS</AvatarFallback>
                </Avatar>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                />
                <Button type="button" size="icon" variant="outline" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full" onClick={handleLogoClick}>
                    <Upload className="h-4 w-4"/>
                </Button>
            </div>
            <div className="flex-1">
                <FormField
                control={form.control}
                name="schoolName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>School Name</FormLabel>
                    <FormControl>
                        <Input {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
        </div>
        
        <FormField
          control={form.control}
          name="motto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>School Motto</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Contact Email</FormLabel>
                <FormControl>
                    <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Contact Phone</FormLabel>
                <FormControl>
                    <Input {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <div className="flex justify-end">
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Form>
  );
}
