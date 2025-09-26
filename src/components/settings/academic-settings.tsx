
'use client';
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { PlusCircle } from "lucide-react";

const academicYears = [
    { year: "2023/2024", terms: "3 Terms", status: "Active" },
    { year: "2022/2023", terms: "3 Terms", status: "Completed" },
];

export function AcademicSettings() {
    return (
        <div className="space-y-4">
             <div className="flex justify-end">
                <Button size="sm"><PlusCircle className="mr-2"/> Add Academic Year</Button>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Academic Year</TableHead>
                            <TableHead>Terms</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {academicYears.map(year => (
                            <TableRow key={year.year}>
                                <TableCell>{year.year}</TableCell>
                                <TableCell>{year.terms}</TableCell>
                                <TableCell>{year.status}</TableCell>
                                <TableCell><Button variant="outline" size="sm">Manage Terms</Button></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
