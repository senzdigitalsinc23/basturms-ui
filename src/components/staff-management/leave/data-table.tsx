
'use client';
import { useEffect, useState } from 'react';
import { getLeaveRequests, getStaff, addLeaveRequest, updateLeaveRequestStatus, addAuditLog } from '@/lib/store';
import { LeaveRequest, Staff, LeaveStatus } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { columns } from './columns';
import { DataTable } from './leave-table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LeaveRequestForm } from './leave-request-form';

export function LeaveManagementTable() {
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [isRequestFormOpen, setIsRequestFormOpen] = useState(false);
    const { user } = useAuth();
    const { toast } = useToast();

    const fetchLeaveData = () => {
        setLeaveRequests(getLeaveRequests());
        setStaffList(getStaff());
    };

    useEffect(() => {
        fetchLeaveData();
    }, []);

    const handleAddRequest = (values: Omit<LeaveRequest, 'id' | 'request_date' | 'status' | 'staff_name'>) => {
        if (!user) return;
        
        const newRequest = addLeaveRequest(values, user.id);
        
        if (newRequest) {
            fetchLeaveData();
            addAuditLog({
                user: user.email,
                name: user.name,
                action: 'Create Leave Request',
                details: `Submitted a ${values.leave_type} leave request for ${newRequest.staff_name}`
            });
            toast({
                title: 'Leave Request Submitted',
                description: `The request for ${newRequest.staff_name} has been submitted.`
            });
            setIsRequestFormOpen(false);
        }
    };
    
    const handleUpdateStatus = (leaveId: string, status: LeaveStatus, comments: string) => {
        if (!user) return;

        const updatedRequest = updateLeaveRequestStatus(leaveId, status, user.id, comments);
        if (updatedRequest) {
            fetchLeaveData();
            addAuditLog({
                user: user.email,
                name: user.name,
                action: 'Update Leave Status',
                details: `Set status of leave request ${leaveId} for ${updatedRequest.staff_name} to ${status}`
            });
            toast({
                title: 'Leave Status Updated',
                description: `The leave request has been ${status.toLowerCase()}.`
            });
        }
    }

    const handleBulkUpdateStatus = (leaveIds: string[], status: LeaveStatus, comments: string) => {
        if (!user) return;
        let successCount = 0;
        leaveIds.forEach(id => {
            const updated = updateLeaveRequestStatus(id, status, user.id, comments);
            if (updated) successCount++;
        });

        if (successCount > 0) {
            fetchLeaveData();
            addAuditLog({
                user: user.email,
                name: user.name,
                action: 'Bulk Update Leave Status',
                details: `Bulk updated ${successCount} leave requests to ${status}.`
            });
            toast({
                title: 'Bulk Update Successful',
                description: `${successCount} leave requests have been updated to ${status}.`
            });
        }
    };


    return (
        <>
            <DataTable
                columns={columns({ onUpdateStatus: handleUpdateStatus })}
                data={leaveRequests}
                onOpenRequestForm={() => setIsRequestFormOpen(true)}
                onBulkUpdateStatus={handleBulkUpdateStatus}
            />
            <Dialog open={isRequestFormOpen} onOpenChange={setIsRequestFormOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>New Leave Request</DialogTitle>
                        <DialogDescription>Submit a leave request on behalf of a staff member.</DialogDescription>
                    </DialogHeader>
                    <LeaveRequestForm staffList={staffList} onSubmit={handleAddRequest} />
                </DialogContent>
            </Dialog>
        </>
    );
}

    