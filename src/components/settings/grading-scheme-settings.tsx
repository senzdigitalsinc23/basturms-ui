

'use client';
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { GradeSetting } from "@/lib/types";
import { fetchGradingSchemesApi, addGradingSchemeApi, updateGradingSchemeApi, deleteGradingSchemeApi, addAuditLog } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Trash2 } from "lucide-react";

export function GradingSchemeSettings() {
    const [gradingScheme, setGradingScheme] = useState<GradeSetting[]>([]);
    const { toast } = useToast();
    const { user } = useAuth();

    const fetchSchemes = async () => {
        const data = await fetchGradingSchemesApi();
        // Ensure there is at least one empty row for new entries if list is empty or last row is not empty
        if (data.length === 0 || isRowNotEmpty(data[data.length - 1])) {
            setGradingScheme([...data, { grade: "", range: "", remarks: "" }]);
        } else {
            setGradingScheme(data);
        }
    };

    useEffect(() => {
        fetchSchemes();
    }, []);

    const isRowNotEmpty = (row: GradeSetting) => {
        return row.grade.trim() !== "" || row.range.trim() !== "" || row.remarks.trim() !== "";
    };

    const handleInputChange = (index: number, field: keyof GradeSetting, value: string) => {
        const newScheme = [...gradingScheme];
        newScheme[index] = { ...newScheme[index], [field]: value };

        // Auto-add new row if user types in the last row
        if (index === newScheme.length - 1 && isRowNotEmpty(newScheme[index])) {
            newScheme.push({ grade: "", range: "", remarks: "" });
        }

        setGradingScheme(newScheme);
    };

    const handleBlur = async (index: number) => {
        const item = gradingScheme[index];
        // Don't save empty rows
        if (!isRowNotEmpty(item)) return;

        if (item.id) {
            // Update existing
            await updateGradingSchemeApi(item.id, { grade: item.grade, range: item.range, remarks: item.remarks });
            // Optional: visual feedback
        } else {
            // Create new
            const newScheme = await addGradingSchemeApi({ grade: item.grade, range: item.range, remarks: item.remarks });
            if (newScheme && newScheme.id) {
                const updatedList = [...gradingScheme];
                updatedList[index] = newScheme;
                setGradingScheme(updatedList);

                if (user) {
                    addAuditLog({
                        user: user.email,
                        name: user.name,
                        action: 'Update Grading Scheme',
                        details: `Added new grade: ${newScheme.grade}`,
                    });
                }
            }
        }
    };

    const removeRow = async (index: number) => {
        const item = gradingScheme[index];
        if (item.id) {
            const success = await deleteGradingSchemeApi(item.grade);
            if (!success) {
                toast({ title: "Error", description: "Failed to delete grading scheme", variant: "destructive" });
                return;
            }
        }

        const newScheme = gradingScheme.filter((_, i) => i !== index);
        // Ensure we don't end up with empty list
        if (newScheme.length === 0) {
            newScheme.push({ grade: "", range: "", remarks: "" });
        }
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
                            <TableRow key={item.id || `temp-${index}`}>
                                <TableCell>
                                    <Input
                                        value={item.grade}
                                        onChange={e => handleInputChange(index, 'grade', e.target.value)}
                                        onBlur={() => handleBlur(index)}
                                        className="w-20"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        value={item.range}
                                        onChange={e => handleInputChange(index, 'range', e.target.value)}
                                        onBlur={() => handleBlur(index)}
                                        className="w-24"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        value={item.remarks}
                                        onChange={e => handleInputChange(index, 'remarks', e.target.value)}
                                        onBlur={() => handleBlur(index)}
                                    />
                                </TableCell>
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
        </div>
    );
}
