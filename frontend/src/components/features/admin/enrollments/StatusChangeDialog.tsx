'use client';

import { useState } from 'react';
import { AdminEnrollment, EnrollmentStatus } from '@/types/admin';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';

interface StatusChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enrollment: AdminEnrollment | null;
  onConfirm: (enrollmentId: number, status: EnrollmentStatus, reason?: string) => Promise<void>;
}

export function StatusChangeDialog({
  open,
  onOpenChange,
  enrollment,
  onConfirm,
}: StatusChangeDialogProps) {
  const [status, setStatus] = useState<EnrollmentStatus>('active');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update status when enrollment changes
  if (enrollment && status !== enrollment.status && !isSubmitting) {
    setStatus(enrollment.status);
  }

  const handleSubmit = async () => {
    if (!enrollment) return;

    setIsSubmitting(true);
    try {
      await onConfirm(enrollment.id, status, reason || undefined);
      onOpenChange(false);
      setReason('');
    } catch (error) {
      console.error('Failed to update enrollment status:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setReason('');
    if (enrollment) {
      setStatus(enrollment.status);
    }
  };

  const isStatusChanged = enrollment && status !== enrollment.status;
  const requiresReason = status === 'cancelled' || status === 'expired';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Change Enrollment Status</DialogTitle>
          <DialogDescription>
            Update the status for {enrollment?.studentName}&apos;s enrollment in{' '}
            {enrollment?.courseName}
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-4">
          {/* Current Status Info */}
          {enrollment && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Student:</span>
                  <p className="font-medium text-gray-900">{enrollment.studentName}</p>
                </div>
                <div>
                  <span className="text-gray-500">Current Status:</span>
                  <p className="font-medium text-gray-900 capitalize">
                    {enrollment.status}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Progress:</span>
                  <p className="font-medium text-gray-900">{enrollment.progress}%</p>
                </div>
                <div>
                  <span className="text-gray-500">Enrolled:</span>
                  <p className="font-medium text-gray-900">
                    {new Date(enrollment.enrolledDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Status Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              New Status
            </label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as EnrollmentStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reason (required for certain statuses) */}
          <Textarea
            label={requiresReason ? 'Reason (Required)' : 'Reason (Optional)'}
            placeholder="Enter the reason for this status change..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
          />

          {/* Warning for destructive actions */}
          {(status === 'cancelled' || status === 'expired') && isStatusChanged && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-900">Warning</p>
                <p className="text-amber-700 mt-1">
                  {status === 'cancelled'
                    ? 'Cancelling this enrollment will prevent the student from accessing the course.'
                    : 'Marking this enrollment as expired will revoke course access.'}
                </p>
              </div>
            </div>
          )}
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!isStatusChanged || (requiresReason && !reason.trim()) || isSubmitting}
            isLoading={isSubmitting}
          >
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
