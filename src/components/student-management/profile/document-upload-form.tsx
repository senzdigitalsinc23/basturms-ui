
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UploadedDocument } from '@/lib/types';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(1, 'Document name is required.'),
  type: z.enum(['Birth Certificate', 'Transcript', 'Report Card', 'Admission Form', 'Admission Letter']),
  file: z.any().refine(files => files?.length === 1, 'File is required.'),
});

type FormValues = Omit<UploadedDocument, 'uploaded_at' | 'url'> & {type: 'Birth Certificate' | 'Transcript' | 'Report Card' | 'Admission Form' | 'Admission Letter', file: FileList};

type DocumentUploadFormProps = {
  onSubmit: (values: UploadedDocument) => void;
};

export function DocumentUploadForm({ onSubmit }: DocumentUploadFormProps) {
  const { toast } = useToast();
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', type: 'Admission Form' },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setFileDataUrl(reader.result as string);
        };
        reader.onerror = () => {
            toast({
                variant: "destructive",
                title: "File Read Error",
                description: "Could not read the selected file.",
            });
        }
        reader.readAsDataURL(file);
    }
  };


  const handleSubmit = (values: FormValues) => {
    if (!fileDataUrl) {
        toast({
            variant: "destructive",
            title: "No File",
            description: "Please select a file to upload.",
        });
        return;
    }
    onSubmit({
        name: values.name,
        type: values.type,
        url: fileDataUrl,
        uploaded_at: new Date().toISOString(),
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField name="name" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Document Name</FormLabel>
            <FormControl><Input placeholder="e.g., May 2024 Report Card" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField name="type" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Document Type</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
              <SelectContent>
                <SelectItem value="Birth Certificate">Birth Certificate</SelectItem>
                <SelectItem value="Transcript">Transcript</SelectItem>
                <SelectItem value="Report Card">Report Card</SelectItem>
                <SelectItem value="Admission Form">Admission Form</SelectItem>
                <SelectItem value="Admission Letter">Admission Letter</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
         <FormField
            control={form.control}
            name="file"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Upload from PC</FormLabel>
                <FormControl>
                    <Input 
                        type="file" 
                        onChange={(e) => {
                            field.onChange(e.target.files);
                            handleFileChange(e);
                        }}
                    />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        <div className="flex justify-end">
          <Button type="submit" size="sm">Add Document</Button>
        </div>
      </form>
    </Form>
  );
}
