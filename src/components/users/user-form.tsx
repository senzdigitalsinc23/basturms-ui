
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
import { ALL_ROLES, Role, Staff, StudentProfile, User } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getUsers, getStudentProfiles, getStaff } from '@/lib/store';

const createSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Invalid email address.'),
  role: z.enum(ALL_ROLES, { required_error: 'Please select a role.' }),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  entityId: z.string().optional(), // For linking to student or staff
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
  const [unlinkedStaff, setUnlinkedStaff] = useState<Staff[]>([]);
  
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

  const isStaffRole = selectedRole && selectedRole !== 'Student' && selectedRole !== 'Parent';

  useEffect(() => {
    if (isEditMode) return;

    const allUsers = getUsers();
    
    if (selectedRole === 'Student') {
      const allStudents = getStudentProfiles();
      const availableStudents = allStudents.filter(s => {
        const studentUser = allUsers.find(u => u.email === s.contactDetails.email);
        return !studentUser;
      });
      setUnlinkedStudents(availableStudents);
      setUnlinkedStaff([]);
    } else if (isStaffRole) {
        const allStaff = getStaff();
        const availableStaff = allStaff.filter(staffMember => {
            return staffMember.roles.includes(selectedRole!) && !staffMember.user_id;
        });
        setUnlinkedStaff(availableStaff);
        setUnlinkedStudents([]);
    } else {
      setUnlinkedStudents([]);
      setUnlinkedStaff([]);
    }
  }, [selectedRole, isEditMode, isStaffRole]);


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
  
  const handleStudentSelection = (studentId: string) => {
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

  const handleStaffSelection = (staffId: string) => {
    const staff = unlinkedStaff.find(s => s.staff_id === staffId);
    if (staff) {
        form.setValue('entityId', staff.staff_id); 
        form.setValue('name', `${staff.first_name} ${staff.last_name}`);
        form.setValue('email', staff.email);
    }
  }

  const isEntitySelectionRole = (selectedRole && selectedRole !== 'Parent') && !isEditMode;

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

        {isEntitySelectionRole && (
           <FormField
            control={form.control}
            name="entityId"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Select {selectedRole === 'Student' ? 'Student' : 'Staff Member'}</FormLabel>
                    <Select onValueChange={selectedRole === 'Student' ? handleStudentSelection : handleStaffSelection} defaultValue={field.value}>
                         <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder={`Select an unlinked ${selectedRole === 'Student' ? 'student' : 'staff member'}`} />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {selectedRole === 'Student' ? (
                                unlinkedStudents.length > 0 ? unlinkedStudents.map(student => (
                                    <SelectItem key={student.student.student_no} value={student.student.student_no}>
                                        {`${student.student.first_name} ${student.student.last_name} (${student.student.student_no})`}
                                    </SelectItem>
                                )) : <p className="p-2 text-sm text-muted-foreground">No unlinked students found.</p>
                            ) : (
                                unlinkedStaff.length > 0 ? unlinkedStaff.map(staff => (
                                    <SelectItem key={staff.staff_id} value={staff.staff_id}>
                                        {`${staff.first_name} ${staff.last_name} (${staff.staff_id})`}
                                    </SelectItem>
                                )) : <p className="p-2 text-sm text-muted-foreground">No unlinked staff with role '{selectedRole}' found.</p>
                            )}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}
           />
        )}
        
        <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
            <FormItem>
            <FormLabel>Full Name</FormLabel>
            <FormControl>
                <Input placeholder="Select an entity to auto-fill" {...field} readOnly={!isEditMode} disabled={!isEditMode && isEntitySelectionRole} />
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
                <Input placeholder="Select an entity to auto-fill" {...field} readOnly={!isEditMode} disabled={!isEditMode && isEntitySelectionRole} />
            </FormControl>
            <FormMessage />
            </FormItem>
        )}
        />

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
