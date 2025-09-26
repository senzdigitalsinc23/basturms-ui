
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
                {ALL_ROLES.filter(r => r !== 'Student' && r !== 'Parent').map(role => (
                    <AccordionItem value={role} key={role}>
                        <AccordionTrigger>{role}</AccordionTrigger>
                        <AccordionContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Module</TableHead>
                                        <TableHead>Create</TableHead>
                                        <TableHead>View</TableHead>
                                        <TableHead>Update</TableHead>
                                        <TableHead>Delete</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Object.entries(permissions).map(([module, actions]) => (
                                        <TableRow key={module}>
                                            <TableCell className="font-medium">{module}</TableCell>
                                            <TableCell><Checkbox disabled={!actions.includes('Create '+module.split(' ')[0])} /></TableCell>
                                            <TableCell><Checkbox disabled={!actions.includes('View '+module.split(' ')[0])} /></TableCell>
                                            <TableCell><Checkbox disabled={!actions.includes('Update '+module.split(' ')[0])} /></TableCell>
                                            <TableCell><Checkbox disabled={!actions.includes('Delete '+module.split(' ')[0])} /></TableCell>
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
