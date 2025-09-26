
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '../ui/separator';

const integrationSchema = z.object({
  smsApiKey: z.string().optional(),
  smsSenderId: z.string().optional(),
  emailServer: z.string().optional(),
  emailPort: z.coerce.number().optional(),
  emailUsername: z.string().optional(),
  emailPassword: z.string().optional(),
  paymentGatewayKey: z.string().optional(),
});

export function IntegrationSettings() {
  const form = useForm({
    resolver: zodResolver(integrationSchema),
    defaultValues: {
        smsApiKey: '',
        smsSenderId: '',
        emailServer: '',
        emailPort: 587,
        emailUsername: '',
        emailPassword: '',
        paymentGatewayKey: '',
    },
  });

  function onSubmit(values: z.infer<typeof integrationSchema>) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div>
            <h3 className="text-lg font-medium">SMS Gateway</h3>
            <p className="text-sm text-muted-foreground">Configure your SMS provider for notifications.</p>
            <Separator className="mt-2" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <FormField
                    control={form.control}
                    name="smsApiKey"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>API Key</FormLabel>
                        <FormControl>
                            <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="smsSenderId"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Sender ID</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>

         <div>
            <h3 className="text-lg font-medium">Email Server (SMTP)</h3>
            <p className="text-sm text-muted-foreground">Set up your outgoing email server.</p>
            <Separator className="mt-2" />
            <div className="space-y-4 mt-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField name="emailServer" render={({ field }) => (
                        <FormItem><FormLabel>Server Address</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                    )} />
                     <FormField name="emailPort" render={({ field }) => (
                        <FormItem><FormLabel>Port</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                    )} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField name="emailUsername" render={({ field }) => (
                        <FormItem><FormLabel>Username</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                    )} />
                     <FormField name="emailPassword" render={({ field }) => (
                        <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl></FormItem>
                    )} />
                </div>
            </div>
        </div>
        
         <div>
            <h3 className="text-lg font-medium">Payment Gateway</h3>
            <p className="text-sm text-muted-foreground">Integrate a payment provider for online fee collection.</p>
            <Separator className="mt-2" />
            <div className="mt-4">
                 <FormField
                    control={form.control}
                    name="paymentGatewayKey"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Public Key</FormLabel>
                        <FormControl>
                            <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit">Save Integrations</Button>
        </div>
      </form>
    </Form>
  );
}
