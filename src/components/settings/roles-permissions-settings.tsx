
'use client';
import { ALL_ROLES } from "@/lib/types";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";

const permissions = {
    "Student Management": ["Create Student", "View Student", "Update Student", "Delete Student"],
    "Staff Management": ["Create Staff", "View Staff", "Update Staff", "Delete Staff"],
    "User Management": ["Create User", "View User", "Update User", "Delete User"],
    "Attendance": ["Take Attendance", "View History"],
    "Settings": ["Manage Settings"],
};

export function RolesPermissionsSettings() {
    return (
        <div className="space-y-4">
            <Accordion type="multiple" className="w-full">
                {Object.entries(permissions).map(([module, actions]) => (
                     <AccordionItem value={module} key={module}>
                        <AccordionTrigger>{module}</AccordionTrigger>
                        <AccordionContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Permission</TableHead>
                                         {ALL_ROLES.filter(r => r !== 'Student' && r !== 'Parent' && r !== 'Admin').map(role => (
                                            <TableHead key={role} className="text-center">{role}</TableHead>
                                         ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {actions.map((action) => (
                                        <TableRow key={action}>
                                            <TableCell className="font-medium">{action}</TableCell>
                                            {ALL_ROLES.filter(r => r !== 'Student' && r !== 'Parent' && r !== 'Admin').map(role => (
                                                <TableCell key={role} className="text-center">
                                                    <Checkbox />
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
             <div className="flex justify-end pt-4">
                <Button>Save Changes</Button>
            </div>
        </div>
    )
}
