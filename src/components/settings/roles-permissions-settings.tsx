
'use client';
import { ALL_ROLES, Role, PERMISSIONS, Permission, RolePermissions, ALL_PERMISSIONS } from "@/lib/types";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { getRolePermissions, saveRolePermissions, addAuditLog } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";


const permissionsByModule = Object.entries(PERMISSIONS).reduce((acc, [key, value]) => {
    const module = key.split(':')[0];
    if (!acc[module]) {
        acc[module] = [];
    }
    acc[module].push({ id: key as Permission, label: value });
    return acc;
}, {} as Record<string, { id: Permission, label: string }[]>);


export function RolesPermissionsSettings() {
    const [selectedRole, setSelectedRole] = useState<Role | undefined>();
    const [currentPermissions, setCurrentPermissions] = useState<Permission[]>([]);
    const [allPermissions, setAllPermissions] = useState<RolePermissions>({});
    const { toast } = useToast();
    const { user } = useAuth();

    useEffect(() => {
        const perms = getRolePermissions();
        setAllPermissions(perms);
    }, []);

    useEffect(() => {
        if (selectedRole && allPermissions[selectedRole]) {
            setCurrentPermissions(allPermissions[selectedRole]!);
        } else {
            setCurrentPermissions([]);
        }
    }, [selectedRole, allPermissions]);

    const handlePermissionChange = (permissionId: Permission, checked: boolean) => {
        if (checked) {
            setCurrentPermissions(prev => [...prev, permissionId]);
        } else {
            setCurrentPermissions(prev => prev.filter(p => p !== permissionId));
        }
    };

    const handleSave = () => {
        if (!selectedRole || !user) return;

        const updatedPermissions = { ...allPermissions, [selectedRole]: currentPermissions };
        saveRolePermissions(updatedPermissions);
        setAllPermissions(updatedPermissions);

        addAuditLog({
            user: user.email,
            name: user.name,
            action: 'Update Permissions',
            details: `Updated permissions for the role: ${selectedRole}.`,
        });

        toast({
            title: 'Permissions Saved',
            description: `Permissions for ${selectedRole} have been updated.`,
        });
    };
    
    const handleSelectAll = (modulePermissions: {id: Permission, label: string}[], checked: boolean) => {
        const modulePermissionIds = modulePermissions.map(p => p.id);
        if (checked) {
            const newPermissions = [...new Set([...currentPermissions, ...modulePermissionIds])];
            setCurrentPermissions(newPermissions);
        } else {
            const newPermissions = currentPermissions.filter(p => !modulePermissionIds.includes(p));
            setCurrentPermissions(newPermissions);
        }
    };


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
                             {ALL_ROLES.map(role => (
                                <SelectItem key={role} value={role} disabled={role === 'Admin'}>{role}{role === 'Admin' && ' (Cannot be modified)'}</SelectItem>
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
                            {Object.entries(permissionsByModule).map(([module, permissions]) => {
                                const modulePermissionIds = permissions.map(p => p.id);
                                const isAllSelectedInModule = modulePermissionIds.every(p => currentPermissions.includes(p));

                                return (
                                <AccordionItem value={module} key={module}>
                                    <div className="flex items-center w-full">
                                        <AccordionTrigger>
                                            <span>{module.charAt(0).toUpperCase() + module.slice(1)}</span>
                                        </AccordionTrigger>
                                        <div className="flex items-center space-x-2 ml-4 pr-4" onClick={(e) => e.stopPropagation()}>
                                            <Checkbox 
                                                id={`select-all-${module}`} 
                                                checked={isAllSelectedInModule}
                                                onCheckedChange={(checked) => handleSelectAll(permissions, !!checked)}
                                            />
                                            <label htmlFor={`select-all-${module}`} className="text-sm font-normal text-muted-foreground">Select All</label>
                                        </div>
                                    </div>
                                    <AccordionContent>
                                        <div className="space-y-2 pl-4">
                                            {permissions.map((permission) => (
                                                <div key={permission.id} className="flex items-center space-x-2">
                                                    <Checkbox 
                                                        id={`${selectedRole}-${permission.id}`} 
                                                        checked={currentPermissions.includes(permission.id)}
                                                        onCheckedChange={(checked) => handlePermissionChange(permission.id, !!checked)}
                                                    />
                                                    <label
                                                        htmlFor={`${selectedRole}-${permission.id}`}
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        {permission.label}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            )})}
                        </Accordion>
                         <div className="flex justify-end pt-6">
                            <Button onClick={handleSave}>Save Changes for {selectedRole}</Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
