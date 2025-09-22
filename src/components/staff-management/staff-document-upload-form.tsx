
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

const formSchema = z.object({
  name: z.string().min(1, 'Document name is required.'),
  file: z.any().refine(file => file instanceof File, 'File is required.'),
});

type DocumentUploadFormProps = {
  onSubmit: (values: { name: string; file: string }) => void;
};

export function StaffDocumentUploadForm({ onSubmit }: DocumentUploadFormProps) {
    const { toast } = useToast();
    const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { name: '' },
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
    
    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        if (!fileDataUrl) {
            toast({ variant: "destructive", title: "No File", description: "Please select a file to upload." });
            return;
        }
        onSubmit({ name: values.name, file: fileDataUrl });
    };

    return (
        <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Document Name</FormLabel>
                        <FormControl><Input placeholder="e.g., Promotion Letter" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                name="file"
                control={form.control}
                render={({ field: { onChange, ...fieldProps } }) => (
                    <FormItem>
                        <FormLabel>File</FormLabel>
                        <FormControl>
                            <Input
                                type="file"
                                {...fieldProps}
                                accept=".pdf,.doc,.docx,.jpg,.png"
                                onChange={(e) => {
                                    onChange(e.target.files?.[0]);
                                    handleFileChange(e);
                                }}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <div className="flex justify-end">
            <Button type="submit" size="sm">Upload Document</Button>
            </div>
        </form>
        </Form>
    );
}
