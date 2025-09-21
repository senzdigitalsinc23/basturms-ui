
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ALL_ROLES, Role, StudentProfile, User } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getUsers, getStudentProfiles } from '@/lib/store';

const createSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Invalid email address.'),
  role: z.enum(ALL_ROLES, { required_error: 'Please select a role.' }),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  entityId: z.string().optional(), // For linking to student, etc.
});

const editSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.').optional(),
  email: z.string().email('Invalid email address.').optional(),
  role: z.enum(ALL_ROLES).optional(),
});

type UserFormProps = {
  isEditMode?: boolean;
  defaultValues?: User;
  onSubmit: (values: any) => void;
};

export function UserForm({
  isEditMode = false,
  defaultValues,
  onSubmit,
}: UserFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const [unlinkedStudents, setUnlinkedStudents] = useState<StudentProfile[]>([]);
  
  const form = useForm({
    resolver: zodResolver(isEditMode ? editSchema : createSchema),
    defaultValues: isEditMode
      ? {
          name: defaultValues?.name,
          email: defaultValues?.email,
          role: defaultValues?.role,
        }
      : {
          name: '',
          email: '',
          password: '',
          role: undefined,
          entityId: undefined,
        },
  });

  const selectedRole = form.watch('role');

  useEffect(() => {
    if (selectedRole === 'Student' && !isEditMode) {
      const allStudents = getStudentProfiles();
      const allUsers = getUsers();
      const linkedStudentEmails = new Set(
        allUsers.filter(u => u.role === 'Student' && u.email).map(u => u.email)
      );
      
      const availableStudents = allStudents.filter(s => {
        const studentEmail = s.contactDetails.email;
        // Check if a user already exists for the student's primary email
        if (studentEmail && linkedStudentEmails.has(studentEmail)) {
          return false;
        }
        // Check if a user already exists for the auto-generated email
        const studentUsername = s.student.student_no.split('-').pop()?.toLowerCase();
        if (studentUsername) {
            const studentUserEmail = `${studentUsername}@student.com`;
             if (linkedStudentEmails.has(studentUserEmail)) {
                return false;
            }
        }
        return true;
      });
      setUnlinkedStudents(availableStudents);
    } else {
      setUnlinkedStudents([]);
    }
  }, [selectedRole, isEditMode]);


  const handleFormSubmit = async (values: z.infer<typeof createSchema | typeof editSchema>) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    onSubmit(values);
    setIsLoading(false);
    toast({
      title: `User ${isEditMode ? 'updated' : 'created'}`,
      description: `The user account has been successfully ${isEditMode ? 'updated' : 'created'}.`,
    });
  };
  
  const handleEntitySelection = (studentId: string) => {
    const student = unlinkedStudents.find(s => s.student.student_no === studentId);
    if (student) {
        form.setValue('entityId', student.student.student_no);
        form.setValue('name', `${student.student.first_name} ${student.student.last_name}`);
        
        if (student.contactDetails.email) {
            form.setValue('email', student.contactDetails.email);
        } else {
            const username = student.student.student_no.split('-').pop()!.toLowerCase();
            form.setValue('email', `${username}@student.com`);
        }
    }
  }

  const allowManualEntry = selectedRole !== 'Student' || isEditMode;


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
         <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isEditMode}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ALL_ROLES.map((role: Role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedRole === 'Student' && !isEditMode && (
           <FormField
            control={form.control}
            name="entityId"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Select Student</FormLabel>
                    <Select onValueChange={handleEntitySelection} defaultValue={field.value}>
                         <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select an unlinked student" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {unlinkedStudents.length > 0 ? unlinkedStudents.map(student => (
                                <SelectItem key={student.student.student_no} value={student.student.student_no}>
                                    {`${student.student.first_name} ${student.student.last_name} (${student.student.student_no})`}
                                </SelectItem>
                            )) : <p className="p-2 text-sm text-muted-foreground">No unlinked students found.</p>}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}
           />
        )}
        
        {allowManualEntry ? (
            <>
                <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                        <Input placeholder="John Doe" {...field} disabled={!allowManualEntry} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                        <Input placeholder="name@example.com" {...field} disabled={!allowManualEntry} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </>
        ) : (
             <Input type="hidden" {...form.register('name')} />
        )}


        {!isEditMode && (
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" {...field} />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading} size="sm">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? 'Save Changes' : 'Create User'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
