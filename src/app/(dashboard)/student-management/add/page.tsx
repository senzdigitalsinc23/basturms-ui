'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { AddStudentForm } from '@/components/student-management/add-student-form';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import jsPDF from 'jspdf';

export default function AddStudentPage() {

    const handleDownloadBlankForm = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Student Admission Form", 105, 20, { align: 'center' });

    const fields = [
        { group: "Personal Details", items: ["Full Name", "Date of Birth", "Gender", "NHIS Number"] },
        { group: "Contact & Address", items: ["Residence", "Hometown", "City", "Country", "GPS No", "Email", "Phone"] },
        { group: "Guardian's Information", items: ["Guardian Name", "Guardian Phone", "Guardian Email", "Relationship"] },
        { group: "Father's Details", items: ["Father's Name", "Father's Phone", "Father's Email"] },
        { group: "Mother's Details", items: ["Mother's Name", "Mother's Phone", "Mother's Email"] },
        { group: "Emergency Contact", items: ["Emergency Contact Name", "Emergency Contact Phone", "Relationship"] },
        { group: "Admission Details", items: ["Enrollment Date", "Class Assigned"] },
    ];
    
    let y = 40;
    fields.forEach(fieldGroup => {
        if (y > 260) { // Add new page if content overflows
            doc.addPage();
            y = 20;
        }
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(fieldGroup.group, 15, y);
        y += 7;
        doc.setFont('helvetica', 'normal');
        fieldGroup.items.forEach(item => {
            doc.text(`${item}:`, 20, y);
            doc.line(60, y + 1, 190, y + 1);
            y += 10;
        });
        y += 5;
    });

    doc.save('blank_admission_form.pdf');
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
          <Button variant="outline" size="sm" onClick={handleDownloadBlankForm}>
            <FileDown className="mr-2 h-4 w-4" />
            Download Blank Form
          </Button>
        </div>
        <AddStudentForm />
      </div>
    </ProtectedRoute>
  );
}
