
'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { AddStudentForm } from '@/components/student-management/add-student-form';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function AddStudentPage() {

    const handleDownloadAdmissionForm = () => {
    const doc = new jsPDF();
    const tableData = (group: string, items: string[]) => {
        let data = [[{ content: group, colSpan: 2, styles: { fontStyle: 'bold', fillColor: '#f0f0f0' }} as any]];
        items.forEach(item => {
            data.push([item, '']);
        });
        return data;
    }

    doc.setFontSize(18);
    doc.text("Student Admission Form", 105, 20, { align: 'center' });
    
    autoTable(doc, {
        startY: 30,
        body: tableData("Personal Details", ["Full Name", "Date of Birth", "Gender", "NHIS Number"]),
        theme: 'grid',
        styles: { fontSize: 10 },
    });

    autoTable(doc, {
        body: tableData("Contact & Address", ["Residence", "Hometown", "City", "Country", "GPS No", "Email", "Phone"]),
        theme: 'grid',
        styles: { fontSize: 10 },
    });
    
    autoTable(doc, {
        body: tableData("Guardian's Information", ["Guardian Name", "Guardian Phone", "Guardian Email", "Relationship"]),
        theme: 'grid',
        styles: { fontSize: 10 },
    });

    autoTable(doc, {
        body: tableData("Father's Details (Leave blank if same as guardian)", ["Father's Name", "Father's Phone", "Father's Email"]),
        theme: 'grid',
        styles: { fontSize: 10 },
    });
    
    autoTable(doc, {
        body: tableData("Mother's Details (Leave blank if same as guardian)", ["Mother's Name", "Mother's Phone", "Mother's Email"]),
        theme: 'grid',
        styles: { fontSize: 10 },
    });

    autoTable(doc, {
        body: tableData("Emergency Contact", ["Emergency Contact Name", "Emergency Contact Phone", "Relationship"]),
        theme: 'grid',
        styles: { fontSize: 10 },
    });
    
     autoTable(doc, {
        body: tableData("Admission Details (For official use only)", ["Enrollment Date", "Class Assigned"]),
        theme: 'grid',
        styles: { fontSize: 10 },
    });

    doc.save('Student admission form.pdf');
  };


  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold font-headline">Add New Student</h1>
            <p className="text-muted-foreground">
              Fill in the details below to enroll a new student.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleDownloadAdmissionForm}>
            <FileDown className="mr-2 h-4 w-4" />
            Download Admission Form
          </Button>
        </div>
        <AddStudentForm />
      </div>
    </ProtectedRoute>
  );
}
