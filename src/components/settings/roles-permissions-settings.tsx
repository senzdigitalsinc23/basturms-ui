
'use client';
import { ALL_ROLES, Role } from "@/lib/types";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";

const permissionsByModule = {
    "Student Management": ["Create Student", "View Student", "Update Student", "Delete Student"],
    "Staff Management": ["Create Staff", "View Staff", "Update Staff", "Delete Staff"],
    "User Management": ["Create User", "View User", "Update User", "Delete User"],
    "Attendance": ["Take Attendance", "View History"],
    "Settings": ["Manage Settings"],
};

export function RolesPermissionsSettings() {
    const [selectedRole, setSelectedRole] = useState<Role | undefined>();

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Select Role to Manage</CardTitle>
                    <CardDescription>Choose a role from the dropdown to view and edit its permissions.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Select onValueChange={(value: Role) => setSelectedRole(value)}>
                        <SelectTrigger className="w-[280px]">
                            <SelectValue placeholder="Select a role..." />
                        </SelectTrigger>
                        <SelectContent>
                             {ALL_ROLES.filter(r => r !== 'Student' && r !== 'Parent').map(role => (
                                <SelectItem key={role} value={role}>{role}</SelectItem>
                             ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {selectedRole && (
                <Card>
                    <CardHeader>
                        <CardTitle>Permissions for {selectedRole}</CardTitle>
                        <CardDescription>Select the checkboxes to grant permissions for this role.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="multiple" className="w-full" defaultValue={Object.keys(permissionsByModule)}>
                            {Object.entries(permissionsByModule).map(([module, permissions]) => (
                                <AccordionItem value={module} key={module}>
                                    <AccordionTrigger>{module}</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-2">
                                            {permissions.map((permission) => (
                                                <div key={permission} className="flex items-center space-x-2">
                                                    <Checkbox id={`${selectedRole}-${permission}`} />
                                                    <label
                                                        htmlFor={`${selectedRole}-${permission}`}
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        {permission}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                         <div className="flex justify-end pt-6">
                            <Button>Save Changes for {selectedRole}</Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
