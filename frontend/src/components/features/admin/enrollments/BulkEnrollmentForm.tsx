'use client';

import { useState } from 'react';
import { BulkEnrollmentData, BulkEnrollmentPreview } from '@/types/admin';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Upload, X, AlertCircle, CheckCircle, AlertTriangle, Users } from 'lucide-react';

interface BulkEnrollmentFormProps {
  courses: { id: number; name: string; slug: string }[];
  users?: { id: number; name: string; email: string }[];
  onSubmit: (data: BulkEnrollmentData) => Promise<void>;
  onPreview?: (emails: string[]) => Promise<BulkEnrollmentPreview[]>;
}

type EnrollmentMethod = 'select' | 'csv';

export function BulkEnrollmentForm({
  courses,
  users = [],
  onSubmit,
  onPreview,
}: BulkEnrollmentFormProps) {
  const [method, setMethod] = useState<EnrollmentMethod>('select');
  const [courseId, setCourseId] = useState<number | ''>('');
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvEmails, setCsvEmails] = useState<string[]>([]);
  const [sendNotification, setSendNotification] = useState(true);
  const [expiresDate, setExpiresDate] = useState('');
  const [preview, setPreview] = useState<BulkEnrollmentPreview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const courseOptions = [
    { value: '', label: 'Select a course...' },
    ...courses.map((course) => ({
      value: course.id.toString(),
      label: course.name,
    })),
  ];

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUserToggle = (userId: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map((user) => user.id));
    }
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);

    // Parse CSV file
    const text = await file.text();
    const lines = text.split('\n').filter((line) => line.trim());

    // Extract emails (assuming CSV has email in first column or has header)
    const emails = lines
      .slice(lines[0].toLowerCase().includes('email') ? 1 : 0) // Skip header if present
      .map((line) => {
        const email = line.split(',')[0].trim();
        return email;
      })
      .filter((email) => email && email.includes('@'));

    setCsvEmails(emails);
  };

  const handlePreview = async () => {
    if (!onPreview) return;

    setIsLoading(true);
    try {
      const emails =
        method === 'csv'
          ? csvEmails
          : selectedUserIds.map((id) => users.find((u) => u.id === id)?.email || '');

      const previewData = await onPreview(emails);
      setPreview(previewData);
    } catch (error) {
      console.error('Failed to generate preview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!courseId) return;

    setIsLoading(true);
    try {
      const data: BulkEnrollmentData = {
        courseId: Number(courseId),
        sendNotification,
        expiresDate: expiresDate || undefined,
      };

      if (method === 'select') {
        data.userIds = selectedUserIds;
      } else {
        data.userEmails = csvEmails;
      }

      await onSubmit(data);

      // Reset form
      setCourseId('');
      setSelectedUserIds([]);
      setCsvFile(null);
      setCsvEmails([]);
      setPreview([]);
      setExpiresDate('');
    } catch (error) {
      console.error('Failed to create enrollments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const canSubmit =
    courseId &&
    ((method === 'select' && selectedUserIds.length > 0) ||
      (method === 'csv' && csvEmails.length > 0));

  const validCount = preview.filter((p) => p.status === 'valid').length;
  const invalidCount = preview.filter((p) => p.status === 'invalid').length;
  const duplicateCount = preview.filter((p) => p.status === 'duplicate').length;

  return (
    <div className="space-y-6">
      {/* Course Selection */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Course</h3>
        <Select
          label="Course"
          options={courseOptions}
          value={courseId.toString()}
          onValueChange={(value) => setCourseId(value ? Number(value) : '')}
          hint="Select the course to enroll users in"
        />
      </Card>

      {/* User Selection Method */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Users</h3>

        {/* Method Toggle */}
        <div className="flex gap-4 mb-4">
          <Button
            variant={method === 'select' ? 'primary' : 'outline'}
            onClick={() => setMethod('select')}
            leftIcon={<Users className="h-4 w-4" />}
          >
            Select Users
          </Button>
          <Button
            variant={method === 'csv' ? 'primary' : 'outline'}
            onClick={() => setMethod('csv')}
            leftIcon={<Upload className="h-4 w-4" />}
          >
            Upload CSV
          </Button>
        </div>

        {/* Select Users */}
        {method === 'select' && (
          <div className="space-y-4">
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {filteredUsers.length > 0 && (
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <Checkbox
                  label={`Select All (${filteredUsers.length})`}
                  checked={selectedUserIds.length === filteredUsers.length}
                  onChange={handleSelectAll}
                />
                <span className="text-sm text-gray-600">
                  {selectedUserIds.length} selected
                </span>
              </div>
            )}

            <div className="max-h-96 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-4">
              {filteredUsers.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No users found</p>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Checkbox
                      checked={selectedUserIds.includes(user.id)}
                      onChange={() => handleUserToggle(user.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* CSV Upload */}
        {method === 'csv' && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="space-y-2">
                <label
                  htmlFor="csv-upload"
                  className="cursor-pointer text-primary-600 hover:text-primary-700 font-medium"
                >
                  Choose CSV file
                </label>
                <input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleCsvUpload}
                  className="hidden"
                />
                <p className="text-sm text-gray-500">
                  Upload a CSV file with user emails (one per line or in a column)
                </p>
              </div>
            </div>

            {csvFile && (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">{csvFile.name}</p>
                    <p className="text-sm text-gray-500">{csvEmails.length} emails found</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => {
                    setCsvFile(null);
                    setCsvEmails([]);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Options */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Enrollment Options</h3>
        <div className="space-y-4">
          <Input
            type="date"
            label="Expiration Date (Optional)"
            value={expiresDate}
            onChange={(e) => setExpiresDate(e.target.value)}
            hint="Leave empty for no expiration"
          />

          <Checkbox
            label="Send notification email to users"
            checked={sendNotification}
            onChange={(e) => setSendNotification(e.target.checked)}
          />
        </div>
      </Card>

      {/* Preview */}
      {preview.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>

          {/* Summary */}
          <div className="flex gap-4 mb-4">
            <Badge variant="success">
              <CheckCircle className="h-3 w-3 mr-1" />
              {validCount} Valid
            </Badge>
            {invalidCount > 0 && (
              <Badge variant="danger">
                <AlertCircle className="h-3 w-3 mr-1" />
                {invalidCount} Invalid
              </Badge>
            )}
            {duplicateCount > 0 && (
              <Badge variant="warning">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {duplicateCount} Duplicate
              </Badge>
            )}
          </div>

          {/* Preview List */}
          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                    Email
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                    Message
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {preview.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm text-gray-900">{item.email}</td>
                    <td className="px-4 py-2">
                      <Badge
                        variant={
                          item.status === 'valid'
                            ? 'success'
                            : item.status === 'invalid'
                            ? 'danger'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {item.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">{item.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-4">
        {onPreview && !preview.length && canSubmit && (
          <Button
            variant="outline"
            onClick={handlePreview}
            isLoading={isLoading}
            disabled={!canSubmit}
          >
            Preview Enrollments
          </Button>
        )}
        <Button
          variant="primary"
          onClick={handleSubmit}
          isLoading={isLoading}
          disabled={!canSubmit || (preview.length > 0 && validCount === 0)}
        >
          Enroll{' '}
          {method === 'select'
            ? `${selectedUserIds.length} User${selectedUserIds.length !== 1 ? 's' : ''}`
            : `${csvEmails.length} User${csvEmails.length !== 1 ? 's' : ''}`}
        </Button>
      </div>
    </div>
  );
}
