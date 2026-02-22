'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';

export type ExportField = {
    id: string;
    label: string;
    category: 'Personal' | 'Academic' | 'Contact' | 'Guardian' | 'Health' | 'Financial';
};

export const AVAILABLE_FIELDS: ExportField[] = [
    // Personal
    { id: 'student_no', label: 'Student ID', category: 'Personal' },
    { id: 'first_name', label: 'First Name', category: 'Personal' },
    { id: 'last_name', label: 'Last Name', category: 'Personal' },
    { id: 'other_name', label: 'Other Name', category: 'Personal' },
    { id: 'gender', label: 'Gender', category: 'Personal' },
    { id: 'dob', label: 'Date of Birth', category: 'Personal' },

    // Academic
    { id: 'class_assigned', label: 'Class', category: 'Academic' },
    { id: 'admission_status', label: 'Status', category: 'Academic' },
    { id: 'enrollment_date', label: 'Enrollment Date', category: 'Academic' },

    // Contact
    { id: 'phone', label: 'Phone', category: 'Contact' },
    { id: 'email', label: 'Email', category: 'Contact' },
    { id: 'address', label: 'Address', category: 'Contact' },
    { id: 'city', label: 'City', category: 'Contact' },

    // Guardian
    { id: 'guardian_name', label: 'Guardian Name', category: 'Guardian' },
    { id: 'guardian_phone', label: 'Guardian Phone', category: 'Guardian' },
    { id: 'father_name', label: 'Father Name', category: 'Guardian' },
    { id: 'mother_name', label: 'Mother Name', category: 'Guardian' },

    // Health
    { id: 'blood_group', label: 'Blood Group', category: 'Health' },
    { id: 'allergies', label: 'Allergies', category: 'Health' },

    // Financial
    { id: 'account_balance', label: 'Account Balance', category: 'Financial' },
];

interface ExportFieldSelectorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onExport: (selectedFields: string[]) => void;
    title?: string;
    description?: string;
    buttonLabel?: string;
}

export function ExportFieldSelector({
    open,
    onOpenChange,
    onExport,
    title = "Select Fields to Export",
    description = "Choose which columns you want to include in the export.",
    buttonLabel = "Export"
}: ExportFieldSelectorProps) {
    const [selectedFields, setSelectedFields] = useState<string[]>(['student_no', 'first_name', 'last_name', 'class_assigned']);

    const handleToggleField = (fieldId: string) => {
        setSelectedFields(prev =>
            prev.includes(fieldId)
                ? prev.filter(f => f !== fieldId)
                : [...prev, fieldId]
        );
    };

    const handleToggleCategory = (category: string, fields: ExportField[]) => {
        const categoryFieldIds = fields.map(f => f.id);
        const allSelected = categoryFieldIds.every(id => selectedFields.includes(id));

        if (allSelected) {
            setSelectedFields(prev => prev.filter(id => !categoryFieldIds.includes(id)));
        } else {
            setSelectedFields(prev => [...Array.from(new Set([...prev, ...categoryFieldIds]))]);
        }
    };

    const groupedFields = AVAILABLE_FIELDS.reduce((acc, field) => {
        if (!acc[field.category]) acc[field.category] = [];
        acc[field.category].push(field);
        return acc;
    }, {} as Record<string, ExportField[]>);

    const handleExportClick = () => {
        onExport(selectedFields);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="h-[60vh] pr-4">
                    <div className="space-y-6">
                        {Object.entries(groupedFields).map(([category, fields]) => (
                            <div key={category} className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`cat-${category}`}
                                        checked={fields.every(f => selectedFields.includes(f.id))}
                                        onCheckedChange={() => handleToggleCategory(category, fields)}
                                    />
                                    <Label htmlFor={`cat-${category}`} className="font-bold text-base cursor-pointer">
                                        {category}
                                    </Label>
                                </div>
                                <div className="grid grid-cols-2 gap-2 pl-6">
                                    {fields.map(field => (
                                        <div key={field.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={field.id}
                                                checked={selectedFields.includes(field.id)}
                                                onCheckedChange={() => handleToggleField(field.id)}
                                            />
                                            <Label htmlFor={field.id} className="text-sm cursor-pointer font-normal">
                                                {field.label}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleExportClick} disabled={selectedFields.length === 0}>
                        {buttonLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
