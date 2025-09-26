
'use client';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

const gradingScheme = [
    { grade: "A+", range: "90-100", remarks: "Excellent" },
    { grade: "A", range: "80-89", remarks: "Very Good" },
    { grade: "B+", range: "75-79", remarks: "Good" },
    { grade: "B", range: "70-74", remarks: "Credit" },
    { grade: "C+", range: "65-69", remarks: "Credit" },
    { grade: "C", range: "60-64", remarks: "Pass" },
    { grade: "D+", range: "55-59", remarks: "Pass" },
    { grade: "D", range: "50-54", remarks: "Pass" },
    { grade: "F", range: "0-49", remarks: "Fail" },
];

export function GradingSchemeSettings() {
    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Grade</TableHead>
                            <TableHead>Score Range</TableHead>
                            <TableHead>Remarks</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {gradingScheme.map(item => (
                            <TableRow key={item.grade}>
                                <TableCell><Input defaultValue={item.grade} className="w-20"/></TableCell>
                                <TableCell><Input defaultValue={item.range} className="w-24"/></TableCell>
                                <TableCell><Input defaultValue={item.remarks} /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
             <div className="flex justify-end">
                <Button>Save Changes</Button>
            </div>
        </div>
    );
}
