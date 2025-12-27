'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SettingsNav } from '@/components/features/admin/settings';
import { SettingsForm } from '@/components/features/admin/settings';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/lib/stores/auth-store';
import { hasPermission } from '@/lib/utils/permissions';
import { toast } from '@/lib/utils/toast';
import { Mail, Send, FileText, CheckCircle2, XCircle } from 'lucide-react';

// Validation schema
const emailSettingsSchema = z.object({
  smtpHost: z.string().optional(),
  smtpPort: z.string().optional(),
  smtpUsername: z.string().optional(),
  smtpPassword: z.string().optional(),
  fromEmail: z.string().email('Invalid email address').optional(),
  fromName: z.string().optional(),
});

type EmailSettingsFormData = z.infer<typeof emailSettingsSchema>;

// Mock data
const mockSettings = {
  smtpHost: 'smtp.gmail.com',
  smtpPort: '587',
  smtpUsername: 'noreply@seitech.com',
  smtpPassword: '',
  fromEmail: 'noreply@seitech.com',
  fromName: 'SEI Tech International',
};

const mockNotificationSettings = {
  welcomeEmail: true,
  enrollmentNotification: true,
  certificateNotification: true,
  courseUpdateNotification: false,
  reminderEmails: true,
};

const emailTemplates = [
  {
    id: 'welcome',
    name: 'Welcome Email',
    description: 'Sent when a new user registers',
    status: 'active',
    lastUpdated: '2024-01-15',
  },
  {
    id: 'enrollment',
    name: 'Enrollment Confirmation',
    description: 'Sent when a user enrolls in a course',
    status: 'active',
    lastUpdated: '2024-01-10',
  },
  {
    id: 'certificate',
    name: 'Certificate Issued',
    description: 'Sent when a certificate is issued',
    status: 'active',
    lastUpdated: '2024-01-08',
  },
  {
    id: 'password-reset',
    name: 'Password Reset',
    description: 'Sent when user requests password reset',
    status: 'active',
    lastUpdated: '2024-01-05',
  },
];

export default function EmailSettingsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [notifications, setNotifications] = useState(mockNotificationSettings);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<EmailSettingsFormData>({
    resolver: zodResolver(emailSettingsSchema),
    defaultValues: mockSettings,
  });

  useEffect(() => {
    // Check permissions
    if (user && !hasPermission(user.role, 'settings.edit')) {
      toast.error('Access Denied', 'You do not have permission to edit settings');
      router.push('/admin/settings');
    }
  }, [user, router]);

  const onSubmit = async (data: EmailSettingsFormData) => {
    setIsLoading(true);

    try {
      // TODO: Implement actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log('Email settings:', data);
      console.log('Notification settings:', notifications);

      toast.success('Settings Saved', 'Email settings have been updated successfully');
      reset(data);
    } catch (error) {
      toast.error('Error', 'Failed to save email settings. Please try again.');
      console.error('Error saving email settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    setNotifications(mockNotificationSettings);
  };

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      toast.error('Error', 'Please enter an email address');
      return;
    }

    setIsSendingTest(true);

    try {
      // TODO: Implement actual API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success('Test Email Sent', `A test email has been sent to ${testEmail}`);
      setTestEmail('');
    } catch (error) {
      toast.error('Error', 'Failed to send test email. Please check your SMTP settings.');
      console.error('Error sending test email:', error);
    } finally {
      setIsSendingTest(false);
    }
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Settings</h1>
        <p className="text-gray-600">Configure email delivery and notification preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <SettingsNav />
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* SMTP Configuration */}
          <SettingsForm
            title="SMTP Configuration"
            description="Configure your email server settings"
            onSubmit={handleSubmit(onSubmit)}
            onCancel={handleCancel}
            isLoading={isLoading}
            isDirty={isDirty}
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="SMTP Host"
                  {...register('smtpHost')}
                  error={errors.smtpHost?.message}
                  placeholder="smtp.example.com"
                />

                <Input
                  label="SMTP Port"
                  {...register('smtpPort')}
                  error={errors.smtpPort?.message}
                  placeholder="587"
                  type="number"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="SMTP Username"
                  {...register('smtpUsername')}
                  error={errors.smtpUsername?.message}
                  placeholder="username@example.com"
                />

                <Input
                  label="SMTP Password"
                  type="password"
                  {...register('smtpPassword')}
                  error={errors.smtpPassword?.message}
                  placeholder="Enter password"
                  hint="Leave blank to keep existing password"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="From Email"
                  type="email"
                  {...register('fromEmail')}
                  error={errors.fromEmail?.message}
                  placeholder="noreply@example.com"
                  hint="Email address that emails will be sent from"
                />

                <Input
                  label="From Name"
                  {...register('fromName')}
                  error={errors.fromName?.message}
                  placeholder="Your Company Name"
                  hint="Name that will appear in recipient's inbox"
                />
              </div>
            </div>
          </SettingsForm>

          {/* Test Email */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Test Email</h2>
              <p className="text-sm text-gray-600 mt-1">
                Send a test email to verify your SMTP configuration
              </p>
            </div>
            <div className="px-6 py-6">
              <div className="flex gap-3">
                <Input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="flex-1"
                />
                <Button
                  variant="primary"
                  onClick={handleSendTestEmail}
                  isLoading={isSendingTest}
                  leftIcon={<Send className="w-4 h-4" />}
                >
                  Send Test
                </Button>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Email Notifications
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Configure which email notifications are enabled
              </p>
            </div>
            <div className="px-6 py-6 space-y-4">
              <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={notifications.welcomeEmail}
                    onChange={() => toggleNotification('welcomeEmail')}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mt-1"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Welcome Email</p>
                    <p className="text-sm text-gray-600">
                      Send welcome email to new users upon registration
                    </p>
                  </div>
                </div>
                {notifications.welcomeEmail ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-gray-400" />
                )}
              </label>

              <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={notifications.enrollmentNotification}
                    onChange={() => toggleNotification('enrollmentNotification')}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mt-1"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Enrollment Notification</p>
                    <p className="text-sm text-gray-600">
                      Notify users when they are enrolled in a course
                    </p>
                  </div>
                </div>
                {notifications.enrollmentNotification ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-gray-400" />
                )}
              </label>

              <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={notifications.certificateNotification}
                    onChange={() => toggleNotification('certificateNotification')}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mt-1"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Certificate Notification</p>
                    <p className="text-sm text-gray-600">
                      Notify users when a certificate is issued
                    </p>
                  </div>
                </div>
                {notifications.certificateNotification ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-gray-400" />
                )}
              </label>

              <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={notifications.courseUpdateNotification}
                    onChange={() => toggleNotification('courseUpdateNotification')}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mt-1"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Course Update Notification</p>
                    <p className="text-sm text-gray-600">
                      Notify enrolled users of course content updates
                    </p>
                  </div>
                </div>
                {notifications.courseUpdateNotification ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-gray-400" />
                )}
              </label>

              <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={notifications.reminderEmails}
                    onChange={() => toggleNotification('reminderEmails')}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mt-1"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Reminder Emails</p>
                    <p className="text-sm text-gray-600">
                      Send reminder emails for upcoming courses and deadlines
                    </p>
                  </div>
                </div>
                {notifications.reminderEmails ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-gray-400" />
                )}
              </label>

              <div className="pt-4 border-t border-gray-200">
                <Button
                  variant="primary"
                  onClick={handleSubmit(onSubmit)}
                  isLoading={isLoading}
                >
                  Save Notification Settings
                </Button>
              </div>
            </div>
          </div>

          {/* Email Templates */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Email Templates</h2>
              <p className="text-sm text-gray-600 mt-1">
                Manage email templates for different notifications
              </p>
            </div>
            <div className="divide-y divide-gray-200">
              {emailTemplates.map((template) => (
                <div
                  key={template.id}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900">{template.name}</h3>
                          <Badge
                            variant={template.status === 'active' ? 'success' : 'default'}
                          >
                            {template.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {template.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Last updated: {template.lastUpdated}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Edit Template
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
