'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { requestPasswordReset } from '@/lib/store';

const ForgotPasswordSchema = z.object({
    email: z.string().email({
        message: 'Please enter a valid email address.',
    }),
});

interface ForgotPasswordFormProps {
    onSuccess?: () => void;
}

export function ForgotPasswordForm({ onSuccess }: ForgotPasswordFormProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof ForgotPasswordSchema>>({
        resolver: zodResolver(ForgotPasswordSchema),
        defaultValues: {
            email: '',
        },
    });

    async function onSubmit(data: z.infer<typeof ForgotPasswordSchema>) {
        setIsLoading(true);
        const result = await requestPasswordReset(data.email);
        setIsLoading(false);

        if (result.success) {
            toast({
                title: 'Check your email',
                description: result.message,
            });
            if (onSuccess) {
                onSuccess();
            }
        } else {
            toast({
                variant: 'destructive',
                title: 'Request Failed',
                description: result.message || 'An unknown error occurred. Please try again.',
            });
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="name@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" disabled={isLoading} size="sm">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send Reset Link
                </Button>
            </form>
        </Form>
    );
}
