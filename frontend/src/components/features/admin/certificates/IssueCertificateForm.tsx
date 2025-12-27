'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Award, User, BookOpen, FileText, Calendar, Eye } from 'lucide-react';
import { CompletedEnrollment, CertificateTemplate, IssueCertificateData } from '@/types/admin';

interface IssueCertificateFormProps {
  enrollments: CompletedEnrollment[];
  templates: CertificateTemplate[];
  users?: { id: number; name: string; email: string }[];
  courses?: { id: number; name: string }[];
  onSubmit: (data: IssueCertificateData) => Promise<void>;
  onPreview?: (data: IssueCertificateData) => void;
  isLoading?: boolean;
}

type SelectionMode = 'enrollment' | 'manual';

export function IssueCertificateForm({
  enrollments,
  templates,
  users = [],
  courses = [],
  onSubmit,
  onPreview,
  isLoading = false,
}: IssueCertificateFormProps) {
  const [mode, setMode] = useState<SelectionMode>('enrollment');
  const [enrollmentId, setEnrollmentId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [courseId, setCourseId] = useState<string>('');
  const [templateId, setTemplateId] = useState<string>('');
  const [customExpiryDate, setCustomExpiryDate] = useState<string>('');

  const selectedEnrollment = enrollments.find((e) => e.id.toString() === enrollmentId);
  const selectedTemplate = templates.find((t) => t.id.toString() === templateId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data: IssueCertificateData = {
      enrollmentId: mode === 'enrollment' ? Number(enrollmentId) : undefined,
      userId: mode === 'manual' ? Number(userId) : undefined,
      courseId: mode === 'manual' ? Number(courseId) : undefined,
      templateId: templateId ? Number(templateId) : undefined,
      customExpiryDate: customExpiryDate || undefined,
    };

    await onSubmit(data);
  };

  const handlePreview = () => {
    const data: IssueCertificateData = {
      enrollmentId: mode === 'enrollment' ? Number(enrollmentId) : undefined,
      userId: mode === 'manual' ? Number(userId) : undefined,
      courseId: mode === 'manual' ? Number(courseId) : undefined,
      templateId: templateId ? Number(templateId) : undefined,
      customExpiryDate: customExpiryDate || undefined,
    };

    onPreview?.(data);
  };

  const isValid =
    (mode === 'enrollment' && enrollmentId) ||
    (mode === 'manual' && userId && courseId);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Selection Mode */}
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Certificate Details</h3>
          </div>

          <div className="space-y-4">
            {/* Mode Selection */}
            <div>
              <Label>Selection Method</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setMode('enrollment')}
                  className={`p-4 border-2 rounded-xl text-left transition-colors ${
                    mode === 'enrollment'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FileText className={`h-5 w-5 mb-2 ${
                    mode === 'enrollment' ? 'text-primary-600' : 'text-gray-400'
                  }`} />
                  <div className="font-medium text-gray-900">From Enrollment</div>
                  <div className="text-sm text-gray-500">Select completed enrollment</div>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('manual')}
                  className={`p-4 border-2 rounded-xl text-left transition-colors ${
                    mode === 'manual'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <User className={`h-5 w-5 mb-2 ${
                    mode === 'manual' ? 'text-primary-600' : 'text-gray-400'
                  }`} />
                  <div className="font-medium text-gray-900">Manual Selection</div>
                  <div className="text-sm text-gray-500">Select user and course</div>
                </button>
              </div>
            </div>

            {/* Enrollment Selection */}
            {mode === 'enrollment' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Completed Enrollment
                </label>
                <Select value={enrollmentId} onValueChange={(value) => setEnrollmentId(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an enrollment..." />
                  </SelectTrigger>
                  <SelectContent>
                    {enrollments
                      .filter((e) => !e.hasCertificate)
                      .map((e) => (
                        <SelectItem key={e.id} value={e.id.toString()}>
                          {e.userName} - {e.courseName} (Completed: {new Date(e.completionDate).toLocaleDateString()})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {selectedEnrollment && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-500">Student:</span>{' '}
                        {selectedEnrollment.userName}
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">Email:</span>{' '}
                        {selectedEnrollment.userEmail}
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium text-gray-500">Course:</span>{' '}
                        {selectedEnrollment.courseName}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Manual Selection */}
            {mode === 'manual' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select User
                  </label>
                  <Select value={userId} onValueChange={(value) => setUserId(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a user..." />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.id.toString()}>
                          {u.name} ({u.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Course
                  </label>
                  <Select value={courseId} onValueChange={(value) => setCourseId(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a course..." />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Template & Options */}
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Template & Options</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certificate Template
              </label>
              <Select value={templateId} onValueChange={(value) => setTemplateId(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Use default template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Use default template</SelectItem>
                  {templates
                    .filter((t) => t.isActive)
                    .map((t) => (
                      <SelectItem key={t.id} value={t.id.toString()}>
                        {t.name}{t.isDefault ? ' (Default)' : ''}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {selectedTemplate?.description && (
                <p className="mt-1 text-sm text-gray-500">{selectedTemplate.description}</p>
              )}
            </div>

            <Input
              type="date"
              label="Custom Expiry Date"
              value={customExpiryDate}
              onChange={(e) => setCustomExpiryDate(e.target.value)}
              hint="Leave empty for no expiration"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        {onPreview && (
          <Button
            type="button"
            variant="outline"
            onClick={handlePreview}
            disabled={!isValid || isLoading}
            leftIcon={<Eye className="h-4 w-4" />}
          >
            Preview
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          className="flex-1"
          disabled={!isValid || isLoading}
          isLoading={isLoading}
          leftIcon={<Award className="h-4 w-4" />}
        >
          Issue Certificate
        </Button>
      </div>
    </form>
  );
}
