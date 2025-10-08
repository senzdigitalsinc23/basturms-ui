'use client';

import { DepartmentRequests } from "@/components/inventory/requests/department-requests";
import { ProtectedRoute } from "@/components/protected-route";


export default function DepartmentRequestsPage() {

    return (
        <ProtectedRoute allowedRoles={['Admin', 'Headmaster', 'Teacher', 'Stores Manager', 'Procurement Manager', 'Accountant', 'Librarian']}>
             <div className="space-y-6">
                <div>
                <h1 className="text-3xl font-bold font-headline">Departmental Requests</h1>
                <p className="text-muted-foreground">
                    Request items from the store, or manage existing requests.
                </p>
                </div>
                <DepartmentRequests />
            </div>
        </ProtectedRoute>
    )
}
