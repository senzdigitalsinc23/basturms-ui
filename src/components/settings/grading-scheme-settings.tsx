
'use client';
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { GradeSetting } from "@/lib/types";
import { getGradingScheme, saveGradingScheme, addAuditLog } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Trash2, PlusCircle } from "lucide-react";

export function GradingSchemeSettings() {
    const [gradingScheme, setGradingScheme] = useState<GradeSetting[]>([]);
    const { toast } = useToast();
    const { user } = useAuth();

    useEffect(() => {
        setGradingScheme(getGradingScheme());
    }, []);

    const handleInputChange = (index: number, field: keyof GradeSetting, value: string) => {
        const newScheme = [...gradingScheme];
        newScheme[index][field] = value;
        setGradingScheme(newScheme);
    };

    const handleSaveChanges = () => {
        saveGradingScheme(gradingScheme);
        if (user) {
            addAuditLog({
                user: user.email,
                name: user.name,
                action: 'Update Grading Scheme',
                details: 'The school grading scheme was updated.',
            });
        }
        toast({
            title: 'Grading Scheme Saved',
            description: 'The new grading scheme has been applied.',
        });
    };

    const addRow = () => {
        setGradingScheme([...gradingScheme, { grade: "", range: "", remarks: "" }]);
    };
    
    const removeRow = (index: number) => {
        const newScheme = gradingScheme.filter((_, i) => i !== index);
        setGradingScheme(newScheme);
    };

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Grade</TableHead>
                            <TableHead>Score Range</TableHead>
                            <TableHead>Remarks</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {gradingScheme.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell><Input value={item.grade} onChange={e => handleInputChange(index, 'grade', e.target.value)} className="w-20"/></TableCell>
                                <TableCell><Input value={item.range} onChange={e => handleInputChange(index, 'range', e.target.value)} className="w-24"/></TableCell>
                                <TableCell><Input value={item.remarks} onChange={e => handleInputChange(index, 'remarks', e.target.value)} /></TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="icon" onClick={() => removeRow(index)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
             <div className="flex justify-between items-center">
                <Button variant="outline" size="sm" onClick={addRow}>
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    Add Row
                </Button>
                <Button onClick={handleSaveChanges}>Save Changes</Button>
            </div>
        </div>
    );
}
